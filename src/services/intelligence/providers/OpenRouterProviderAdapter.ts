/**
 * ORCHESTRA OpenRouter Provider Adapter
 * Connects to OpenRouter multi-provider model routing gateway via secure server proxy.
 */

import { BaseProviderAdapter } from './BaseProviderAdapter';
import { AIProviderId } from '../../../types/intelligence';

export class OpenRouterProviderAdapter extends BaseProviderAdapter {
  readonly providerId: AIProviderId = 'openrouter';
  readonly name = 'OpenRouter Gateway';
}
