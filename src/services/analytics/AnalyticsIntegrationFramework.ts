/**
 * ORCHESTRA Analytics Integration Framework
 * Central interface for normalized metrics, funnel telemetry, and advertising analytics.
 * Strictly distinguishes measured data from AI hypotheses, ensuring zero fabricated statistics.
 */

import { AnalyticsDataRecord } from '../../types/integrations';
import { LocalStoragePersistenceAdapter } from '../persistence/StorageAdapter';
import { AuditLogger } from '../audit/AuditLogger';

export class AnalyticsIntegrationFramework {
  private storage: LocalStoragePersistenceAdapter<AnalyticsDataRecord>;
  private auditLogger: AuditLogger;

  constructor(
    auditLogger: AuditLogger,
    storage?: LocalStoragePersistenceAdapter<AnalyticsDataRecord>
  ) {
    this.auditLogger = auditLogger;
    this.storage =
      storage ||
      new LocalStoragePersistenceAdapter<AnalyticsDataRecord>('analytics_records', []);
  }

  /**
   * List recorded analytics data points
   */
  public listRecords(ventureId?: string): AnalyticsDataRecord[] {
    const all = this.storage.getAll();
    return ventureId ? all.filter(r => r.ventureId === ventureId) : all;
  }

  /**
   * Record verified analytics metric
   */
  public recordMetric(
    data: Omit<AnalyticsDataRecord, 'id' | 'ingestedAt'>
  ): AnalyticsDataRecord {
    const id = `metric-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const record: AnalyticsDataRecord = {
      ...data,
      id,
      ingestedAt: new Date().toISOString()
    };

    this.storage.set(id, record);
    return record;
  }

  /**
   * Fetch telemetry for a venture from external connector via server API
   */
  public async queryTelemetry(
    ventureId: string,
    metricType: string
  ): Promise<{ isMeasured: boolean; records: AnalyticsDataRecord[]; notice?: string }> {
    try {
      const response = await fetch('/api/tools/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolId: 'tool_analytics_query',
          parameters: { ventureId, metricType },
          requestingAgentId: 'agt-grw-anlyst'
        })
      });

      const resData = await response.json();
      if (!response.ok || !resData.output) {
        return {
          isMeasured: false,
          records: this.listRecords(ventureId),
          notice: 'Telemetry endpoint unreachable. No live streaming metrics available.'
        };
      }

      return {
        isMeasured: resData.output.isMeasuredData || false,
        records: this.listRecords(ventureId),
        notice: resData.output.message
      };
    } catch {
      return {
        isMeasured: false,
        records: this.listRecords(ventureId),
        notice: 'Analytics query offline. Live telemetry requires POSTHOG_API_KEY.'
      };
    }
  }
}
