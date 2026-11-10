/**
 * ORCHESTRA Stage 5: Commercial Operations & Growth Workforce Types
 * Structured output schemas, CRM relationship records, campaign management,
 * centralized human approval queue, and integration registries.
 */

import { TaskPriority, TaskStatus } from './index';

// ==================================================
// 1. FIVE COMMERCIAL AGENT STRUCTURED OUTPUTS
// ==================================================

// A. Marketing Strategist Output
export interface MarketingStrategyOutput {
  productBeingMarketed: string;
  targetAudience: string;
  customerPainPoints: string[];
  valueProposition: string;
  competitivePositioning: string;
  recommendedChannels: string[];
  marketingStrategy: string;
  budgetConsiderations: string;
  successMetrics: string[];
  recommendedNextActions: string[];
}

// B. Campaign Planner Output & Lifecycle
export type TrackableCampaignStatus =
  | 'DRAFT'
  | 'PLANNED'
  | 'AWAITING_APPROVAL'
  | 'APPROVED'
  | 'ACTIVE'
  | 'PAUSED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface CampaignChecklistItem {
  id: string;
  step: string;
  assignedRole: string;
  isCompleted: boolean;
  notes?: string;
}

export interface CampaignPlanOutput {
  campaignName: string;
  objective: string;
  targetAudience: string;
  campaignConcept: string;
  contentRequirements: string[];
  distributionChannels: string[];
  timeline: string;
  requiredResources: string[];
  performanceIndicators: string[];
  executionChecklist: CampaignChecklistItem[];
}

// Full Persistent Commercial Campaign
export interface CommercialCampaign {
  id: string;
  name: string;
  ventureId: string;
  status: TrackableCampaignStatus;
  objective: string;
  targetAudience: string;
  concept: string;
  channels: string[];
  contentRequirements: string[];
  timeline: string;
  budgetEstimate?: string;
  performanceIndicators: string[];
  actualPerformanceData?: {
    impressions?: number;
    clicks?: number;
    leadsGenerated?: number;
    conversions?: number;
    notes?: string;
    isMeasured: boolean;
    lastRecordedAt?: string;
  };
  assignedAgentId: string;
  originatingTaskId?: string;
  executionChecklist: CampaignChecklistItem[];
  createdAt: string;
  updatedAt: string;
}

// C. Outreach Assistant Output
export interface OutreachPlanOutput {
  prospect: string;
  contactContext: string;
  communicationObjective: string;
  recommendedApproach: string;
  personalizedMessage: string;
  relevantProduct: string;
  followUpRecommendation: string;
  confidenceAssessment: 'high' | 'medium' | 'provisional';
}

// D. Relationship Manager & Lightweight CRM
export type CRMPipelineStage =
  | 'DISCOVERED'
  | 'RESEARCHING'
  | 'QUALIFIED'
  | 'CONTACT_PREPARED'
  | 'AWAITING_APPROVAL'
  | 'CONTACTED'
  | 'RESPONDED'
  | 'NEGOTIATION'
  | 'CONVERTED'
  | 'UNQUALIFIED';

export type RelationshipCategory =
  | 'prospect'
  | 'customer'
  | 'strategic_partner'
  | 'distribution_channel';

export interface InteractionLogEntry {
  id: string;
  timestamp: string;
  type:
    | 'research'
    | 'draft_prepared'
    | 'approval_requested'
    | 'human_approved'
    | 'contact_logged'
    | 'response_received'
    | 'meeting'
    | 'note';
  summary: string;
  actor: string;
  metadata?: Record<string, any>;
}

export interface RelationshipRecord {
  id: string;
  organization: string;
  contactName?: string;
  contactDetails?: string; // Legitimate email, handle or phone if publicly available
  industry: string;
  relatedProductId: string; // ventureId (v-1, v-2, v-3)
  relationshipCategory: RelationshipCategory;
  pipelineStage: CRMPipelineStage;
  source: string;
  interactionHistory: InteractionLogEntry[];
  notes: string;
  assignedAgentId?: string;
  nextRecommendedAction?: string;
  lastInteractionTimestamp?: string;
  estimatedValue?: string;
  qualificationScore?: number; // 1-100
  originatingTaskId?: string;
  linkedOpportunityId?: string;
  createdAt: string;
  updatedAt: string;
}

// E. Growth Analyst Output
export interface GrowthExperiment {
  hypothesis: string;
  experiment: string;
  metric: string;
  estimatedTimeframe: string;
}

export interface GrowthAnalysisOutput {
  analysisPeriod: string;
  availableData: string;
  performanceObservations: string[];
  identifiedBottlenecks: string[];
  growthOpportunities: string[];
  risks: string[];
  recommendations: string[];
  suggestedExperiments: GrowthExperiment[];
  dataReliability: 'measured' | 'provisional_estimate' | 'ai_hypothesis';
}

// ==================================================
// 2. CENTRALIZED APPROVAL AND COMMUNICATION CONTROL
// ==================================================

export type ApprovalItemType =
  | 'outgoing_email'
  | 'external_message'
  | 'campaign_publication'
  | 'public_content'
  | 'external_api_action'
  | 'financial_commitment'
  | 'other_external_action';

export type ApprovalDecision =
  | 'PENDING'
  | 'APPROVE'
  | 'REJECT'
  | 'REQUEST_REVISION';

export interface ApprovalExecutionResult {
  executed: boolean;
  status: 'EXECUTED' | 'SIMULATED_LOG' | 'HELD_NO_INTEGRATION';
  message: string;
  timestamp: string;
}

export interface ApprovalRecord {
  id: string;
  title: string;
  itemType: ApprovalItemType;
  description: string;
  requestingAgentId: string;
  requestingAgentName: string;
  relatedProspectId?: string;
  relatedProspectName?: string;
  relatedCampaignId?: string;
  relatedCampaignName?: string;
  relatedTaskId?: string;
  proposedContent: string;
  timestamp: string;
  decision: ApprovalDecision;
  decisionTimestamp?: string;
  decisionBy?: string;
  decisionNotes?: string;
  executionResult?: ApprovalExecutionResult;
}

// ==================================================
// 3. INTEGRATION ARCHITECTURE & CONNECTORS
// ==================================================

export type CommercialIntegrationStatus =
  | 'CONNECTED'
  | 'NOT_CONFIGURED'
  | 'DISABLED'
  | 'ERROR';

export type CommercialIntegrationCategory =
  | 'email'
  | 'crm'
  | 'social'
  | 'analytics'
  | 'advertising'
  | 'payment';

export interface CommercialIntegrationConnector {
  id: string;
  name: string;
  category: CommercialIntegrationCategory;
  description: string;
  status: CommercialIntegrationStatus;
  requiredEnvVar: string;
  isAvailable: boolean;
  verifiedAt?: string;
  capabilities: string[];
  configNotes?: string;
}

// ==================================================
// 4. COMMERCIAL WORKFLOW REQUESTS
// ==================================================

export type CommercialWorkflowType =
  | 'full_commercial_pipeline'
  | 'go_to_market_strategy'
  | 'prospect_outreach_prep'
  | 'growth_and_conversion_audit'
  | 'campaign_generation';

export interface LaunchCommercialWorkflowRequest {
  workflowType: CommercialWorkflowType;
  objective: string;
  targetVentureId: string;
  targetProspectId?: string;
  targetCampaignId?: string;
  priority?: TaskPriority;
  contextNotes?: string;
  requireApprovalBeforeFinalize?: boolean;
}
