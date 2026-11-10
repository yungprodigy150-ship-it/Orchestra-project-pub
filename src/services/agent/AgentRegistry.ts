/**
 * ORCHESTRA Agent Registry Service
 * Structured registry managing agent identities, model capabilities, assigned workloads, and operational statuses.
 */

import { Agent, AgentStatus, AgentAutonomy, AgentDepartment, AgentModelConfig } from '../../types';
import { AgentIntelligenceProfile } from '../../types/intelligence';
import { IPersistenceStorage, LocalStoragePersistenceAdapter } from '../persistence/StorageAdapter';
import { AuditLogger } from '../audit/AuditLogger';

export interface RegisterAgentInput {
  name: string;
  code: string;
  role: string;
  department: AgentDepartment;
  description: string;
  responsibilities?: string[];
  capabilities: string[];
  provider: 'gemini' | 'anthropic' | 'openai' | 'local';
  model: string;
  modelConfig?: AgentModelConfig;
  intelligenceProfile?: AgentIntelligenceProfile;
  status?: AgentStatus;
  autonomy?: AgentAutonomy;
  assignedVentureIds?: string[];
}

export interface UpdateAgentInput {
  name?: string;
  code?: string;
  role?: string;
  department?: AgentDepartment;
  description?: string;
  responsibilities?: string[];
  capabilities?: string[];
  provider?: 'gemini' | 'anthropic' | 'openai' | 'local';
  model?: string;
  modelConfig?: AgentModelConfig;
  intelligenceProfile?: AgentIntelligenceProfile;
  autonomy?: AgentAutonomy;
  assignedVentureIds?: string[];
  status?: AgentStatus;
  assignedTaskIds?: string[];
  activeTaskCount?: number;
  completedTasksTotal?: number;
  lastActive?: string;
}

export class AgentRegistry {
  private storage: IPersistenceStorage<Agent>;
  private auditLogger?: AuditLogger;

  constructor(storage?: IPersistenceStorage<Agent>, initialAgents?: Agent[], auditLogger?: AuditLogger) {
    this.storage = storage || new LocalStoragePersistenceAdapter<Agent>('agents', initialAgents || []);
    this.auditLogger = auditLogger;
  }

  public registerAgent(input: RegisterAgentInput, actorName = 'System Operator'): Agent {
    const now = new Date().toISOString();
    const id = `agt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

    const agent: Agent = {
      id,
      name: input.name.trim(),
      code: input.code.trim().toUpperCase(),
      role: input.role.trim(),
      department: input.department,
      description: input.description.trim(),
      responsibilities: input.responsibilities || [input.role],
      capabilities: input.capabilities,
      provider: input.provider,
      model: input.model,
      modelConfig: input.modelConfig || {
        provider: input.provider,
        model: input.model,
        temperature: 0.2,
        maxTokens: 4096
      },
      status: 'idle',
      autonomy: input.autonomy || 'approval_required',
      assignedTaskIds: [],
      assignedVentureIds: input.assignedVentureIds || [],
      activeTaskCount: 0,
      completedTasksTotal: 0,
      uptimeHours: 0,
      reliabilityScore: 100,
      createdAt: now,
      updatedAt: now,
      lastActive: 'Just registered'
    };

    this.storage.set(agent.id, agent);

    this.auditLogger?.log({
      type: 'AGENT_REGISTERED',
      title: 'Agent Registered',
      description: `Specialized agent ${agent.name} (${agent.code}) registered in ${agent.department} department.`,
      severity: 'info',
      entityType: 'agent',
      entityId: agent.id,
      actor: { id: 'operator', name: actorName, type: 'human' },
      details: {
        provider: agent.provider,
        model: agent.model,
        capabilities: agent.capabilities
      }
    });

    return agent;
  }

  public updateAgent(id: string, updates: UpdateAgentInput, actorName = 'System Operator'): Agent {
    const existing = this.storage.get(id);
    if (!existing) {
      throw new Error(`Agent with ID ${id} not found.`);
    }

    const updated: Agent = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.storage.set(id, updated);

    this.auditLogger?.log({
      type: 'AGENT_UPDATED',
      title: 'Agent Updated',
      description: `Configuration modified for agent ${updated.name} (${updated.code}).`,
      severity: 'notice',
      entityType: 'agent',
      entityId: id,
      actor: { id: 'operator', name: actorName, type: 'human' },
      details: updates
    });

    return updated;
  }

  public getAgent(id: string): Agent | null {
    return this.storage.get(id);
  }

  public listAgents(filter?: (a: Agent) => boolean): Agent[] {
    const all = this.storage.getAll();
    return filter ? all.filter(filter) : all;
  }

  public activateAgent(id: string, actorName = 'System Operator'): Agent {
    const agent = this.storage.get(id);
    if (!agent) throw new Error(`Agent ${id} not found.`);

    const nextStatus: AgentStatus = agent.activeTaskCount > 0 ? 'executing' : 'idle';
    const updated = this.updateAgent(id, { status: nextStatus }, actorName);

    this.auditLogger?.log({
      type: 'AGENT_STATUS_TOGGLED',
      title: 'Agent Activated',
      description: `Agent ${agent.name} activated into ${nextStatus} state.`,
      severity: 'info',
      entityType: 'agent',
      entityId: id
    });

    return updated;
  }

  public deactivateAgent(id: string, actorName = 'System Operator'): Agent {
    const agent = this.storage.get(id);
    if (!agent) throw new Error(`Agent ${id} not found.`);

    const updated = this.updateAgent(id, { status: 'paused' }, actorName);

    this.auditLogger?.log({
      type: 'AGENT_STATUS_TOGGLED',
      title: 'Agent Deactivated',
      description: `Agent ${agent.name} set to paused status. Active tasks will be suspended.`,
      severity: 'notice',
      entityType: 'agent',
      entityId: id
    });

    return updated;
  }

  public findAgentsWithCapability(capability: string): Agent[] {
    const capLower = capability.toLowerCase();
    return this.storage.query(
      (a) =>
        a.status !== 'paused' &&
        a.status !== 'offline' &&
        a.capabilities.some((c) => c.toLowerCase().includes(capLower) || capLower.includes(c.toLowerCase()))
    );
  }

  public findBestAgentForTask(taskRequirements: string[]): Agent | null {
    const activeAgents = this.storage.query((a) => a.status !== 'paused' && a.status !== 'offline');
    if (activeAgents.length === 0) return null;

    // Rank agents by capability overlap and lowest active task count
    const scored = activeAgents.map((agent) => {
      let score = 0;
      taskRequirements.forEach((req) => {
        const reqLower = req.toLowerCase();
        if (agent.capabilities.some((c) => c.toLowerCase().includes(reqLower) || reqLower.includes(c.toLowerCase()))) {
          score += 2;
        }
      });
      // Workload penalty to balance load across workforce
      score -= agent.activeTaskCount * 0.5;
      return { agent, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored[0]?.agent || activeAgents[0];
  }

  public recordTaskAssignment(agentId: string, taskId: string): void {
    const agent = this.storage.get(agentId);
    if (!agent) return;

    const assignedTaskIds = Array.from(new Set([...agent.assignedTaskIds, taskId]));
    const nextStatus: AgentStatus = agent.status === 'paused' ? 'paused' : 'executing';

    this.updateAgent(agentId, {
      assignedTaskIds,
      activeTaskCount: assignedTaskIds.length,
      status: nextStatus
    });
  }

  public recordTaskCompletion(agentId: string, taskId: string): void {
    const agent = this.storage.get(agentId);
    if (!agent) return;

    const assignedTaskIds = agent.assignedTaskIds.filter((id) => id !== taskId);
    const nextStatus: AgentStatus = agent.status === 'paused' ? 'paused' : assignedTaskIds.length > 0 ? 'executing' : 'idle';

    this.updateAgent(agentId, {
      assignedTaskIds,
      activeTaskCount: assignedTaskIds.length,
      completedTasksTotal: agent.completedTasksTotal + 1,
      status: nextStatus,
      lastActive: 'Just now'
    });
  }
}
