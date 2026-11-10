/**
 * ORCHESTRA Model Registry Service
 * Central authority on available AI models, capability matrices, context limits,
 * and cost tiers across Google Gemini, Groq, and OpenRouter.
 */

import { ModelDefinition, AIProviderId, ModelCapability } from '../../types/intelligence';

export const REGISTERED_MODELS: ModelDefinition[] = [
  // Google Gemini Models
  {
    provider: 'gemini',
    modelId: 'gemini-2.5-flash',
    displayName: 'Gemini 2.5 Flash',
    capabilities: ['text_generation', 'structured_json', 'tool_calling', 'fast_inference'],
    contextWindow: 1048576,
    maxOutputTokens: 8192,
    recommendedTemp: 0.3,
    costTier: 'low',
    description: 'Ultra-fast, cost-effective multimodal workhorse. Optimal for high-frequency routing, categorization, and real-time operations.',
    isAvailable: true,
  },
  {
    provider: 'gemini',
    modelId: 'gemini-2.5-pro',
    displayName: 'Gemini 2.5 Pro',
    capabilities: ['text_generation', 'complex_reasoning', 'structured_json', 'code_generation', 'tool_calling'],
    contextWindow: 2097152,
    maxOutputTokens: 8192,
    recommendedTemp: 0.2,
    costTier: 'medium',
    description: 'Advanced reasoning and multi-hop synthesis engine. Ideal for enterprise architecture RFCs, complex code audits, and strategic intelligence.',
    isAvailable: true,
  },
  {
    provider: 'gemini',
    modelId: 'gemini-3.8-flash',
    displayName: 'Gemini 3.8 Flash (Preview)',
    capabilities: ['text_generation', 'complex_reasoning', 'structured_json', 'code_generation', 'fast_inference'],
    contextWindow: 1048576,
    maxOutputTokens: 8192,
    recommendedTemp: 0.4,
    costTier: 'low',
    description: 'Next-generation low-latency frontier reasoning model with enhanced instruction adherence.',
    isAvailable: true,
  },

  // Groq Models
  {
    provider: 'groq',
    modelId: 'llama-3.3-70b-versatile',
    displayName: 'Llama 3.3 70B Versatile (Groq LPU)',
    capabilities: ['text_generation', 'complex_reasoning', 'structured_json', 'code_generation', 'fast_inference'],
    contextWindow: 131072,
    maxOutputTokens: 4096,
    recommendedTemp: 0.2,
    costTier: 'low',
    description: 'Near-instantaneous token throughput powered by Groq LPU inference. Superior for latency-critical agent triage and real-time alerts.',
    isAvailable: true,
  },
  {
    provider: 'groq',
    modelId: 'llama-3.1-8b-instant',
    displayName: 'Llama 3.1 8B Instant (Groq LPU)',
    capabilities: ['text_generation', 'structured_json', 'fast_inference'],
    contextWindow: 131072,
    maxOutputTokens: 2048,
    recommendedTemp: 0.1,
    costTier: 'free',
    description: 'Sub-second lightweight execution for schema validation, sentiment scoring, and quick keyword extraction.',
    isAvailable: true,
  },

  // OpenRouter Models
  {
    provider: 'openrouter',
    modelId: 'anthropic/claude-3.5-sonnet',
    displayName: 'Claude 3.5 Sonnet (OpenRouter)',
    capabilities: ['text_generation', 'complex_reasoning', 'code_generation', 'structured_json', 'tool_calling'],
    contextWindow: 200000,
    maxOutputTokens: 8192,
    recommendedTemp: 0.2,
    costTier: 'high',
    description: 'Industry benchmark for nuance, deep structural understanding, and high-fidelity technical writing.',
    isAvailable: true,
  },
  {
    provider: 'openrouter',
    modelId: 'openai/gpt-4o',
    displayName: 'GPT-4o Omnimodel (OpenRouter)',
    capabilities: ['text_generation', 'complex_reasoning', 'structured_json', 'tool_calling', 'fast_inference'],
    contextWindow: 128000,
    maxOutputTokens: 4096,
    recommendedTemp: 0.3,
    costTier: 'high',
    description: 'Flagship multimodal intelligence for high-stakes enterprise decisions, contract evaluations, and lead scoring.',
    isAvailable: true,
  },
  {
    provider: 'openrouter',
    modelId: 'deepseek/deepseek-r1',
    displayName: 'DeepSeek R1 Reasoning (OpenRouter)',
    capabilities: ['text_generation', 'complex_reasoning', 'code_generation'],
    contextWindow: 65536,
    maxOutputTokens: 8192,
    recommendedTemp: 0.6,
    costTier: 'low',
    description: 'Open-weights chain-of-thought reasoning model for mathematical verification and deep logic checking.',
    isAvailable: true,
  }
];

export class ModelRegistry {
  private models: Map<string, ModelDefinition> = new Map();

  constructor(initialModels: ModelDefinition[] = REGISTERED_MODELS) {
    initialModels.forEach(m => this.models.set(m.modelId, m));
  }

  public getModel(modelId: string): ModelDefinition | undefined {
    return this.models.get(modelId);
  }

  public listModels(filter?: (m: ModelDefinition) => boolean): ModelDefinition[] {
    const all = Array.from(this.models.values());
    return filter ? all.filter(filter) : all;
  }

  public getModelsByProvider(providerId: AIProviderId): ModelDefinition[] {
    return Array.from(this.models.values()).filter(m => m.provider === providerId);
  }

  public getModelsWithCapability(capability: ModelCapability): ModelDefinition[] {
    return Array.from(this.models.values()).filter(m => m.capabilities.includes(capability));
  }

  public getDefaultModelForProvider(providerId: AIProviderId): string {
    switch (providerId) {
      case 'gemini':
        return 'gemini-3.8-flash';
      case 'groq':
        return 'llama-3.3-70b-versatile';
      case 'openrouter':
        return 'anthropic/claude-3.5-sonnet';
      default:
        return 'gemini-3.8-flash';
    }
  }
}
