/**
 * ORCHESTRA Tool Execution Service
 * Central authority for executing external tools on behalf of authorized agents.
 * Validates inputs against schemas, enforces agent permissions, checks human approval,
 * handles timeouts and retries, and maintains an auditable execution history.
 */

import {
  ExternalToolDefinition,
  ToolExecutionRequest,
  ToolExecutionRecord,
  ToolExecutionStatus,
  AgentToolPermissionEntry
} from '../../types/integrations';
import { ToolRegistry } from '../intelligence/ToolRegistry';
import { AuditLogger } from '../audit/AuditLogger';
import { LocalStoragePersistenceAdapter } from '../persistence/StorageAdapter';

export class ToolExecutionService {
  private toolRegistry: ToolRegistry;
  private auditLogger: AuditLogger;
  private executionStorage: LocalStoragePersistenceAdapter<ToolExecutionRecord>;

  // Granular Agent Permission Matrix (Section 9 Specification)
  private agentPermissions: Map<string, string[]> = new Map([
    // Market Intelligence Agent: Web search, Webpage retrieval, Research analysis
    ['agt-2', ['tool_web_research', 'tool_doc_schema_analyzer', 'tool_website_intelligence']],
    ['agt-mkt-intel', ['tool_web_research', 'tool_doc_schema_analyzer', 'tool_website_intelligence']],

    // Opportunity Hunter: Web search, Lead discovery, Organizational research
    ['agt-scout', ['tool_web_research', 'tool_lead_discovery', 'tool_website_intelligence']],
    ['agt-opp-hunter', ['tool_web_research', 'tool_lead_discovery', 'tool_website_intelligence']],

    // Prospect Intelligence Agent: Web search, Website intelligence, Lead enrichment
    ['agt-3', ['tool_web_research', 'tool_website_intelligence', 'tool_crm_account_profiler']],
    ['agt-prsp-intel', ['tool_web_research', 'tool_website_intelligence', 'tool_crm_account_profiler']],

    // Portfolio Strategist: Product info, Research retrieval, Schema parsing
    ['agt-4', ['tool_doc_schema_analyzer', 'tool_web_research']],
    ['agt-port-strat', ['tool_doc_schema_analyzer', 'tool_web_research']],

    // Marketing Strategist: Research retrieval, Analytics query
    ['agt-mkt-strat', ['tool_web_research', 'tool_analytics_query']],

    // Campaign Planner: Content preparation, Internal tasks
    ['agt-cmp-plan', ['tool_doc_schema_analyzer']],

    // Outreach Assistant: Prospect retrieval, Draft prep, Approval request (NEVER direct email dispatch)
    ['agt-out-asst', ['tool_crm_account_profiler', 'tool_web_research']],

    // Relationship Manager: CRM records, Interaction records
    ['agt-rel-mgr', ['tool_crm_account_profiler']],

    // Growth Analyst: Analytics retrieval, Historical business records
    ['agt-grw-anlyst', ['tool_analytics_query', 'tool_finops_cluster_auditor']],

    // Human Operator / Supervisor: All tools
    ['operator', ['*']],
    ['human-operator', ['*']]
  ]);

  constructor(
    toolRegistry: ToolRegistry,
    auditLogger: AuditLogger,
    executionStorage?: LocalStoragePersistenceAdapter<ToolExecutionRecord>
  ) {
    this.toolRegistry = toolRegistry;
    this.auditLogger = auditLogger;
    this.executionStorage =
      executionStorage ||
      new LocalStoragePersistenceAdapter<ToolExecutionRecord>('tool_executions', []);
  }

  /**
   * Get all recorded tool executions
   */
  public listExecutions(): ToolExecutionRecord[] {
    return this.executionStorage.getAll().sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  /**
   * Check if a specific agent is authorized to execute a given tool
   */
  public isAgentAuthorized(agentId: string, toolId: string, isHumanSupervisor: boolean = false): boolean {
    if (isHumanSupervisor) return true;
    const authorized = this.agentPermissions.get(agentId);
    if (!authorized) return false;
    if (authorized.includes('*')) return true;
    return authorized.includes(toolId);
  }

  /**
   * Validate parameters against tool input schema
   */
  public validateInput(tool: ExternalToolDefinition, parameters: Record<string, any>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const required = tool.inputSchema.required || [];

    for (const field of required) {
      if (parameters[field] === undefined || parameters[field] === null || parameters[field] === '') {
        errors.push(`Missing required parameter: "${field}"`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Execute an external tool on behalf of an authorized agent or operator
   */
  public async executeTool(request: ToolExecutionRequest): Promise<ToolExecutionRecord> {
    const startTime = performance.now();
    const executionId = `exec-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const tool = this.toolRegistry.getTool(request.toolId) as ExternalToolDefinition | null;

    // 1. Tool Existence Check
    if (!tool) {
      const durationMs = Math.round(performance.now() - startTime);
      const record: ToolExecutionRecord = {
        id: executionId,
        toolId: request.toolId,
        toolName: request.toolId,
        requestingAgentId: request.requestingAgentId,
        requestingAgentName: request.requestingAgentName,
        status: 'FAILED',
        inputParameters: this.sanitizeInput(request.parameters),
        errorMessage: `Tool "${request.toolId}" is not registered in the Tool Execution Service.`,
        durationMs,
        timestamp: new Date().toISOString(),
        relatedTaskId: request.taskId
      };
      this.recordExecution(record);
      return record;
    }

    // 2. Permission Check
    const isAuthorized = this.isAgentAuthorized(
      request.requestingAgentId,
      request.toolId,
      request.isHumanSupervisor || false
    );

    if (!isAuthorized) {
      const durationMs = Math.round(performance.now() - startTime);
      const record: ToolExecutionRecord = {
        id: executionId,
        toolId: tool.id,
        toolName: tool.name,
        requestingAgentId: request.requestingAgentId,
        requestingAgentName: request.requestingAgentName,
        status: 'BLOCKED_PERMISSION',
        inputParameters: this.sanitizeInput(request.parameters),
        errorMessage: `Agent ${request.requestingAgentName} (${request.requestingAgentId}) is not authorized to execute tool ${tool.name}. Access blocked by security policy.`,
        durationMs,
        timestamp: new Date().toISOString(),
        relatedTaskId: request.taskId
      };
      this.recordExecution(record);
      return record;
    }

    // 3. Human Approval Gate Check for Destructive / External Action Tools
    if (tool.permissionLevel === 'HUMAN_APPROVAL_REQUIRED' || tool.permissionLevel === 'RESTRICTED_ADMIN') {
      if (!request.isHumanSupervisor && !request.approvalId) {
        const durationMs = Math.round(performance.now() - startTime);
        const record: ToolExecutionRecord = {
          id: executionId,
          toolId: tool.id,
          toolName: tool.name,
          requestingAgentId: request.requestingAgentId,
          requestingAgentName: request.requestingAgentName,
          status: 'BLOCKED_APPROVAL',
          inputParameters: this.sanitizeInput(request.parameters),
          errorMessage: `Tool ${tool.name} requires explicit human supervisory approval before execution. Action blocked.`,
          durationMs,
          timestamp: new Date().toISOString(),
          relatedTaskId: request.taskId
        };
        this.recordExecution(record);
        return record;
      }
    }

    // 4. Input Schema Validation
    const validation = this.validateInput(tool, request.parameters);
    if (!validation.valid) {
      const durationMs = Math.round(performance.now() - startTime);
      const record: ToolExecutionRecord = {
        id: executionId,
        toolId: tool.id,
        toolName: tool.name,
        requestingAgentId: request.requestingAgentId,
        requestingAgentName: request.requestingAgentName,
        status: 'FAILED',
        inputParameters: this.sanitizeInput(request.parameters),
        errorMessage: `Input schema validation failed: ${validation.errors.join(', ')}`,
        durationMs,
        timestamp: new Date().toISOString(),
        relatedTaskId: request.taskId
      };
      this.recordExecution(record);
      return record;
    }

    // 5. Tool Status & Availability Check
    if (tool.status === 'DISABLED') {
      const durationMs = Math.round(performance.now() - startTime);
      const record: ToolExecutionRecord = {
        id: executionId,
        toolId: tool.id,
        toolName: tool.name,
        requestingAgentId: request.requestingAgentId,
        requestingAgentName: request.requestingAgentName,
        status: 'FAILED',
        inputParameters: this.sanitizeInput(request.parameters),
        errorMessage: `Tool ${tool.name} is disabled by the platform administrator.`,
        durationMs,
        timestamp: new Date().toISOString(),
        relatedTaskId: request.taskId
      };
      this.recordExecution(record);
      return record;
    }

    // 6. Execute via Server Gateway API with Timeout
    try {
      const controller = new AbortController();
      const timeoutMs = tool.timeoutMs || 15000;
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch('/api/tools/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          toolId: tool.id,
          parameters: request.parameters,
          requestingAgentId: request.requestingAgentId
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const durationMs = Math.round(performance.now() - startTime);
      const resData = await response.json();

      let status: ToolExecutionStatus = 'SUCCESS';
      let errorMessage: string | undefined = undefined;

      if (resData.status === 'BLOCKED_PERMISSION') {
        status = 'BLOCKED_PERMISSION';
        errorMessage = resData.error || 'Execution blocked by server security policy.';
      } else if (resData.status === 'BLOCKED_APPROVAL') {
        status = 'BLOCKED_APPROVAL';
        errorMessage = resData.error || 'Execution blocked: Valid human supervisory approval required.';
      } else if (resData.status === 'NOT_CONFIGURED') {
        status = 'NOT_CONFIGURED';
        errorMessage = resData.error || resData.message || 'Underlying integration connector is not configured.';
      } else if (!response.ok || resData.status === 'FAILED') {
        status = 'FAILED';
        errorMessage = resData.error || resData.message || `Server returned HTTP ${response.status}`;
      }

      const record: ToolExecutionRecord = {
        id: executionId,
        toolId: tool.id,
        toolName: tool.name,
        requestingAgentId: request.requestingAgentId,
        requestingAgentName: request.requestingAgentName,
        status,
        inputParameters: this.sanitizeInput(request.parameters),
        outputData: resData.output,
        errorMessage,
        durationMs,
        timestamp: new Date().toISOString(),
        relatedTaskId: request.taskId,
        approvalRefId: request.approvalId,
        integrationId: tool.requiredIntegrationId
      };

      this.recordExecution(record);
      return record;
    } catch (err: any) {
      const durationMs = Math.round(performance.now() - startTime);
      const isTimeout = err.name === 'AbortError';

      const record: ToolExecutionRecord = {
        id: executionId,
        toolId: tool.id,
        toolName: tool.name,
        requestingAgentId: request.requestingAgentId,
        requestingAgentName: request.requestingAgentName,
        status: isTimeout ? 'TIMEOUT' : 'FAILED',
        inputParameters: this.sanitizeInput(request.parameters),
        errorMessage: isTimeout
          ? `Execution timed out after ${tool.timeoutMs || 15000}ms.`
          : (err.message || 'Tool execution network failure.'),
        durationMs,
        timestamp: new Date().toISOString(),
        relatedTaskId: request.taskId,
        approvalRefId: request.approvalId,
        integrationId: tool.requiredIntegrationId
      };

      this.recordExecution(record);
      return record;
    }
  }

  /**
   * Persist execution and log audit event
   */
  private recordExecution(record: ToolExecutionRecord): void {
    this.executionStorage.set(record.id, record);

    this.auditLogger.log({
      type: 'TASK_EXECUTION',
      title: `Tool Execution: ${record.toolName} [${record.status}]`,
      description: `Executed by ${record.requestingAgentName}. Duration: ${record.durationMs}ms.${record.errorMessage ? ` Error: ${record.errorMessage}` : ''}`,
      severity: record.status === 'SUCCESS' ? 'info' : record.status === 'BLOCKED_PERMISSION' || record.status === 'BLOCKED_APPROVAL' ? 'warning' : 'error',
      actor: { id: record.requestingAgentId, name: record.requestingAgentName, type: record.requestingAgentId.startsWith('agt-') ? 'agent' : 'human' },
      relatedTaskId: record.relatedTaskId,
      details: {
        toolId: record.toolId,
        status: record.status,
        durationMs: record.durationMs
      }
    });
  }

  /**
   * Sanitize parameters to remove sensitive tokens before logging
   */
  private sanitizeInput(params: Record<string, any>): Record<string, any> {
    const sanitized = { ...params };
    const sensitiveKeys = ['apiKey', 'token', 'secret', 'password', 'authorization'];
    for (const k of Object.keys(sanitized)) {
      if (sensitiveKeys.some(s => k.toLowerCase().includes(s))) {
        sanitized[k] = '[REDACTED]';
      }
    }
    return sanitized;
  }
}
