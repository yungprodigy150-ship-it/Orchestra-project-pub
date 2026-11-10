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
  IntegrationRegistry
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
      integrationRegistry
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

    setTasks([...currentTasks]);
    setAgents([...currentAgents]);
    setIntelligence([...currentIntel]);
    setWorkflows([...currentWorkflows]);
    setRelationships([...currentRels]);
    setCommercialCampaigns([...currentCamps]);
    setApprovals([...currentApps]);
    setCommercialIntegrations([...currentConns]);

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
    return taskApprovals + commercialApprovals;
  }, [tasks, approvals]);

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
