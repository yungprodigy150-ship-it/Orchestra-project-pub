/**
 * ORCHESTRA Tool Registry Service
 * Authoritative registry of operational tools, permissions, input/output schemas,
 * and execution safety guardrails for multi-agent workloads.
 */

import { ToolDefinition, ToolPermissionLevel, ToolStatus } from '../../types/intelligence';

export const INITIAL_TOOLS: ToolDefinition[] = [
  {
    id: 'tool_web_research',
    name: 'Web & Competitive Intel Search',
    description: 'Searches public technical documentation, SEC filings, venture capital disclosures, and changelogs for competitive telemetry.',
    category: 'research',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'The search query or competitor entity name', required: true },
        domainFilter: { type: 'string', description: 'Optional domain restriction (e.g. github.com, news.ycombinator.com)' },
        maxResults: { type: 'number', description: 'Number of results to retrieve (1-10)' }
      },
      required: ['query']
    },
    outputSchema: {
      type: 'object',
      properties: {
        results: { type: 'array', description: 'Verified snippets with title, URL, and publication timestamp' },
        citationSummary: { type: 'string', description: 'Consolidated factual synthesis' }
      }
    },
    permissionLevel: 'PUBLIC',
    status: 'SIMULATED',
    statusNotice: 'Operating via deterministic sandbox synthesizer. Real SERP connector awaits production API key.'
  },
  {
    id: 'tool_doc_schema_analyzer',
    name: 'Document & OpenAPI Schema Parser',
    description: 'Parses OpenAPI 3.1 definitions, federated GraphQL schemas, protobuf contracts, and Markdown RFCs into normalized relational structures.',
    category: 'infrastructure',
    inputSchema: {
      type: 'object',
      properties: {
        rawContent: { type: 'string', description: 'The raw schema string or specification document', required: true },
        format: { type: 'string', description: 'Format identifier: openapi_v3 | graphql | markdown_rfc', required: true }
      },
      required: ['rawContent', 'format']
    },
    outputSchema: {
      type: 'object',
      properties: {
        entities: { type: 'array', description: 'Extracted models, types, and schema dependencies' },
        validationErrors: { type: 'array', description: 'Syntax or breaking invariant errors detected' }
      }
    },
    permissionLevel: 'PUBLIC',
    status: 'READY'
  },
  {
    id: 'tool_finops_cluster_auditor',
    name: 'Kubernetes Multi-Cloud FinOps Auditor',
    description: 'Inspects pod allocation metrics, daemonset densities, and unattached EBS/persistent volumes to compute idle cost savings.',
    category: 'infrastructure',
    inputSchema: {
      type: 'object',
      properties: {
        clusterIdentifier: { type: 'string', description: 'Target Kubernetes cluster name or ARN', required: true },
        lookbackDays: { type: 'number', description: 'Telemetry lookback window (default 14 days)' }
      },
      required: ['clusterIdentifier']
    },
    outputSchema: {
      type: 'object',
      properties: {
        estimatedMonthlyWasteUsd: { type: 'number', description: 'Total calculated cloud waste' },
        remediationPlan: { type: 'array', description: 'List of safe compaction actions' }
      }
    },
    permissionLevel: 'HUMAN_APPROVAL_REQUIRED',
    status: 'SIMULATED',
    statusNotice: 'Read-only cluster probe active. Live AWS IAM assume-role credentials configured per venture.'
  },
  {
    id: 'tool_crm_account_profiler',
    name: 'Enterprise CRM & Account Profiler',
    description: 'Enriches prospective customer company domains with headcount, cloud infrastructure spend, and executive decision-maker mappings.',
    category: 'outreach',
    inputSchema: {
      type: 'object',
      properties: {
        companyDomain: { type: 'string', description: 'Corporate domain name (e.g. nexuscap.com)', required: true },
        targetRoleKeywords: { type: 'array', description: 'Key title filters (e.g. VP Platform, Head of Infrastructure)' }
      },
      required: ['companyDomain']
    },
    outputSchema: {
      type: 'object',
      properties: {
        organizationProfile: { type: 'object', description: 'Company size, estimated ARR, and tech stack tags' },
        recommendedContacts: { type: 'array', description: 'Relevant verified executive profiles' }
      }
    },
    permissionLevel: 'HUMAN_APPROVAL_REQUIRED',
    status: 'SIMULATED',
    statusNotice: 'Requires human signoff before any personalized draft or outreach trigger.'
  },
  {
    id: 'tool_database_cdc_inspector',
    name: 'Database CDC Lag & Invariant Inspector',
    description: 'Monitors WAL replication backlog, PostgreSQL logical decoding slot throughput, and target Kafka consumer lag.',
    category: 'database',
    inputSchema: {
      type: 'object',
      properties: {
        pipelineId: { type: 'string', description: 'RelaySync pipeline identifier', required: true }
      },
      required: ['pipelineId']
    },
    outputSchema: {
      type: 'object',
      properties: {
        walBacklogBytes: { type: 'number', description: 'Current unread WAL bytes' },
        p99LatencyMs: { type: 'number', description: '99th percentile end-to-end sync latency' },
        healthStatus: { type: 'string', description: 'NOMINAL | DEGRADED | LAGGING' }
      }
    },
    permissionLevel: 'PUBLIC',
    status: 'READY'
  },
  {
    id: 'tool_external_billing_api',
    name: 'External Commercial Billing & Invoicing Engine',
    description: 'Issues customer subscription licenses, updates contract milestones, and generates enterprise invoices.',
    category: 'analytics',
    inputSchema: {
      type: 'object',
      properties: {
        accountId: { type: 'string', description: 'Customer account ID', required: true },
        invoiceAmountUsd: { type: 'number', description: 'Total charge amount', required: true }
      },
      required: ['accountId', 'invoiceAmountUsd']
    },
    outputSchema: {
      type: 'object',
      properties: {
        invoiceId: { type: 'string', description: 'Generated invoice identifier' },
        paymentStatus: { type: 'string', description: 'PENDING_AUTHORIZATION | CLEARED' }
      }
    },
    permissionLevel: 'RESTRICTED_ADMIN',
    status: 'UNCONFIGURED',
    statusNotice: 'Stripe / Merchant Gateway unconfigured. Production financial operations disabled.'
  }
];

export class ToolRegistry {
  private tools: Map<string, ToolDefinition> = new Map();

  constructor(initialTools: ToolDefinition[] = INITIAL_TOOLS) {
    initialTools.forEach(tool => this.tools.set(tool.id, tool));
  }

  public getTool(id: string): ToolDefinition | null {
    return this.tools.get(id) || null;
  }

  public listTools(filter?: (t: ToolDefinition) => boolean): ToolDefinition[] {
    const all = Array.from(this.tools.values());
    return filter ? all.filter(filter) : all;
  }

  public getAuthorizedToolsForAgent(authorizedToolIds: string[]): ToolDefinition[] {
    return authorizedToolIds
      .map(id => this.tools.get(id))
      .filter((t): t is ToolDefinition => t !== undefined && t.status !== 'DISABLED');
  }

  public checkToolPermission(toolId: string, isHumanSupervisor: boolean): { allowed: boolean; reason?: string } {
    const tool = this.tools.get(toolId);
    if (!tool) {
      return { allowed: false, reason: `Tool with ID ${toolId} is not registered.` };
    }

    if (tool.status === 'DISABLED') {
      return { allowed: false, reason: `Tool ${tool.name} is currently disabled by administrator.` };
    }

    if (tool.status === 'UNCONFIGURED') {
      return { allowed: false, reason: `Tool ${tool.name} credentials or backend connectors are unconfigured.` };
    }

    if (tool.permissionLevel === 'RESTRICTED_ADMIN' && !isHumanSupervisor) {
      return { allowed: false, reason: `Tool ${tool.name} requires administrator privileges.` };
    }

    return { allowed: true };
  }

  public updateToolStatus(id: string, status: ToolStatus, notice?: string): void {
    const tool = this.tools.get(id);
    if (tool) {
      tool.status = status;
      if (notice !== undefined) tool.statusNotice = notice;
      this.tools.set(id, { ...tool });
    }
  }
}
