/**
 * ORCHESTRA Agent Identity Service
 * Manages unique digital identities, cryptographic fingerprints, User-Agent signatures,
 * and autonomy permission levels across all registered agents.
 */

import { AgentDigitalIdentity, AgentAutonomyPermissionLevel, AgentExternalAccountAccess } from '../../types/identity';
import { AgentRegistry } from '../agent/AgentRegistry';
import { AuditLogger } from '../audit/AuditLogger';
import { LocalStoragePersistenceAdapter } from '../persistence/StorageAdapter';

export const INITIAL_DIGITAL_IDENTITIES: AgentDigitalIdentity[] = [
  {
    id: 'ident-agt-scout',
    agentId: 'agt-scout',
    name: 'Scout',
    callsign: 'SCOUT-01',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&fit=crop&crop=faces',
    role: 'Opportunity Hunter',
    description: 'Autonomous market telemetry and enterprise software opportunity scout.',
    specialization: 'Public SEC filings, Developer changelogs, B2B SaaS signals',
    capabilities: ['Autonomous Web Navigation', 'Corporate Domain Discovery', 'Signal Correlation'],
    assignedResponsibilities: ['Discover real target organizations', 'Inspect public pricing indicators', 'Score venture relevance'],
    availableModels: ['google/gemini-2.5-flash', 'groq/llama-3.3-70b-versatile'],
    connectedToolIds: ['tool_web_research', 'tool_lead_discovery', 'tool_website_intelligence'],
    authorizedExternalAccounts: [
      { accountId: 'acc-google-workspace', accountType: 'google_workspace', accountName: 'Google Drive Briefs', scopeLevel: 'read_only', isGranted: true, grantedAt: '2026-11-10T10:00:00Z' },
      { accountId: 'acc-github-org', accountType: 'github', accountName: 'GitHub Enterprise', scopeLevel: 'read_only', isGranted: true, grantedAt: '2026-11-10T10:00:00Z' }
    ],
    permissionLevel: 'execute',
    userAgentSignature: 'ORCHESTRA-Agent/1.0 (Scout; Role:OpportunityHunter; ID:agt-scout; +https://orchestra.internal)',
    digitalCertificateId: 'cert-sha256-scout-9f82ab11',
    operationalStatus: 'ACTIVE',
    totalExecutionsCount: 38,
    totalConversationsCount: 14,
    lastActiveTimestamp: new Date().toISOString(),
    createdAt: '2026-11-01T08:00:00Z'
  },
  {
    id: 'ident-agt-2',
    agentId: 'agt-2',
    name: 'Vanguard',
    callsign: 'VANGUARD-02',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&fit=crop&crop=faces',
    role: 'Market Intelligence Agent',
    description: 'Macro-economic landscape analysis, competitor teardowns, and market risk intelligence.',
    specialization: 'Competitor architecture analysis, OpenTelemetry benchmarks',
    capabilities: ['Deep Web Research', 'Document Schema Parsing', 'DOM Structure Diagnostics'],
    assignedResponsibilities: ['Analyze competitor pricing cues', 'Detect underserved enterprise verticals'],
    availableModels: ['google/gemini-2.5-pro', 'anthropic/claude-3.5-sonnet'],
    connectedToolIds: ['tool_web_research', 'tool_doc_schema_analyzer', 'tool_website_intelligence'],
    authorizedExternalAccounts: [
      { accountId: 'acc-google-workspace', accountType: 'google_workspace', accountName: 'Market Research Drive', scopeLevel: 'read_only', isGranted: true, grantedAt: '2026-11-10T10:00:00Z' },
      { accountId: 'acc-openrouter', accountType: 'openrouter', accountName: 'OpenRouter Multi-Model', scopeLevel: 'authorized_execution', isGranted: true, grantedAt: '2026-11-10T10:00:00Z' }
    ],
    permissionLevel: 'execute',
    userAgentSignature: 'ORCHESTRA-Agent/1.0 (Vanguard; Role:MarketIntel; ID:agt-2; +https://orchestra.internal)',
    digitalCertificateId: 'cert-sha256-vanguard-4c33ee78',
    operationalStatus: 'ACTIVE',
    totalExecutionsCount: 52,
    totalConversationsCount: 21,
    lastActiveTimestamp: new Date().toISOString(),
    createdAt: '2026-11-01T08:00:00Z'
  },
  {
    id: 'ident-agt-3',
    agentId: 'agt-3',
    name: 'Nexus',
    callsign: 'NEXUS-03',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=128&fit=crop&crop=faces',
    role: 'Prospect Intelligence Agent',
    description: 'Enterprise account profiling, technology stack discovery, and executive stakeholder mapping.',
    specialization: 'CRM Enrichment, Executive mapping, Tech stack signatures',
    capabilities: ['Website Scraping', 'CRM Profiling', 'Contact Channel Discovery'],
    assignedResponsibilities: ['Extract corporate contacts', 'Audit tech spend from job disclosures'],
    availableModels: ['google/gemini-2.5-flash'],
    connectedToolIds: ['tool_web_research', 'tool_website_intelligence', 'tool_crm_account_profiler'],
    authorizedExternalAccounts: [
      { accountId: 'acc-github-org', accountType: 'github', accountName: 'GitHub Repositories', scopeLevel: 'read_only', isGranted: true, grantedAt: '2026-11-10T10:00:00Z' }
    ],
    permissionLevel: 'assist',
    userAgentSignature: 'ORCHESTRA-Agent/1.0 (Nexus; Role:ProspectIntel; ID:agt-3; +https://orchestra.internal)',
    digitalCertificateId: 'cert-sha256-nexus-77da0119',
    operationalStatus: 'ACTIVE',
    totalExecutionsCount: 29,
    totalConversationsCount: 11,
    lastActiveTimestamp: new Date().toISOString(),
    createdAt: '2026-11-01T08:00:00Z'
  },
  {
    id: 'ident-agt-out-asst',
    agentId: 'agt-out-asst',
    name: 'Courier',
    callsign: 'COURIER-04',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=128&fit=crop&crop=faces',
    role: 'Outreach Assistant',
    description: 'Personalized outbound communication architect. Strictly draft-only under human supervisory gating.',
    specialization: 'Bespoke B2B communications, Executive technical value propositions',
    capabilities: ['Outreach Drafting', 'Tone Personalization', 'Approval Queue Packaging'],
    assignedResponsibilities: ['Draft bespoke executive emails', 'Stage communications in Human Approval Queue'],
    availableModels: ['google/gemini-2.5-flash'],
    connectedToolIds: ['tool_crm_account_profiler', 'tool_web_research'],
    authorizedExternalAccounts: [
      { accountId: 'acc-google-workspace', accountType: 'google_workspace', accountName: 'Gmail Drafts', scopeLevel: 'draft_only', isGranted: true, grantedAt: '2026-11-10T10:00:00Z' }
    ],
    permissionLevel: 'restricted',
    userAgentSignature: 'ORCHESTRA-Agent/1.0 (Courier; Role:OutreachAssistant; ID:agt-out-asst; +https://orchestra.internal)',
    digitalCertificateId: 'cert-sha256-courier-18b5ff32',
    operationalStatus: 'ACTIVE',
    totalExecutionsCount: 44,
    totalConversationsCount: 19,
    lastActiveTimestamp: new Date().toISOString(),
    createdAt: '2026-11-01T08:00:00Z'
  },
  {
    id: 'ident-agt-4',
    agentId: 'agt-4',
    name: 'Atlas',
    callsign: 'ATLAS-05',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=128&fit=crop&crop=faces',
    role: 'Portfolio Strategist',
    description: 'SaaS venture alignment, API contract verification, and multi-product synergy analysis.',
    specialization: 'OpenAPI 3.1 contracts, GraphQL federated schemas, Portfolio resource distribution',
    capabilities: ['Schema Analysis', 'Cross-Venture Synthesis', 'Resource Planning'],
    assignedResponsibilities: ['Analyze technical schemas', 'Coordinate agent delegations'],
    availableModels: ['google/gemini-2.5-pro', 'anthropic/claude-3.5-sonnet'],
    connectedToolIds: ['tool_doc_schema_analyzer', 'tool_web_research'],
    authorizedExternalAccounts: [
      { accountId: 'acc-github-org', accountType: 'github', accountName: 'GitHub Enterprise', scopeLevel: 'read_only', isGranted: true, grantedAt: '2026-11-10T10:00:00Z' }
    ],
    permissionLevel: 'execute',
    userAgentSignature: 'ORCHESTRA-Agent/1.0 (Atlas; Role:PortfolioStrategist; ID:agt-4; +https://orchestra.internal)',
    digitalCertificateId: 'cert-sha256-atlas-21fe4499',
    operationalStatus: 'ACTIVE',
    totalExecutionsCount: 31,
    totalConversationsCount: 16,
    lastActiveTimestamp: new Date().toISOString(),
    createdAt: '2026-11-01T08:00:00Z'
  }
];

export class AgentIdentityService {
  private storage: LocalStoragePersistenceAdapter<AgentDigitalIdentity>;
  private auditLogger: AuditLogger;

  constructor(auditLogger: AuditLogger, storage?: LocalStoragePersistenceAdapter<AgentDigitalIdentity>) {
    this.auditLogger = auditLogger;
    this.storage =
      storage ||
      new LocalStoragePersistenceAdapter<AgentDigitalIdentity>(
        'agent_identities',
        INITIAL_DIGITAL_IDENTITIES
      );
  }

  public listIdentities(): AgentDigitalIdentity[] {
    return this.storage.getAll();
  }

  public getIdentity(agentIdOrIdentityId: string): AgentDigitalIdentity | null {
    const all = this.storage.getAll();
    return all.find(i => i.agentId === agentIdOrIdentityId || i.id === agentIdOrIdentityId) || null;
  }

  public updatePermissionLevel(agentId: string, level: AgentAutonomyPermissionLevel): AgentDigitalIdentity {
    const identity = this.getIdentity(agentId);
    if (!identity) throw new Error(`Identity for agent "${agentId}" not found.`);

    identity.permissionLevel = level;
    identity.lastActiveTimestamp = new Date().toISOString();
    this.storage.set(identity.id, identity);

    this.auditLogger.log({
      type: 'STATUS_CHANGED',
      title: `Agent Permission Updated: ${identity.name} (${level.toUpperCase()})`,
      description: `Autonomy level adjusted to ${level}. Least privilege boundaries applied.`,
      severity: 'info',
      actor: { id: 'operator', name: 'Human Operator', type: 'human' }
    });

    return identity;
  }

  public recordActivity(agentId: string): void {
    const identity = this.getIdentity(agentId);
    if (identity) {
      identity.totalExecutionsCount += 1;
      identity.lastActiveTimestamp = new Date().toISOString();
      this.storage.set(identity.id, identity);
    }
  }

  public recordConversation(agentId: string): void {
    const identity = this.getIdentity(agentId);
    if (identity) {
      identity.totalConversationsCount += 1;
      identity.lastActiveTimestamp = new Date().toISOString();
      this.storage.set(identity.id, identity);
    }
  }
}
