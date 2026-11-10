/**
 * ORCHESTRA Groq Provider Adapter
 * Connects to Groq LPU Ultra-Low Latency Inference via the secure server proxy.
 */

import { BaseProviderAdapter } from './BaseProviderAdapter';
import { AIProviderId } from '../../../types/intelligence';

export class GroqProviderAdapter extends BaseProviderAdapter {
  readonly providerId: AIProviderId = 'groq';
  readonly name = 'Groq Cloud';
}
