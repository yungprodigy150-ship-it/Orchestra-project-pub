import React, { createContext, useContext, useState, useMemo, useEffect, useRef } from 'react';
import {
  WorkspaceSection,
  Agent,
  AgentAutonomy,
  AgentStatus,
  Task,
  TaskStatus,
  TaskPriority,
  TaskErrorInfo,
  TaskExecutionResult,
  Venture,
  IntelligenceItem,
  Opportunity,
  OpportunityStage,
  GrowthCampaign,
  CampaignStatus,
  AIProviderConfig,
  GovernancePolicy,
  SystemEvent,
  RelationshipRecord,
  CommercialCampaign,
  ApprovalRecord,
  CommercialIntegrationConnector,
  CommercialIntegrationStatus,
  CRMPipelineStage,
  TrackableCampaignStatus,
  ApprovalDecision,
  MarketingStrategyOutput,
  CampaignPlanOutput,
  OutreachPlanOutput,
  GrowthAnalysisOutput,
  LaunchCommercialWorkflowRequest
} from '../types';
import {
  INITIAL_VENTURES,
  INITIAL_AGENTS,
  INITIAL_TASKS,
  INITIAL_INTELLIGENCE,
  INITIAL_OPPORTUNITIES,
  INITIAL_CAMPAIGNS,
  INITIAL_SYSTEM_EVENTS,
  INITIAL_GOVERNANCE,
  INITIAL_RELATIONSHIPS,
  INITIAL_COMMERCIAL_CAMPAIGNS,
  INITIAL_APPROVALS
} from '../architecture/seed-data';
import { DEFAULT_AI_PROVIDERS } from '../architecture/provider-abstraction';
import {
  LocalStoragePersistenceAdapter,
  AuditLogger,
  AgentRegistry,
  TaskEngine,
  OrganizationalMemory,
  OrchestrationService,
  CreateTaskInput,
  RegisterAgentInput,
  UpdateAgentInput,
  IntelligenceService,
  ModelRegistry,
  ToolRegistry,
  ReasonParams,
  WorkforceOrchestrator,
  CommercialOrchestrator,
  IntegrationRegistry,
  ToolExecutionService,
  LeadDiscoveryEngine,
  ExecutionApprovalEngine,
  AnalyticsIntegrationFramework
} from '../services';
import {
  ProviderStatusInfo,
  AIExecutionResponse,
  ToolDefinition,
  ModelDefinition
} from '../types/intelligence';
import {
  CoordinatedWorkflowExecution,
  LaunchWorkflowRequest
} from '../types/workforce';
import {
  IntegrationConnector,
  ToolExecutionRequest,
  ToolExecutionRecord,
  DiscoveredLead,
  LeadDiscoveryQuery,
  ExecutionAuthorizationRequest,
  AnalyticsDataRecord,
  AgentDigitalIdentity,
  AgentAutonomyPermissionLevel,
  BrowserSessionRecord,
  BrowserTabState,
  ExternalConnectedAccount,
  AccountActivityRecord,
  DiscoveredAIModel,
  ModelRoutingEvaluation,
  AgentConversation,
  DialogueMessage,
  DialogueMessageType
} from '../types';
import {
  AgentIdentityService,
  AutonomousBrowserService,
  ExternalAccountService,
  AIDiscoveryService,
  AgentDialogueService
} from '../services';

interface CoreServices {
  auditLogger: AuditLogger;
  agentRegistry: AgentRegistry;
  taskEngine: TaskEngine;
  memory: OrganizationalMemory;
  orchestrationService: OrchestrationService;
  intelligenceService: IntelligenceService;
  modelRegistry: ModelRegistry;
  toolRegistry: ToolRegistry;
  workforceOrchestrator: WorkforceOrchestrator;
  commercialOrchestrator: CommercialOrchestrator;
  integrationRegistry: IntegrationRegistry;
  toolExecutionService: ToolExecutionService;
  leadDiscoveryEngine: LeadDiscoveryEngine;
  executionApprovalEngine: ExecutionApprovalEngine;
  analyticsIntegrationFramework: AnalyticsIntegrationFramework;
  identityService: AgentIdentityService;
  browserService: AutonomousBrowserService;
  accountService: ExternalAccountService;
  aiDiscoveryService: AIDiscoveryService;
  dialogueService: AgentDialogueService;
}

interface OrchestraContextType {
  // Navigation
  activeSection: WorkspaceSection;
  setActiveSection: (section: WorkspaceSection) => void;
  activeVentureFilter: string; // 'all' or ventureId
  setActiveVentureFilter: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // Global modals / drawers
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  activeTaskForDrawer: Task | null;
  setActiveTaskForDrawer: (task: Task | null) => void;
  activeAgentForDrawer: Agent | null;
  setActiveAgentForDrawer: (agent: Agent | null) => void;
  isEditAgentModalOpen: boolean;
  setIsEditAgentModalOpen: (open: boolean) => void;
  agentBeingEdited: Agent | null;
  setAgentBeingEdited: (agent: Agent | null) => void;

  // Underlying Core Service Instances
  services: CoreServices;

  // Domain Collections & Mutators
  ventures: Venture[];
  addVenture: (v: Omit<Venture, 'id' | 'assignedAgentIds' | 'objectives'>) => void;
  updateVenture: (id: string, updates: Partial<Venture>) => void;

  agents: Agent[];
  registerAgent: (agentInput: RegisterAgentInput) => Agent;
  updateAgent: (id: string, updates: UpdateAgentInput) => Agent;
  activateAgent: (id: string) => Agent;
  deactivateAgent: (id: string) => Agent;
  updateAgentAutonomy: (id: string, autonomy: AgentAutonomy) => void;
  toggleAgentStatus: (id: string) => void;

  tasks: Task[];
  createTask: (t: {
    title: string;
    description: string;
    ventureId: string;
    assignedAgentId?: string;
    priority: Task['priority'];
    approvalRequired: boolean;
    dueDays?: number;
    relatedKnowledgeIds?: string[];
  }) => Task;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  assignTask: (taskId: string, agentId: string) => void;
  approveTask: (taskId: string, notes?: string) => void;
  rejectTask: (taskId: string, notes?: string) => void;
  reassignTask: (taskId: string, agentId: string) => void;
  completeTaskWithResult: (taskId: string, result: TaskExecutionResult) => void;
  failTask: (taskId: string, error: TaskErrorInfo) => void;
  cancelTask: (taskId: string, reason?: string) => void;

  intelligence: IntelligenceItem[];
  addIntelligence: (item: Omit<IntelligenceItem, 'id' | 'createdAt' | 'updatedAt' | 'verifiedByHuman'>) => IntelligenceItem;
  toggleVerifyIntelligence: (id: string) => void;
  searchKnowledge: (query: string, category?: string, ventureId?: string) => IntelligenceItem[];
  linkKnowledgeToTask: (knowledgeId: string, taskId: string) => void;

  opportunities: Opportunity[];
  createOpportunity: (opp: Omit<Opportunity, 'id' | 'updatedAt'>) => void;
  updateOpportunityStage: (id: string, stage: OpportunityStage) => void;

  campaigns: GrowthCampaign[];
  createCampaign: (c: Omit<GrowthCampaign, 'id'>) => void;
  updateCampaignStatus: (id: string, status: CampaignStatus) => void;

  aiProviders: AIProviderConfig[];
  toggleProviderActive: (id: AIProviderConfig['id']) => void;
  updateProviderSettings: (id: AIProviderConfig['id'], partial: Partial<AIProviderConfig>) => void;

  governance: GovernancePolicy;
  updateGovernance: (partial: Partial<GovernancePolicy>) => void;

  systemEvents: SystemEvent[];
  addSystemEvent: (evt: Omit<SystemEvent, 'id' | 'timestamp'>) => void;

  // Intelligence Layer
  intelligenceService: IntelligenceService;
  modelRegistry: ModelRegistry;
  toolRegistry: ToolRegistry;
  providerStatuses: ProviderStatusInfo[];
  refreshProviderStatuses: () => Promise<void>;
  executeAIReasoning: (params: ReasonParams) => Promise<AIExecutionResponse>;

  // Stage 4: Multi-Agent Workforce & Workflows
  workforceOrchestrator: WorkforceOrchestrator;
  workflows: CoordinatedWorkflowExecution[];
  activeWorkflow: CoordinatedWorkflowExecution | null;
  setActiveWorkflow: (wf: CoordinatedWorkflowExecution | null) => void;
  isWorkflowModalOpen: boolean;
  setIsWorkflowModalOpen: (open: boolean) => void;
  preselectedAgentForWorkflow: Agent | null;
  setPreselectedAgentForWorkflow: (agent: Agent | null) => void;
  launchWorkflow: (request: LaunchWorkflowRequest) => Promise<CoordinatedWorkflowExecution>;
  executeAgentTask: (
    agentId: string,
    objective: string,
    ventureId?: string,
    priority?: TaskPriority,
    contextNotes?: string
  ) => Promise<{ task: Task; structuredData: any }>;
  approveWorkflow: (workflowId: string, notes?: string) => void;
  rejectWorkflow: (workflowId: string, notes?: string) => void;

  // Stage 5: Commercial Operations, CRM, Campaigns & Approval Queue
  relationships: RelationshipRecord[];
  createRelationship: (data: Omit<RelationshipRecord, 'id' | 'createdAt' | 'updatedAt' | 'interactionHistory'>) => RelationshipRecord;
  updateRelationshipStage: (id: string, stage: CRMPipelineStage, notes?: string) => void;
  addRelationshipInteraction: (id: string, entry: Omit<RelationshipRecord['interactionHistory'][0], 'id' | 'timestamp'>) => void;

  commercialCampaigns: CommercialCampaign[];
  createCommercialCampaign: (data: Omit<CommercialCampaign, 'id' | 'createdAt' | 'updatedAt'>) => CommercialCampaign;
  updateCommercialCampaignStatus: (id: string, status: TrackableCampaignStatus) => void;
  recordCampaignPerformance: (id: string, data: CommercialCampaign['actualPerformanceData']) => void;

  approvals: ApprovalRecord[];
  resolveApproval: (id: string, decision: ApprovalDecision, notes?: string) => void;
  createApprovalRequest: (data: Omit<ApprovalRecord, 'id' | 'timestamp' | 'decision'>) => ApprovalRecord;
  isApprovalModalOpen: boolean;
  setIsApprovalModalOpen: (open: boolean) => void;

  commercialIntegrations: CommercialIntegrationConnector[];
  updateIntegrationStatus: (id: string, status: CommercialIntegrationStatus) => void;

  executeMarketingStrategy: (ventureId: string, objective: string, contextNotes?: string) => Promise<{ task: Task; output: MarketingStrategyOutput }>;
  executeCampaignPlanning: (ventureId: string, conceptObjective: string, strategyContext?: string) => Promise<{ task: Task; campaign: CommercialCampaign; output: CampaignPlanOutput }>;
  executeOutreachPreparation: (ventureId: string, prospectOrgName: string, contactContext: string, targetProspectId?: string) => Promise<{ task: Task; output: OutreachPlanOutput; approval: ApprovalRecord }>;
  executeGrowthAnalysis: (analysisScope?: string, contextNotes?: string) => Promise<{ task: Task; output: GrowthAnalysisOutput }>;
  launchCommercialWorkflow: (req: LaunchCommercialWorkflowRequest, onProgress?: (msg: string) => void) => Promise<any>;

  // Stage 6: Real-World Integrations & Execution Infrastructure
  connectors: IntegrationConnector[];
  refreshConnectors: () => Promise<void>;
  testIntegrationConnection: (integrationId: string) => Promise<{ success: boolean; status: string; latencyMs: number; details?: string; error?: string }>;
  toggleIntegrationEnabled: (integrationId: string, enabled: boolean) => void;

  toolExecutions: ToolExecutionRecord[];
  executeTool: (request: ToolExecutionRequest) => Promise<ToolExecutionRecord>;

  discoveredLeads: DiscoveredLead[];
  discoverLeads: (query: LeadDiscoveryQuery) => Promise<{ newLeads: DiscoveredLead[]; duplicateCount: number }>;
  promoteLeadToCRM: (leadId: string) => string | null;

  executionAuthorizations: ExecutionAuthorizationRequest[];
  processExecutionAuthorization: (id: string, decision: 'APPROVE' | 'REJECT', notes?: string) => Promise<void>;

  // Autonomous Internet Workforce Infrastructure
  digitalIdentities: AgentDigitalIdentity[];
  updateAgentPermissionLevel: (agentId: string, level: AgentAutonomyPermissionLevel) => void;
  getAgentIdentity: (agentId: string) => AgentDigitalIdentity | null;

  browserSessions: BrowserSessionRecord[];
  createBrowserSession: (agentId: string, agentName: string, objective: string, relatedTaskId?: string) => Promise<BrowserSessionRecord>;
  openBrowserTab: (sessionId: string, url: string, agentId?: string) => Promise<BrowserTabState | null>;
  navigateBrowserTab: (sessionId: string, tabId: string, url: string, agentId?: string) => Promise<BrowserTabState | null>;
  performBrowserAction: (sessionId: string, tabId: string, action: 'click_link' | 'extract_content' | 'download_file', linkHref?: string, agentId?: string) => Promise<any>;
  closeBrowserTab: (sessionId: string, tabId: string) => void;

  externalAccounts: ExternalConnectedAccount[];
  refreshExternalAccounts: () => Promise<void>;
  testAccountConnection: (accountId: string) => Promise<{ success: boolean; status: string; details?: string; error?: string }>;
  accountActivities: AccountActivityRecord[];
  recordAccountActivity: (activity: Omit<AccountActivityRecord, 'id' | 'timestamp'>) => AccountActivityRecord;

  discoveredModels: DiscoveredAIModel[];
  refreshDiscoveredModels: () => Promise<void>;
  evaluateModelRouting: (taskObjective: string, options?: { maxLatencyMs?: number; maxBudgetUsd?: number; requireCoding?: boolean }) => Promise<ModelRoutingEvaluation>;

  agentConversations: AgentConversation[];
  startAgentDialogue: (initiatingAgent: any, targetAgent: any, topic: string, initialPrompt: string, relatedTaskId?: string) => Promise<AgentConversation>;
  sendAgentDialogueMessage: (conversationId: string, senderAgent: any, recipientAgent: any, content: string, messageType?: DialogueMessageType) => Promise<DialogueMessage | null>;
  isDialogueModalOpen: boolean;
  setIsDialogueModalOpen: (open: boolean) => void;

  // Computed
  pendingApprovalsCount: number;
}

const OrchestraContext = createContext<OrchestraContextType | undefined>(undefined);

export const OrchestraProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation & Drawer state
  const [activeSection, setActiveSection] = useState<WorkspaceSection>('command_centre');
  const [activeVentureFilter, setActiveVentureFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [activeTaskForDrawer, setActiveTaskForDrawer] = useState<Task | null>(null);
  const [activeAgentForDrawer, setActiveAgentForDrawer] = useState<Agent | null>(null);
  const [isEditAgentModalOpen, setIsEditAgentModalOpen] = useState(false);
  const [agentBeingEdited, setAgentBeingEdited] = useState<Agent | null>(null);

  // Initialize service architecture with persistent storage adapters
  const servicesRef = useRef<CoreServices | null>(null);
  if (!servicesRef.current) {
    const auditStorage = new LocalStoragePersistenceAdapter<SystemEvent>('audit_events', INITIAL_SYSTEM_EVENTS);
    const auditLogger = new AuditLogger(auditStorage);

    const agentStorage = new LocalStoragePersistenceAdapter<Agent>('agents', INITIAL_AGENTS);
    const agentRegistry = new AgentRegistry(agentStorage, undefined, auditLogger);

    const taskStorage = new LocalStoragePersistenceAdapter<Task>('tasks', INITIAL_TASKS);
    const taskEngine = new TaskEngine(taskStorage, undefined, auditLogger);

    const memoryStorage = new LocalStoragePersistenceAdapter<IntelligenceItem>('knowledge_memory', INITIAL_INTELLIGENCE);
    const memory = new OrganizationalMemory(memoryStorage, undefined, auditLogger);

    const orchestrationService = new OrchestrationService(
      agentRegistry,
      taskEngine,
      memory,
      auditLogger,
      INITIAL_GOVERNANCE
    );

    const modelRegistry = new ModelRegistry();
    const toolRegistry = new ToolRegistry();
    const intelligenceService = new IntelligenceService(
      modelRegistry,
      toolRegistry,
      memory,
      auditLogger
    );

    const workforceOrchestrator = new WorkforceOrchestrator(
      intelligenceService,
      agentRegistry,
      taskEngine,
      memory,
      auditLogger
    );

    const integrationRegistry = new IntegrationRegistry();
    const commercialOrchestrator = new CommercialOrchestrator(
      intelligenceService,
      agentRegistry,
      taskEngine,
      memory,
      auditLogger,
      integrationRegistry,
      INITIAL_RELATIONSHIPS,
      INITIAL_COMMERCIAL_CAMPAIGNS,
      INITIAL_APPROVALS
    );

    const toolExecutionService = new ToolExecutionService(toolRegistry, auditLogger);
    workforceOrchestrator.setToolExecutionService(toolExecutionService);
    const leadDiscoveryEngine = new LeadDiscoveryEngine(auditLogger, undefined, commercialOrchestrator);
    const executionApprovalEngine = new ExecutionApprovalEngine(auditLogger);
    const analyticsIntegrationFramework = new AnalyticsIntegrationFramework(auditLogger);

    const identityService = new AgentIdentityService(auditLogger);
    const browserService = new AutonomousBrowserService(auditLogger);
    const accountService = new ExternalAccountService(auditLogger);
    const aiDiscoveryService = new AIDiscoveryService(auditLogger);
    const dialogueService = new AgentDialogueService(auditLogger);

    servicesRef.current = {
      auditLogger,
      agentRegistry,
      taskEngine,
      memory,
      orchestrationService,
      intelligenceService,
      modelRegistry,
      toolRegistry,
      workforceOrchestrator,
      commercialOrchestrator,
      integrationRegistry,
      toolExecutionService,
      leadDiscoveryEngine,
      executionApprovalEngine,
      analyticsIntegrationFramework,
      identityService,
      browserService,
      accountService,
      aiDiscoveryService,
      dialogueService
    };
  }

  const services = servicesRef.current;

  // Reactive UI state mirrored from services
  const [ventures, setVentures] = useState<Venture[]>(() => {
    const storage = new LocalStoragePersistenceAdapter<Venture>('ventures', INITIAL_VENTURES);
    return storage.getAll();
  });

  const [agents, setAgents] = useState<Agent[]>(() => services.agentRegistry.listAgents());
  const [tasks, setTasks] = useState<Task[]>(() => services.taskEngine.listTasks());
  const [intelligence, setIntelligence] = useState<IntelligenceItem[]>(() => services.memory.listRecords());
  const [systemEvents, setSystemEvents] = useState<SystemEvent[]>(() => services.auditLogger.getEvents(50));
  const [opportunities, setOpportunities] = useState<Opportunity[]>(() => {
    const storage = new LocalStoragePersistenceAdapter<Opportunity>('opportunities', INITIAL_OPPORTUNITIES);
    return storage.getAll();
  });
  const [campaigns, setCampaigns] = useState<GrowthCampaign[]>(() => {
    const storage = new LocalStoragePersistenceAdapter<GrowthCampaign>('campaigns', INITIAL_CAMPAIGNS);
    return storage.getAll();
  });
  const [aiProviders, setAiProviders] = useState<AIProviderConfig[]>(DEFAULT_AI_PROVIDERS);
  const [governance, setGovernance] = useState<GovernancePolicy>(() => services.orchestrationService.getGovernance());

  // Provider Status & Live Gateway Tracking
  const [providerStatuses, setProviderStatuses] = useState<ProviderStatusInfo[]>([]);

  const refreshProviderStatuses = async () => {
    try {
      const statuses = await services.intelligenceService.getProvidersStatus();
      setProviderStatuses(statuses);
    } catch (err) {
      console.error('Failed to query provider status:', err);
    }
  };

  useEffect(() => {
    refreshProviderStatuses();
  }, []);

  const executeAIReasoning = async (params: ReasonParams): Promise<AIExecutionResponse> => {
    const res = await services.intelligenceService.reason(params);
    syncFromServices();
    return res;
  };

  // Stage 4: Multi-Agent Workflow State & Operations
  const [workflows, setWorkflows] = useState<CoordinatedWorkflowExecution[]>(() =>
    services.workforceOrchestrator.listWorkflows()
  );
  const [activeWorkflow, setActiveWorkflow] = useState<CoordinatedWorkflowExecution | null>(null);
  const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState(false);
  const [preselectedAgentForWorkflow, setPreselectedAgentForWorkflow] = useState<Agent | null>(null);

  const launchWorkflow = async (req: LaunchWorkflowRequest): Promise<CoordinatedWorkflowExecution> => {
    services.workforceOrchestrator.setVentures(ventures);
    const wf = await services.workforceOrchestrator.launchCoordinatedWorkflow(req, (updated) => {
      setWorkflows(prev => [updated, ...prev.filter(w => w.id !== updated.id)]);
      setActiveWorkflow(updated);
      syncFromServices();
    });
    setWorkflows(prev => [wf, ...prev.filter(w => w.id !== wf.id)]);
    setActiveWorkflow(wf);
    syncFromServices();
    return wf;
  };

  const executeAgentTask = async (
    agentId: string,
    objective: string,
    ventureId = 'v-1',
    priority: TaskPriority = 'high',
    contextNotes?: string
  ) => {
    services.workforceOrchestrator.setVentures(ventures);
    const result = await services.workforceOrchestrator.executeSingleAgentTask(
      agentId,
      objective,
      ventureId,
      priority,
      contextNotes,
      () => syncFromServices()
    );
    syncFromServices();
    return result;
  };

  const approveWorkflow = (workflowId: string, notes?: string) => {
    const updated = services.workforceOrchestrator.approveWorkflow(workflowId, notes);
    setWorkflows(prev => prev.map(w => w.id === updated.id ? updated : w));
    if (activeWorkflow?.id === workflowId) setActiveWorkflow(updated);
    syncFromServices();
  };

  const rejectWorkflow = (workflowId: string, notes?: string) => {
    const updated = services.workforceOrchestrator.rejectWorkflow(workflowId, notes || 'Rejected by operator');
    setWorkflows(prev => prev.map(w => w.id === updated.id ? updated : w));
    if (activeWorkflow?.id === workflowId) setActiveWorkflow(updated);
    syncFromServices();
  };

  // Stage 5: Commercial Workforce State & Operations
  const [relationships, setRelationships] = useState<RelationshipRecord[]>(() =>
    services.commercialOrchestrator.listRelationships()
  );
  const [commercialCampaigns, setCommercialCampaigns] = useState<CommercialCampaign[]>(() =>
    services.commercialOrchestrator.listCampaigns()
  );
  const [approvals, setApprovals] = useState<ApprovalRecord[]>(() =>
    services.commercialOrchestrator.listApprovals()
  );
  const [commercialIntegrations, setCommercialIntegrations] = useState<CommercialIntegrationConnector[]>(() =>
    services.integrationRegistry.listConnectors()
  );
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);

  const createRelationship = (data: Omit<RelationshipRecord, 'id' | 'createdAt' | 'updatedAt' | 'interactionHistory'>) => {
    const rec = services.commercialOrchestrator.createRelationship(data);
    setRelationships(services.commercialOrchestrator.listRelationships());
    syncFromServices();
    return rec;
  };

  const updateRelationshipStage = (id: string, stage: CRMPipelineStage, notes?: string) => {
    services.commercialOrchestrator.updateRelationshipStage(id, stage, 'Human Operator', notes);
    setRelationships(services.commercialOrchestrator.listRelationships());
    syncFromServices();
  };

  const addRelationshipInteraction = (
    id: string,
    entry: Omit<RelationshipRecord['interactionHistory'][0], 'id' | 'timestamp'>
  ) => {
    services.commercialOrchestrator.addRelationshipInteraction(id, entry);
    setRelationships(services.commercialOrchestrator.listRelationships());
    syncFromServices();
  };

  const createCommercialCampaign = (data: Omit<CommercialCampaign, 'id' | 'createdAt' | 'updatedAt'>) => {
    const camp = services.commercialOrchestrator.createCampaign(data);
    setCommercialCampaigns(services.commercialOrchestrator.listCampaigns());
    syncFromServices();
    return camp;
  };

  const updateCommercialCampaignStatus = (id: string, status: TrackableCampaignStatus) => {
    services.commercialOrchestrator.updateCampaignStatus(id, status, 'Human Operator');
    setCommercialCampaigns(services.commercialOrchestrator.listCampaigns());
    syncFromServices();
  };

  const recordCampaignPerformance = (id: string, data: CommercialCampaign['actualPerformanceData']) => {
    services.commercialOrchestrator.recordCampaignPerformance(id, data);
    setCommercialCampaigns(services.commercialOrchestrator.listCampaigns());
    syncFromServices();
  };

  const createApprovalRequest = (data: Omit<ApprovalRecord, 'id' | 'timestamp' | 'decision'>) => {
    const app = services.commercialOrchestrator.createApprovalRequest(data);
    setApprovals(services.commercialOrchestrator.listApprovals());
    syncFromServices();
    return app;
  };

  const resolveApproval = (id: string, decision: ApprovalDecision, notes?: string) => {
    services.commercialOrchestrator.resolveApproval(id, decision, 'Human Operator', notes);
    setApprovals(services.commercialOrchestrator.listApprovals());
    setRelationships(services.commercialOrchestrator.listRelationships());
    syncFromServices();
  };

  const updateIntegrationStatus = (id: string, status: CommercialIntegrationStatus) => {
    services.integrationRegistry.updateConnectorStatus(id, status);
    setCommercialIntegrations(services.integrationRegistry.listConnectors());
  };

  const executeMarketingStrategy = async (ventureId: string, objective: string, contextNotes?: string) => {
    services.commercialOrchestrator.setVentures(ventures);
    const res = await services.commercialOrchestrator.executeMarketingStrategy(ventureId, objective, contextNotes);
    syncFromServices();
    return res;
  };

  const executeCampaignPlanning = async (ventureId: string, conceptObjective: string, strategyContext?: string) => {
    services.commercialOrchestrator.setVentures(ventures);
    const res = await services.commercialOrchestrator.executeCampaignPlanning(ventureId, conceptObjective, strategyContext);
    setCommercialCampaigns(services.commercialOrchestrator.listCampaigns());
    setApprovals(services.commercialOrchestrator.listApprovals());
    syncFromServices();
    return res;
  };

  const executeOutreachPreparation = async (
    ventureId: string,
    prospectOrgName: string,
    contactContext: string,
    targetProspectId?: string
  ) => {
    services.commercialOrchestrator.setVentures(ventures);
    const res = await services.commercialOrchestrator.executeOutreachPreparation(
      ventureId,
      prospectOrgName,
      contactContext,
      targetProspectId
    );
    setApprovals(services.commercialOrchestrator.listApprovals());
    setRelationships(services.commercialOrchestrator.listRelationships());
    syncFromServices();
    return res;
  };

  const executeGrowthAnalysis = async (analysisScope?: string, contextNotes?: string) => {
    services.commercialOrchestrator.setVentures(ventures);
    const res = await services.commercialOrchestrator.executeGrowthAnalysis(analysisScope, contextNotes);
    syncFromServices();
    return res;
  };

  const launchCommercialWorkflow = async (
    req: LaunchCommercialWorkflowRequest,
    onProgress?: (msg: string) => void
  ) => {
    services.commercialOrchestrator.setVentures(ventures);
    const res = await services.commercialOrchestrator.launchCommercialWorkflow(req, onProgress);
    setCommercialCampaigns(services.commercialOrchestrator.listCampaigns());
    setRelationships(services.commercialOrchestrator.listRelationships());
    setApprovals(services.commercialOrchestrator.listApprovals());
    syncFromServices();
    return res;
  };

  // Stage 6: Real-World Integrations & Execution Infrastructure
  const [connectors, setConnectors] = useState<IntegrationConnector[]>([]);
  const [toolExecutions, setToolExecutions] = useState<ToolExecutionRecord[]>(() =>
    services.toolExecutionService.listExecutions()
  );
  const [discoveredLeads, setDiscoveredLeads] = useState<DiscoveredLead[]>(() =>
    services.leadDiscoveryEngine.listLeads()
  );
  const [executionAuthorizations, setExecutionAuthorizations] = useState<ExecutionAuthorizationRequest[]>(() =>
    services.executionApprovalEngine.listRequests()
  );

  const refreshConnectors = async () => {
    try {
      const res = await fetch('/api/integrations/status');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.connectors)) {
          setConnectors(data.connectors);
        }
      }
    } catch {
      // offline fallback
    }
  };

  useEffect(() => {
    refreshConnectors();
  }, []);

  const testIntegrationConnection = async (integrationId: string) => {
    const res = await fetch('/api/integrations/test-connection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ integrationId })
    });
    const data = await res.json();
    await refreshConnectors();
    return data;
  };

  const toggleIntegrationEnabled = (integrationId: string, enabled: boolean) => {
    setConnectors(prev =>
      prev.map(c => (c.id === integrationId ? { ...c, isEnabled: enabled } : c))
    );
  };

  const executeTool = async (request: ToolExecutionRequest) => {
    const result = await services.toolExecutionService.executeTool(request);
    setToolExecutions(services.toolExecutionService.listExecutions());
    syncFromServices();
    return result;
  };

  const discoverLeads = async (query: LeadDiscoveryQuery) => {
    const res = await services.leadDiscoveryEngine.discoverLeads(query);
    setDiscoveredLeads(services.leadDiscoveryEngine.listLeads());
    syncFromServices();
    return res;
  };

  const promoteLeadToCRM = (leadId: string) => {
    const relId = services.leadDiscoveryEngine.promoteLeadToCRM(leadId);
    setRelationships(services.commercialOrchestrator.listRelationships());
    setDiscoveredLeads(services.leadDiscoveryEngine.listLeads());
    syncFromServices();
    return relId;
  };

  const processExecutionAuthorization = async (
    id: string,
    decision: 'APPROVE' | 'REJECT',
    notes?: string
  ) => {
    // 1. Process decision in local execution approval engine
    const updated = services.executionApprovalEngine.processDecision(id, decision, 'Supervisory Human Operator', notes);

    // 2. Synchronize decision to server approval store
    try {
      await fetch('/api/approvals/decide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          decision,
          decisionBy: 'Supervisory Human Operator',
          notes
        })
      });
    } catch {
      // offline/fallback
    }

    // 3. If approved and involves email dispatch, execute via ToolExecutionService
    if (decision === 'APPROVE' && updated.actionType === 'SEND_EMAIL') {
      try {
        const payload = (updated.proposedActionPayload || {}) as any;
        const execRes = await services.toolExecutionService.executeTool({
          toolId: 'tool_email_dispatch',
          parameters: {
            to: payload.recipient || payload.to || '',
            subject: payload.subject || '',
            body: payload.body || '',
            approvalId: id
          },
          requestingAgentId: updated.requestingAgentId,
          requestingAgentName: updated.requestingAgentName,
          isHumanSupervisor: true,
          approvalId: id,
          taskId: updated.relatedTaskId
        });

        services.executionApprovalEngine.recordExecutionResult(id, {
          success: execRes.status === 'SUCCESS' || execRes.status === 'NOT_CONFIGURED',
          responseSummary: execRes.status === 'SUCCESS' ? 'Dispatched via Resend API' : (execRes.errorMessage || 'Held safely: HELD_NO_INTEGRATION'),
          errorCode: execRes.status === 'FAILED' ? 'DISPATCH_ERROR' : undefined
        });

        setToolExecutions(services.toolExecutionService.listExecutions());
      } catch (err: any) {
        console.warn('[Approval Engine] Execution post-step note:', err);
      }
    }

    setExecutionAuthorizations(services.executionApprovalEngine.listRequests());
    syncFromServices();
  };

  // Autonomous Internet Workforce Infrastructure State & Handlers
  const [digitalIdentities, setDigitalIdentities] = useState<AgentDigitalIdentity[]>(() =>
    services.identityService.listIdentities()
  );
  const [browserSessions, setBrowserSessions] = useState<BrowserSessionRecord[]>(() =>
    services.browserService.listSessions()
  );
  const [externalAccounts, setExternalAccounts] = useState<ExternalConnectedAccount[]>(() =>
    services.accountService.listAccounts()
  );
  const [accountActivities, setAccountActivities] = useState<AccountActivityRecord[]>(() =>
    services.accountService.listActivities()
  );
  const [discoveredModels, setDiscoveredModels] = useState<DiscoveredAIModel[]>(() =>
    services.aiDiscoveryService.listModels()
  );
  const [agentConversations, setAgentConversations] = useState<AgentConversation[]>(() =>
    services.dialogueService.listConversations()
  );
  const [isDialogueModalOpen, setIsDialogueModalOpen] = useState(false);

  const refreshExternalAccounts = async () => {
    try {
      const accs = await services.accountService.fetchAccounts();
      setExternalAccounts([...accs]);
    } catch {
      // fallback
    }
  };

  const refreshDiscoveredModels = async () => {
    try {
      const mods = await services.aiDiscoveryService.fetchCatalog();
      setDiscoveredModels([...mods]);
    } catch {
      // fallback
    }
  };

  useEffect(() => {
    refreshExternalAccounts();
    refreshDiscoveredModels();
  }, []);

  const updateAgentPermissionLevel = (agentId: string, level: AgentAutonomyPermissionLevel) => {
    services.identityService.updatePermissionLevel(agentId, level);
    setDigitalIdentities(services.identityService.listIdentities());
    syncFromServices();
  };

  const getAgentIdentity = (agentId: string) => {
    return services.identityService.getIdentity(agentId);
  };

  const createBrowserSession = async (agentId: string, agentName: string, objective: string, relatedTaskId?: string) => {
    const session = await services.browserService.createSession(agentId, agentName, objective, relatedTaskId);
    setBrowserSessions(services.browserService.listSessions());
    syncFromServices();
    return session;
  };

  const openBrowserTab = async (sessionId: string, url: string, agentId?: string) => {
    const tab = await services.browserService.openTab(sessionId, url, agentId);
    setBrowserSessions(services.browserService.listSessions());
    syncFromServices();
    return tab;
  };

  const navigateBrowserTab = async (sessionId: string, tabId: string, url: string, agentId?: string) => {
    const tab = await services.browserService.navigate(sessionId, tabId, url, agentId);
    setBrowserSessions(services.browserService.listSessions());
    syncFromServices();
    return tab;
  };

  const performBrowserAction = async (sessionId: string, tabId: string, action: 'click_link' | 'extract_content' | 'download_file', linkHref?: string, agentId?: string) => {
    const res = await services.browserService.performAction(sessionId, tabId, action, linkHref, agentId);
    setBrowserSessions(services.browserService.listSessions());
    syncFromServices();
    return res;
  };

  const closeBrowserTab = (sessionId: string, tabId: string) => {
    services.browserService.closeTab(sessionId, tabId);
    setBrowserSessions(services.browserService.listSessions());
    syncFromServices();
  };

  const testAccountConnection = async (accountId: string) => {
    const res = await services.accountService.testConnection(accountId);
    await refreshExternalAccounts();
    return res;
  };

  const recordAccountActivity = (activity: Omit<AccountActivityRecord, 'id' | 'timestamp'>) => {
    const res = services.accountService.recordActivity(activity);
    setAccountActivities(services.accountService.listActivities());
    syncFromServices();
    return res;
  };

  const evaluateModelRouting = async (taskObjective: string, options?: { maxLatencyMs?: number; maxBudgetUsd?: number; requireCoding?: boolean }) => {
    return services.aiDiscoveryService.evaluateRouting(taskObjective, options);
  };

  const startAgentDialogue = async (initiatingAgent: any, targetAgent: any, topic: string, initialPrompt: string, relatedTaskId?: string) => {
    const conv = await services.dialogueService.startConversation(initiatingAgent, targetAgent, topic, initialPrompt, relatedTaskId);
    setAgentConversations(services.dialogueService.listConversations());
    syncFromServices();
    return conv;
  };

  const sendAgentDialogueMessage = async (conversationId: string, senderAgent: any, recipientAgent: any, content: string, messageType?: DialogueMessageType) => {
    const msg = await services.dialogueService.sendMessage(conversationId, senderAgent, recipientAgent, content, messageType);
    setAgentConversations(services.dialogueService.listConversations());
    syncFromServices();
    return msg;
  };

  // Subscribe to audit logger to keep UI event stream reactive
  useEffect(() => {
    const unsubscribe = services.auditLogger.subscribe((newEvent) => {
      setSystemEvents(prev => [newEvent, ...prev.slice(0, 49)]);
    });
    return () => unsubscribe();
  }, [services.auditLogger]);

  // Helper to re-sync state from services
  const syncFromServices = () => {
    const currentTasks = services.taskEngine.listTasks();
    const currentAgents = services.agentRegistry.listAgents();
    const currentIntel = services.memory.listRecords();
    const currentWorkflows = services.workforceOrchestrator.listWorkflows();
    const currentRels = services.commercialOrchestrator.listRelationships();
    const currentCamps = services.commercialOrchestrator.listCampaigns();
    const currentApps = services.commercialOrchestrator.listApprovals();
    const currentConns = services.integrationRegistry.listConnectors();
    const currentExecs = services.toolExecutionService.listExecutions();
    const currentLeads = services.leadDiscoveryEngine.listLeads();
    const currentAuths = services.executionApprovalEngine.listRequests();

    setTasks([...currentTasks]);
    setAgents([...currentAgents]);
    setIntelligence([...currentIntel]);
    setWorkflows([...currentWorkflows]);
    setRelationships([...currentRels]);
    setCommercialCampaigns([...currentCamps]);
    setApprovals([...currentApps]);
    setCommercialIntegrations([...currentConns]);
    setToolExecutions([...currentExecs]);
    setDiscoveredLeads([...currentLeads]);
    setExecutionAuthorizations([...currentAuths]);
    setDigitalIdentities(services.identityService.listIdentities());
    setBrowserSessions(services.browserService.listSessions());
    setExternalAccounts(services.accountService.listAccounts());
    setAccountActivities(services.accountService.listActivities());
    setDiscoveredModels(services.aiDiscoveryService.listModels());
    setAgentConversations(services.dialogueService.listConversations());

    // Keep active drawers in sync with current data
    if (activeTaskForDrawer) {
      const refreshedTask = currentTasks.find(t => t.id === activeTaskForDrawer.id);
      if (refreshedTask) setActiveTaskForDrawer(refreshedTask);
    }
    if (activeAgentForDrawer) {
      const refreshedAgent = currentAgents.find(a => a.id === activeAgentForDrawer.id);
      if (refreshedAgent) setActiveAgentForDrawer(refreshedAgent);
    }
    if (activeWorkflow) {
      const refreshedWf = currentWorkflows.find(w => w.id === activeWorkflow.id);
      if (refreshedWf) setActiveWorkflow(refreshedWf);
    }
  };

  const addSystemEvent = (evt: Omit<SystemEvent, 'id' | 'timestamp'>) => {
    services.auditLogger.log({
      type: evt.type,
      title: evt.title,
      description: evt.description,
      severity: evt.severity,
      entityType: evt.entityType,
      entityId: evt.entityId,
      relatedTaskId: evt.relatedTaskId,
      details: evt.details
    });
  };

  const addVenture = (v: Omit<Venture, 'id' | 'assignedAgentIds' | 'objectives'>) => {
    const id = `v-${Date.now()}`;
    const newVenture: Venture = {
      ...v,
      id,
      assignedAgentIds: ['agt-1'],
      objectives: [
        { id: `obj-${Date.now()}-1`, title: 'Define initial target customer ICP', progressPercent: 20, targetQuarter: 'Q1 2027' }
      ]
    };
    const storage = new LocalStoragePersistenceAdapter<Venture>('ventures');
    storage.set(newVenture.id, newVenture);
    setVentures(prev => [...prev, newVenture]);

    addSystemEvent({
      type: 'SYSTEM_ALERT',
      title: 'New Venture Registered',
      description: `Added "${v.name}" to the ORCHESTRA portfolio registry.`,
      severity: 'info',
      entityType: 'venture',
      entityId: id
    });
  };

  const updateVenture = (id: string, updates: Partial<Venture>) => {
    const storage = new LocalStoragePersistenceAdapter<Venture>('ventures');
    const existing = storage.get(id);
    if (existing) {
      const updated = { ...existing, ...updates };
      storage.set(id, updated);
      setVentures(prev => prev.map(v => v.id === id ? updated : v));
    }
  };

  // Agent Operations
  const registerAgent = (agentInput: RegisterAgentInput): Agent => {
    const newAgent = services.agentRegistry.registerAgent(agentInput, 'Human Operator');
    syncFromServices();
    return newAgent;
  };

  const updateAgent = (id: string, updates: UpdateAgentInput): Agent => {
    const updated = services.agentRegistry.updateAgent(id, updates, 'Human Operator');
    syncFromServices();
    return updated;
  };

  const activateAgent = (id: string): Agent => {
    const updated = services.agentRegistry.activateAgent(id, 'Human Operator');
    syncFromServices();
    return updated;
  };

  const deactivateAgent = (id: string): Agent => {
    const updated = services.agentRegistry.deactivateAgent(id, 'Human Operator');
    syncFromServices();
    return updated;
  };

  const updateAgentAutonomy = (id: string, autonomy: AgentAutonomy) => {
    services.agentRegistry.updateAgent(id, { autonomy }, 'Human Operator');
    syncFromServices();
  };

  const toggleAgentStatus = (id: string) => {
    const agent = services.agentRegistry.getAgent(id);
    if (!agent) return;
    if (agent.status === 'paused' || agent.status === 'offline') {
      services.agentRegistry.activateAgent(id);
    } else {
      services.agentRegistry.deactivateAgent(id);
    }
    syncFromServices();
  };

  // Task Operations through Orchestration Engine
  const createTask = (t: {
    title: string;
    description: string;
    ventureId: string;
    assignedAgentId?: string;
    priority: Task['priority'];
    approvalRequired: boolean;
    dueDays?: number;
    relatedKnowledgeIds?: string[];
  }): Task => {
    const due = new Date();
    due.setDate(due.getDate() + (t.dueDays || 3));

    const task = services.orchestrationService.submitTask(
      {
        title: t.title,
        description: t.description,
        ventureId: t.ventureId,
        assignedAgentId: t.assignedAgentId,
        priority: t.priority,
        approvalRequired: t.approvalRequired,
        dueAt: due.toISOString(),
        relatedKnowledgeIds: t.relatedKnowledgeIds
      },
      'Human Operator'
    );

    syncFromServices();
    return task;
  };

  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    services.taskEngine.transitionStatus(taskId, status, 'Human Operator');
    syncFromServices();
  };

  const assignTask = (taskId: string, agentId: string) => {
    services.orchestrationService.delegateTask(taskId, agentId, 'Human Operator');
    syncFromServices();
  };

  const reassignTask = (taskId: string, agentId: string) => {
    services.orchestrationService.delegateTask(taskId, agentId, 'Human Operator');
    syncFromServices();
  };

  const approveTask = (taskId: string, notes?: string) => {
    services.orchestrationService.authorizeApproval(taskId, notes, 'Human Supervisor');
    syncFromServices();
  };

  const rejectTask = (taskId: string, notes?: string) => {
    services.orchestrationService.requestRevision(taskId, notes || 'Revision requested by operator', 'Human Supervisor');
    syncFromServices();
  };

  const completeTaskWithResult = (taskId: string, result: TaskExecutionResult) => {
    services.orchestrationService.recordExecutionResult(taskId, result, 'Agent Engine');
    syncFromServices();
  };

  const failTask = (taskId: string, error: TaskErrorInfo) => {
    services.orchestrationService.handleTaskFailure(taskId, error, 'System Engine');
    syncFromServices();
  };

  const cancelTask = (taskId: string, reason?: string) => {
    services.taskEngine.cancelTask(taskId, reason || 'Cancelled by operator', 'Human Operator');
    syncFromServices();
  };

  // Organizational Memory Operations
  const addIntelligence = (item: Omit<IntelligenceItem, 'id' | 'createdAt' | 'updatedAt' | 'verifiedByHuman'>): IntelligenceItem => {
    const record = services.memory.createRecord(item, 'Human Analyst');
    syncFromServices();
    return record;
  };

  const toggleVerifyIntelligence = (id: string) => {
    services.memory.toggleHumanVerification(id, 'Human Supervisor');
    syncFromServices();
  };

  const searchKnowledge = (query: string, category?: string, ventureId?: string): IntelligenceItem[] => {
    return services.memory.search(query, category, ventureId);
  };

  const linkKnowledgeToTask = (knowledgeId: string, taskId: string) => {
    services.memory.linkRecordToTask(knowledgeId, taskId);
    syncFromServices();
  };

  // Opportunity Operations
  const createOpportunity = (opp: Omit<Opportunity, 'id' | 'updatedAt'>) => {
    const newOpp: Opportunity = {
      ...opp,
      id: `opp-${Date.now()}`,
      updatedAt: new Date().toISOString()
    };
    const storage = new LocalStoragePersistenceAdapter<Opportunity>('opportunities');
    storage.set(newOpp.id, newOpp);
    setOpportunities(prev => [newOpp, ...prev]);

    addSystemEvent({
      type: 'SYSTEM_ALERT',
      title: 'Opportunity Logged',
      description: `Tracked prospect "${opp.title}" with estimated value ${opp.estimatedValue}.`,
      severity: 'info'
    });
  };

  const updateOpportunityStage = (id: string, stage: OpportunityStage) => {
    const storage = new LocalStoragePersistenceAdapter<Opportunity>('opportunities');
    const existing = storage.get(id);
    if (existing) {
      const updated = { ...existing, stage, updatedAt: new Date().toISOString() };
      storage.set(id, updated);
      setOpportunities(prev => prev.map(opp => opp.id === id ? updated : opp));
    }
  };

  // Campaign Operations
  const createCampaign = (c: Omit<GrowthCampaign, 'id'>) => {
    const newCamp: GrowthCampaign = {
      ...c,
      id: `cmp-${Date.now()}`
    };
    const storage = new LocalStoragePersistenceAdapter<GrowthCampaign>('campaigns');
    storage.set(newCamp.id, newCamp);
    setCampaigns(prev => [newCamp, ...prev]);

    addSystemEvent({
      type: 'SYSTEM_ALERT',
      title: 'Campaign Prepared',
      description: `Growth campaign "${c.title}" registered in workspace.`,
      severity: 'info'
    });
  };

  const updateCampaignStatus = (id: string, status: CampaignStatus) => {
    const storage = new LocalStoragePersistenceAdapter<GrowthCampaign>('campaigns');
    const existing = storage.get(id);
    if (existing) {
      const updated = { ...existing, status };
      storage.set(id, updated);
      setCampaigns(prev => prev.map(c => c.id === id ? updated : c));
    }
  };

  const toggleProviderActive = (id: AIProviderConfig['id']) => {
    setAiProviders(prev => prev.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p));
  };

  const updateProviderSettings = (id: AIProviderConfig['id'], partial: Partial<AIProviderConfig>) => {
    setAiProviders(prev => prev.map(p => p.id === id ? { ...p, ...partial } : p));
  };

  const updateGovernance = (partial: Partial<GovernancePolicy>) => {
    services.orchestrationService.updateGovernance(partial);
    setGovernance(services.orchestrationService.getGovernance());
  };

  const pendingApprovalsCount = useMemo(() => {
    const taskApprovals = tasks.filter(t => t.status === 'WAITING_FOR_APPROVAL' || t.approvalStatus === 'pending').length;
    const commercialApprovals = approvals.filter(a => a.decision === 'PENDING').length;
    const executionApprovals = executionAuthorizations.filter(a => a.status === 'PENDING').length;
    return taskApprovals + commercialApprovals + executionApprovals;
  }, [tasks, approvals, executionAuthorizations]);

  const value: OrchestraContextType = {
    activeSection,
    setActiveSection,
    activeVentureFilter,
    setActiveVentureFilter,
    searchQuery,
    setSearchQuery,

    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    activeTaskForDrawer,
    setActiveTaskForDrawer,
    activeAgentForDrawer,
    setActiveAgentForDrawer,
    isEditAgentModalOpen,
    setIsEditAgentModalOpen,
    agentBeingEdited,
    setAgentBeingEdited,

    services,

    ventures,
    addVenture,
    updateVenture,

    agents,
    registerAgent,
    updateAgent,
    activateAgent,
    deactivateAgent,
    updateAgentAutonomy,
    toggleAgentStatus,

    tasks,
    createTask,
    updateTaskStatus,
    assignTask,
    approveTask,
    rejectTask,
    reassignTask,
    completeTaskWithResult,
    failTask,
    cancelTask,

    intelligence,
    addIntelligence,
    toggleVerifyIntelligence,
    searchKnowledge,
    linkKnowledgeToTask,

    opportunities,
    createOpportunity,
    updateOpportunityStage,

    campaigns,
    createCampaign,
    updateCampaignStatus,

    aiProviders,
    toggleProviderActive,
    updateProviderSettings,

    governance,
    updateGovernance,

    systemEvents,
    addSystemEvent,

    // Intelligence Layer
    intelligenceService: services.intelligenceService,
    modelRegistry: services.modelRegistry,
    toolRegistry: services.toolRegistry,
    providerStatuses,
    refreshProviderStatuses,
    executeAIReasoning,

    // Stage 4: Multi-Agent Workforce & Coordinated Pipelines
    workforceOrchestrator: services.workforceOrchestrator,
    workflows,
    activeWorkflow,
    setActiveWorkflow,
    isWorkflowModalOpen,
    setIsWorkflowModalOpen,
    preselectedAgentForWorkflow,
    setPreselectedAgentForWorkflow,
    launchWorkflow,
    executeAgentTask,
    approveWorkflow,
    rejectWorkflow,

    // Stage 5: Commercial Workforce, CRM, Campaigns, Approval Queue & Integrations
    relationships,
    createRelationship,
    updateRelationshipStage,
    addRelationshipInteraction,

    commercialCampaigns,
    createCommercialCampaign,
    updateCommercialCampaignStatus,
    recordCampaignPerformance,

    approvals,
    resolveApproval,
    createApprovalRequest,
    isApprovalModalOpen,
    setIsApprovalModalOpen,

    commercialIntegrations,
    updateIntegrationStatus,

    executeMarketingStrategy,
    executeCampaignPlanning,
    executeOutreachPreparation,
    executeGrowthAnalysis,
    launchCommercialWorkflow,

    // Stage 6: Real-World Integrations & Execution Infrastructure
    connectors,
    refreshConnectors,
    testIntegrationConnection,
    toggleIntegrationEnabled,

    toolExecutions,
    executeTool,

    discoveredLeads,
    discoverLeads,
    promoteLeadToCRM,

    executionAuthorizations,
    processExecutionAuthorization,

    // Autonomous Internet Workforce Infrastructure
    digitalIdentities,
    updateAgentPermissionLevel,
    getAgentIdentity,

    browserSessions,
    createBrowserSession,
    openBrowserTab,
    navigateBrowserTab,
    performBrowserAction,
    closeBrowserTab,

    externalAccounts,
    refreshExternalAccounts,
    testAccountConnection,
    accountActivities,
    recordAccountActivity,

    discoveredModels,
    refreshDiscoveredModels,
    evaluateModelRouting,

    agentConversations,
    startAgentDialogue,
    sendAgentDialogueMessage,
    isDialogueModalOpen,
    setIsDialogueModalOpen,

    pendingApprovalsCount
  };

  return <OrchestraContext.Provider value={value}>{children}</OrchestraContext.Provider>;
};

export const useOrchestra = () => {
  const context = useContext(OrchestraContext);
  if (!context) {
    throw new Error('useOrchestra must be used within an OrchestraProvider');
  }
  return context;
};
