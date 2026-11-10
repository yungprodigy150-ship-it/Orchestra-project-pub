/**
 * ORCHESTRA Task Management Engine
 * Governs task creation, delegation status transitions, execution lifecycle, and audit history.
 */

import {
  Task,
  TaskStatus,
  TaskPriority,
  TaskDeliverable,
  TaskExecutionResult,
  TaskErrorInfo,
  TaskAuditLog
} from '../../types';
import { IPersistenceStorage, LocalStoragePersistenceAdapter } from '../persistence/StorageAdapter';
import { AuditLogger } from '../audit/AuditLogger';

export interface CreateTaskInput {
  title: string;
  description: string;
  ventureId: string;
  assignedAgentId?: string;
  priority?: TaskPriority;
  approvalRequired?: boolean;
  dueAt?: string;
  relatedKnowledgeIds?: string[];
  parentTaskId?: string;
  delegatedByAgentId?: string;
  workflowId?: string;
  workflowStepIndex?: number;
  workflowTotalSteps?: number;
  structuredOutput?: any;
}

export class TaskEngine {
  private storage: IPersistenceStorage<Task>;
  private auditLogger?: AuditLogger;

  constructor(storage?: IPersistenceStorage<Task>, initialTasks?: Task[], auditLogger?: AuditLogger) {
    this.storage = storage || new LocalStoragePersistenceAdapter<Task>('tasks', initialTasks || []);
    this.auditLogger = auditLogger;
  }

  public createTask(input: CreateTaskInput, actorName = 'Operator'): Task {
    const now = new Date().toISOString();
    const id = `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

    const due = input.dueAt || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    const initialStatus: TaskStatus = input.assignedAgentId ? 'ASSIGNED' : 'PENDING';

    const task: Task = {
      id,
      title: input.title.trim(),
      description: input.description.trim(),
      ventureId: input.ventureId,
      assignedAgentId: input.assignedAgentId,
      priority: input.priority || 'medium',
      status: initialStatus,
      approvalRequired: input.approvalRequired ?? false,
      approvalStatus: input.approvalRequired ? 'pending' : undefined,
      createdAt: now,
      updatedAt: now,
      dueAt: due,
      relatedKnowledgeIds: input.relatedKnowledgeIds || [],
      parentTaskId: input.parentTaskId,
      delegatedByAgentId: input.delegatedByAgentId,
      workflowId: input.workflowId,
      workflowStepIndex: input.workflowStepIndex,
      workflowTotalSteps: input.workflowTotalSteps,
      structuredOutput: input.structuredOutput,
      auditLogs: [
        {
          id: `log-${Date.now()}-init`,
          timestamp: now,
          actor: actorName,
          action: input.delegatedByAgentId
            ? `Subtask delegated by agent ${input.delegatedByAgentId}`
            : 'Created task in queue',
          notes: input.assignedAgentId ? `Assigned to agent ${input.assignedAgentId}` : 'Awaiting assignment'
        }
      ]
    };

    // If this is a subtask, link it back to the parent task
    if (input.parentTaskId) {
      const parent = this.storage.get(input.parentTaskId);
      if (parent) {
        const subTaskIds = Array.from(new Set([...(parent.subTaskIds || []), task.id]));
        this.storage.set(parent.id, { ...parent, subTaskIds, updatedAt: now });
      }
    }

    this.storage.set(task.id, task);

    this.auditLogger?.log({
      type: 'TASK_CREATED',
      title: 'Task Created',
      description: `Task "${task.title}" created with status ${initialStatus}.`,
      severity: 'info',
      entityType: 'task',
      entityId: task.id,
      relatedTaskId: task.id,
      actor: { id: 'operator', name: actorName, type: 'human' },
      details: {
        priority: task.priority,
        ventureId: task.ventureId,
        assignedAgentId: task.assignedAgentId
      }
    });

    return task;
  }

  public assignTask(taskId: string, agentId: string, actorName = 'Orchestrator'): Task {
    const task = this.getTaskOrThrow(taskId);
    const now = new Date().toISOString();

    const updated = this.updateTaskInternal(taskId, {
      assignedAgentId: agentId,
      status: task.status === 'PENDING' ? 'ASSIGNED' : task.status,
      updatedAt: now,
      auditLogs: [
        ...task.auditLogs,
        {
          id: `log-${Date.now()}`,
          timestamp: now,
          actor: actorName,
          action: `Assigned task to agent ${agentId}`
        }
      ]
    });

    this.auditLogger?.log({
      type: 'AGENT_ASSIGNED',
      title: 'Agent Delegated',
      description: `Task "${task.title}" assigned to agent ${agentId}.`,
      severity: 'info',
      entityType: 'task',
      entityId: taskId,
      relatedTaskId: taskId,
      actor: { id: 'orchestrator', name: actorName, type: 'system' }
    });

    return updated;
  }

  public startTask(taskId: string, actorName = 'Agent'): Task {
    const task = this.getTaskOrThrow(taskId);
    const now = new Date().toISOString();

    const updated = this.updateTaskInternal(taskId, {
      status: 'RUNNING',
      startedAt: task.startedAt || now,
      updatedAt: now,
      auditLogs: [
        ...task.auditLogs,
        {
          id: `log-${Date.now()}`,
          timestamp: now,
          actor: actorName,
          action: 'Task execution started'
        }
      ]
    });

    this.auditLogger?.log({
      type: 'STATUS_CHANGED',
      title: 'Task Execution Started',
      description: `Task "${task.title}" transitioned to RUNNING state.`,
      severity: 'info',
      entityType: 'task',
      entityId: taskId,
      relatedTaskId: taskId
    });

    return updated;
  }

  public submitForApproval(taskId: string, deliverable?: TaskDeliverable, actorName = 'Agent'): Task {
    const task = this.getTaskOrThrow(taskId);
    const now = new Date().toISOString();

    const deliverables = deliverable
      ? [...(task.deliverables || []), deliverable]
      : task.deliverables;

    const updated = this.updateTaskInternal(taskId, {
      status: 'WAITING_FOR_APPROVAL',
      approvalStatus: 'pending',
      deliverables,
      updatedAt: now,
      auditLogs: [
        ...task.auditLogs,
        {
          id: `log-${Date.now()}`,
          timestamp: now,
          actor: actorName,
          action: 'Submitted deliverables for supervisory review'
        }
      ]
    });

    this.auditLogger?.log({
      type: 'STATUS_CHANGED',
      title: 'Awaiting Human Approval',
      description: `Task "${task.title}" halted at supervisory checkpoint. Human authorization required.`,
      severity: 'action_required',
      entityType: 'task',
      entityId: taskId,
      relatedTaskId: taskId
    });

    return updated;
  }

  public approveTask(taskId: string, approverNotes = 'Approved by human supervisor', actorName = 'Human Supervisor'): Task {
    const task = this.getTaskOrThrow(taskId);
    const now = new Date().toISOString();

    const updated = this.updateTaskInternal(taskId, {
      status: 'COMPLETED',
      approvalStatus: 'approved',
      approvalNotes: approverNotes,
      completedAt: now,
      updatedAt: now,
      auditLogs: [
        ...task.auditLogs,
        {
          id: `log-${Date.now()}`,
          timestamp: now,
          actor: actorName,
          action: 'Approved & Signed off',
          notes: approverNotes
        }
      ]
    });

    this.auditLogger?.log({
      type: 'APPROVAL_DECISION',
      title: 'Human Approval Granted',
      description: `Task "${task.title}" approved by supervisor. Cleared for production execution.`,
      severity: 'notice',
      entityType: 'task',
      entityId: taskId,
      relatedTaskId: taskId,
      actor: { id: 'supervisor', name: actorName, type: 'human' }
    });

    return updated;
  }

  public rejectTask(taskId: string, revisionNotes: string, actorName = 'Human Supervisor'): Task {
    const task = this.getTaskOrThrow(taskId);
    const now = new Date().toISOString();

    const updated = this.updateTaskInternal(taskId, {
      status: 'RUNNING',
      approvalStatus: 'rejected',
      approvalNotes: revisionNotes,
      updatedAt: now,
      auditLogs: [
        ...task.auditLogs,
        {
          id: `log-${Date.now()}`,
          timestamp: now,
          actor: actorName,
          action: 'Revision requested by operator',
          notes: revisionNotes
        }
      ]
    });

    this.auditLogger?.log({
      type: 'APPROVAL_DECISION',
      title: 'Revision Requested',
      description: `Task "${task.title}" returned for revision with feedback: "${revisionNotes}".`,
      severity: 'notice',
      entityType: 'task',
      entityId: taskId,
      relatedTaskId: taskId,
      actor: { id: 'supervisor', name: actorName, type: 'human' }
    });

    return updated;
  }

  public completeTask(taskId: string, result: TaskExecutionResult, actorName = 'Agent', structuredOutput?: any): Task {
    const task = this.getTaskOrThrow(taskId);
    const now = new Date().toISOString();

    const updated = this.updateTaskInternal(taskId, {
      status: 'COMPLETED',
      completedAt: now,
      updatedAt: now,
      executionResults: result,
      deliverables: result.artifacts || task.deliverables,
      structuredOutput: structuredOutput ?? task.structuredOutput,
      auditLogs: [
        ...task.auditLogs,
        {
          id: `log-${Date.now()}`,
          timestamp: now,
          actor: actorName,
          action: 'Completed task execution',
          notes: result.outputSummary
        }
      ]
    });

    this.auditLogger?.log({
      type: 'EXECUTION_RESULT',
      title: 'Task Completed',
      description: `Task "${task.title}" executed successfully.`,
      severity: 'info',
      entityType: 'task',
      entityId: taskId,
      relatedTaskId: taskId,
      details: {
        summary: result.outputSummary,
        artifactsCount: result.artifacts?.length || 0
      }
    });

    return updated;
  }

  public failTask(taskId: string, error: TaskErrorInfo, actorName = 'System'): Task {
    const task = this.getTaskOrThrow(taskId);
    const now = new Date().toISOString();

    const updated = this.updateTaskInternal(taskId, {
      status: 'FAILED',
      errorInfo: error,
      updatedAt: now,
      auditLogs: [
        ...task.auditLogs,
        {
          id: `log-${Date.now()}`,
          timestamp: now,
          actor: actorName,
          action: `Execution failed: ${error.message}`,
          notes: error.details
        }
      ]
    });

    this.auditLogger?.log({
      type: 'ERROR',
      title: 'Task Execution Failed',
      description: `Task "${task.title}" failed: ${error.message}`,
      severity: 'error',
      entityType: 'task',
      entityId: taskId,
      relatedTaskId: taskId,
      details: error
    });

    return updated;
  }

  public cancelTask(taskId: string, reason = 'Cancelled by operator', actorName = 'Operator'): Task {
    const task = this.getTaskOrThrow(taskId);
    const now = new Date().toISOString();

    const updated = this.updateTaskInternal(taskId, {
      status: 'CANCELLED',
      updatedAt: now,
      auditLogs: [
        ...task.auditLogs,
        {
          id: `log-${Date.now()}`,
          timestamp: now,
          actor: actorName,
          action: 'Task cancelled',
          notes: reason
        }
      ]
    });

    this.auditLogger?.log({
      type: 'STATUS_CHANGED',
      title: 'Task Cancelled',
      description: `Task "${task.title}" was cancelled: ${reason}`,
      severity: 'notice',
      entityType: 'task',
      entityId: taskId,
      relatedTaskId: taskId
    });

    return updated;
  }

  public transitionStatus(taskId: string, nextStatus: TaskStatus, actorName = 'Operator'): Task {
    switch (nextStatus) {
      case 'PENDING':
        return this.updateTaskInternal(taskId, { status: 'PENDING', updatedAt: new Date().toISOString() });
      case 'ASSIGNED':
        return this.updateTaskInternal(taskId, { status: 'ASSIGNED', updatedAt: new Date().toISOString() });
      case 'RUNNING':
        return this.startTask(taskId, actorName);
      case 'WAITING_FOR_APPROVAL':
        return this.submitForApproval(taskId, undefined, actorName);
      case 'COMPLETED':
        return this.approveTask(taskId, 'Direct operator signoff', actorName);
      case 'FAILED':
        return this.failTask(taskId, {
          code: 'MANUAL_FAIL',
          message: 'Marked failed by operator',
          timestamp: new Date().toISOString(),
          recoverable: true
        }, actorName);
      case 'CANCELLED':
        return this.cancelTask(taskId, 'Direct operator cancellation', actorName);
      default:
        return this.getTaskOrThrow(taskId);
    }
  }

  public getTask(taskId: string): Task | null {
    return this.storage.get(taskId);
  }

  public listTasks(filter?: (t: Task) => boolean): Task[] {
    const all = this.storage.getAll();
    return filter ? all.filter(filter) : all;
  }

  private updateTaskInternal(taskId: string, updates: Partial<Task>): Task {
    const task = this.getTaskOrThrow(taskId);
    const updated: Task = {
      ...task,
      ...updates
    };
    this.storage.set(taskId, updated);
    return updated;
  }

  private getTaskOrThrow(taskId: string): Task {
    const task = this.storage.get(taskId);
    if (!task) throw new Error(`Task with ID ${taskId} not found.`);
    return task;
  }
}
