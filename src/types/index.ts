/**
 * ORCHESTRA Core Architecture Types
 * Multi-Agent Orchestration & Enterprise Business Intelligence
 */

export type WorkspaceSection =
  | 'command_centre'
  | 'agent_workforce'
  | 'operations'
  | 'intelligence'
  | 'opportunities'
  | 'growth'
  | 'portfolio'
  | 'integrations'
  | 'settings';

export type AgentDepartment =
  | 'Orchestration'
  | 'Research'
  | 'Engineering'
  | 'Growth'
  | 'Operations';

export type AgentStatus = 'idle' | 'executing' | 'awaiting_approval' | 'paused' | 'offline';
export type AgentAutonomy = 'full' | 'approval_required' | 'supervised';

export interface AgentModelConfig {
  provider: 'gemini' | 'anthropic' | 'openai' | 'local';
  model: string;
  temperature: number;
  maxTokens: number;
  systemPromptOverride?: string;
}

import { AgentIntelligenceProfile } from './intelligence';

export interface Agent {
  id: string;
  name: string;
  code: string;
  role: string;
  department: AgentDepartment;
  description: string;
  responsibilities?: string[];
  status: AgentStatus;
  autonomy: AgentAutonomy;
  provider: 'gemini' | 'anthropic' | 'openai' | 'local';
  model: string;
  modelConfig?: AgentModelConfig;
  intelligenceProfile?: AgentIntelligenceProfile;
  assignedTaskIds: string[];
  assignedVentureIds: string[];
  capabilities: string[];
  activeTaskCount: number;
  completedTasksTotal: number;
  uptimeHours: number;
  reliabilityScore: number;
  createdAt: string;
  updatedAt: string;
  lastActive: string;
}

export * from './intelligence';
export * from './workforce';
export * from './commercial';

export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export type TaskStatus =
  | 'PENDING'
  | 'ASSIGNED'
  | 'RUNNING'
  | 'WAITING_FOR_APPROVAL'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export interface TaskAuditLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  notes?: string;
}

export interface TaskDeliverable {
  title: string;
  summary: string;
  type: 'strategy' | 'code' | 'dossier' | 'outreach_copy' | 'specification';
  content: string;
}

export interface TaskExecutionResult {
  outputSummary: string;
  completedAt: string;
  artifacts?: TaskDeliverable[];
  metrics?: {
    durationMs?: number;
    tokensConsumed?: number;
    confidenceScore?: number;
  };
}

export interface TaskErrorInfo {
  code: string;
  message: string;
  details?: string;
  timestamp: string;
  recoverable: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string; // detailed description
  ventureId: string;
  assignedAgentId?: string;
  priority: TaskPriority;
  status: TaskStatus;
  approvalRequired: boolean;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  approvalNotes?: string;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
  dueAt: string;
  deliverables?: TaskDeliverable[];
  executionResults?: TaskExecutionResult;
  errorInfo?: TaskErrorInfo;
  relatedKnowledgeIds?: string[];
  auditLogs: TaskAuditLog[];
  // Traceable Multi-Agent Delegation & Workflow fields
  parentTaskId?: string;
  subTaskIds?: string[];
  delegatedByAgentId?: string;
  workflowId?: string;
  workflowStepIndex?: number;
  workflowTotalSteps?: number;
  structuredOutput?: any;
}

export type VentureStage = 'ideation' | 'mvp' | 'growth' | 'scaling';

export interface VentureObjective {
  id: string;
  title: string;
  progressPercent: number;
  targetQuarter: string;
}

export interface Venture {
  id: string;
  name: string;
  tagline: string;
  stage: VentureStage;
  description: string;
  targetAudience: string;
  valueProposition: string;
  techStack: string[];
  objectives: VentureObjective[];
  assignedAgentIds: string[];
  primaryMetricLabel: string;
  primaryMetricValue: string;
  secondaryMetricLabel: string;
  secondaryMetricValue: string;
  repoIdentifier?: string;
  liveUrl?: string;
}

export type IntelligenceCategory =
  | 'competitive_intel'
  | 'market_signal'
  | 'technical_architecture'
  | 'customer_research'
  | 'regulatory_risk';

export interface IntelligenceItem {
  id: string;
  title: string;
  ventureId?: string;
  category: IntelligenceCategory;
  summary: string;
  keyTakeaways: string[];
  confidence: 'high' | 'medium' | 'provisional';
  source: string; // Source attribution
  authorAgentId?: string;
  verifiedByHuman: boolean;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  relatedTaskIds?: string[];
  accessLevel?: 'PUBLIC' | 'RESTRICTED' | 'CONFIDENTIAL';
}

export type OpportunityStage =
  | 'discovery'
  | 'qualification'
  | 'outreach_prep'
  | 'negotiation'
  | 'closed_won'
  | 'archived';

export interface OpportunityScorecard {
  strategicFit: number; // 1-10
  commercialImpact: number; // 1-10
  feasibility: number; // 1-10
  rationale: string;
}

export interface Opportunity {
  id: string;
  title: string;
  ventureId: string;
  partnerOrLead: string;
  type: 'enterprise_client' | 'strategic_partner' | 'api_distribution' | 'venture_alliance';
  stage: OpportunityStage;
  estimatedValue: string;
  assignedAgentId: string;
  nextStep: string;
  nextStepDate: string;
  scorecard: OpportunityScorecard;
  updatedAt: string;
  contacts: string;
}

export type CampaignStatus = 'drafting' | 'under_review' | 'active' | 'completed' | 'paused';
export type CampaignChannel = 'editorial_blog' | 'developer_community' | 'direct_outreach' | 'product_directory' | 'partnership_syndication';

export interface GrowthCampaign {
  id: string;
  title: string;
  ventureId: string;
  channel: CampaignChannel;
  status: CampaignStatus;
  objective: string;
  targetAudience: string;
  kpiMetric: string;
  targetValue: string;
  currentValue: string;
  preparedAssetsCount: number;
  assignedAgentId: string;
  startDate: string;
  endDate: string;
}

export interface AIProviderConfig {
  id: 'gemini' | 'anthropic' | 'openai' | 'local';
  name: string;
  isActive: boolean;
  defaultModel: string;
  availableModels: string[];
  temperature: number;
  maxTokens: number;
  rateLimitRpm: number;
  description: string;
}

export interface GovernancePolicy {
  requireApprovalForOutreach: boolean;
  requireApprovalForProductionDeploy: boolean;
  requireApprovalAboveCostUsd: number;
  maxAutonomousStepCount: number;
  strictAuditRetentionDays: number;
}

export type AuditEventType =
  | 'TASK_CREATED'
  | 'AGENT_ASSIGNED'
  | 'STATUS_CHANGED'
  | 'APPROVAL_DECISION'
  | 'EXECUTION_RESULT'
  | 'TASK_EXECUTION'
  | 'TASK_FAILED'
  | 'ERROR'
  | 'AGENT_REGISTERED'
  | 'AGENT_UPDATED'
  | 'AGENT_STATUS_TOGGLED'
  | 'KNOWLEDGE_INGESTED'
  | 'SYSTEM_ALERT'
  | 'approval_gate'
  | 'task_execution'
  | 'task_failed'
  | 'agent_dispatch'
  | 'intelligence_captured'
  | 'system_alert';

export interface SystemEvent {
  id: string;
  timestamp: string;
  type: AuditEventType;
  entityType?: 'task' | 'agent' | 'knowledge' | 'system' | 'governance' | 'venture';
  entityId?: string;
  actor?: {
    id: string;
    name: string;
    type: 'human' | 'agent' | 'system';
  };
  title: string;
  description: string;
  severity: 'info' | 'notice' | 'action_required' | 'warning' | 'error';
  relatedTaskId?: string;
  details?: Record<string, any>;
}

export * from './integrations';
