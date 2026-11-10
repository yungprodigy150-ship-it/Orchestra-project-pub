/**
 * ORCHESTRA Central Orchestration Engine
 * Coordinates task lifecycle, agent capability matching, delegation, supervisory approval checkpoints,
 * failure recovery, and organizational knowledge linkage.
 */

import { Task, Agent, TaskExecutionResult, TaskErrorInfo, TaskDeliverable, GovernancePolicy } from '../../types';
import { AgentRegistry } from '../agent/AgentRegistry';
import { TaskEngine, CreateTaskInput } from '../task/TaskEngine';
import { OrganizationalMemory } from '../memory/OrganizationalMemory';
import { AuditLogger } from '../audit/AuditLogger';

export interface SubmitTaskRequest extends CreateTaskInput {
  requiredCapabilities?: string[];
  autoAssign?: boolean;
}

export class OrchestrationService {
  private agentRegistry: AgentRegistry;
  private taskEngine: TaskEngine;
  private memory: OrganizationalMemory;
  private auditLogger: AuditLogger;
  private governance: GovernancePolicy;

  constructor(
    agentRegistry: AgentRegistry,
    taskEngine: TaskEngine,
    memory: OrganizationalMemory,
    auditLogger: AuditLogger,
    governance: GovernancePolicy
  ) {
    this.agentRegistry = agentRegistry;
    this.taskEngine = taskEngine;
    this.memory = memory;
    this.auditLogger = auditLogger;
    this.governance = governance;
  }

  /**
   * Receives task, determines governance constraints, matches suitable agent, and assigns.
   */
  public submitTask(request: SubmitTaskRequest, actorName = 'Operator'): Task {
    let assignedAgentId = request.assignedAgentId;

    // Autonomous or assisted agent matching
    if (!assignedAgentId && request.autoAssign !== false) {
      const matchCriteria = request.requiredCapabilities && request.requiredCapabilities.length > 0
        ? request.requiredCapabilities
        : [request.title, request.description];

      const bestAgent = this.agentRegistry.findBestAgentForTask(matchCriteria);
      if (bestAgent) {
        assignedAgentId = bestAgent.id;
      }
    }

    // Determine if task inherently requires approval gate per Governance Policy
    const requiresApproval =
      request.approvalRequired ??
      (this.governance.requireApprovalForOutreach &&
        (request.title.toLowerCase().includes('outreach') ||
          request.description.toLowerCase().includes('outreach') ||
          request.title.toLowerCase().includes('email') ||
          request.description.toLowerCase().includes('memo')));

    const task = this.taskEngine.createTask(
      {
        ...request,
        assignedAgentId,
        approvalRequired: requiresApproval
      },
      actorName
    );

    if (assignedAgentId) {
      this.agentRegistry.recordTaskAssignment(assignedAgentId, task.id);
    }

    // Link any requested knowledge IDs to the task
    if (request.relatedKnowledgeIds && request.relatedKnowledgeIds.length > 0) {
      request.relatedKnowledgeIds.forEach((kId) => {
        this.memory.linkRecordToTask(kId, task.id);
      });
    }

    return task;
  }

  /**
   * Delegates an unassigned or existing task to a specific agent
   */
  public delegateTask(taskId: string, agentId: string, actorName = 'Orchestrator'): Task {
    const agent = this.agentRegistry.getAgent(agentId);
    if (!agent) {
      throw new Error(`Target agent ${agentId} not found in registry.`);
    }

    const previousTask = this.taskEngine.getTask(taskId);
    if (previousTask?.assignedAgentId && previousTask.assignedAgentId !== agentId) {
      this.agentRegistry.recordTaskCompletion(previousTask.assignedAgentId, taskId);
    }

    const task = this.taskEngine.assignTask(taskId, agentId, actorName);
    this.agentRegistry.recordTaskAssignment(agentId, taskId);
    return task;
  }

  /**
   * Transitions task to RUNNING execution state
   */
  public startTaskExecution(taskId: string, actorName = 'Agent'): Task {
    const task = this.taskEngine.getTask(taskId);
    if (!task) throw new Error(`Task ${taskId} not found.`);

    if (task.assignedAgentId) {
      const agent = this.agentRegistry.getAgent(task.assignedAgentId);
      if (agent && agent.status === 'paused') {
        throw new Error(`Cannot execute task: Agent ${agent.name} is currently paused.`);
      }
    }

    return this.taskEngine.startTask(taskId, actorName);
  }

  /**
   * Records execution deliverables.
   * If task requires supervisory approval, routes to WAITING_FOR_APPROVAL.
   * Otherwise, finalizes as COMPLETED.
   */
  public recordExecutionResult(
    taskId: string,
    result: TaskExecutionResult,
    actorName = 'Agent'
  ): Task {
    const task = this.taskEngine.getTask(taskId);
    if (!task) throw new Error(`Task ${taskId} not found.`);

    if (task.approvalRequired) {
      const primaryDeliverable = result.artifacts?.[0];
      return this.taskEngine.submitForApproval(taskId, primaryDeliverable, actorName);
    }

    const completed = this.taskEngine.completeTask(taskId, result, actorName);

    if (task.assignedAgentId) {
      this.agentRegistry.recordTaskCompletion(task.assignedAgentId, taskId);
    }

    return completed;
  }

  /**
   * Records task execution failure and logs error telemetry
   */
  public handleTaskFailure(taskId: string, error: TaskErrorInfo, actorName = 'System'): Task {
    const task = this.taskEngine.getTask(taskId);
    if (!task) throw new Error(`Task ${taskId} not found.`);

    const failed = this.taskEngine.failTask(taskId, error, actorName);

    if (task.assignedAgentId) {
      this.agentRegistry.recordTaskCompletion(task.assignedAgentId, taskId);
    }

    return failed;
  }

  /**
   * Human supervisor authorizes execution of deliverable at approval gate
   */
  public authorizeApproval(taskId: string, supervisorNotes?: string, actorName = 'Supervisor'): Task {
    const task = this.taskEngine.getTask(taskId);
    if (!task) throw new Error(`Task ${taskId} not found.`);

    const approved = this.taskEngine.approveTask(taskId, supervisorNotes, actorName);

    if (task.assignedAgentId) {
      this.agentRegistry.recordTaskCompletion(task.assignedAgentId, taskId);
    }

    return approved;
  }

  /**
   * Human supervisor requests deliverable revision
   */
  public requestRevision(taskId: string, revisionNotes: string, actorName = 'Supervisor'): Task {
    return this.taskEngine.rejectTask(taskId, revisionNotes, actorName);
  }

  /**
   * Update governance policy thresholds at runtime
   */
  public updateGovernance(policy: Partial<GovernancePolicy>): void {
    this.governance = {
      ...this.governance,
      ...policy
    };
    this.auditLogger.log({
      type: 'SYSTEM_ALERT',
      title: 'Governance Policy Reconfigured',
      description: 'Human approval limits and step execution boundaries updated.',
      severity: 'notice',
      entityType: 'governance',
      details: policy
    });
  }

  public getGovernance(): GovernancePolicy {
    return { ...this.governance };
  }
}
