/**
 * ORCHESTRA Lead Discovery Engine
 * Discovers potential customer organizations and businesses using legitimate public information sources.
 * Enforces deduplication by domain, calculates relevance confidence scores,
 * and promotes qualified organizations into the CRM pipeline.
 */

import { DiscoveredLead, LeadDiscoveryQuery } from '../../types/integrations';
import { LocalStoragePersistenceAdapter } from '../persistence/StorageAdapter';
import { AuditLogger } from '../audit/AuditLogger';
import { CommercialOrchestrator } from '../commercial/CommercialOrchestrator';

export const INITIAL_DISCOVERED_LEADS: DiscoveredLead[] = [
  {
    id: 'lead-01',
    organizationName: 'Hyperscale Cloud Dynamics',
    website: 'https://hyperscaledynamics.io',
    domain: 'hyperscaledynamics.io',
    industry: 'Cloud Infrastructure & Kubernetes',
    location: 'Berlin, Germany',
    discoverySource: 'Public FinOps Registry & KubeCon 2026 Directory',
    discoveryTimestamp: '2026-11-10T08:30:00Z',
    relevantProductId: 'v-1',
    qualificationReason: 'Operates 450+ spot instances across multi-region AWS with substantial uncompacted compute waste.',
    confidenceScore: 91,
    researchStatus: 'QUALIFIED',
    estimatedTechSpend: '$80k-$120k ARR',
    tags: ['EKS', 'Spot Instances', 'FinOps']
  },
  {
    id: 'lead-02',
    organizationName: 'VectorStream Telemetry GmbH',
    website: 'https://vectorstream.de',
    domain: 'vectorstream.de',
    industry: 'Real-time Analytics & Streaming CDC',
    location: 'Munich, Germany',
    discoverySource: 'High-Throughput Kafka Users Community',
    discoveryTimestamp: '2026-11-09T14:15:00Z',
    relevantProductId: 'v-2',
    qualificationReason: 'Experiencing PostgreSQL logical replication slot lag while streaming into ClickHouse and BigQuery.',
    confidenceScore: 87,
    researchStatus: 'DISCOVERED',
    estimatedTechSpend: '$40k-$60k ARR',
    tags: ['PostgreSQL', 'Debezium', 'Kafka Lag']
  },
  {
    id: 'lead-03',
    organizationName: 'Synthetix Genomics Labs',
    website: 'https://synthetixlabs.org',
    domain: 'synthetixlabs.org',
    industry: 'Bioinformatics & Distributed Data',
    location: 'Cambridge, MA, USA',
    discoverySource: 'Public GitHub Bioinformatics Repositories',
    discoveryTimestamp: '2026-11-08T11:00:00Z',
    relevantProductId: 'v-3',
    qualificationReason: 'Navigating vast OpenAPI 3.1 and federated GraphQL schemas across 80+ microservices.',
    confidenceScore: 79,
    researchStatus: 'DISCOVERED',
    estimatedTechSpend: '$50k-$90k ARR',
    tags: ['OpenAPI 3.1', 'GraphQL Federation']
  }
];

export class LeadDiscoveryEngine {
  private storage: LocalStoragePersistenceAdapter<DiscoveredLead>;
  private auditLogger: AuditLogger;
  private commercialOrchestrator?: CommercialOrchestrator;

  constructor(
    auditLogger: AuditLogger,
    storage?: LocalStoragePersistenceAdapter<DiscoveredLead>,
    commercialOrchestrator?: CommercialOrchestrator
  ) {
    this.auditLogger = auditLogger;
    this.commercialOrchestrator = commercialOrchestrator;
    this.storage =
      storage ||
      new LocalStoragePersistenceAdapter<DiscoveredLead>('discovered_leads', INITIAL_DISCOVERED_LEADS);
  }

  public setCommercialOrchestrator(orchestrator: CommercialOrchestrator): void {
    this.commercialOrchestrator = orchestrator;
  }

  /**
   * List all stored discovered leads
   */
  public listLeads(): DiscoveredLead[] {
    return this.storage.getAll().sort(
      (a, b) => new Date(b.discoveryTimestamp).getTime() - new Date(a.discoveryTimestamp).getTime()
    );
  }

  /**
   * Get lead by ID
   */
  public getLead(id: string): DiscoveredLead | undefined {
    return this.storage.get(id) || undefined;
  }

  /**
   * Execute lead discovery query and ingest deduplicated results
   */
  public async discoverLeads(
    query: LeadDiscoveryQuery,
    requestingAgentName: string = 'Scout (OPP-HUNTER)'
  ): Promise<{ newLeads: DiscoveredLead[]; duplicateCount: number }> {
    const response = await fetch('/api/tools/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        toolId: 'tool_lead_discovery',
        parameters: {
          industry: query.industry,
          keywords: query.keywords,
          targetVentureId: query.targetVentureId,
          geography: query.geography
        },
        requestingAgentId: 'agt-scout'
      })
    });

    const resData = await response.json();
    if (!response.ok || resData.status !== 'SUCCESS') {
      throw new Error(resData.error || resData.message || 'Lead discovery execution failed.');
    }

    const rawLeads: any[] = resData.output?.leads || [];
    const existing = this.listLeads();
    const existingDomains = new Set(existing.map(l => l.domain?.toLowerCase()).filter(Boolean));
    const existingNames = new Set(existing.map(l => l.organizationName.toLowerCase().trim()));

    const newLeads: DiscoveredLead[] = [];
    let duplicateCount = 0;

    for (const raw of rawLeads) {
      const normalizedDomain = raw.domain ? raw.domain.toLowerCase().trim() : undefined;
      const normalizedName = raw.organizationName.toLowerCase().trim();

      if (
        (normalizedDomain && existingDomains.has(normalizedDomain)) ||
        existingNames.has(normalizedName)
      ) {
        duplicateCount++;
        continue;
      }

      const lead: DiscoveredLead = {
        id: raw.id || `lead-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        organizationName: raw.organizationName,
        website: raw.website,
        domain: normalizedDomain,
        industry: raw.industry || query.industry,
        location: raw.location || query.geography || 'Global',
        discoverySource: raw.discoverySource || 'Search Grounding Discovery',
        discoveryTimestamp: raw.discoveryTimestamp || new Date().toISOString(),
        relevantProductId: query.targetVentureId,
        qualificationReason: raw.qualificationReason || `Identified matching ${query.industry} operational criteria.`,
        confidenceScore: raw.confidenceScore || 80,
        researchStatus: 'DISCOVERED',
        estimatedTechSpend: raw.estimatedTechSpend,
        tags: query.keywords
      };

      this.storage.set(lead.id, lead);
      newLeads.push(lead);
      if (normalizedDomain) existingDomains.add(normalizedDomain);
      existingNames.add(normalizedName);
    }

    this.auditLogger.log({
      type: 'TASK_EXECUTION',
      title: `Lead Discovery: ${newLeads.length} Organizations Ingested`,
      description: `${newLeads.length} new leads discovered in "${query.industry}". ${duplicateCount} duplicates filtered. Actor: ${requestingAgentName}.`,
      severity: 'info',
      actor: { id: 'agt-scout', name: requestingAgentName, type: 'agent' }
    });

    return { newLeads, duplicateCount };
  }

  /**
   * Promote a discovered lead into the CRM pipeline
   */
  public promoteLeadToCRM(leadId: string): string | null {
    const lead = this.getLead(leadId);
    if (!lead || !this.commercialOrchestrator) return null;

    const relationship = this.commercialOrchestrator.createRelationship({
      organization: lead.organizationName,
      contactDetails: lead.website,
      industry: lead.industry,
      relatedProductId: lead.relevantProductId,
      relationshipCategory: 'prospect',
      pipelineStage: 'QUALIFIED',
      source: `Lead Discovery: ${lead.discoverySource}`,
      notes: `${lead.qualificationReason}${lead.estimatedTechSpend ? ` Estimated Spend: ${lead.estimatedTechSpend}` : ''}`,
      assignedAgentId: 'agt-rel-mgr',
      nextRecommendedAction: 'Assign Outreach Assistant to formulate personalized executive brief',
      estimatedValue: lead.estimatedTechSpend || '$50,000 ARR',
      qualificationScore: lead.confidenceScore
    });

    // Mark lead as qualified and link relationship ID
    const updatedLead: DiscoveredLead = {
      ...lead,
      researchStatus: 'QUALIFIED',
      promotedToRelationshipId: relationship.id
    };
    this.storage.set(lead.id, updatedLead);

    this.auditLogger.log({
      type: 'STATUS_CHANGED',
      title: `Lead Promoted to CRM: ${lead.organizationName}`,
      description: `Discovered lead ${lead.organizationName} promoted to CRM pipeline stage QUALIFIED (Rel ID: ${relationship.id}).`,
      severity: 'info',
      actor: { id: 'agt-rel-mgr', name: 'Nexus (REL-MGR)', type: 'agent' }
    });

    return relationship.id;
  }

  /**
   * Update lead research status
   */
  public updateLeadStatus(id: string, status: 'DISCOVERED' | 'QUALIFIED' | 'ENRICHED' | 'REJECTED'): void {
    const lead = this.getLead(id);
    if (lead) {
      this.storage.set(id, { ...lead, researchStatus: status });
    }
  }
}
