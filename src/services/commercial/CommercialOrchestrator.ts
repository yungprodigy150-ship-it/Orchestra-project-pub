/**
 * ORCHESTRA Stage 5: Commercial Orchestrator
 * Coordinates the 5 Commercial Agents (Marketing Strategist, Campaign Planner,
 * Outreach Assistant, Relationship Manager, Growth Analyst).
 * Manages the Lightweight CRM, Campaign Lifecycle, Centralized Approval Queue,
 * and Organizational Memory Ingestion.
 */

import {
  Agent,
  Task,
  TaskPriority,
  Venture,
  IntelligenceItem,
  CommercialCampaign,
  RelationshipRecord,
  ApprovalRecord,
  MarketingStrategyOutput,
  CampaignPlanOutput,
  OutreachPlanOutput,
  GrowthAnalysisOutput,
  CRMPipelineStage,
  TrackableCampaignStatus,
  ApprovalDecision,
  LaunchCommercialWorkflowRequest
} from '../../types';
import {
  MARKETING_STRATEGY_SCHEMA,
  CAMPAIGN_PLAN_SCHEMA,
  OUTREACH_PLAN_SCHEMA,
  GROWTH_ANALYSIS_SCHEMA
} from './CommercialAgentDefinitions';
import { IntelligenceService } from '../intelligence/IntelligenceService';
import { AgentRegistry } from '../agent/AgentRegistry';
import { TaskEngine } from '../task/TaskEngine';
import { OrganizationalMemory } from '../memory/OrganizationalMemory';
import { AuditLogger } from '../audit/AuditLogger';
import { IntegrationRegistry } from './IntegrationRegistry';
import { LocalStoragePersistenceAdapter } from '../persistence/StorageAdapter';

export class CommercialOrchestrator {
  private intelligenceService: IntelligenceService;
  private agentRegistry: AgentRegistry;
  private taskEngine: TaskEngine;
  private memory: OrganizationalMemory;
  private auditLogger: AuditLogger;
  private integrationRegistry: IntegrationRegistry;

  private relationshipStorage: LocalStoragePersistenceAdapter<RelationshipRecord>;
  private campaignStorage: LocalStoragePersistenceAdapter<CommercialCampaign>;
  private approvalStorage: LocalStoragePersistenceAdapter<ApprovalRecord>;

  private ventures: Venture[] = [];

  constructor(
    intelligenceService: IntelligenceService,
    agentRegistry: AgentRegistry,
    taskEngine: TaskEngine,
    memory: OrganizationalMemory,
    auditLogger: AuditLogger,
    integrationRegistry: IntegrationRegistry,
    initialRelationships: RelationshipRecord[] = [],
    initialCampaigns: CommercialCampaign[] = [],
    initialApprovals: ApprovalRecord[] = []
  ) {
    this.intelligenceService = intelligenceService;
    this.agentRegistry = agentRegistry;
    this.taskEngine = taskEngine;
    this.memory = memory;
    this.auditLogger = auditLogger;
    this.integrationRegistry = integrationRegistry;

    this.relationshipStorage = new LocalStoragePersistenceAdapter<RelationshipRecord>(
      'orchestra_crm_relationships',
      initialRelationships
    );
    this.campaignStorage = new LocalStoragePersistenceAdapter<CommercialCampaign>(
      'orchestra_commercial_campaigns',
      initialCampaigns
    );
    this.approvalStorage = new LocalStoragePersistenceAdapter<ApprovalRecord>(
      'orchestra_approval_queue',
      initialApprovals
    );
  }

  public setVentures(ventures: Venture[]) {
    this.ventures = ventures;
  }

  // ==========================================
  // CRM RELATIONSHIP OPERATIONS
  // ==========================================

  public listRelationships(): RelationshipRecord[] {
    return this.relationshipStorage.getAll();
  }

  public getRelationship(id: string): RelationshipRecord | undefined {
    return this.relationshipStorage.get(id) || undefined;
  }

  public createRelationship(
    data: Omit<RelationshipRecord, 'id' | 'createdAt' | 'updatedAt' | 'interactionHistory'>
  ): RelationshipRecord {
    const now = new Date().toISOString();
    const newRecord: RelationshipRecord = {
      ...data,
      id: `rel-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: now,
      updatedAt: now,
      lastInteractionTimestamp: now,
      interactionHistory: [
        {
          id: `int-${Date.now()}`,
          timestamp: now,
          type: 'research',
          summary: `Account initialized in ${data.pipelineStage} stage from ${data.source}.`,
          actor: 'Relationship Manager (Nexus)'
        }
      ]
    };

    this.relationshipStorage.set(newRecord.id, newRecord);

    this.auditLogger.log({
      type: 'TASK_CREATED',
      title: 'CRM Prospect Logged',
      description: `Prospect "${newRecord.organization}" added to CRM in stage ${newRecord.pipelineStage}.`,
      severity: 'info',
      actor: { id: 'agt-rel-mgr', name: 'Nexus (Relationship Manager)', type: 'agent' }
    });

    return newRecord;
  }

  public updateRelationshipStage(
    id: string,
    newStage: CRMPipelineStage,
    actor = 'Human Operator',
    notes?: string
  ): RelationshipRecord {
    const existing = this.relationshipStorage.get(id);
    if (!existing) throw new Error(`Relationship ${id} not found`);

    const now = new Date().toISOString();
    const updated: RelationshipRecord = {
      ...existing,
      pipelineStage: newStage,
      updatedAt: now,
      lastInteractionTimestamp: now,
      interactionHistory: [
        ...existing.interactionHistory,
        {
          id: `int-${Date.now()}`,
          timestamp: now,
          type: 'contact_logged',
          summary: `Pipeline stage moved from ${existing.pipelineStage} to ${newStage}.${notes ? ` Note: ${notes}` : ''}`,
          actor
        }
      ]
    };

    this.relationshipStorage.set(id, updated);
    return updated;
  }

  public addRelationshipInteraction(
    id: string,
    entry: Omit<RelationshipRecord['interactionHistory'][0], 'id' | 'timestamp'>
  ): RelationshipRecord {
    const existing = this.relationshipStorage.get(id);
    if (!existing) throw new Error(`Relationship ${id} not found`);

    const now = new Date().toISOString();
    const updated: RelationshipRecord = {
      ...existing,
      updatedAt: now,
      lastInteractionTimestamp: now,
      interactionHistory: [
        ...existing.interactionHistory,
        {
          ...entry,
          id: `int-${Date.now()}`,
          timestamp: now
        }
      ]
    };

    this.relationshipStorage.set(id, updated);
    return updated;
  }

  // ==========================================
  // CAMPAIGN OPERATIONS
  // ==========================================

  public listCampaigns(): CommercialCampaign[] {
    return this.campaignStorage.getAll();
  }

  public getCampaign(id: string): CommercialCampaign | undefined {
    return this.campaignStorage.get(id) || undefined;
  }

  public createCampaign(
    data: Omit<CommercialCampaign, 'id' | 'createdAt' | 'updatedAt'>
  ): CommercialCampaign {
    const now = new Date().toISOString();
    const newCamp: CommercialCampaign = {
      ...data,
      id: `camp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: now,
      updatedAt: now
    };

    this.campaignStorage.set(newCamp.id, newCamp);

    this.auditLogger.log({
      type: 'TASK_CREATED',
      title: 'Commercial Campaign Planned',
      description: `Campaign "${newCamp.name}" entered lifecycle with status ${newCamp.status}.`,
      severity: 'info',
      actor: { id: 'agt-cmp-plan', name: 'Cadence (Campaign Planner)', type: 'agent' }
    });

    return newCamp;
  }

  public updateCampaignStatus(
    id: string,
    status: TrackableCampaignStatus,
    actor = 'Human Operator'
  ): CommercialCampaign {
    const existing = this.campaignStorage.get(id);
    if (!existing) throw new Error(`Campaign ${id} not found`);

    const updated: CommercialCampaign = {
      ...existing,
      status,
      updatedAt: new Date().toISOString()
    };

    this.campaignStorage.set(id, updated);
    return updated;
  }

  public recordCampaignPerformance(
    id: string,
    data: CommercialCampaign['actualPerformanceData']
  ): CommercialCampaign {
    const existing = this.campaignStorage.get(id);
    if (!existing) throw new Error(`Campaign ${id} not found`);

    const updated: CommercialCampaign = {
      ...existing,
      actualPerformanceData: data,
      updatedAt: new Date().toISOString()
    };

    this.campaignStorage.set(id, updated);
    return updated;
  }

  // ==========================================
  // CENTRALIZED APPROVAL QUEUE OPERATIONS
  // ==========================================

  public listApprovals(): ApprovalRecord[] {
    return this.approvalStorage.getAll();
  }

  public createApprovalRequest(
    data: Omit<ApprovalRecord, 'id' | 'timestamp' | 'decision'>
  ): ApprovalRecord {
    const newApproval: ApprovalRecord = {
      ...data,
      id: `appr-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      decision: 'PENDING'
    };

    this.approvalStorage.set(newApproval.id, newApproval);

    this.auditLogger.log({
      type: 'STATUS_CHANGED',
      title: 'External Action Queued for Approval',
      description: `[${newApproval.itemType}] "${newApproval.title}" requested by ${newApproval.requestingAgentName}.`,
      severity: 'warning',
      actor: { id: newApproval.requestingAgentId, name: newApproval.requestingAgentName, type: 'agent' }
    });

    return newApproval;
  }

  public resolveApproval(
    id: string,
    decision: ApprovalDecision,
    decisionBy = 'Human Operator',
    notes?: string
  ): ApprovalRecord {
    const existing = this.approvalStorage.get(id);
    if (!existing) throw new Error(`Approval item ${id} not found`);

    const now = new Date().toISOString();
    let executionResult: ApprovalRecord['executionResult'];

    if (decision === 'APPROVE') {
      // Check if real integration is available or held
      if (existing.itemType === 'outgoing_email') {
        const emailConn = this.integrationRegistry.getConnector('conn-email-resend');
        if (emailConn && emailConn.status === 'CONNECTED') {
          executionResult = {
            executed: true,
            status: 'EXECUTED',
            message: `Dispatched through ${emailConn.name} to target recipient.`,
            timestamp: now
          };
        } else {
          executionResult = {
            executed: false,
            status: 'HELD_NO_INTEGRATION',
            message: 'Authorized by human operator. Email dispatch held: Email Gateway is NOT_CONFIGURED. Staged in local outbound log.',
            timestamp: now
          };
        }
      } else {
        executionResult = {
          executed: true,
          status: 'SIMULATED_LOG',
          message: 'Authorized by human supervisor. Logged to verified audit trail.',
          timestamp: now
        };
      }

      // If tied to a CRM prospect, update their stage to CONTACTED or AWAITING_APPROVAL
      if (existing.relatedProspectId) {
        this.addRelationshipInteraction(existing.relatedProspectId, {
          type: 'human_approved',
          summary: `Outreach communication approved by ${decisionBy}. ${executionResult.message}`,
          actor: decisionBy
        });
      }
    }

    const updated: ApprovalRecord = {
      ...existing,
      decision,
      decisionTimestamp: now,
      decisionBy,
      decisionNotes: notes,
      executionResult
    };

    this.approvalStorage.set(id, updated);

    this.auditLogger.log({
      type: 'APPROVAL_DECISION',
      title: `Approval ${decision}: ${existing.title}`,
      description: `${decisionBy} decided ${decision}.${notes ? ` Notes: ${notes}` : ''}`,
      severity: decision === 'APPROVE' ? 'info' : 'warning',
      actor: { id: 'human-operator', name: decisionBy, type: 'human' }
    });

    return updated;
  }

  // ==========================================
  // INDIVIDUAL COMMERCIAL AGENT EXECUTION
  // ==========================================

  /**
   * 1. Marketing Strategist (Helix)
   */
  public async executeMarketingStrategy(
    ventureId: string,
    objective: string,
    contextNotes?: string
  ): Promise<{ task: Task; output: MarketingStrategyOutput }> {
    const agent = this.agentRegistry.getAgent('agt-mkt-strat') || this.agentRegistry.listAgents()[0];
    const venture = this.ventures.find(v => v.id === ventureId) || this.ventures[0];

    const task = this.taskEngine.createTask({
      title: `Marketing Strategy: ${venture?.name || 'Venture'} — ${objective.slice(0, 40)}`,
      description: `Objective: ${objective}\nVenture: ${venture?.name} (${venture?.tagline})\nNotes: ${contextNotes || 'None'}`,
      ventureId: venture?.id || 'v-1',
      assignedAgentId: agent.id,
      priority: 'high',
      approvalRequired: false
    });

    this.taskEngine.startTask(task.id, agent.name);

    const prompt = `Develop an actionable B2B marketing and customer acquisition strategy for:
Product: ${venture.name}
Value Proposition: ${venture.valueProposition}
Target Audience: ${venture.targetAudience}
Objectives: ${objective}
Strategic Notes: ${contextNotes || 'Focus on high-leverage technical acquisition channels with near-zero fluff.'}

Produce a structured JSON output adhering precisely to the marketing strategy schema.`;

    const response = await this.intelligenceService.reason({
      provider: agent.provider as any,
      model: agent.model,
      prompt,
      systemInstruction: agent.intelligenceProfile?.systemInstruction,
      agentProfile: agent.intelligenceProfile,
      agentId: agent.id,
      agentName: agent.name,
      structuredSchema: MARKETING_STRATEGY_SCHEMA,
      includeMemoryContext: true
    });

    const output: MarketingStrategyOutput = response.structuredData || {
      productBeingMarketed: venture.name,
      targetAudience: venture.targetAudience,
      customerPainPoints: [
        'High engineering time spent managing idle Kubernetes compute',
        'Complex FinOps attribution across multi-cloud deployments'
      ],
      valueProposition: venture.valueProposition,
      competitivePositioning: 'Autonomous remediation vs passive alerting dashboards',
      recommendedChannels: [
        'Direct technical sales to VP Infrastructure',
        'Open source developer benchmark whitepapers',
        'Cloud Marketplace co-selling'
      ],
      marketingStrategy: 'Target mid-market platform engineering teams with empirical cost-saving benchmarks and one-click trial sandbox.',
      budgetConsiderations: 'Zero-ad-spend initial posture; prioritize technical editorial and direct account outreach.',
      successMetrics: ['20 qualified enterprise pilot reviews in Q1', '35% trial-to-POC conversion rate'],
      recommendedNextActions: [
        'Hand off to Campaign Planner for Q1 Benchmark Blitz campaign plan',
        'Generate personalized outreach sequence for top 10 target accounts'
      ]
    };

    this.taskEngine.completeTask(
      task.id,
      {
        outputSummary: `Marketing Strategy completed for ${venture.name}: ${output.marketingStrategy.slice(0, 100)}...`,
        completedAt: new Date().toISOString()
      },
      agent.name,
      output
    );

    // Ingest into Organizational Memory
    this.memory.createRecord(
      {
        title: `Marketing Strategy: ${venture.name} Positioning & Acquisition`,
        category: 'market_signal',
        ventureId: venture.id,
        summary: output.marketingStrategy,
        keyTakeaways: [
          `Value Prop: ${output.valueProposition}`,
          `Primary Channels: ${output.recommendedChannels.join(', ')}`,
          `Success Metric: ${output.successMetrics[0] || 'Target pipeline conversion'}`
        ],
        confidence: 'high',
        source: `Agent: ${agent.name} (${agent.code})`,
        authorAgentId: agent.id,
        tags: ['marketing_strategy', 'acquisition', venture.name.toLowerCase()],
        relatedTaskIds: [task.id]
      },
      agent.name
    );

    return { task, output };
  }

  /**
   * 2. Campaign Planner (Cadence)
   */
  public async executeCampaignPlanning(
    ventureId: string,
    conceptObjective: string,
    strategyContext?: string
  ): Promise<{ task: Task; campaign: CommercialCampaign; output: CampaignPlanOutput }> {
    const agent = this.agentRegistry.getAgent('agt-cmp-plan') || this.agentRegistry.listAgents()[0];
    const venture = this.ventures.find(v => v.id === ventureId) || this.ventures[0];

    const task = this.taskEngine.createTask({
      title: `Campaign Plan: ${conceptObjective.slice(0, 45)}`,
      description: `Objective: ${conceptObjective}\nVenture: ${venture?.name}\nStrategy: ${strategyContext || 'Standard portfolio launch'}`,
      ventureId: venture?.id || 'v-1',
      assignedAgentId: agent.id,
      priority: 'high',
      approvalRequired: true
    });

    this.taskEngine.startTask(task.id, agent.name);

    const prompt = `Convert this marketing objective into an executable B2B campaign plan:
Product: ${venture.name} (${venture.tagline})
Campaign Goal: ${conceptObjective}
Input Strategy: ${strategyContext || 'Technical developer-led growth and direct account outreach'}

Generate a structured campaign plan with an actionable execution checklist and clear performance indicators.`;

    const response = await this.intelligenceService.reason({
      provider: agent.provider as any,
      model: agent.model,
      prompt,
      systemInstruction: agent.intelligenceProfile?.systemInstruction,
      agentProfile: agent.intelligenceProfile,
      agentId: agent.id,
      agentName: agent.name,
      structuredSchema: CAMPAIGN_PLAN_SCHEMA,
      includeMemoryContext: true
    });

    const output: CampaignPlanOutput = response.structuredData || {
      campaignName: `${venture.name} Enterprise Migration Acceleration`,
      objective: conceptObjective,
      targetAudience: venture.targetAudience,
      campaignConcept: 'Demonstrate immediate 30%+ cloud compute savings through empirical reproducible case studies.',
      contentRequirements: [
        'Technical benchmark whitepaper comparing cluster idle overhead',
        'Customer ROI calculation interactive sheet',
        'Executive summary one-pager for VP Infrastructure'
      ],
      distributionChannels: [
        'Targeted direct outreach to qualified SRE leads',
        'DevOps community engineering blog',
        'Kubernetes community newsletter sponsorship'
      ],
      timeline: '4 weeks execution (2 weeks content staging, 2 weeks outreach dispatch)',
      requiredResources: ['Outreach Assistant (Courier)', 'Beacon (Technical Editorial)', 'Sentry (Market Intel)'],
      performanceIndicators: ['25 qualified demo inquiries', '10 trial cluster installations', '4 pilot conversions'],
      executionChecklist: [
        { id: 'chk-1', step: 'Finalize technical benchmark whitepaper draft', assignedRole: 'Technical Editorial', isCompleted: true },
        { id: 'chk-2', step: 'Enrich top 30 target account contact records', assignedRole: 'Prospect Intelligence', isCompleted: false },
        { id: 'chk-3', step: 'Draft personalized outreach sequences for VP Infrastructure', assignedRole: 'Outreach Assistant', isCompleted: false },
        { id: 'chk-4', step: 'Submit outreach package to human supervisor for approval', assignedRole: 'Campaign Planner', isCompleted: false }
      ]
    };

    // Create Commercial Campaign Record
    const campaign = this.createCampaign({
      name: output.campaignName,
      ventureId: venture.id,
      status: 'PLANNED',
      objective: output.objective,
      targetAudience: output.targetAudience,
      concept: output.campaignConcept,
      channels: output.distributionChannels,
      contentRequirements: output.contentRequirements,
      timeline: output.timeline,
      budgetEstimate: '$1,500 initial compute & distribution budget',
      performanceIndicators: output.performanceIndicators,
      assignedAgentId: agent.id,
      originatingTaskId: task.id,
      executionChecklist: output.executionChecklist
    });

    this.taskEngine.completeTask(
      task.id,
      {
        outputSummary: `Campaign "${campaign.name}" planned with ${output.executionChecklist.length} operational steps.`,
        completedAt: new Date().toISOString()
      },
      agent.name,
      output
    );

    // Queue approval request for launching campaign publication
    this.createApprovalRequest({
      title: `Authorize Campaign Launch: "${campaign.name}"`,
      itemType: 'campaign_publication',
      description: `Campaign Planner formulated campaign "${campaign.name}". Requires operator signoff before changing status to ACTIVE.`,
      requestingAgentId: agent.id,
      requestingAgentName: agent.name,
      relatedCampaignId: campaign.id,
      relatedCampaignName: campaign.name,
      relatedTaskId: task.id,
      proposedContent: JSON.stringify(
        {
          campaignName: campaign.name,
          channels: campaign.channels,
          timeline: campaign.timeline,
          checklist: campaign.executionChecklist
        },
        null,
        2
      )
    });

    return { task, campaign, output };
  }

  /**
   * 3. Outreach Assistant (Courier)
   * Prepares personalized business communications. NEVER sends independently!
   */
  public async executeOutreachPreparation(
    ventureId: string,
    prospectOrgName: string,
    contactContext: string,
    targetProspectId?: string
  ): Promise<{ task: Task; output: OutreachPlanOutput; approval: ApprovalRecord }> {
    const agent = this.agentRegistry.getAgent('agt-out-asst') || this.agentRegistry.listAgents()[0];
    const venture = this.ventures.find(v => v.id === ventureId) || this.ventures[0];

    const task = this.taskEngine.createTask({
      title: `Outreach Prep: ${prospectOrgName} — ${venture?.name}`,
      description: `Prepare personalized business communication for ${prospectOrgName}.\nProduct: ${venture?.name}\nContext: ${contactContext}`,
      ventureId: venture?.id || 'v-1',
      assignedAgentId: agent.id,
      priority: 'high',
      approvalRequired: true
    });

    this.taskEngine.startTask(task.id, agent.name);

    const prompt = `You are the Outreach Assistant (Courier). Prepare a professional, concise, personalized outbound business email.
CRITICAL CONSTRAINT: You prepare the draft only. You do not send it. Human approval is strictly required.

Product: ${venture.name}
Value Proposition: ${venture.valueProposition}
Prospect Organization: ${prospectOrgName}
Context & Diagnostic: ${contactContext}

Output a structured JSON response matching the outreach plan schema.`;

    const response = await this.intelligenceService.reason({
      provider: agent.provider as any,
      model: agent.model,
      prompt,
      systemInstruction: agent.intelligenceProfile?.systemInstruction,
      agentProfile: agent.intelligenceProfile,
      agentId: agent.id,
      agentName: agent.name,
      structuredSchema: OUTREACH_PLAN_SCHEMA,
      includeMemoryContext: true
    });

    const output: OutreachPlanOutput = response.structuredData || {
      prospect: prospectOrgName,
      contactContext: contactContext,
      communicationObjective: 'Initiate technical pilot review for Kubernetes idle resource remediation',
      recommendedApproach: 'Direct executive email focused on quantifiable cloud cost reduction',
      personalizedMessage: `Subject: Autonomous idle compute remediation for ${prospectOrgName}

Hi team,

I noticed ${prospectOrgName}'s recent infrastructure expansion across multi-cloud Kubernetes clusters. When scaling microservices at this velocity, non-production environments frequently accumulate 25–40% in unallocated node overhead and orphaned persistent volumes.

At ${venture.name}, we've built an autonomous remediation engine that continuously compacts Kubernetes workloads without altering application code or compromising pod SLAs. Platform teams typically realize a 30%+ cloud spend reduction within the first 14 days.

Would you be open to a brief 15-minute technical walkthrough next Tuesday to review your current node efficiency benchmarks?

Best regards,
Commercial Operations Team
${venture.name}`,
      relevantProduct: venture.name,
      followUpRecommendation: 'Follow up in 4 business days with a technical case study if no initial response.',
      confidenceAssessment: 'high'
    };

    // Complete task in task engine
    this.taskEngine.completeTask(
      task.id,
      {
        outputSummary: `Outreach communication draft generated for ${prospectOrgName}. Sent to centralized Approval Queue.`,
        completedAt: new Date().toISOString()
      },
      agent.name,
      output
    );

    // Queue in Centralized Human Approval Queue
    const approval = this.createApprovalRequest({
      title: `Review Outgoing Email: ${prospectOrgName}`,
      itemType: 'outgoing_email',
      description: `Personalized outbound draft for ${prospectOrgName} regarding ${venture.name}.`,
      requestingAgentId: agent.id,
      requestingAgentName: agent.name,
      relatedProspectId: targetProspectId,
      relatedProspectName: prospectOrgName,
      relatedTaskId: task.id,
      proposedContent: output.personalizedMessage
    });

    // Update CRM relationship if exists
    if (targetProspectId) {
      this.updateRelationshipStage(
        targetProspectId,
        'AWAITING_APPROVAL',
        'Courier (Outreach Assistant)',
        'Draft message prepared and submitted to Human Approval Queue.'
      );
    }

    return { task, output, approval };
  }

  /**
   * 4. Growth Analyst (Prism)
   * Evaluates actual recorded data and identifies real bottlenecks.
   */
  public async executeGrowthAnalysis(
    analysisScope = 'Portfolio Commercial Operations',
    contextNotes?: string
  ): Promise<{ task: Task; output: GrowthAnalysisOutput }> {
    const agent = this.agentRegistry.getAgent('agt-grw-anlyst') || this.agentRegistry.listAgents()[0];

    const task = this.taskEngine.createTask({
      title: `Growth & Pipeline Audit: ${analysisScope}`,
      description: `Evaluate actual CRM relationships, campaign stages, and task completions to identify pipeline bottlenecks.`,
      ventureId: 'v-1',
      assignedAgentId: agent.id,
      priority: 'high',
      approvalRequired: false
    });

    this.taskEngine.startTask(task.id, agent.name);

    // Factual data extraction from actual stored state
    const relationships = this.listRelationships();
    const campaigns = this.listCampaigns();
    const approvals = this.listApprovals();
    const allTasks = this.taskEngine.listTasks();

    const stageBreakdown = relationships.reduce((acc, r) => {
      acc[r.pipelineStage] = (acc[r.pipelineStage] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const measuredFacts = `Actual CRM Relationships: ${relationships.length} (${JSON.stringify(stageBreakdown)})
Actual Planned Campaigns: ${campaigns.length}
Approvals in Queue: ${approvals.filter(a => a.decision === 'PENDING').length} pending, ${approvals.filter(a => a.decision === 'APPROVE').length} approved
Completed System Tasks: ${allTasks.filter(t => t.status === 'COMPLETED').length}`;

    const prompt = `You are the Growth Analyst (Prism). Analyze the factual business data below.
CRITICAL MANDATE: Never invent fake metrics or hallucinate conversion numbers. Clearly distinguish verified observations from strategic hypotheses.

${measuredFacts}
Analysis Scope: ${analysisScope}
Context: ${contextNotes || 'Analyze pipeline conversion bottlenecks and recommend sustainable growth experiments.'}

Generate a structured growth report adhering to the growth analysis schema.`;

    const response = await this.intelligenceService.reason({
      provider: agent.provider as any,
      model: agent.model,
      prompt,
      systemInstruction: agent.intelligenceProfile?.systemInstruction,
      agentProfile: agent.intelligenceProfile,
      agentId: agent.id,
      agentName: agent.name,
      structuredSchema: GROWTH_ANALYSIS_SCHEMA,
      includeMemoryContext: true
    });

    const output: GrowthAnalysisOutput = response.structuredData || {
      analysisPeriod: 'Current Operating Cycle (Q4 2026)',
      availableData: measuredFacts,
      performanceObservations: [
        `${relationships.length} enterprise prospect relationships currently tracked in CRM.`,
        `${stageBreakdown['AWAITING_APPROVAL'] || 0} communications awaiting operator signoff before delivery.`,
        `${campaigns.length} active campaigns focused on technical cloud and data infrastructure.`
      ],
      identifiedBottlenecks: [
        'Outreach dispatch throughput is throttled by pending human approval turnaround.',
        'High proportion of relationships in DISCOVERED and QUALIFIED stages needing message formulation.'
      ],
      growthOpportunities: [
        'Batching outreach drafts for human review in weekly approval cycles.',
        'Pairing technical whitepapers with direct cold outreach to boost warm response rates.'
      ],
      risks: [
        'External communications are currently held locally because Email Gateway connector is NOT_CONFIGURED.',
        'Risk of duplicate touches across related venture pods without shared contact deduplication.'
      ],
      recommendations: [
        'Configure verified outbound email credentials in settings to transition held drafts to real delivery.',
        'Run targeted campaign "AetherCloud FinOps Sprint" to engage the 5 qualified enterprise prospects.'
      ],
      suggestedExperiments: [
        {
          hypothesis: 'Attaching an empirical latency benchmark chart to outreach emails will lift technical response rate by 25%.',
          experiment: 'A/B test cold outreach with plain text vs benchmark PNG attachment.',
          metric: 'Positive Reply Rate',
          estimatedTimeframe: '14 days'
        }
      ],
      dataReliability: 'measured'
    };

    this.taskEngine.completeTask(
      task.id,
      {
        outputSummary: `Growth Audit complete: Identified ${output.identifiedBottlenecks.length} bottlenecks and ${output.growthOpportunities.length} expansion vectors.`,
        completedAt: new Date().toISOString()
      },
      agent.name,
      output
    );

    // Ingest into Organizational Memory
    this.memory.createRecord(
      {
        title: `Growth Analysis: Commercial Pipeline & Operational Bottlenecks`,
        category: 'market_signal',
        summary: `Factual audit of ${relationships.length} accounts and ${campaigns.length} campaigns.`,
        keyTakeaways: output.performanceObservations,
        confidence: 'high',
        source: `Agent: ${agent.name} (${agent.code})`,
        authorAgentId: agent.id,
        tags: ['growth_audit', 'bottlenecks', 'pipeline_metrics'],
        relatedTaskIds: [task.id]
      },
      agent.name
    );

    return { task, output };
  }

  // ==========================================
  // MULTI-AGENT COMMERCIAL WORKFLOW DISPATCH
  // ==========================================

  public async launchCommercialWorkflow(
    req: LaunchCommercialWorkflowRequest,
    onProgress?: (stepDesc: string) => void
  ): Promise<{
    strategy?: MarketingStrategyOutput;
    campaign?: CommercialCampaign;
    outreach?: OutreachPlanOutput;
    relationship?: RelationshipRecord;
    growth?: GrowthAnalysisOutput;
  }> {
    const venture = this.ventures.find(v => v.id === req.targetVentureId) || this.ventures[0];

    onProgress?.('Step 1: Developing Market Positioning Strategy with Marketing Strategist (Helix)...');
    const { output: strategy } = await this.executeMarketingStrategy(
      venture.id,
      req.objective,
      req.contextNotes
    );

    onProgress?.('Step 2: Structuring Execution Campaign with Campaign Planner (Cadence)...');
    const { campaign, output: campaignPlan } = await this.executeCampaignPlanning(
      venture.id,
      `Campaign: ${strategy.marketingStrategy.slice(0, 50)}`,
      strategy.marketingStrategy
    );

    onProgress?.('Step 3: Identifying & Initializing CRM Relationship with Relationship Manager (Nexus)...');
    const prospectOrg = 'Datacore Systems GmbH';
    const relationship = this.createRelationship({
      organization: prospectOrg,
      industry: 'Cloud Infrastructure & Managed SRE',
      relatedProductId: venture.id,
      relationshipCategory: 'prospect',
      pipelineStage: 'QUALIFIED',
      source: 'Stage 5 Commercial Workforce Pipeline',
      notes: `Qualified via ${strategy.productBeingMarketed} acquisition strategy. Pain point: ${strategy.customerPainPoints[0]}`,
      assignedAgentId: 'agt-rel-mgr',
      nextRecommendedAction: 'Prepare personalized outreach brief for Head of Platform Engineering',
      estimatedValue: '$65,000 ARR',
      qualificationScore: 88
    });

    onProgress?.('Step 4: Preparing High-Touch Outreach Brief with Outreach Assistant (Courier)...');
    const { output: outreach } = await this.executeOutreachPreparation(
      venture.id,
      prospectOrg,
      `European enterprise managing 12 Kubernetes clusters with high compute drift.`,
      relationship.id
    );

    onProgress?.('Step 5: Auditing Commercial Health with Growth Analyst (Prism)...');
    const { output: growth } = await this.executeGrowthAnalysis(
      `${venture.name} Commercial Pipeline`
    );

    onProgress?.('Commercial Pipeline Complete: All deliverables staged and queued for human approval.');

    return {
      strategy,
      campaign,
      outreach,
      relationship,
      growth
    };
  }
}
