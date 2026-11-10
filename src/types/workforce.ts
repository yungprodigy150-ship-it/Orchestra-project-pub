/**
 * ORCHESTRA Stage 4: Specialized Agent Workforce Types
 * Structured output schemas, workflow definitions, and delegation contracts
 * for Market Intelligence, Opportunity Hunter, Prospect Intelligence, and Portfolio Strategist agents.
 */

import { TaskPriority, TaskStatus } from './index';

// 1. Market Intelligence Agent Structured Output
export interface CompetitorTeardown {
  competitorName: string;
  keyStrengths: string;
  keyWeaknesses: string;
  pricingModel?: string;
  marketShareEstimate?: string;
}

export interface IntelligenceSourceCitation {
  title: string;
  citation: string;
  verificationConfidence: 'high' | 'medium' | 'provisional';
}

export interface MarketIntelligenceOutput {
  marketOverview: string;
  targetAudience: string;
  customerPainPoints: string[];
  competitorLandscape: CompetitorTeardown[];
  marketOpportunities: string[];
  risks: string[];
  evidenceAndSources: IntelligenceSourceCitation[];
  recommendedNextSteps: string[];
}

// 2. Opportunity Hunter Agent Structured Output
export type OpportunityCategoryType =
  | 'enterprise_client'
  | 'strategic_partner'
  | 'software_distribution'
  | 'market_gap';

export interface OpportunityHunterOutput {
  opportunityTitle: string;
  description: string;
  opportunityCategory: OpportunityCategoryType;
  targetMarket: string;
  relevantProduct: string;
  potentialValue: string;
  confidenceLevel: 'high' | 'medium' | 'provisional';
  supportingEvidence: string[];
  recommendedAction: string;
}

// 3. Prospect Intelligence Agent Structured Output
export interface ProspectIntelligenceOutput {
  organizationName: string;
  industry: string;
  websiteOrPublicSource: string;
  businessOverview: string;
  identifiedNeeds: string[];
  potentialProductMatch: string;
  qualificationScore: number; // 1-100
  evidence: string[];
  recommendedApproach: string;
}

// 4. Portfolio Strategist Agent Structured Output
export interface PortfolioStrategyOutput {
  product: string;
  targetAudience: string;
  coreValueProposition: string;
  relevantCustomerProblems: string[];
  marketPositioning: string;
  potentialCustomers: string[];
  recommendedImprovements: string[];
}

// 5. Coordinated Multi-Agent Workflow Types
export type SpecializedAgentRole =
  | 'market_intelligence'
  | 'opportunity_hunter'
  | 'prospect_intelligence'
  | 'portfolio_strategist'
  | 'orchestrator';

export interface WorkflowStepState {
  stepIndex: number;
  agentId: string;
  agentName: string;
  agentRole: SpecializedAgentRole;
  title: string;
  description: string;
  status: TaskStatus;
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
  taskId?: string;
  output?: MarketIntelligenceOutput | OpportunityHunterOutput | ProspectIntelligenceOutput | PortfolioStrategyOutput | any;
  error?: string;
}

export interface CoordinatedWorkflowExecution {
  id: string;
  workflowTemplateId: string;
  title: string;
  objective: string;
  targetVentureId?: string;
  industrySector?: string;
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  currentStepIndex: number;
  totalSteps: number;
  steps: WorkflowStepState[];
  synthesizedReport?: {
    executiveSummary: string;
    keyFindings: string[];
    recommendedInitiatives: string[];
    commercialImpactEstimate: string;
    riskAssessment: string;
    requiresHumanSignoff: boolean;
    approvalStatus: 'pending' | 'approved' | 'rejected';
    approvedBy?: string;
    approvalNotes?: string;
  };
  errorInfo?: {
    stepIndex: number;
    agentId: string;
    message: string;
    recoverable: boolean;
  };
}

export interface LaunchWorkflowRequest {
  objective: string;
  workflowType: 'coordinated_opportunity_pipeline' | 'market_discovery' | 'prospect_qualification' | 'single_agent';
  targetAgentId?: string;
  targetVentureId?: string;
  industrySector?: string;
  contextNotes?: string;
  priority?: TaskPriority;
  requireApprovalBeforeFinalize?: boolean;
}
