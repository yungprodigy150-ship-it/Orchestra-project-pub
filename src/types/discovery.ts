/**
 * ORCHESTRA AI Discovery and Intelligent Routing Types
 * Enables agents to discover model capabilities across OpenRouter, Hugging Face,
 * compare pricing, context, latency, and route subtasks dynamically.
 */

export interface DiscoveredAIModel {
  id: string; // e.g. "anthropic/claude-3.7-sonnet" or "deepseek/deepseek-r1"
  name: string;
  provider: string; // e.g. "OpenRouter", "Google", "Hugging Face"
  contextLength: number;
  inputCostPer1M: number;
  outputCostPer1M: number;
  modalities: Array<'text' | 'image' | 'audio' | 'code' | 'video'>;
  specialties: string[];
  benchmarks: {
    reasoningScore?: number;
    codingScore?: number;
    latencyMs?: number;
  };
  apiCompatibility: 'openai_chat_v1' | 'gemini_v1' | 'hf_inference';
  isConfigured: boolean;
  licensing: string;
}

export interface ModelRoutingEvaluation {
  taskObjective: string;
  estimatedComplexity: 'low' | 'medium' | 'high' | 'expert';
  recommendedModelId: string;
  recommendedProvider: string;
  rationales: string[];
  estimatedCostUsd: number;
  requiresExternalDelegation: boolean;
  alternativeOptions: Array<{ modelId: string; tradeOff: string; costEstimate: number }>;
}
