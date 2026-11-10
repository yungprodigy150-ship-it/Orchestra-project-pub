/**
 * ORCHESTRA Stage 6: Real-World Integrations & Execution Infrastructure
 * Types for External Tools, Integration Gateways, Lead Discovery,
 * Website Intelligence, Web Research, Analytics, and Execution Authorizations.
 */

import { ToolPermissionLevel, ToolStatus } from './intelligence';

export type IntegrationCategory =
  | 'search'
  | 'intel'
  | 'email'
  | 'crm'
  | 'analytics'
  | 'advertising'
  | 'payment'
  | 'social';

export type IntegrationConnectionStatus =
  | 'CONNECTED'
  | 'NOT_CONFIGURED'
  | 'DISABLED'
  | 'ERROR'
  | 'AUTHENTICATION_REQUIRED';

export type RiskClassification = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ToolExecutionStatus =
  | 'SUCCESS'
  | 'FAILED'
  | 'BLOCKED_PERMISSION'
  | 'BLOCKED_APPROVAL'
  | 'TIMEOUT'
  | 'NOT_CONFIGURED';

export type ExecutionApprovalStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'EXECUTED'
  | 'FAILED';

export type ActionApprovalType =
  | 'SEND_EMAIL'
  | 'PUBLISH_CONTENT'
  | 'CONTACT_PROSPECT'
  | 'LAUNCH_CAMPAIGN'
  | 'FINANCIAL_COMMITMENT'
  | 'CREATE_ACCOUNT'
  | 'IRREVERSIBLE_ACTION';

// Integration Gateway Connector
export interface IntegrationConnector {
  id: string;
  name: string;
  category: IntegrationCategory;
  provider: string;
  description: string;
  status: IntegrationConnectionStatus;
  statusMessage: string;
  requiredEnvVar: string;
  authType: 'api_key' | 'bearer_token' | 'oauth2' | 'webhook';
  lastTestedAt?: string;
  lastTestLatencyMs?: number;
  lastErrorDetails?: string;
  endpointUrl?: string;
  documentationUrl: string;
  supportedToolIds: string[];
  isEnabled: boolean;
  capabilities: string[];
}

// Extended Tool Definition with Execution Specifications
export interface ExternalToolDefinition {
  id: string;
  name: string;
  description: string;
  category: 'research' | 'infrastructure' | 'database' | 'graph' | 'outreach' | 'analytics' | 'intel';
  inputSchema: {
    type: 'object';
    properties: Record<string, { type: string; description: string; required?: boolean }>;
    required?: string[];
  };
  outputSchema: {
    type: 'object';
    properties: Record<string, { type: string; description: string }>;
  };
  permissionLevel: ToolPermissionLevel;
  riskLevel: RiskClassification;
  status: ToolStatus;
  statusNotice?: string;
  requiredIntegrationId?: string;
  timeoutMs: number;
  retryLimit: number;
  rateLimitPerMinute: number;
  executionCountTotal: number;
  failureCountTotal: number;
}

// Tool Execution Request from an Agent or Operator
export interface ToolExecutionRequest {
  toolId: string;
  requestingAgentId: string;
  requestingAgentName: string;
  parameters: Record<string, any>;
  taskId?: string;
  approvalId?: string;
  isHumanSupervisor?: boolean;
}

// Recorded Tool Execution Log Item
export interface ToolExecutionRecord {
  id: string;
  toolId: string;
  toolName: string;
  requestingAgentId: string;
  requestingAgentName: string;
  status: ToolExecutionStatus;
  inputParameters: Record<string, any>; // sanitized: credentials omitted
  outputData?: any;
  errorMessage?: string;
  durationMs: number;
  timestamp: string;
  relatedTaskId?: string;
  approvalRefId?: string;
  integrationId?: string;
}

// 2. Web Research Specification
export interface WebResearchSource {
  title: string;
  url: string;
  snippet: string;
  publicationDate?: string;
  confidenceScore?: number;
}

export interface WebResearchResult {
  query: string;
  domainFilter?: string;
  citationSummary: string;
  sources: WebResearchSource[];
  retrievedFacts: string[];
  aiInterpretations: string[];
  providerUsed: string;
  executionTimestamp: string;
  isVerifiedWebResult: boolean;
}

// 3. Lead Discovery Specification
export interface DiscoveredLead {
  id: string;
  organizationName: string;
  website?: string;
  domain?: string;
  industry: string;
  location?: string;
  discoverySource: string;
  discoveryTimestamp: string;
  relevantProductId: string; // e.g. 'v-1', 'v-2', 'v-3'
  qualificationReason: string;
  confidenceScore: number; // 1-100
  researchStatus: 'DISCOVERED' | 'QUALIFIED' | 'ENRICHED' | 'REJECTED';
  keyContactName?: string;
  keyContactRole?: string;
  estimatedTechSpend?: string;
  promotedToRelationshipId?: string;
  tags?: string[];
}

export interface LeadDiscoveryQuery {
  industry: string;
  businessCategory?: string;
  geography?: string;
  organizationType?: string;
  keywords: string[];
  targetVentureId: string;
  maxLeadsToDiscover?: number;
}

// 5. Website and Business Intelligence Specification
export interface WebsiteIntelligenceResult {
  url: string;
  resolvedTitle: string;
  metaDescription: string;
  primaryServices: string[];
  publicContactChannels: {
    email?: string;
    phone?: string;
    contactUrl?: string;
    socialLinks?: string[];
  };
  publicPricingCues: string[];
  visibleHeadings: string[];
  structureSummary: string;
  isAccessible: boolean;
  httpStatusCode?: number;
  retrievalTimestamp: string;
  diagnostics?: string;
}

// 6. Analytics Integration Framework
export interface AnalyticsDataRecord {
  id: string;
  integrationId: string;
  ventureId: string;
  metricType: 'PAGEVIEWS' | 'ACTIVE_USERS' | 'LEADS_GENERATED' | 'CONVERSIONS' | 'SPEND' | 'REVENUE';
  periodStart: string;
  periodEnd: string;
  measuredValue: number;
  unit: string;
  dimensions?: Record<string, string>;
  isMeasuredData: boolean;
  sourceProvider: string;
  ingestedAt: string;
}

// 7. Execution Approval Engine
export interface ExecutionAuthorizationRequest {
  id: string;
  requestingAgentId: string;
  requestingAgentName: string;
  actionType: ActionApprovalType;
  targetIntegrationId: string;
  title: string;
  description: string;
  proposedActionPayload: any;
  relatedTaskId?: string;
  riskClassification: RiskClassification;
  requiredPermissions: string[];
  status: ExecutionApprovalStatus;
  decisionBy?: string;
  decisionNotes?: string;
  decisionTimestamp?: string;
  executionResult?: {
    success: boolean;
    executedAt: string;
    responseSummary?: string;
    errorCode?: string;
  };
  createdAt: string;
  expiresAt?: string;
}

// 9. Agent-to-Tool Permissions Mapping
export interface AgentToolPermissionEntry {
  agentId: string;
  agentName: string;
  agentCode: string;
  role: string;
  department: string;
  authorizedToolIds: string[];
  maxRiskAllowed: RiskClassification;
  isApprovalExempt: boolean;
}
