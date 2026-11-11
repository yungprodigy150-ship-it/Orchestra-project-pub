/**
 * ORCHESTRA Intelligence Layer Types
 * Provider abstractions, model management, tool registries, and execution safety profiles.
 */

export type AIProviderId = 'gemini' | 'groq' | 'openrouter';

export type ProviderConfigStatus = 'configured' | 'unconfigured' | 'invalid';

export interface ProviderStatusInfo {
  providerId: AIProviderId;
  name: string;
  status: ProviderConfigStatus;
  hasKey: boolean;
  message?: string;
  defaultModel: string;
}

export type ModelCapability =
  | 'text_generation'
  | 'complex_reasoning'
  | 'structured_json'
  | 'code_generation'
  | 'tool_calling'
  | 'fast_inference';

export interface ModelDefinition {
  provider: AIProviderId;
  modelId: string;
  displayName: string;
  capabilities: ModelCapability[];
  contextWindow: number;
  maxOutputTokens: number;
  recommendedTemp: number;
  costTier: 'free' | 'low' | 'medium' | 'high';
  description: string;
  isAvailable: boolean;
}

export interface AIExecutionRequest {
  provider: AIProviderId;
  model: string;
  prompt: string;
  systemInstruction?: string;
  agentIdentity?: string;
  contextDocuments?: Array<{ title: string; content: string }>;
  structuredSchema?: Record<string, any>;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
  maxRetries?: number;
}

export interface AIExecutionResponse {
  text: string;
  structuredData?: any;
  provider: AIProviderId;
  model: string;
  durationMs: number;
  tokensUsed?: {
    prompt: number;
    completion: number;
    total: number;
  };
  isSimulated: boolean;
  simulationReason?: string;
  error?: string;
  timestamp: string;
}

export interface IAIProviderAdapter {
  readonly providerId: AIProviderId;
  readonly name: string;
  checkStatus(): Promise<{ status: ProviderConfigStatus; message?: string }>;
  executeRequest(params: AIExecutionRequest): Promise<AIExecutionResponse>;
}

export type ToolPermissionLevel = 'PUBLIC' | 'HUMAN_APPROVAL_REQUIRED' | 'RESTRICTED_ADMIN';
export type ToolStatus = 'READY' | 'SIMULATED' | 'UNCONFIGURED' | 'DISABLED';

export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  category: 'research' | 'infrastructure' | 'database' | 'graph' | 'outreach' | 'analytics' | 'intel';
  inputSchema: {
    type: 'object';
    properties: Record<string, { type: string; description: string; required?: boolean }>;
    required?: string[];
  };
  outputSchema: {
    type: 'object';
    properties: Record<string, { type: string; description: string }>;
  };
  permissionLevel: ToolPermissionLevel;
  status: ToolStatus;
  statusNotice?: string;
  timeoutMs?: number;
  retryLimit?: number;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  requiredIntegrationId?: string;
}

export interface ExecutionSafetyGuardrails {
  maxExecutionTimeMs: number;
  retryLimit: number;
  requireApprovalForOutreach: boolean;
  requireApprovalForDestructiveTool: boolean;
  maxRecursionDepth: number;
}

export interface AgentIntelligenceProfile {
  systemInstruction: string;
  operationalIdentity: string;
  objectives: string[];
  authorizedToolIds: string[];
  memoryAccessLevel: 'PUBLIC' | 'RESTRICTED' | 'CONFIDENTIAL';
  executionLimits: {
    maxTokens: number;
    timeoutMs: number;
    maxRetries: number;
    maxAutonomousSteps: number;
  };
  preferredModelId: string;
  fallbackModelId?: string;
}
