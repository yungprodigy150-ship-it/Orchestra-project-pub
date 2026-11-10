/**
 * ORCHESTRA Google Gemini Provider Adapter
 * Connects to Google's frontier models via the secure server proxy or server-side SDK.
 */

import { BaseProviderAdapter } from './BaseProviderAdapter';
import { AIProviderId } from '../../../types/intelligence';

export class GeminiProviderAdapter extends BaseProviderAdapter {
  readonly providerId: AIProviderId = 'gemini';
  readonly name = 'Google Gemini';
}
