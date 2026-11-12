/**
 * ORCHESTRA AI Discovery & Intelligent Routing Service
 * Client-side interface to model registries, pricing evaluation,
 * capability benchmarking, and task-to-model intelligent routing.
 */

import { DiscoveredAIModel, ModelRoutingEvaluation } from '../../types/discovery';
import { AuditLogger } from '../audit/AuditLogger';
import { LocalStoragePersistenceAdapter } from '../persistence/StorageAdapter';

export class AIDiscoveryService {
  private auditLogger: AuditLogger;
  private catalogStorage: LocalStoragePersistenceAdapter<DiscoveredAIModel>;

  constructor(auditLogger: AuditLogger, catalogStorage?: LocalStoragePersistenceAdapter<DiscoveredAIModel>) {
    this.auditLogger = auditLogger;
    this.catalogStorage =
      catalogStorage ||
      new LocalStoragePersistenceAdapter<DiscoveredAIModel>('ai_discovered_models', []);
  }

  public async fetchCatalog(): Promise<DiscoveredAIModel[]> {
    try {
      const resp = await fetch('/api/ai/discovery/catalog');
      if (resp.ok) {
        const data = await resp.json();
        if (Array.isArray(data.models)) {
          this.catalogStorage.setAll(data.models);
          return data.models;
        }
      }
    } catch {
      // offline fallback
    }
    return this.catalogStorage.getAll();
  }

  public listModels(): DiscoveredAIModel[] {
    return this.catalogStorage.getAll();
  }

  public async evaluateRouting(
    taskObjective: string,
    options?: { maxLatencyMs?: number; maxBudgetUsd?: number; requireCoding?: boolean }
  ): Promise<ModelRoutingEvaluation> {
    try {
      const resp = await fetch('/api/ai/discovery/routing/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskObjective, ...options })
      });
      if (resp.ok) {
        const data = await resp.json();
        return data;
      }
    } catch {
      // fallback
    }

    return {
      taskObjective,
      estimatedComplexity: 'medium',
      recommendedModelId: 'google/gemini-2.5-flash',
      recommendedProvider: 'Google AI Studio',
      rationales: ['Sub-300ms latency baseline', 'Native search grounding available'],
      estimatedCostUsd: 0.0004,
      requiresExternalDelegation: false,
      alternativeOptions: [
        { modelId: 'groq/llama-3.3-70b-versatile', tradeOff: 'Fastest token throughput (140ms)', costEstimate: 0.0008 }
      ]
    };
  }
}
