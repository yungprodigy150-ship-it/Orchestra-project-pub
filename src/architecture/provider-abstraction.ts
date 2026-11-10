/**
 * ORCHESTRA Provider Abstraction Layer
 * Decouples agents and orchestration workflows from specific AI LLM vendors.
 * Enables switching between Gemini, Anthropic, OpenAI, or self-hosted models without app rewrites.
 */

import { AIProviderConfig } from '../types';

export interface PromptExecutionRequest {
  systemPrompt: string;
  userPrompt: string;
  contextDocuments?: Array<{ title: string; content: string }>;
  temperature?: number;
  maxOutputTokens?: number;
}

export interface PromptExecutionResponse {
  content: string;
  provider: string;
  model: string;
  tokensUsed: { prompt: number; completion: number; total: number };
  latencyMs: number;
  timestamp: string;
}

export interface IAIProviderAdapter {
  id: string;
  name: string;
  executePrompt(req: PromptExecutionRequest): Promise<PromptExecutionResponse>;
  checkHealth(): Promise<{ healthy: boolean; latencyMs: number }>;
}

/**
 * Standard default AI providers available in ORCHESTRA
 */
export const DEFAULT_AI_PROVIDERS: AIProviderConfig[] = [
  {
    id: 'gemini',
    name: 'Google Gemini',
    isActive: true,
    defaultModel: 'gemini-2.5-flash',
    availableModels: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash'],
    temperature: 0.2,
    maxTokens: 4096,
    rateLimitRpm: 120,
    description: 'High-speed multimodal orchestration with native server-side integration',
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    isActive: false,
    defaultModel: 'claude-3-5-sonnet-20241022',
    availableModels: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-3-opus'],
    temperature: 0.2,
    maxTokens: 4096,
    rateLimitRpm: 60,
    description: 'Complex reasoning, legal policy review, and long-context synthesis',
  },
  {
    id: 'openai',
    name: 'OpenAI GPT',
    isActive: false,
    defaultModel: 'gpt-4o',
    availableModels: ['gpt-4o', 'gpt-4o-mini', 'o1-preview'],
    temperature: 0.2,
    maxTokens: 4096,
    rateLimitRpm: 90,
    description: 'General intelligence, tool-use coordination, and JSON schema formatting',
  },
  {
    id: 'local',
    name: 'Local / Ollama Cluster',
    isActive: false,
    defaultModel: 'llama-3.3-70b-instruct',
    availableModels: ['llama-3.3-70b-instruct', 'deepseek-r1-70b', 'qwen-2.5-coder-32b'],
    temperature: 0.1,
    maxTokens: 8192,
    rateLimitRpm: 300,
    description: 'Private on-premise inference for confidential internal product source',
  },
];
