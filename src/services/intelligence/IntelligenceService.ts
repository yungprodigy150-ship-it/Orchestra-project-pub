/**
 * ORCHESTRA Intelligence Service
 * Central reasoning coordinator for multi-agent workloads.
 * Manages provider adapters, model registries, tool permission validation,
 * context document injection from organizational memory, and safety guardrails.
 */

import {
  AIProviderId,
  IAIProviderAdapter,
  ProviderStatusInfo,
  AIExecutionRequest,
  AIExecutionResponse,
  AgentIntelligenceProfile,
  ExecutionSafetyGuardrails
} from '../../types/intelligence';
import { GeminiProviderAdapter } from './providers/GeminiProviderAdapter';
import { GroqProviderAdapter } from './providers/GroqProviderAdapter';
import { OpenRouterProviderAdapter } from './providers/OpenRouterProviderAdapter';
import { ModelRegistry } from './ModelRegistry';
import { ToolRegistry } from './ToolRegistry';
import { OrganizationalMemory } from '../memory/OrganizationalMemory';
import { AuditLogger } from '../audit/AuditLogger';

export interface ReasonParams {
  provider?: AIProviderId;
  model?: string;
  prompt: string;
  systemInstruction?: string;
  agentProfile?: AgentIntelligenceProfile;
  agentId?: string;
  agentName?: string;
  includeMemoryContext?: boolean;
  memoryQuery?: string;
  structuredSchema?: Record<string, any>;
  temperature?: number;
  maxTokens?: number;
  recursionDepth?: number;
  isHumanSupervisor?: boolean;
}

export const DEFAULT_GUARDRAILS: ExecutionSafetyGuardrails = {
  maxExecutionTimeMs: 30000,
  retryLimit: 2,
  requireApprovalForOutreach: true,
  requireApprovalForDestructiveTool: true,
  maxRecursionDepth: 5
};

export class IntelligenceService {
  private adapters: Map<AIProviderId, IAIProviderAdapter> = new Map();
  public readonly modelRegistry: ModelRegistry;
  public readonly toolRegistry: ToolRegistry;
  private memory?: OrganizationalMemory;
  private auditLogger?: AuditLogger;
  public readonly guardrails: ExecutionSafetyGuardrails;

  constructor(
    modelRegistry?: ModelRegistry,
    toolRegistry?: ToolRegistry,
    memory?: OrganizationalMemory,
    auditLogger?: AuditLogger,
    guardrails?: Partial<ExecutionSafetyGuardrails>
  ) {
    this.modelRegistry = modelRegistry || new ModelRegistry();
    this.toolRegistry = toolRegistry || new ToolRegistry();
    this.memory = memory;
    this.auditLogger = auditLogger;
    this.guardrails = { ...DEFAULT_GUARDRAILS, ...guardrails };

    // Register all 3 adapters
    this.registerAdapter(new GeminiProviderAdapter());
    this.registerAdapter(new GroqProviderAdapter());
    this.registerAdapter(new OpenRouterProviderAdapter());
  }

  public registerAdapter(adapter: IAIProviderAdapter): void {
    this.adapters.set(adapter.providerId, adapter);
  }

  public getAdapter(providerId: AIProviderId): IAIProviderAdapter {
    const adapter = this.adapters.get(providerId);
    if (!adapter) {
      throw new Error(`Provider adapter for "${providerId}" is not registered.`);
    }
    return adapter;
  }

  /**
   * Retrieves status for all configured AI providers
   */
  public async getProvidersStatus(): Promise<ProviderStatusInfo[]> {
    const providerIds: AIProviderId[] = ['gemini', 'groq', 'openrouter'];
    const results: ProviderStatusInfo[] = [];

    for (const pid of providerIds) {
      const adapter = this.adapters.get(pid);
      if (!adapter) continue;

      try {
        const { status, message } = await adapter.checkStatus();
        results.push({
          providerId: pid,
          name: adapter.name,
          status,
          hasKey: status === 'configured',
          message,
          defaultModel: this.modelRegistry.getDefaultModelForProvider(pid)
        });
      } catch (err: any) {
        results.push({
          providerId: pid,
          name: adapter.name,
          status: 'unconfigured',
          hasKey: false,
          message: err.message || 'Status check failed',
          defaultModel: this.modelRegistry.getDefaultModelForProvider(pid)
        });
      }
    }

    return results;
  }

  /**
   * Main entry point for agent and operator reasoning requests
   */
  public async reason(params: ReasonParams): Promise<AIExecutionResponse> {
    const startTime = performance.now();

    // 1. Guardrail: Recursion depth check (protects against infinite self-invocation)
    const currentDepth = params.recursionDepth || 0;
    if (currentDepth > this.guardrails.maxRecursionDepth) {
      const errorMsg = `Execution halted: Exceeded maximum allowed recursion depth (${this.guardrails.maxRecursionDepth}). Infinite loop protection triggered.`;
      this.logAuditFailure('RECURSION_LIMIT_EXCEEDED', errorMsg, params);
      return {
        text: '',
        provider: params.provider || 'gemini',
        model: params.model || 'default',
        durationMs: Math.round(performance.now() - startTime),
        isSimulated: false,
        error: errorMsg,
        timestamp: new Date().toISOString()
      };
    }

    // 2. Resolve Provider and Model based on Agent Profile or explicit parameters
    const providerId: AIProviderId =
      params.provider ||
      (params.agentProfile?.preferredModelId ? this.resolveProviderFromModel(params.agentProfile.preferredModelId) : 'gemini');

    const defaultForProvider = this.modelRegistry.getDefaultModelForProvider(providerId);
    const model = params.model || params.agentProfile?.preferredModelId || defaultForProvider;

    // 3. Assemble Context Documents from Organizational Memory if requested
    const contextDocs: Array<{ title: string; content: string }> = [];
    if (params.includeMemoryContext && this.memory) {
      const query = params.memoryQuery || params.prompt;
      const records = this.memory.search(query).slice(0, 4);
      records.forEach(r => {
        contextDocs.push({
          title: `[Knowledge Brief] ${r.title} (${r.category})`,
          content: `${r.summary}\nKey Takeaways: ${r.keyTakeaways.join('; ')}`
        });
      });
    }

    // 4. Compose System Instructions combining enterprise policies and agent profile
    let finalSystemInstruction = 'You are an autonomous intelligence sub-routine within the ORCHESTRA enterprise platform.';
    if (params.agentProfile) {
      finalSystemInstruction = `${params.agentProfile.operationalIdentity}\n\n${params.agentProfile.systemInstruction}\n\nObjectives:\n${params.agentProfile.objectives.map(o => `- ${o}`).join('\n')}`;
    } else if (params.systemInstruction) {
      finalSystemInstruction = params.systemInstruction;
    }

    // 5. Build Execution Request
    const execRequest: AIExecutionRequest = {
      provider: providerId,
      model,
      prompt: params.prompt,
      systemInstruction: finalSystemInstruction,
      agentIdentity: params.agentProfile?.operationalIdentity,
      contextDocuments: contextDocs.length > 0 ? contextDocs : undefined,
      structuredSchema: params.structuredSchema,
      temperature: params.temperature ?? 0.2,
      maxTokens: params.maxTokens || params.agentProfile?.executionLimits.maxTokens || 2048,
      timeoutMs: params.agentProfile?.executionLimits.timeoutMs || this.guardrails.maxExecutionTimeMs,
      maxRetries: params.agentProfile?.executionLimits.maxRetries || this.guardrails.retryLimit
    };

    // 6. Invoke Adapter
    const adapter = this.getAdapter(providerId);
    try {
      const response = await adapter.executeRequest(execRequest);

      // 7. Structured JSON response validation & error recovery
      if (params.structuredSchema && response.text) {
        try {
          if (!response.structuredData) {
            // Attempt extraction if JSON was returned in markdown code blocks
            const jsonMatch = response.text.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, response.text];
            const parsed = JSON.parse(jsonMatch[1] || response.text);
            response.structuredData = parsed;
          }
        } catch (jsonErr: any) {
          // Graceful degradation: flag schema mismatch without failing task
          response.error = `Structured output validation warning: Raw text could not be strictly parsed into JSON schema (${jsonErr.message}).`;
        }
      }

      // Log success event
      this.auditLogger?.log({
        type: 'TASK_EXECUTION',
        title: `AI Reasoning Dispatched: ${adapter.name}`,
        description: `Model ${model} executed reasoning query (${response.durationMs}ms, ${response.tokensUsed?.total || 0} tokens). Simulated: ${response.isSimulated}`,
        severity: response.error ? 'warning' : 'info',
        entityType: 'task',
        actor: {
          id: params.agentId || 'orchestra_engine',
          name: params.agentName || 'Intelligence Dispatcher',
          type: 'agent'
        },
        details: {
          provider: providerId,
          model,
          isSimulated: response.isSimulated,
          durationMs: response.durationMs
        }
      });

      return response;
    } catch (err: any) {
      const errorMsg = err.message || 'Execution failed';
      this.logAuditFailure('AI_EXECUTION_ERROR', errorMsg, params);

      return {
        text: '',
        provider: providerId,
        model,
        durationMs: Math.round(performance.now() - startTime),
        isSimulated: false,
        error: errorMsg,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Helper to resolve provider from model ID
   */
  private resolveProviderFromModel(modelId: string): AIProviderId {
    const model = this.modelRegistry.getModel(modelId);
    if (model) return model.provider;
    if (modelId.startsWith('gemini')) return 'gemini';
    if (modelId.startsWith('llama')) return 'groq';
    return 'openrouter';
  }

  private logAuditFailure(eventType: string, message: string, params: ReasonParams): void {
    this.auditLogger?.log({
      type: 'TASK_FAILED',
      title: `AI Execution Alert: ${eventType}`,
      description: message,
      severity: 'error',
      entityType: 'task',
      actor: {
        id: params.agentId || 'system',
        name: params.agentName || 'Intelligence Guardrail',
        type: 'agent'
      },
      details: {
        provider: params.provider,
        model: params.model,
        promptSnippet: params.prompt.slice(0, 100)
      }
    });
  }
}
