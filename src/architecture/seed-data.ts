import {
  Agent,
  Task,
  Venture,
  IntelligenceItem,
  Opportunity,
  GrowthCampaign,
  SystemEvent,
  GovernancePolicy,
  RelationshipRecord,
  CommercialCampaign,
  ApprovalRecord
} from '../types';

export const INITIAL_VENTURES: Venture[] = [
  {
    id: 'v-1',
    name: 'AetherCloud',
    tagline: 'Multi-cloud Kubernetes FinOps & autonomous idle resource remediation',
    stage: 'scaling',
    description: 'Autonomous cloud cost observability and resource compaction engine for enterprise Kubernetes clusters across AWS, GCP, and Azure.',
    targetAudience: 'VP of Infrastructure, Principal SREs, and Platform Engineering Leads managing >$50k/mo cloud spend.',
    valueProposition: 'Reduces non-production cloud infrastructure waste by an average of 34% without modifying application code.',
    techStack: ['Go', 'Rust', 'eBPF', 'React', 'TimescaleDB', 'Prometheus'],
    primaryMetricLabel: 'Managed Pods',
    primaryMetricValue: '142,800',
    secondaryMetricLabel: 'Mo. Cloud Savings Realized',
    secondaryMetricValue: '$184,200',
    repoIdentifier: 'orchestra-ventures/aether-core',
    liveUrl: 'https://aethercloud.internal',
    assignedAgentIds: ['agt-1', 'agt-4', 'agt-6'],
    objectives: [
      { id: 'obj-101', title: 'Achieve SOC2 Type II compliance audit pass', progressPercent: 85, targetQuarter: 'Q4 2026' },
      { id: 'obj-102', title: 'Roll out automated AWS Spot-to-Graviton instant migration', progressPercent: 60, targetQuarter: 'Q1 2027' },
      { id: 'obj-103', title: 'Expand enterprise pipeline to 20 qualified mid-market pilots', progressPercent: 45, targetQuarter: 'Q1 2027' },
    ]
  },
  {
    id: 'v-2',
    name: 'RelaySync',
    tagline: 'Zero-lag transactional CDC pipeline from Postgres to analytics lakes',
    stage: 'growth',
    description: 'High-throughput change data capture engine streaming production database mutations into ClickHouse, BigQuery, and Snowflake with strict transaction boundary guarantees.',
    targetAudience: 'Data platform engineers and backend architects dealing with fragile Debezium or custom ETL scripts.',
    valueProposition: 'Sub-100ms analytics freshness with exactly-once delivery guarantees and zero WAL replication lag.',
    techStack: ['Rust', 'Apache Arrow', 'PostgreSQL Logical Replication', 'Kafka', 'TypeScript'],
    primaryMetricLabel: 'Daily Events Synced',
    primaryMetricValue: '1.48B',
    secondaryMetricLabel: 'Mean End-to-End Latency',
    secondaryMetricValue: '42ms',
    repoIdentifier: 'orchestra-ventures/relaysync-engine',
    liveUrl: 'https://relaysync.internal',
    assignedAgentIds: ['agt-1', 'agt-3', 'agt-5'],
    objectives: [
      { id: 'obj-201', title: 'Complete native Iceberg catalog streaming integration', progressPercent: 90, targetQuarter: 'Q4 2026' },
      { id: 'obj-202', title: 'Launch self-service community cloud edition', progressPercent: 35, targetQuarter: 'Q1 2027' },
    ]
  },
  {
    id: 'v-3',
    name: 'OmniGraph',
    tagline: 'Autonomous knowledge graph synthesis for enterprise technical documentation',
    stage: 'mvp',
    description: 'Extracts entities, architectural dependencies, and compliance linkages from disparate Git repositories, OpenAPI schemas, and Slack discussions into a unified semantic graph.',
    targetAudience: 'Chief Architects and Security Compliance Teams at high-velocity software engineering organizations.',
    valueProposition: 'Eliminates outdated architectural diagrams and gives onboarding engineers instant semantic answers to system interdependencies.',
    techStack: ['Python', 'Neo4j', 'FastAPI', 'Gemini 2.5 Pro', 'React'],
    primaryMetricLabel: 'Indexed Entities',
    primaryMetricValue: '480,200',
    secondaryMetricLabel: 'Query Accuracy Ratio',
    secondaryMetricValue: '96.8%',
    repoIdentifier: 'orchestra-ventures/omnigraph-api',
    assignedAgentIds: ['agt-1', 'agt-2', 'agt-4'],
    objectives: [
      { id: 'obj-301', title: 'Finalize benchmark comparison vs raw vector similarity embeddings', progressPercent: 75, targetQuarter: 'Q4 2026' },
      { id: 'obj-302', title: 'Ship GitHub App connector with automatic PR architectural delta audits', progressPercent: 40, targetQuarter: 'Q1 2027' },
    ]
  }
];

export const INITIAL_AGENTS: Agent[] = [
  {
    id: 'agt-1',
    name: 'Atlas',
    code: 'ATLAS-01',
    role: 'Chief Multi-Venture Orchestrator',
    department: 'Orchestration',
    description: 'Responsible for master plan decomposition, dependency resolution across agents, risk assessment, and resource allocation across software products.',
    responsibilities: [
      'Master plan decomposition and workstream delegation',
      'Dependency arbitration and inter-agent synchronization',
      'Supervisory approval checkpoint gating'
    ],
    status: 'idle',
    autonomy: 'approval_required',
    provider: 'gemini',
    model: 'gemini-2.5-pro',
    modelConfig: {
      provider: 'gemini',
      model: 'gemini-2.5-pro',
      temperature: 0.1,
      maxTokens: 8192
    },
    intelligenceProfile: {
      operationalIdentity: 'Chief Multi-Venture Strategic Orchestrator (Code: ATLAS-01). Authoritative supervisor on venture alignment, workstream decomposition, and human escalation gates.',
      systemInstruction: 'You decompose macro-initiatives into atomic, delegated sub-tasks. Enforce strict risk checks before assigning any destructive or public-facing action. Never make assumptions without cross-referencing organizational memory.',
      objectives: [
        'Maintain zero inter-agent deadlock across concurrent venture initiatives.',
        'Enforce human verification checkpoints on high-risk operations.',
        'Optimize multi-venture resource allocation across SRE and engineering agents.'
      ],
      authorizedToolIds: ['tool_doc_schema_analyzer', 'tool_database_cdc_inspector', 'tool_finops_cluster_auditor'],
      memoryAccessLevel: 'CONFIDENTIAL',
      executionLimits: {
        maxTokens: 8192,
        timeoutMs: 45000,
        maxRetries: 3,
        maxAutonomousSteps: 8
      },
      preferredModelId: 'gemini-2.5-pro',
      fallbackModelId: 'anthropic/claude-3.5-sonnet'
    },
    assignedVentureIds: ['v-1', 'v-2', 'v-3'],
    assignedTaskIds: ['task-106'],
    capabilities: ['Task Decomposition', 'Inter-Agent Consensus', 'Strategic Scheduling', 'Resource Arbitration'],
    activeTaskCount: 1,
    completedTasksTotal: 184,
    uptimeHours: 940,
    reliabilityScore: 99.8,
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-11-08T08:00:00Z',
    lastActive: '2 min ago'
  },
  {
    id: 'agt-2',
    name: 'Sentry',
    code: 'MKT-INTEL',
    role: 'Market Intelligence Agent',
    department: 'Research',
    description: 'Understands markets, industries, competitors, customer behavior, and emerging opportunities. Produces structured market intelligence reports.',
    responsibilities: [
      'Analyze specific industries and market segments',
      'Identify market trends and customer problems',
      'Research competitors and alternative solutions',
      'Identify underserved markets',
      'Produce structured market intelligence reports',
      'Identify risks and potential opportunities'
    ],
    status: 'executing',
    autonomy: 'full',
    provider: 'gemini',
    model: 'gemini-3.8-flash',
    modelConfig: {
      provider: 'gemini',
      model: 'gemini-3.8-flash',
      temperature: 0.2,
      maxTokens: 4096
    },
    intelligenceProfile: {
      operationalIdentity: 'Market Intelligence Agent (Code: MKT-INTEL). Precision market researcher investigating trends, customer pain points, competitor offerings, and regulatory risks.',
      systemInstruction: 'Analyze specific market segments and competitive dynamics. Generate structured market intelligence reports with customer pain points, competitor teardowns, market opportunities, and verifiable evidence sources.',
      objectives: [
        'Analyze target industries, macro shifts, and developer sentiment.',
        'Produce rigorous competitor teardowns citing strengths, weaknesses, and pricing models.',
        'Ingest high-confidence evidence briefs directly into shared organizational memory.'
      ],
      authorizedToolIds: ['tool_web_research', 'tool_doc_schema_analyzer'],
      memoryAccessLevel: 'PUBLIC',
      executionLimits: {
        maxTokens: 4096,
        timeoutMs: 25000,
        maxRetries: 2,
        maxAutonomousSteps: 5
      },
      preferredModelId: 'gemini-3.8-flash',
      fallbackModelId: 'llama-3.3-70b-versatile'
    },
    assignedVentureIds: ['v-1', 'v-2', 'v-3'],
    assignedTaskIds: ['task-104'],
    capabilities: ['Market Overview Synthesis', 'Competitor Teardowns', 'Pain Point Extraction', 'Risk & Evidence Auditing'],
    activeTaskCount: 1,
    completedTasksTotal: 138,
    uptimeHours: 850,
    reliabilityScore: 99.2,
    createdAt: '2026-10-05T00:00:00Z',
    updatedAt: '2026-11-10T08:00:00Z',
    lastActive: 'Just now'
  },
  {
    id: 'agt-scout',
    name: 'Scout',
    code: 'OPP-HUNTER',
    role: 'Opportunity Hunter Agent',
    department: 'Operations',
    description: 'Discovers potential business opportunities, customer gaps, partnership channels, and software distribution openings matching ORCHESTRA portfolio products.',
    responsibilities: [
      'Identify potential customers and market gaps',
      'Discover organizations that may need existing products',
      'Identify partnership opportunities',
      'Identify potential software distribution opportunities',
      'Evaluate opportunities based on relevance and potential value',
      'Submit qualified opportunities for further investigation'
    ],
    status: 'idle',
    autonomy: 'approval_required',
    provider: 'gemini',
    model: 'gemini-3.8-flash',
    modelConfig: {
      provider: 'gemini',
      model: 'gemini-3.8-flash',
      temperature: 0.3,
      maxTokens: 4096
    },
    intelligenceProfile: {
      operationalIdentity: 'Opportunity Hunter Agent (Code: OPP-HUNTER). Autonomous commercial opportunity scout discovering high-potential software distribution and enterprise customer openings.',
      systemInstruction: 'Evaluate market findings against ORCHESTRA portfolio products (AetherCloud, RelaySync, OmniGraph). Compute potential contract valuations, confidence levels, and recommended actions.',
      objectives: [
        'Identify qualified commercial gaps across B2B cloud and data platforms.',
        'Formulate concrete value propositions tied directly to portfolio capabilities.',
        'Submit structured opportunity dossiers for prospect qualification.'
      ],
      authorizedToolIds: ['tool_crm_account_profiler', 'tool_web_research'],
      memoryAccessLevel: 'RESTRICTED',
      executionLimits: {
        maxTokens: 4096,
        timeoutMs: 30000,
        maxRetries: 2,
        maxAutonomousSteps: 5
      },
      preferredModelId: 'gemini-3.8-flash',
      fallbackModelId: 'llama-3.3-70b-versatile'
    },
    assignedVentureIds: ['v-1', 'v-2', 'v-3'],
    assignedTaskIds: [],
    capabilities: ['Commercial Gap Discovery', 'Distribution Channel Mapping', 'Opportunity Valuation', 'Partnership Scouting'],
    activeTaskCount: 0,
    completedTasksTotal: 84,
    uptimeHours: 520,
    reliabilityScore: 98.9,
    createdAt: '2026-10-08T00:00:00Z',
    updatedAt: '2026-11-10T08:00:00Z',
    lastActive: '5 min ago'
  },
  {
    id: 'agt-3',
    name: 'Vanguard',
    code: 'PRSP-INTEL',
    role: 'Prospect Intelligence Agent',
    department: 'Operations',
    description: 'Researches and qualifies potential customers and organizations, diagnoses operational challenges, and assesses product relevance and readiness.',
    responsibilities: [
      'Investigate identified prospects',
      'Understand their business activities',
      'Identify potential operational problems',
      'Determine whether an ORCHESTRA portfolio product could help',
      'Identify relevant decision-maker roles when publicly available',
      'Assess prospect relevance and readiness'
    ],
    status: 'awaiting_approval',
    autonomy: 'approval_required',
    provider: 'gemini',
    model: 'gemini-2.5-pro',
    modelConfig: {
      provider: 'gemini',
      model: 'gemini-2.5-pro',
      temperature: 0.2,
      maxTokens: 4096
    },
    intelligenceProfile: {
      operationalIdentity: 'Prospect Intelligence Agent (Code: PRSP-INTEL). Deep investigative researcher qualifying enterprise organizations, technology stacks, and buying readiness.',
      systemInstruction: 'Investigate target organizations, uncover operational challenges, calculate qualification scores (1-100), and formulate tailored approach strategies. Enforce governance approval gates before outreach.',
      objectives: [
        'Profile mid-market and enterprise accounts spending >$30k/mo on cloud infrastructure.',
        'Map key technical decision-maker titles and compute qualification scores.',
        'Draft personalized technical value briefs matching prospect operational pain points.'
      ],
      authorizedToolIds: ['tool_crm_account_profiler', 'tool_web_research'],
      memoryAccessLevel: 'RESTRICTED',
      executionLimits: {
        maxTokens: 4096,
        timeoutMs: 35000,
        maxRetries: 2,
        maxAutonomousSteps: 4
      },
      preferredModelId: 'gemini-2.5-pro',
      fallbackModelId: 'openai/gpt-4o'
    },
    assignedVentureIds: ['v-1', 'v-2'],
    assignedTaskIds: ['task-101'],
    capabilities: ['Account Deep Investigation', 'Tech Stack Diagnostic', 'Qualification Scoring', 'Executive Angle Formulation'],
    activeTaskCount: 1,
    completedTasksTotal: 104,
    uptimeHours: 680,
    reliabilityScore: 98.7,
    createdAt: '2026-10-10T00:00:00Z',
    updatedAt: '2026-11-10T08:00:00Z',
    lastActive: '8 min ago'
  },
  {
    id: 'agt-4',
    name: 'Foundry',
    code: 'PORT-STRAT',
    role: 'Portfolio Strategist Agent',
    department: 'Engineering',
    description: 'Maintains structured knowledge of ORCHESTRA software portfolio, matches products to market opportunities, identifies positioning angles, and recommends improvements.',
    responsibilities: [
      'Maintain structured knowledge of portfolio products',
      'Understand each product\'s features, target users, and value proposition',
      'Match products to market opportunities and prospects',
      'Identify product positioning opportunities',
      'Identify gaps in the current portfolio',
      'Recommend improvements and expansion opportunities'
    ],
    status: 'executing',
    autonomy: 'approval_required',
    provider: 'gemini',
    model: 'gemini-2.5-pro',
    modelConfig: {
      provider: 'gemini',
      model: 'gemini-2.5-pro',
      temperature: 0.1,
      maxTokens: 8192
    },
    intelligenceProfile: {
      operationalIdentity: 'Portfolio Strategist Agent (Code: PORT-STRAT). Enterprise software strategist mapping portfolio venture capabilities, ROI propositions, and technical positioning.',
      systemInstruction: 'Maintain authoritative knowledge of all portfolio ventures (AetherCloud, RelaySync, OmniGraph). Map features to prospect pain points, formulate differentiation arguments, and identify portfolio expansion gaps.',
      objectives: [
        'Formulate quantitative ROI and differentiation arguments for each portfolio product.',
        'Match prospect technical requirements against product capabilities.',
        'Identify product gaps and recommend high-impact roadmap initiatives.'
      ],
      authorizedToolIds: ['tool_doc_schema_analyzer', 'tool_database_cdc_inspector'],
      memoryAccessLevel: 'CONFIDENTIAL',
      executionLimits: {
        maxTokens: 8192,
        timeoutMs: 40000,
        maxRetries: 3,
        maxAutonomousSteps: 6
      },
      preferredModelId: 'gemini-2.5-pro',
      fallbackModelId: 'anthropic/claude-3.5-sonnet'
    },
    assignedVentureIds: ['v-1', 'v-2', 'v-3'],
    assignedTaskIds: ['task-103'],
    capabilities: ['Portfolio Capability Mapping', 'Positioning Formulation', 'Technical ROI Modeling', 'Portfolio Gap Analysis'],
    activeTaskCount: 1,
    completedTasksTotal: 156,
    uptimeHours: 920,
    reliabilityScore: 99.7,
    createdAt: '2026-10-12T00:00:00Z',
    updatedAt: '2026-11-10T08:00:00Z',
    lastActive: '14 min ago'
  },
  {
    id: 'agt-5',
    name: 'Beacon',
    code: 'BEACON-05',
    role: 'Technical Growth & Developer Editorial',
    department: 'Growth',
    description: 'Analyzes search queries, authors deep-dive technical benchmarks and guides, and orchestrates distribution across engineering communities.',
    responsibilities: [
      'Developer audience research and query gap analysis',
      'Empirical performance benchmark dossiers',
      'Technical documentation syndication'
    ],
    status: 'executing',
    autonomy: 'supervised',
    provider: 'gemini',
    model: 'gemini-2.5-flash',
    modelConfig: {
      provider: 'gemini',
      model: 'gemini-2.5-flash',
      temperature: 0.4,
      maxTokens: 4096
    },
    intelligenceProfile: {
      operationalIdentity: 'Developer Relations & Technical Benchmarking Specialist (Code: BEACON-05). Translates complex distributed systems achievements into compelling empirical content.',
      systemInstruction: 'Author developer-centric documentation, reproducible benchmarks, and architecture teardowns. Avoid marketing fluff or unsupported superlatives; rely on verifiable p99 latency figures and architectural diagrams.',
      objectives: [
        'Publish reproducible latency and throughput comparison studies.',
        'Address top developer pain-points identified in search queries.',
        'Expand technical readership across senior engineering teams.'
      ],
      authorizedToolIds: ['tool_web_research'],
      memoryAccessLevel: 'PUBLIC',
      executionLimits: {
        maxTokens: 4096,
        timeoutMs: 25000,
        maxRetries: 2,
        maxAutonomousSteps: 4
      },
      preferredModelId: 'llama-3.3-70b-versatile',
      fallbackModelId: 'gemini-2.5-flash'
    },
    assignedVentureIds: ['v-2'],
    assignedTaskIds: ['task-102'],
    capabilities: ['Benchmark Content Generation', 'Developer Documentation', 'SEO Query Gap Analysis', 'Social Syndication'],
    activeTaskCount: 1,
    completedTasksTotal: 110,
    uptimeHours: 710,
    reliabilityScore: 98.9,
    createdAt: '2026-10-15T00:00:00Z',
    updatedAt: '2026-11-08T09:10:00Z',
    lastActive: 'Just now'
  },
  {
    id: 'agt-6',
    name: 'Cipher',
    code: 'CIPHER-06',
    role: 'Operational Integrity & Telemetry Auditor',
    department: 'Operations',
    description: 'Audits multi-agent action logs, monitors token spend against budgets, detects anomaly drift, and validates compliance invariants.',
    responsibilities: [
      'Continuous audit trail verification',
      'Token consumption anomaly detection',
      'Release binary signature & invariant verification'
    ],
    status: 'awaiting_approval',
    autonomy: 'full',
    provider: 'gemini',
    model: 'gemini-2.5-flash',
    modelConfig: {
      provider: 'gemini',
      model: 'gemini-2.5-flash',
      temperature: 0.0,
      maxTokens: 4096
    },
    intelligenceProfile: {
      operationalIdentity: 'Compliance, Cryptographic Audit & Telemetry Guardrail (Code: CIPHER-06). Uncompromising watchdog verifying execution integrity, cost budgets, and safety invariants.',
      systemInstruction: 'Continuously verify audit streams for policy breaches, unusual token spikes, and unapproved tool invocations. Immediately alert the command centre if anomalous behavior is detected.',
      objectives: [
        'Enforce 100% compliance with human approval gates for destructive tools.',
        'Track per-agent token and budget burn against operational targets.',
        'Maintain cryptographic audit integrity across all task state mutations.'
      ],
      authorizedToolIds: ['tool_database_cdc_inspector', 'tool_finops_cluster_auditor'],
      memoryAccessLevel: 'CONFIDENTIAL',
      executionLimits: {
        maxTokens: 4096,
        timeoutMs: 20000,
        maxRetries: 3,
        maxAutonomousSteps: 4
      },
      preferredModelId: 'gemini-2.5-flash',
      fallbackModelId: 'llama-3.1-8b-instant'
    },
    assignedVentureIds: ['v-1', 'v-2', 'v-3'],
    assignedTaskIds: ['task-105'],
    capabilities: ['Audit Trail Verification', 'Budget Variance Detection', 'Model Latency Tracking', 'Security Invariant Checks'],
    activeTaskCount: 1,
    completedTasksTotal: 215,
    uptimeHours: 960,
    reliabilityScore: 99.9,
    createdAt: '2026-10-18T00:00:00Z',
    updatedAt: '2026-11-08T08:45:00Z',
    lastActive: '4 min ago'
  },
  {
    id: 'agt-mkt-strat',
    name: 'Helix',
    code: 'MKT-STRAT',
    role: 'Marketing Strategist',
    department: 'Growth',
    description: 'Develops actionable marketing, positioning, customer acquisition, and pricing strategies across ORCHESTRA portfolio products.',
    responsibilities: [
      'Analyze product positioning and competitive differentiation',
      'Identify target enterprise audiences and buyer personas',
      'Develop customer acquisition strategies and channel mixes',
      'Recommend pricing and positioning experiments',
      'Create market-specific marketing plans'
    ],
    status: 'idle',
    autonomy: 'approval_required',
    provider: 'gemini',
    model: 'gemini-2.5-pro',
    modelConfig: {
      provider: 'gemini',
      model: 'gemini-2.5-pro',
      temperature: 0.2,
      maxTokens: 4096
    },
    intelligenceProfile: {
      operationalIdentity: 'Marketing Strategist (Code: MKT-STRAT). Formulates technical B2B go-to-market strategies and defensible positioning narratives.',
      systemInstruction: 'Analyze product capabilities and competitor positioning. Produce structured marketing plans with customer pain points, value propositions, acquisition channels, budget considerations, and success metrics.',
      objectives: [
        'Formulate quantitative customer acquisition plans for B2B infrastructure products.',
        'Establish channel strategies that emphasize technical differentiation over generic advertising.',
        'Feed structured positioning recommendations directly to the Campaign Planner.'
      ],
      authorizedToolIds: ['tool_web_research', 'tool_doc_schema_analyzer'],
      memoryAccessLevel: 'PUBLIC',
      executionLimits: {
        maxTokens: 4096,
        timeoutMs: 30000,
        maxRetries: 2,
        maxAutonomousSteps: 4
      },
      preferredModelId: 'gemini-2.5-pro',
      fallbackModelId: 'anthropic/claude-3.5-sonnet'
    },
    assignedVentureIds: ['v-1', 'v-2', 'v-3'],
    assignedTaskIds: [],
    capabilities: ['Positioning Architecture', 'Acquisition Channel Planning', 'Competitor Differentiation', 'Pricing Experimentation'],
    activeTaskCount: 0,
    completedTasksTotal: 62,
    uptimeHours: 420,
    reliabilityScore: 99.1,
    createdAt: '2026-10-20T00:00:00Z',
    updatedAt: '2026-11-10T08:00:00Z',
    lastActive: '6 min ago'
  },
  {
    id: 'agt-cmp-plan',
    name: 'Cadence',
    code: 'CMP-PLAN',
    role: 'Campaign Planner',
    department: 'Growth',
    description: 'Converts high-level marketing strategies into structured, trackable campaigns with content specifications and execution checklists.',
    responsibilities: [
      'Generate campaign concepts and clear strategic objectives',
      'Define target technical audiences and distribution channels',
      'Develop execution checklists and resource requirements',
      'Establish performance indicators and milestones',
      'Coordinate campaign execution tasks with other specialist agents'
    ],
    status: 'idle',
    autonomy: 'approval_required',
    provider: 'gemini',
    model: 'gemini-2.5-flash',
    modelConfig: {
      provider: 'gemini',
      model: 'gemini-2.5-flash',
      temperature: 0.3,
      maxTokens: 4096
    },
    intelligenceProfile: {
      operationalIdentity: 'Campaign Planner (Code: CMP-PLAN). Operationalizes marketing strategies into timed, multitrack B2B campaigns.',
      systemInstruction: 'Convert strategic positioning into multi-step campaigns. Build concrete checklists, distribution channel assignments, and performance indicators. Enforce approval gating before campaign activation.',
      objectives: [
        'Translate positioning hypotheses into measurable campaign workstreams.',
        'Coordinate asset preparation across technical editorial and outreach agents.',
        'Track campaign execution checklists through strict lifecycle stages.'
      ],
      authorizedToolIds: ['tool_web_research'],
      memoryAccessLevel: 'PUBLIC',
      executionLimits: {
        maxTokens: 4096,
        timeoutMs: 25000,
        maxRetries: 2,
        maxAutonomousSteps: 5
      },
      preferredModelId: 'gemini-2.5-flash',
      fallbackModelId: 'llama-3.3-70b-versatile'
    },
    assignedVentureIds: ['v-1', 'v-2', 'v-3'],
    assignedTaskIds: [],
    capabilities: ['Campaign Lifecycle Management', 'Operational Checklists', 'Channel Orchestration', 'KPI Specification'],
    activeTaskCount: 0,
    completedTasksTotal: 48,
    uptimeHours: 380,
    reliabilityScore: 99.4,
    createdAt: '2026-10-22T00:00:00Z',
    updatedAt: '2026-11-10T08:00:00Z',
    lastActive: '12 min ago'
  },
  {
    id: 'agt-out-asst',
    name: 'Courier',
    code: 'OUT-ASST',
    role: 'Outreach Assistant',
    department: 'Operations',
    description: 'Prepares relevant, personalized business communications for qualified prospects. Strictly requires human approval before dispatch.',
    responsibilities: [
      'Review qualified prospects and public engineering context',
      'Identify product value propositions matching prospect challenges',
      'Draft personalized, professional outbound business messages',
      'Prepare follow-up sequences and fallback angles',
      'Submit all drafts to the Centralized Human Approval Queue'
    ],
    status: 'awaiting_approval',
    autonomy: 'approval_required',
    provider: 'gemini',
    model: 'gemini-2.5-pro',
    modelConfig: {
      provider: 'gemini',
      model: 'gemini-2.5-pro',
      temperature: 0.2,
      maxTokens: 4096
    },
    intelligenceProfile: {
      operationalIdentity: 'Outreach Assistant (Code: OUT-ASST). Expert enterprise copywriter drafting high-touch, pain-point-aligned communications.',
      systemInstruction: 'Draft concise, respectful, and technically precise communications. Never independently send communications. Every draft must be submitted to the human approval queue. Never fabricate contact info.',
      objectives: [
        'Craft hyper-relevant, non-spammy messages addressing known architectural pain points.',
        'Highlight immediate, quantifiable value propositions with zero superficial jargon.',
        'Enforce 100% human review compliance on all outgoing communication artifacts.'
      ],
      authorizedToolIds: ['tool_crm_account_profiler'],
      memoryAccessLevel: 'RESTRICTED',
      executionLimits: {
        maxTokens: 4096,
        timeoutMs: 30000,
        maxRetries: 2,
        maxAutonomousSteps: 3
      },
      preferredModelId: 'gemini-2.5-pro',
      fallbackModelId: 'openai/gpt-4o'
    },
    assignedVentureIds: ['v-1', 'v-2'],
    assignedTaskIds: [],
    capabilities: ['Personalized Business Copywriting', 'Follow-up Sequence Structuring', 'Value Pitch Formulation', 'Human Gate Compliance'],
    activeTaskCount: 0,
    completedTasksTotal: 72,
    uptimeHours: 490,
    reliabilityScore: 99.8,
    createdAt: '2026-10-25T00:00:00Z',
    updatedAt: '2026-11-10T08:00:00Z',
    lastActive: '3 min ago'
  },
  {
    id: 'agt-rel-mgr',
    name: 'Nexus',
    code: 'REL-MGR',
    role: 'Relationship Manager',
    department: 'Operations',
    description: 'Maintains structured records of prospects, customers, partners and business relationships in the lightweight CRM system.',
    responsibilities: [
      'Maintain prospect and customer profiles with interaction history',
      'Track pipeline stages from Discovered to Converted',
      'Record communication notes and follow-up requirements',
      'Identify inactive prospects and recommend next actions',
      'Coordinate with Outreach Assistant to prepare touchpoints'
    ],
    status: 'idle',
    autonomy: 'supervised',
    provider: 'gemini',
    model: 'gemini-2.5-flash',
    modelConfig: {
      provider: 'gemini',
      model: 'gemini-2.5-flash',
      temperature: 0.1,
      maxTokens: 4096
    },
    intelligenceProfile: {
      operationalIdentity: 'Relationship Manager (Code: REL-MGR). Guardian of the enterprise CRM pipeline, interaction histories, and account health.',
      systemInstruction: 'Maintain complete factual accuracy in relationship records. Never invent contact details or communications. Track pipeline transitions and log all account touchpoints with timestamped summaries.',
      objectives: [
        'Maintain zero orphaned or untracked prospect accounts in the CRM pipeline.',
        'Provide structured account dossiers for commercial review and executive touchpoints.',
        'Track interaction timelines and prevent stale deals from exceeding 14 days without action.'
      ],
      authorizedToolIds: ['tool_crm_account_profiler'],
      memoryAccessLevel: 'RESTRICTED',
      executionLimits: {
        maxTokens: 4096,
        timeoutMs: 20000,
        maxRetries: 2,
        maxAutonomousSteps: 4
      },
      preferredModelId: 'gemini-2.5-flash',
      fallbackModelId: 'llama-3.1-8b-instant'
    },
    assignedVentureIds: ['v-1', 'v-2', 'v-3'],
    assignedTaskIds: [],
    capabilities: ['CRM Pipeline Management', 'Interaction Logging', 'Account Health Auditing', 'Follow-up Scheduling'],
    activeTaskCount: 0,
    completedTasksTotal: 96,
    uptimeHours: 540,
    reliabilityScore: 99.6,
    createdAt: '2026-10-28T00:00:00Z',
    updatedAt: '2026-11-10T08:00:00Z',
    lastActive: '8 min ago'
  },
  {
    id: 'agt-grw-anlyst',
    name: 'Prism',
    code: 'GRW-ANLYST',
    role: 'Growth Analyst',
    department: 'Growth',
    description: 'Evaluates business performance, analyzes conversion bottlenecks, and designs growth experiments strictly using factual recorded data.',
    responsibilities: [
      'Analyze portfolio performance data and customer acquisition trends',
      'Evaluate campaign performance against measurable KPIs',
      'Identify bottlenecks in the sales and conversion pipeline',
      'Distinguish measured data from estimates and AI hypotheses',
      'Recommend pragmatic, testable growth experiments'
    ],
    status: 'idle',
    autonomy: 'approval_required',
    provider: 'gemini',
    model: 'gemini-2.5-pro',
    modelConfig: {
      provider: 'gemini',
      model: 'gemini-2.5-pro',
      temperature: 0.1,
      maxTokens: 4096
    },
    intelligenceProfile: {
      operationalIdentity: 'Growth Analyst (Code: GRW-ANLYST). Rigorous empirical analyst diagnosing commercial pipelines, conversion drop-offs, and unit economics.',
      systemInstruction: 'Strictly evaluate measured data without fabricating metrics. Separate facts from provisional estimates and hypotheses. Identify exact pipeline bottlenecks and suggest testable experiments.',
      objectives: [
        'Diagnose pipeline velocity and conversion leakage points across portfolio ventures.',
        'Evaluate campaign ROI and recommend resource reallocation based on measured data.',
        'Formulate falsifiable growth experiments with explicit measurement criteria.'
      ],
      authorizedToolIds: ['tool_doc_schema_analyzer', 'tool_web_research'],
      memoryAccessLevel: 'CONFIDENTIAL',
      executionLimits: {
        maxTokens: 4096,
        timeoutMs: 35000,
        maxRetries: 2,
        maxAutonomousSteps: 4
      },
      preferredModelId: 'gemini-2.5-pro',
      fallbackModelId: 'anthropic/claude-3.5-sonnet'
    },
    assignedVentureIds: ['v-1', 'v-2', 'v-3'],
    assignedTaskIds: [],
    capabilities: ['Bottleneck Diagnosis', 'Pipeline Conversion Analytics', 'Growth Experiment Formulation', 'Data Integrity Auditing'],
    activeTaskCount: 0,
    completedTasksTotal: 54,
    uptimeHours: 460,
    reliabilityScore: 99.5,
    createdAt: '2026-11-01T00:00:00Z',
    updatedAt: '2026-11-10T08:00:00Z',
    lastActive: 'Just now'
  }
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-101',
    title: 'Executive Outreach Draft: CloudScale FinOps Migration at FinTech Group',
    description: 'Generate high-impact executive outreach and technical value brief tailored to the Head of Infrastructure at Nexus Capital, targeting their 300+ node EKS deployment.',
    ventureId: 'v-1',
    assignedAgentId: 'agt-3',
    priority: 'high',
    status: 'WAITING_FOR_APPROVAL',
    approvalRequired: true,
    approvalStatus: 'pending',
    createdAt: '2026-11-08T06:15:00Z',
    startedAt: '2026-11-08T06:20:00Z',
    updatedAt: '2026-11-08T08:20:00Z',
    dueAt: '2026-11-09T18:00:00Z',
    relatedKnowledgeIds: ['intel-01'],
    deliverables: [
      {
        title: 'Nexus Capital Account Dossier & Personalized Executive Memo',
        type: 'outreach_copy',
        summary: 'Pinpoints their recent multi-region AWS migration announcement and proposes a 14-day passive cluster savings audit.',
        content: `Target: Marcus Vance (VP Platform Engineering, Nexus Capital)\nContext: Nexus migrated 40 core microservices to AWS EKS across eu-west-1 and us-east-1 last quarter. Public filings indicate heavy Datadog + AWS spend.\n\nProposed Value Proposition:\n- Passive read-only helm deployment (no cluster restart required).\n- Identifies uncompacted daemonsets and overprovisioned staging environments in 4 hours.\n- Projected monthly savings: $22,000 - $35,000 based on standard FinTech memory over-allocation patterns.\n\nCall to Action:\n15-minute screen share with Lead FinOps Architect to review sample audit output on anonymized cluster.`
      }
    ],
    executionResults: {
      outputSummary: 'Generated personalized outreach brief with verified infrastructure sizing.',
      completedAt: '2026-11-08T08:20:00Z',
      metrics: {
        durationMs: 4200,
        tokensConsumed: 1840,
        confidenceScore: 0.94
      }
    },
    auditLogs: [
      { id: 'log-1', timestamp: '2026-11-08 06:15', actor: 'Atlas (Orchestrator)', action: 'Dispatched task to Vanguard', notes: 'Triggered from Opportunity pipeline record opp-201' },
      { id: 'log-2', timestamp: '2026-11-08 08:20', actor: 'Vanguard (Agent)', action: 'Completed draft deliverable', notes: 'Awaiting human partner authorization before sending' }
    ]
  },
  {
    id: 'task-102',
    title: 'Benchmark Dossier: RelaySync vs Debezium CDC Throughput & WAL Overhead',
    description: 'Synthesize stress-test telemetry comparing RelaySync native Rust replication reader against Kafka Debezium on 50,000 writes/sec PostgreSQL workloads.',
    ventureId: 'v-2',
    assignedAgentId: 'agt-5',
    priority: 'medium',
    status: 'RUNNING',
    approvalRequired: true,
    createdAt: '2026-11-08T07:00:00Z',
    startedAt: '2026-11-08T07:05:00Z',
    updatedAt: '2026-11-08T09:10:00Z',
    dueAt: '2026-11-10T12:00:00Z',
    relatedKnowledgeIds: ['intel-02'],
    deliverables: [
      {
        title: 'Preliminary Performance Comparative Chart & Technical Summary',
        type: 'strategy',
        summary: 'Shows 68% lower CPU utilization on primary database server under sustained peak insertion spikes.',
        content: 'Analysis in progress: Initial benchmarks on 64-core RDS Postgres instance demonstrate RelaySync maintains <15MB WAL backlog compared to 240MB under standard Kafka Connect serialization.'
      }
    ],
    auditLogs: [
      { id: 'log-3', timestamp: '2026-11-08 07:00', actor: 'Foundry (Agent)', action: 'Provided test harness raw logs', notes: 'Delivered to Beacon for editorial compilation' },
      { id: 'log-3b', timestamp: '2026-11-08 07:05', actor: 'Beacon (Agent)', action: 'Task execution started', notes: 'Running benchmark synthesis' }
    ]
  },
  {
    id: 'task-103',
    title: 'Technical RFC: GraphQL & OpenAPI Auto-Ingestion for OmniGraph',
    description: 'Design the schema abstraction protocol for ingesting federated GraphQL schemas and OpenAPI v3.1 definitions into the unified knowledge graph.',
    ventureId: 'v-3',
    assignedAgentId: 'agt-4',
    priority: 'high',
    status: 'RUNNING',
    approvalRequired: false,
    createdAt: '2026-11-08T05:30:00Z',
    startedAt: '2026-11-08T05:35:00Z',
    updatedAt: '2026-11-08T09:25:00Z',
    dueAt: '2026-11-11T17:00:00Z',
    relatedKnowledgeIds: ['intel-03'],
    auditLogs: [
      { id: 'log-4', timestamp: '2026-11-08 05:30', actor: 'Atlas (Orchestrator)', action: 'Initialized task', notes: 'Required for Q4 objective obj-302' },
      { id: 'log-4b', timestamp: '2026-11-08 05:35', actor: 'Foundry (Agent)', action: 'Execution started', notes: 'Parsing federated schema edge cases' }
    ]
  },
  {
    id: 'task-104',
    title: 'Competitor Intelligence: Analysis of Datadog Cloud Cost Management pricing overhaul',
    description: 'Inspect Datadog recent enterprise pricing revision announced at their investor conference and evaluate implications for AetherCloud market positioning.',
    ventureId: 'v-1',
    assignedAgentId: 'agt-2',
    priority: 'medium',
    status: 'COMPLETED',
    approvalRequired: false,
    createdAt: '2026-11-07T14:00:00Z',
    startedAt: '2026-11-07T14:05:00Z',
    completedAt: '2026-11-08T04:10:00Z',
    updatedAt: '2026-11-08T04:10:00Z',
    dueAt: '2026-11-08T12:00:00Z',
    relatedKnowledgeIds: ['intel-01'],
    deliverables: [
      {
        title: 'Datadog FinOps Pricing Shift Strategic Brief',
        type: 'dossier',
        summary: 'Datadog introduced a $0.05/container-hour add-on that significantly inflates costs for microservice-heavy topologies.',
        content: 'Key finding: Customers with dense container topologies (>50 pods per node) face steep cost escalation under Datadog container-based pricing model. AetherCloud per-node pricing offers a direct 5x cost advantage to emphasize in product marketing.'
      }
    ],
    executionResults: {
      outputSummary: 'Ingested transcripts from 3 earnings calls and quantified per-node cost advantages.',
      completedAt: '2026-11-08T04:10:00Z',
      metrics: {
        durationMs: 9800,
        tokensConsumed: 4200,
        confidenceScore: 0.98
      }
    },
    auditLogs: [
      { id: 'log-5', timestamp: '2026-11-07 14:00', actor: 'Sentry (Agent)', action: 'Ingested transcripts', notes: 'Analyzed 3 earnings call transcripts' },
      { id: 'log-6', timestamp: '2026-11-08 04:10', actor: 'Sentry (Agent)', action: 'Logged completed intelligence brief', notes: 'Indexed in Intelligence workspace' }
    ]
  },
  {
    id: 'task-105',
    title: 'Human Review Gate: Production Helm Chart Signing Key Rotation',
    description: 'Verify cryptographic provenance and automated build signatures before pushing public AetherCloud agent release v2.4.0 to artifact hub.',
    ventureId: 'v-1',
    assignedAgentId: 'agt-6',
    priority: 'critical',
    status: 'WAITING_FOR_APPROVAL',
    approvalRequired: true,
    approvalStatus: 'pending',
    createdAt: '2026-11-08T08:00:00Z',
    startedAt: '2026-11-08T08:02:00Z',
    updatedAt: '2026-11-08T08:45:00Z',
    dueAt: '2026-11-08T16:00:00Z',
    deliverables: [
      {
        title: 'Cosign Verification & Invariant Proof Report',
        type: 'specification',
        summary: 'Automated test suite passed 412/412 checks. Requires one human engineering key signature before registry publication.',
        content: 'Binary SHA-256: 7f8a32b904c1... All container vulnerability scans (Trivy) returned 0 High/Critical CVEs. Autonomous pipeline halted at release boundary per Governance Policy #2.'
      }
    ],
    executionResults: {
      outputSummary: 'Automated build pipeline completed test matrix. Release halted at human boundary.',
      completedAt: '2026-11-08T08:45:00Z',
      metrics: {
        durationMs: 14200,
        confidenceScore: 1.0
      }
    },
    auditLogs: [
      { id: 'log-7', timestamp: '2026-11-08 08:00', actor: 'Cipher (Agent)', action: 'Validated binary hashes', notes: 'Sign-off halted at human approval gate' }
    ]
  },
  {
    id: 'task-106',
    title: 'Strategic Coordination: Multi-Venture Q1 Cross-Selling Matrix',
    description: 'Analyze overlap in prospect accounts between AetherCloud Kubernetes users and RelaySync high-throughput database replication needs.',
    ventureId: 'v-1',
    assignedAgentId: 'agt-1',
    priority: 'medium',
    status: 'ASSIGNED',
    approvalRequired: false,
    createdAt: '2026-11-08T09:00:00Z',
    updatedAt: '2026-11-08T09:00:00Z',
    dueAt: '2026-11-12T18:00:00Z',
    auditLogs: [
      { id: 'log-8', timestamp: '2026-11-08 09:00', actor: 'Operator', action: 'Created task and delegated to Atlas' }
    ]
  },
  {
    id: 'task-107',
    title: 'Autonomous Ingestion Pipeline: Ingestion Schema Validation for Kafka Source',
    description: 'Verify schema registry compatibility for incoming Avro messages on the test staging cluster.',
    ventureId: 'v-2',
    assignedAgentId: 'agt-4',
    priority: 'low',
    status: 'FAILED',
    approvalRequired: false,
    createdAt: '2026-11-07T18:00:00Z',
    startedAt: '2026-11-07T18:05:00Z',
    completedAt: '2026-11-07T18:12:00Z',
    updatedAt: '2026-11-07T18:12:00Z',
    dueAt: '2026-11-08T12:00:00Z',
    errorInfo: {
      code: 'SCHEMA_COMPATIBILITY_MISMATCH',
      message: 'Source schema field "transaction_seq" is incompatible with target Apache Arrow UInt64 representation.',
      details: 'Avro schema evolution constraint violation: reader field missing default value in union.',
      timestamp: '2026-11-07T18:12:00Z',
      recoverable: true
    },
    auditLogs: [
      { id: 'log-9', timestamp: '2026-11-07 18:00', actor: 'Atlas (Orchestrator)', action: 'Dispatched schema test' },
      { id: 'log-10', timestamp: '2026-11-07 18:12', actor: 'Foundry (Agent)', action: 'Execution halted with schema error', notes: 'Logged SCHEMA_COMPATIBILITY_MISMATCH' }
    ]
  }
];

export const INITIAL_INTELLIGENCE: IntelligenceItem[] = [
  {
    id: 'intel-01',
    title: 'Hyperscaler Kubernetes Pricing & FinOps Add-on Shift',
    ventureId: 'v-1',
    category: 'competitive_intel',
    summary: 'AWS and Google Cloud are introducing tighter native cost anomaly detectors, but enterprise customers continue to resist vendor lock-in and multi-cloud visibility gaps.',
    keyTakeaways: [
      'Enterprises running hybrid AWS/GCP clusters require unified single-pane cost allocation.',
      'Native cloud tools lack automated right-sizing actuation due to fear of breaking workloads.',
      'AetherCloud safe sandbox simulation before remediation is a key differentiator.'
    ],
    confidence: 'high',
    source: 'Gartner Hype Cycle for Cloud Management & 14 Enterprise Customer Discovery Calls',
    authorAgentId: 'agt-2',
    verifiedByHuman: true,
    verifiedAt: '2026-11-07',
    createdAt: '2026-11-06T11:00:00Z',
    updatedAt: '2026-11-08T04:10:00Z',
    relatedTaskIds: ['task-101', 'task-104'],
    tags: ['FinOps', 'Kubernetes', 'Multi-Cloud', 'Pricing Strategy']
  },
  {
    id: 'intel-02',
    title: 'ClickHouse vs Apache Iceberg Real-time Ingestion Benchmarks',
    ventureId: 'v-2',
    category: 'technical_architecture',
    summary: 'Modern data teams are moving away from batch nightly syncs toward sub-minute micro-batching directly into columnar formats for real-time customer-facing dashboards.',
    keyTakeaways: [
      'Debezium memory footprint remains an operational blocker for clusters over 200 tables.',
      'Arrow-native in-memory streaming reduces serialization overhead by up to 4x.',
      'RelaySync architectural focus on zero-copy Rust streaming aligns with current market demand.'
    ],
    confidence: 'high',
    source: 'VLDB 2026 Streaming Architecture Proceedings & ClickHouse Engineering Review',
    authorAgentId: 'agt-4',
    verifiedByHuman: true,
    verifiedAt: '2026-11-05',
    createdAt: '2026-11-04T16:20:00Z',
    updatedAt: '2026-11-08T07:00:00Z',
    relatedTaskIds: ['task-102'],
    tags: ['CDC', 'Data Streaming', 'ClickHouse', 'Database Performance']
  },
  {
    id: 'intel-03',
    title: 'Enterprise AI Code Audits: Regulatory Demands for Architectural Provenance',
    ventureId: 'v-3',
    category: 'regulatory_risk',
    summary: 'Emerging EU and US regulatory guidance for AI-assisted software requires organizations to maintain verifiable records of system architecture and data lineage.',
    keyTakeaways: [
      'Pure vector RAG databases fail compliance audits because they cannot explain relational lineage.',
      'Graph-based semantic representations provide mathematically verifiable path traversals.',
      'OmniGraph should position as an "Audit-Ready Architectural Knowledge Engine".'
    ],
    confidence: 'medium',
    source: 'NIST AI Risk Management Framework 2026 Revision Draft',
    authorAgentId: 'agt-2',
    verifiedByHuman: false,
    createdAt: '2026-11-08T02:15:00Z',
    updatedAt: '2026-11-08T05:30:00Z',
    relatedTaskIds: ['task-103'],
    tags: ['AI Governance', 'Compliance', 'Knowledge Graph', 'Enterprise Sales']
  }
];

export const INITIAL_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'opp-201',
    title: 'Nexus Capital: Global EKS Fleet Cost Optimization',
    ventureId: 'v-1',
    partnerOrLead: 'Nexus Capital Management',
    type: 'enterprise_client',
    stage: 'outreach_prep',
    estimatedValue: '$84,000 / yr ARR',
    assignedAgentId: 'agt-3',
    nextStep: 'Human approval of personalized technical memo before sending to VP Platform',
    nextStepDate: '2026-11-09',
    scorecard: {
      strategicFit: 9,
      commercialImpact: 9,
      feasibility: 8,
      rationale: 'High AWS spend, public engineering blog references cluster scaling headaches, direct match for AetherCloud.'
    },
    updatedAt: '2026-11-08T08:20:00Z',
    contacts: 'Marcus Vance, VP Platform Engineering (via LinkedIn & public conference paper)'
  },
  {
    id: 'opp-202',
    title: 'DataFleet Analytics: Native RelaySync Connector Integration',
    ventureId: 'v-2',
    partnerOrLead: 'DataFleet Cloud (Analytics Platform)',
    type: 'api_distribution',
    stage: 'qualification',
    estimatedValue: '$120,000 / yr Revenue Share',
    assignedAgentId: 'agt-3',
    nextStep: 'Schedule technical deep dive with their Core Engine integration team',
    nextStepDate: '2026-11-12',
    scorecard: {
      strategicFit: 10,
      commercialImpact: 8,
      feasibility: 7,
      rationale: 'DataFleet needs high-speed Postgres ingest; integrating RelaySync as their default engine gives us 400+ downstream customers.'
    },
    updatedAt: '2026-11-07T18:00:00Z',
    contacts: 'Elena Rostova, Head of Technology Partnerships'
  },
  {
    id: 'opp-203',
    title: 'Krypton Security: Architectural Dependency Graph Pilot',
    ventureId: 'v-3',
    partnerOrLead: 'Krypton Cyber Defense',
    type: 'strategic_partner',
    stage: 'discovery',
    estimatedValue: '$45,000 POC',
    assignedAgentId: 'agt-2',
    nextStep: 'Ingest sample anonymized microservice schema repository to generate demo graph',
    nextStepDate: '2026-11-14',
    scorecard: {
      strategicFit: 8,
      commercialImpact: 7,
      feasibility: 9,
      rationale: 'Security vendor wanting to map microservice blast radiuses automatically.'
    },
    updatedAt: '2026-11-06T15:30:00Z',
    contacts: 'David Chen, Chief Information Security Officer'
  }
];

export const INITIAL_CAMPAIGNS: GrowthCampaign[] = [
  {
    id: 'cmp-301',
    title: 'The Hidden Cost of Idle Kubernetes: Q4 Industry Benchmark Report',
    ventureId: 'v-1',
    channel: 'editorial_blog',
    status: 'active',
    objective: 'Drive 250 qualified inbound newsletter subscribers and 30 self-service sandbox trials among DevOps leads.',
    targetAudience: 'Kubernetes Platform Engineers and Infrastructure Directors',
    kpiMetric: 'Target MQL Inbounds',
    currentValue: '18',
    targetValue: '30',
    preparedAssetsCount: 4,
    assignedAgentId: 'agt-5',
    startDate: '2026-11-01',
    endDate: '2026-11-30'
  },
  {
    id: 'cmp-302',
    title: 'Zero-Lag CDC for ClickHouse: Interactive Developer Guide & Repo',
    ventureId: 'v-2',
    channel: 'developer_community',
    status: 'under_review',
    objective: 'Acquire 500 GitHub stars and establish RelaySync as the modern alternative to Debezium on Hacker News and Reddit /r/dataengineering.',
    targetAudience: 'Data Engineers, PostgreSQL DBAs, and Modern Analytics Engineers',
    kpiMetric: 'GitHub Repository Stars',
    currentValue: '128',
    targetValue: '500',
    preparedAssetsCount: 3,
    assignedAgentId: 'agt-5',
    startDate: '2026-11-15',
    endDate: '2026-12-15'
  }
];

export const INITIAL_SYSTEM_EVENTS: SystemEvent[] = [
  {
    id: 'evt-01',
    timestamp: '14 min ago',
    type: 'approval_gate',
    title: 'Human Approval Required',
    description: 'Vanguard completed tailored executive outreach memo for Nexus Capital. Human authorization required before dispatch.',
    severity: 'action_required',
    relatedTaskId: 'task-101'
  },
  {
    id: 'evt-02',
    timestamp: '42 min ago',
    type: 'approval_gate',
    title: 'Security Gate Enforced',
    description: 'Production Helm chart signing paused at human checkpoint per Governance Rule #2.',
    severity: 'action_required',
    relatedTaskId: 'task-105'
  },
  {
    id: 'evt-03',
    timestamp: '2 hours ago',
    type: 'task_execution',
    title: 'Task Dispatched: Benchmark Dossier',
    description: 'Atlas dispatched RelaySync vs Debezium technical benchmark compilation to Beacon.',
    severity: 'info',
    relatedTaskId: 'task-102'
  },
  {
    id: 'evt-04',
    timestamp: '4 hours ago',
    type: 'intelligence_captured',
    title: 'Intelligence Ingested',
    description: 'Sentry completed competitor analysis on Datadog container pricing update.',
    severity: 'info'
  },
  {
    id: 'evt-05',
    timestamp: '5 hours ago',
    type: 'agent_dispatch',
    title: 'Autonomy Status Check',
    description: 'Cipher verified all 6 agents operating within allocated token and error budgets (0 security anomalies detected).',
    severity: 'info'
  }
];

export const INITIAL_GOVERNANCE: GovernancePolicy = {
  requireApprovalForOutreach: true,
  requireApprovalForProductionDeploy: true,
  requireApprovalAboveCostUsd: 50,
  maxAutonomousStepCount: 8,
  strictAuditRetentionDays: 90
};

export const INITIAL_RELATIONSHIPS: RelationshipRecord[] = [
  {
    id: 'rel-01',
    organization: 'Nexus Capital Infrastructure',
    contactName: 'Marcus Vance',
    contactDetails: 'm.vance@nexuscap.internal (public SRE speaker profile)',
    industry: 'FinTech & High-Frequency Trading',
    relatedProductId: 'v-1',
    relationshipCategory: 'prospect',
    pipelineStage: 'QUALIFIED',
    source: 'Prospect Intelligence (Vanguard)',
    originatingTaskId: 'task-101',
    estimatedValue: '$45,000 ARR',
    qualificationScore: 88,
    notes: 'Managing 300+ EKS nodes across eu-west-1 and us-east-1. Experiencing substantial uncompacted compute drift during off-market hours.',
    nextRecommendedAction: 'Draft executive value memo tailored to Marcus Vance for human approval.',
    assignedAgentId: 'agt-rel-mgr',
    lastInteractionTimestamp: '2026-11-09T14:30:00Z',
    createdAt: '2026-11-05T09:00:00Z',
    updatedAt: '2026-11-09T14:30:00Z',
    interactionHistory: [
      {
        id: 'int-101',
        timestamp: '2026-11-05T09:00:00Z',
        type: 'research',
        summary: 'Account identified by Sentry & qualified by Vanguard.',
        actor: 'Vanguard (PRSP-INTEL)'
      },
      {
        id: 'int-102',
        timestamp: '2026-11-08T11:15:00Z',
        type: 'draft_prepared',
        summary: 'Courier drafted personalized 14-day passive audit invitation.',
        actor: 'Courier (OUT-ASST)'
      }
    ]
  },
  {
    id: 'rel-02',
    organization: 'StrataData Cloud Systems',
    contactName: 'Elena Rostova',
    contactDetails: 'elena@stratadata.io',
    industry: 'Real-time Analytics & Big Data',
    relatedProductId: 'v-2',
    relationshipCategory: 'prospect',
    pipelineStage: 'CONTACT_PREPARED',
    source: 'Opportunity Hunter (Scout)',
    estimatedValue: '$36,000 ARR',
    qualificationScore: 92,
    notes: 'Replacing fragile Debezium Postgres connectors streaming into Snowflake and ClickHouse. Struggling with WAL replication spikes.',
    nextRecommendedAction: 'Submit prepared technical comparison draft to Human Approval Queue.',
    assignedAgentId: 'agt-rel-mgr',
    lastInteractionTimestamp: '2026-11-09T10:10:00Z',
    createdAt: '2026-11-06T11:00:00Z',
    updatedAt: '2026-11-09T10:10:00Z',
    interactionHistory: [
      {
        id: 'int-201',
        timestamp: '2026-11-06T11:00:00Z',
        type: 'research',
        summary: 'Targeted based on public tech blog post complaining about Debezium schema mutations.',
        actor: 'Scout (OPP-HUNTER)'
      }
    ]
  },
  {
    id: 'rel-03',
    organization: 'Axiom BioTechnologies',
    contactName: 'Dr. Aris Thorne',
    industry: 'Genomics & Distributed Data Architecture',
    relatedProductId: 'v-3',
    relationshipCategory: 'prospect',
    pipelineStage: 'RESEARCHING',
    source: 'Market Signal Monitoring',
    estimatedValue: '$52,000 ARR',
    qualificationScore: 78,
    notes: 'Navigating vast OpenAPI schemas and fragmented bioinformatics microservice dependency graphs.',
    nextRecommendedAction: 'Complete entity graph extraction test on public repos.',
    assignedAgentId: 'agt-rel-mgr',
    lastInteractionTimestamp: '2026-11-08T16:00:00Z',
    createdAt: '2026-11-07T08:00:00Z',
    updatedAt: '2026-11-08T16:00:00Z',
    interactionHistory: [
      {
        id: 'int-301',
        timestamp: '2026-11-07T08:00:00Z',
        type: 'research',
        summary: 'Initial technical research logged by Foundry.',
        actor: 'Foundry (PORT-STRAT)'
      }
    ]
  },
  {
    id: 'rel-04',
    organization: 'FinOps Foundation Alliance',
    industry: 'Cloud Governance Community',
    relatedProductId: 'v-1',
    relationshipCategory: 'strategic_partner',
    pipelineStage: 'NEGOTIATION',
    source: 'Direct Partnership Inbound',
    estimatedValue: 'Community Co-Marketing Hub',
    qualificationScore: 95,
    notes: 'Joint engineering webinar scheduled on "Autonomous Pod Compaction at Hyperscale".',
    nextRecommendedAction: 'Review joint presentation slide deck with Marketing Strategist.',
    assignedAgentId: 'agt-rel-mgr',
    lastInteractionTimestamp: '2026-11-09T16:45:00Z',
    createdAt: '2026-10-25T14:00:00Z',
    updatedAt: '2026-11-09T16:45:00Z',
    interactionHistory: [
      {
        id: 'int-401',
        timestamp: '2026-11-02T10:00:00Z',
        type: 'meeting',
        summary: 'Preliminary alignment call with Community Director.',
        actor: 'Helix (MKT-STRAT)'
      }
    ]
  }
];

export const INITIAL_COMMERCIAL_CAMPAIGNS: CommercialCampaign[] = [
  {
    id: 'camp-01',
    name: 'AetherCloud FinOps Migration Acceleration Sprint',
    ventureId: 'v-1',
    status: 'ACTIVE',
    objective: 'Generate 20 qualified mid-market FinOps cluster audits for Kubernetes platform engineering teams.',
    targetAudience: 'VP Infrastructure, Principal SREs, and Head of Platform Engineering ($50k+/mo cloud spend)',
    concept: 'Demonstrate immediate 30%+ cloud compute savings through empirical reproducible case studies and a zero-risk 14-day audit.',
    channels: [
      'Direct account outreach to qualified SRE leads',
      'Technical DevOps editorial & architecture teardowns',
      'Kubernetes community newsletter sponsorship'
    ],
    contentRequirements: [
      'Technical benchmark whitepaper comparing cluster idle overhead',
      'Interactive customer ROI calculation sheet',
      'Executive summary one-pager for VP Infrastructure'
    ],
    timeline: '4 weeks execution (Nov 15 - Dec 15, 2026)',
    budgetEstimate: '$1,800 editorial & staging allocation',
    performanceIndicators: [
      '20 qualified pilot audits requested',
      '35% trial-to-POC conversion rate',
      '4 reference enterprise accounts signed'
    ],
    actualPerformanceData: {
      impressions: 2450,
      clicks: 310,
      leadsGenerated: 14,
      conversions: 3,
      notes: 'Strong early engagement from mid-market European Kubernetes clusters.',
      isMeasured: true,
      lastRecordedAt: '2026-11-09T18:00:00Z'
    },
    assignedAgentId: 'agt-cmp-plan',
    executionChecklist: [
      { id: 'chk-1', step: 'Publish technical benchmark whitepaper on idle compute', assignedRole: 'Technical Editorial (Beacon)', isCompleted: true },
      { id: 'chk-2', step: 'Enrich top 30 target accounts in Nexus CRM', assignedRole: 'Relationship Manager (Nexus)', isCompleted: true },
      { id: 'chk-3', step: 'Draft personalized outreach sequences for VP Infrastructure', assignedRole: 'Outreach Assistant (Courier)', isCompleted: true },
      { id: 'chk-4', step: 'Review outgoing email queue in Centralized Approval Queue', assignedRole: 'Human Supervisor', isCompleted: false }
    ],
    createdAt: '2026-11-02T10:00:00Z',
    updatedAt: '2026-11-09T18:00:00Z'
  },
  {
    id: 'camp-02',
    name: 'Zero-Lag CDC for ClickHouse: Interactive Developer Guide & Repo',
    ventureId: 'v-2',
    status: 'PLANNED',
    objective: 'Establish RelaySync as the high-throughput, low-latency alternative to Debezium on Hacker News and r/dataengineering.',
    targetAudience: 'Data Engineers, PostgreSQL DBAs, and Modern Analytics Engineers',
    concept: 'Direct benchmark comparison showing RelaySync maintaining sub-50ms replication latency under 100k writes/sec while Debezium lags by 4+ seconds.',
    channels: [
      'Developer engineering blog',
      'Hacker News Show HN launch',
      'GitHub repository release documentation'
    ],
    contentRequirements: [
      'Reproducible docker-compose benchmark environment',
      'Latency distribution graph comparison asset',
      'Architecture teardown blog post'
    ],
    timeline: '3 weeks execution (Nov 20 - Dec 10, 2026)',
    budgetEstimate: '$500 cloud benchmark test instances',
    performanceIndicators: [
      '500 GitHub repository stars',
      '1,500 developer documentation reads',
      '25 self-service Docker downloads'
    ],
    assignedAgentId: 'agt-cmp-plan',
    executionChecklist: [
      { id: 'chk-21', step: 'Generate docker-compose benchmark testbed', assignedRole: 'Engineering (Foundry)', isCompleted: true },
      { id: 'chk-22', step: 'Author reproducible benchmark technical post', assignedRole: 'Technical Editorial (Beacon)', isCompleted: false },
      { id: 'chk-23', step: 'Submit Show HN draft for human approval', assignedRole: 'Outreach Assistant (Courier)', isCompleted: false }
    ],
    createdAt: '2026-11-04T12:00:00Z',
    updatedAt: '2026-11-08T15:00:00Z'
  }
];

export const INITIAL_APPROVALS: ApprovalRecord[] = [
  {
    id: 'appr-01',
    title: 'Review Outgoing Email: Nexus Capital Platform Lead (Marcus Vance)',
    itemType: 'outgoing_email',
    description: 'Personalized outbound memo inviting Marcus Vance to a 14-day zero-risk passive Kubernetes cluster idle audit.',
    requestingAgentId: 'agt-out-asst',
    requestingAgentName: 'Courier (Outreach Assistant)',
    relatedProspectId: 'rel-01',
    relatedProspectName: 'Nexus Capital Infrastructure',
    relatedTaskId: 'task-101',
    proposedContent: `Subject: Autonomous idle compute remediation for Nexus Capital

Hi Marcus,

I noticed Nexus Capital's recent multi-region expansion of core microservices across AWS EKS. In distributed trading and FinTech clusters scaling at this pace, non-production namespaces and overprovisioned node pools often accumulate 25–40% in uncompacted compute drift.

At AetherCloud, we've developed a non-disruptive eBPF compaction agent that runs passively in read-only mode to detect idle node reservations without restarting pods or altering manifests.

Would you be open to a 15-minute walkthrough next Tuesday to review what a 14-day passive savings audit would uncover on your staging clusters?

Best regards,
Commercial Operations Team
AetherCloud`,
    timestamp: '2026-11-09T14:35:00Z',
    decision: 'PENDING'
  },
  {
    id: 'appr-02',
    title: 'Authorize Campaign Release: AetherCloud FinOps Migration Sprint',
    itemType: 'campaign_publication',
    description: 'Cadence has prepared the campaign structure and distribution schedule. Operator signoff required to authorize community newsletter sponsorships.',
    requestingAgentId: 'agt-cmp-plan',
    requestingAgentName: 'Cadence (Campaign Planner)',
    relatedCampaignId: 'camp-01',
    relatedCampaignName: 'AetherCloud FinOps Migration Acceleration Sprint',
    proposedContent: `Campaign: AetherCloud FinOps Migration Acceleration Sprint
Budget Commitment: $1,800
Target Outbound Batch: 30 qualified enterprise accounts
Channels: Direct Outreach, Developer Editorial, Newsletter Sponsorship
Risk Level: Low (External commercial message review required for each dispatch)`,
    timestamp: '2026-11-09T15:10:00Z',
    decision: 'PENDING'
  },
  {
    id: 'appr-03',
    title: 'Outreach Authorization: StrataData Cloud (Elena Rostova)',
    itemType: 'outgoing_email',
    description: 'Direct technical comparison outreach addressing Debezium Postgres replication latency.',
    requestingAgentId: 'agt-out-asst',
    requestingAgentName: 'Courier (Outreach Assistant)',
    relatedProspectId: 'rel-02',
    relatedProspectName: 'StrataData Cloud Systems',
    proposedContent: `Subject: Sub-50ms Postgres CDC into Snowflake & ClickHouse for StrataData

Hi Elena,

Read your recent post on WAL log saturation and Debezium lag during peak batch ingestion. We built RelaySync specifically to solve the transaction serialization bottlenecks inherent in Java/Kafka CDC stacks.

RelaySync uses a native Rust logical replication consumer that streams directly into ClickHouse and Snowflake with sub-50ms end-to-end freshness and zero WAL bloat.

Happy to send over our reproducible benchmark testbed if you'd like to test it locally.

Best,
RelaySync Engineering Team`,
    timestamp: '2026-11-08T11:00:00Z',
    decision: 'APPROVE',
    decisionTimestamp: '2026-11-08T14:20:00Z',
    decisionBy: 'Lead Operator',
    decisionNotes: 'Approved for delivery once Email Gateway connector is configured.',
    executionResult: {
      executed: false,
      status: 'HELD_NO_INTEGRATION',
      message: 'Authorized by human operator. Email dispatch held: Email Gateway (Resend / SendGrid) is NOT_CONFIGURED. Staged in local outbound queue.',
      timestamp: '2026-11-08T14:20:00Z'
    }
  }
];

