/**
 * ORCHESTRA Execution Approval Engine
 * Centralized authorization layer for high-risk, consequential, or external actions.
 * Enforces human-in-the-loop gating for outgoing communications, campaigns,
 * financial commits, and irreversible operations.
 */

import {
  ExecutionAuthorizationRequest,
  ExecutionApprovalStatus,
  ActionApprovalType,
  RiskClassification
} from '../../types/integrations';
import { LocalStoragePersistenceAdapter } from '../persistence/StorageAdapter';
import { AuditLogger } from '../audit/AuditLogger';

export const INITIAL_EXECUTION_APPROVALS: ExecutionAuthorizationRequest[] = [
  {
    id: 'auth-01',
    requestingAgentId: 'agt-out-asst',
    requestingAgentName: 'Courier (OUT-ASST)',
    actionType: 'SEND_EMAIL',
    targetIntegrationId: 'conn-email-resend',
    title: 'Personalized Executive Outreach to Marcus Vance (Nexus Capital)',
    description: 'Proposes sending a tailored 14-day zero-risk FinOps audit invitation regarding Kubernetes EKS compute compaction.',
    proposedActionPayload: {
      recipient: 'm.vance@nexuscap.internal',
      subject: 'Autonomous Pod Compaction at Nexus Capital Infrastructure',
      body: 'Marcus,\n\nFollowing your presentation on EKS multi-cluster drift, we analyzed how RelaySync compacts spot allocation during off-market hours without pod restarts. Would you be open to an executive technical brief next Tuesday?'
    },
    relatedTaskId: 'task-102',
    riskClassification: 'HIGH',
    requiredPermissions: ['tool_email_dispatch'],
    status: 'PENDING',
    createdAt: '2026-11-10T10:30:00Z',
    expiresAt: '2026-11-17T10:30:00Z'
  },
  {
    id: 'auth-02',
    requestingAgentId: 'agt-cmp-plan',
    requestingAgentName: 'Cadence (CMP-PLAN)',
    actionType: 'LAUNCH_CAMPAIGN',
    targetIntegrationId: 'conn-ads-google',
    title: 'Launch Google Search Campaign: "Zero-Lag CDC Replication"',
    description: 'Authorizes activating a targeted search campaign for data platform engineers experiencing Debezium Postgres replication bottlenecks.',
    proposedActionPayload: {
      campaignName: 'Q4 CDC Invariant Acquisition',
      targetKeywords: ['Postgres CDC lag', 'Debezium alternative', 'Kafka WAL backlog'],
      dailyBudgetUsd: 150
    },
    relatedTaskId: 'task-103',
    riskClassification: 'HIGH',
    requiredPermissions: ['tool_analytics_query'],
    status: 'PENDING',
    createdAt: '2026-11-10T09:15:00Z',
    expiresAt: '2026-11-17T09:15:00Z'
  }
];

export class ExecutionApprovalEngine {
  private storage: LocalStoragePersistenceAdapter<ExecutionAuthorizationRequest>;
  private auditLogger: AuditLogger;

  constructor(
    auditLogger: AuditLogger,
    storage?: LocalStoragePersistenceAdapter<ExecutionAuthorizationRequest>
  ) {
    this.auditLogger = auditLogger;
    this.storage =
      storage ||
      new LocalStoragePersistenceAdapter<ExecutionAuthorizationRequest>(
        'execution_approvals',
        INITIAL_EXECUTION_APPROVALS
      );
  }

  /**
   * List all execution approval requests
   */
  public listRequests(filter?: (r: ExecutionAuthorizationRequest) => boolean): ExecutionAuthorizationRequest[] {
    const all = this.storage.getAll().sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return filter ? all.filter(filter) : all;
  }

  /**
   * Get single request
   */
  public getRequest(id: string): ExecutionAuthorizationRequest | undefined {
    return this.storage.get(id) || undefined;
  }

  /**
   * Submit a new execution authorization request from an agent
   */
  public submitRequest(
    data: Omit<ExecutionAuthorizationRequest, 'id' | 'createdAt' | 'status'>
  ): ExecutionAuthorizationRequest {
    const id = `auth-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const now = new Date().toISOString();

    const request: ExecutionAuthorizationRequest = {
      ...data,
      id,
      status: 'PENDING',
      createdAt: now
    };

    this.storage.set(id, request);

    this.auditLogger.log({
      type: 'STATUS_CHANGED',
      title: `Authorization Requested: [${request.actionType}]`,
      description: `Agent ${request.requestingAgentName} requested authorization for "${request.title}". Risk: ${request.riskClassification}.`,
      severity: 'warning',
      actor: { id: request.requestingAgentId, name: request.requestingAgentName, type: 'agent' }
    });

    return request;
  }

  /**
   * Process a human supervisory decision
   */
  public processDecision(
    id: string,
    decision: 'APPROVE' | 'REJECT',
    decisionBy: string = 'Supervisory Human Operator',
    notes?: string
  ): ExecutionAuthorizationRequest {
    const existing = this.getRequest(id);
    if (!existing) {
      throw new Error(`Execution request "${id}" not found.`);
    }

    const now = new Date().toISOString();
    const newStatus: ExecutionApprovalStatus = decision === 'APPROVE' ? 'APPROVED' : 'REJECTED';

    const updated: ExecutionAuthorizationRequest = {
      ...existing,
      status: newStatus,
      decisionBy,
      decisionNotes: notes,
      decisionTimestamp: now
    };

    this.storage.set(id, updated);

    this.auditLogger.log({
      type: 'APPROVAL_DECISION',
      title: `Execution Request ${decision}: ${existing.title}`,
      description: `${decisionBy} decided ${decision}.${notes ? ` Notes: ${notes}` : ''}`,
      severity: decision === 'APPROVE' ? 'info' : 'warning',
      actor: { id: 'operator', name: decisionBy, type: 'human' }
    });

    return updated;
  }

  /**
   * Record the post-approval execution result
   */
  public recordExecutionResult(
    id: string,
    result: { success: boolean; responseSummary?: string; errorCode?: string }
  ): ExecutionAuthorizationRequest {
    const existing = this.getRequest(id);
    if (!existing) {
      throw new Error(`Execution request "${id}" not found.`);
    }

    const updated: ExecutionAuthorizationRequest = {
      ...existing,
      status: result.success ? 'EXECUTED' : 'FAILED',
      executionResult: {
        success: result.success,
        executedAt: new Date().toISOString(),
        responseSummary: result.responseSummary,
        errorCode: result.errorCode
      }
    };

    this.storage.set(id, updated);
    return updated;
  }
}
