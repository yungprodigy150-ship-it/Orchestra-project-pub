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
        citationSummary: { type: 'string', description: 'Consolidated factual synthesis' },
        retrievedFacts: { type: 'array', description: 'Direct facts verified from search sources' },
        aiInterpretations: { type: 'array', description: 'Analytical inferences and hypotheses' }
      }
    },
    permissionLevel: 'PUBLIC',
    riskLevel: 'LOW',
    timeoutMs: 18000,
    retryLimit: 2,
    requiredIntegrationId: 'conn-web-search',
    status: 'READY',
    statusNotice: 'Google Search grounding active via Gemini API Gateway. Returns real sources.'
  },
  {
    id: 'tool_website_intelligence',
    name: 'Website & Business DOM Extractor',
    description: 'Retrieves public HTML, title, meta description, services, pricing indicators, and public contact channels from company URLs.',
    category: 'intel',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'Target website URL (e.g. https://company.com)', required: true }
      },
      required: ['url']
    },
    outputSchema: {
      type: 'object',
      properties: {
        resolvedTitle: { type: 'string', description: 'Resolved page HTML title' },
        metaDescription: { type: 'string', description: 'Meta description tag content' },
        primaryServices: { type: 'array', description: 'Extracted primary service offerings' },
        publicContactChannels: { type: 'object', description: 'Detected email and contact links' },
        publicPricingCues: { type: 'array', description: 'Detected pricing plans and tier keywords' }
      }
    },
    permissionLevel: 'PUBLIC',
    riskLevel: 'LOW',
    timeoutMs: 12000,
    retryLimit: 1,
    requiredIntegrationId: 'conn-website-intel',
    status: 'READY',
    statusNotice: 'Built-in public DOM retrieval engine operational.'
  },
  {
    id: 'tool_lead_discovery',
    name: 'Public Organization & Lead Discovery Engine',
    description: 'Discovers real target organizations and businesses based on industry, geography, keywords, and venture relevance.',
    category: 'research',
    inputSchema: {
      type: 'object',
      properties: {
        industry: { type: 'string', description: 'Target industry or sector', required: true },
        geography: { type: 'string', description: 'Target region or country' },
        keywords: { type: 'array', description: 'Key technology or operational terms' },
        targetVentureId: { type: 'string', description: 'ORCHESTRA portfolio product ID (v-1, v-2, v-3)' }
      },
      required: ['industry']
    },
    outputSchema: {
      type: 'object',
      properties: {
        leads: { type: 'array', description: 'List of discovered organizations with confidence scores' },
        count: { type: 'number', description: 'Number of verified leads discovered' }
      }
    },
    permissionLevel: 'PUBLIC',
    riskLevel: 'MEDIUM',
    timeoutMs: 25000,
    retryLimit: 2,
    requiredIntegrationId: 'conn-web-search',
    status: 'READY',
    statusNotice: 'Searches public organizational registries and index. Deduplicates by corporate domain.'
  },
  {
    id: 'tool_email_dispatch',
    name: 'Transactional & Outreach Email Dispatcher',
    description: 'Sends human-approved outreach emails via Resend. Strictly blocked without prior supervisory authorization.',
    category: 'outreach',
    inputSchema: {
      type: 'object',
      properties: {
        to: { type: 'string', description: 'Recipient corporate email address', required: true },
        subject: { type: 'string', description: 'Email subject line', required: true },
        body: { type: 'string', description: 'Approved email body text', required: true },
        approvalId: { type: 'string', description: 'Reference ID of approved human authorization record' }
      },
      required: ['to', 'subject', 'body']
    },
    outputSchema: {
      type: 'object',
      properties: {
        dispatched: { type: 'boolean', description: 'Whether the email was dispatched' },
        messageId: { type: 'string', description: 'Provider delivery ID' },
        heldReason: { type: 'string', description: 'Reason if held (e.g. HELD_NO_INTEGRATION)' }
      }
    },
    permissionLevel: 'HUMAN_APPROVAL_REQUIRED',
    riskLevel: 'HIGH',
    timeoutMs: 10000,
    retryLimit: 0,
    requiredIntegrationId: 'conn-email-resend',
    status: 'UNCONFIGURED',
    statusNotice: 'RESEND_API_KEY unconfigured. Approved emails safely transition to HELD_NO_INTEGRATION without leaking.'
  },
  {
    id: 'tool_analytics_query',
    name: 'Unified Telemetry & Analytics Query Engine',
    description: 'Retrieves actual measured pageviews, funnel events, and conversion metrics from PostHog or Google Ads.',
    category: 'analytics',
    inputSchema: {
      type: 'object',
      properties: {
        metricType: { type: 'string', description: 'PAGEVIEWS | ACTIVE_USERS | CONVERSIONS | SPEND | REVENUE' },
        ventureId: { type: 'string', description: 'ORCHESTRA portfolio venture ID (v-1, v-2, v-3)' },
        dateRange: { type: 'string', description: 'Lookback window (e.g. 7d, 30d)' }
      },
      required: ['ventureId']
    },
    outputSchema: {
      type: 'object',
      properties: {
        isMeasuredData: { type: 'boolean', description: 'Guarantees whether data represents real measurements or empty state' },
        records: { type: 'array', description: 'Historical data points' }
      }
    },
    permissionLevel: 'PUBLIC',
    riskLevel: 'LOW',
    timeoutMs: 8000,
    retryLimit: 1,
    requiredIntegrationId: 'conn-analytics-posthog',
    status: 'UNCONFIGURED',
    statusNotice: 'POSTHOG_API_KEY unconfigured. Returns transparent zero-state without fabricated statistics.'
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
    riskLevel: 'LOW',
    timeoutMs: 8000,
    retryLimit: 1,
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
    riskLevel: 'MEDIUM',
    timeoutMs: 15000,
    retryLimit: 1,
    status: 'READY',
    statusNotice: 'Read-only cluster probe active. Live telemetry evaluated against venture heuristics.'
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
    riskLevel: 'LOW',
    timeoutMs: 12000,
    retryLimit: 1,
    requiredIntegrationId: 'conn-crm-hubspot',
    status: 'UNCONFIGURED',
    statusNotice: 'HUBSPOT_API_KEY unconfigured in environment secrets. Profile enrichment held until configured.'
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
    riskLevel: 'LOW',
    timeoutMs: 8000,
    retryLimit: 2,
    status: 'READY'
  },
  {
    id: 'tool_external_billing_api',
    name: 'External Commercial Billing & Invoicing Engine',
    description: 'Issues customer subscription licenses, updates contract milestones, and generates enterprise invoices via Stripe.',
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
    riskLevel: 'CRITICAL',
    timeoutMs: 15000,
    retryLimit: 0,
    requiredIntegrationId: 'conn-billing-stripe',
    status: 'UNCONFIGURED',
    statusNotice: 'Stripe Secret Key unconfigured in environment secrets. Production financial operations disabled.'
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
