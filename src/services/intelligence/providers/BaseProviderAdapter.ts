/**
 * ORCHESTRA Base AI Provider Adapter
 * Provides shared error handling, retry backoff, timeout enforcement,
 * and proxy routing to secure server-side endpoints.
 */

import {
  AIProviderId,
  IAIProviderAdapter,
  ProviderConfigStatus,
  AIExecutionRequest,
  AIExecutionResponse,
} from '../../../types/intelligence';

export abstract class BaseProviderAdapter implements IAIProviderAdapter {
  abstract readonly providerId: AIProviderId;
  abstract readonly name: string;

  /**
   * Ping server-side configuration status
   */
  async checkStatus(): Promise<{ status: ProviderConfigStatus; message?: string }> {
    try {
      const rawAppUrl = typeof process !== 'undefined' ? process.env?.APP_URL : undefined;
      const validAppUrl = (rawAppUrl && rawAppUrl.startsWith('http') && !rawAppUrl.includes('MY_')) ? rawAppUrl : 'http://localhost:3000';
      const baseUrl = typeof window !== 'undefined' ? '' : validAppUrl;

      const res = await fetch(`${baseUrl}/api/intelligence/providers/status?provider=${this.providerId}`);
      if (!res.ok) {
        return {
          status: 'unconfigured',
          message: `Server returned HTTP ${res.status}: Proxy endpoint unavailable or offline.`
        };
      }
      const data = await res.json();
      return {
        status: data.status || 'unconfigured',
        message: data.message
      };
    } catch {
      // In standalone client preview mode when backend is starting or offline
      return {
        status: 'unconfigured',
        message: 'Server proxy offline. Simulation fallback ready.'
      };
    }
  }

  /**
   * Executes AI request through the secure server route with retries and timeout
   */
  async executeRequest(params: AIExecutionRequest): Promise<AIExecutionResponse> {
    const startTime = performance.now();
    const timeoutMs = params.timeoutMs || 25000;
    const maxRetries = params.maxRetries ?? 2;
    const rawAppUrl = typeof process !== 'undefined' ? process.env?.APP_URL : undefined;
    const validAppUrl = (rawAppUrl && rawAppUrl.startsWith('http') && !rawAppUrl.includes('MY_')) ? rawAppUrl : 'http://localhost:3000';
    const baseUrl = typeof window !== 'undefined' ? '' : validAppUrl;

    let attempt = 0;
    let lastError: Error | null = null;

    while (attempt <= maxRetries) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch(`${baseUrl}/api/intelligence/execute`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...params,
            provider: this.providerId
          }),
          signal: controller.signal
        });

        clearTimeout(timer);

        if (response.ok) {
          const contentType = response.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const result: AIExecutionResponse = await response.json();
            return result;
          }
        }

        // Check if server indicated unconfigured or invalid key
        if (response.status === 401 || response.status === 403) {
          let errorText = `Provider API Key invalid or unconfigured on server.`;
          try {
            const errData = await response.json();
            if (errData?.error) errorText = errData.error;
          } catch {
            // ignore
          }
          return this.generateSimulatedFallback(params, startTime, errorText);
        }

        // For 5xx or 429, retry if attempts remain
        if (response.status === 429 || response.status >= 500) {
          attempt++;
          if (attempt <= maxRetries) {
            const backoffMs = Math.pow(2, attempt) * 500 + Math.random() * 200;
            await new Promise(r => setTimeout(r, backoffMs));
            continue;
          }
        }

        const errorPayload = await response.json().catch(() => ({ error: `Server error: ${response.statusText}` }));
        throw new Error(errorPayload.error || `HTTP ${response.status}`);
      } catch (err: any) {
        clearTimeout(timer);
        lastError = err;

        if (err.name === 'AbortError') {
          return {
            text: '',
            provider: this.providerId,
            model: params.model,
            durationMs: Math.round(performance.now() - startTime),
            isSimulated: false,
            error: `Execution timed out after ${timeoutMs}ms.`,
            timestamp: new Date().toISOString()
          };
        }

        attempt++;
        if (attempt <= maxRetries) {
          const backoffMs = Math.pow(2, attempt) * 400;
          await new Promise(r => setTimeout(r, backoffMs));
        }
      }
    }

    // If server is unreachable or failed completely, return transparent simulation with clear notice
    return this.generateSimulatedFallback(
      params,
      startTime,
      lastError?.message || 'Server proxy connection failed'
    );
  }

  /**
   * Deterministic simulation generator when credentials are not configured or server proxy is offline.
   * Ensures the user interface remains responsive and tests the full orchestration pipeline.
   */
  protected generateSimulatedFallback(
    params: AIExecutionRequest,
    startTime: number,
    reason: string
  ): AIExecutionResponse {
    const elapsed = Math.max(120, Math.round(performance.now() - startTime));
    const tokenEstimate = Math.max(45, Math.round(params.prompt.length / 3.8));

    let simulatedText = '';
    let structuredData: any = undefined;

    if (params.structuredSchema) {
      structuredData = {
        status: 'ANALYSIS_COMPLETE',
        confidenceScore: 0.94,
        sourceProvider: this.providerId,
        sourceModel: params.model,
        summary: `Deterministic execution completed for: "${params.prompt.slice(0, 60)}..."`,
        findings: [
          'Enterprise telemetry invariants verified within tolerance.',
          'Cross-referenced active venture objectives in organizational memory.',
          'No escalation required for current operational step.'
        ],
        recommendedAction: 'PROCEED_TO_DELEGATION'
      };
      simulatedText = JSON.stringify(structuredData, null, 2);
    } else {
      simulatedText = `[SIMULATION RESPONSE - Provider: ${this.name} (${params.model})]

ORCHESTRA Intelligence Dispatch:
The reasoning request was analyzed against the operational context and agent profile.

Prompt summary: "${params.prompt.trim()}"

Evaluated findings:
1. Operational alignment verified with organizational policies.
2. Context references checked: ${params.contextDocuments?.length ?? 0} documents integrated.
3. Recommended next step: Continue task progression or solicit operator approval if privileged tools are involved.

Note: This output was synthesized via ORCHESTRA's internal sandbox engine (${reason}).`;
    }

    return {
      text: simulatedText,
      structuredData,
      provider: this.providerId,
      model: params.model,
      durationMs: elapsed,
      tokensUsed: {
        prompt: Math.round(params.prompt.length / 4),
        completion: tokenEstimate,
        total: Math.round(params.prompt.length / 4) + tokenEstimate
      },
      isSimulated: true,
      simulationReason: reason,
      timestamp: new Date().toISOString()
    };
  }
}
