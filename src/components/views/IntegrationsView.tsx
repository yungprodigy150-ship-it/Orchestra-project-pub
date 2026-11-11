/**
 * ORCHESTRA Stage 6: Real-World Integrations & Execution Infrastructure
 * Dedicated workspace for managing external connectors, executing tools in an interactive sandbox,
 * monitoring real-time execution audits, and governing agent-to-tool permissions.
 */

import React, { useState } from 'react';
import {
  Plug,
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  RotateCcw,
  Shield,
  ShieldAlert,
  Search,
  Globe,
  Mail,
  Building2,
  BarChart3,
  CreditCard,
  Layers,
  Terminal,
  ExternalLink,
  Lock,
  Clock,
  Sparkles,
  ArrowRight,
  Filter,
  Eye,
  Check,
  Send,
  HelpCircle
} from 'lucide-react';
import { useOrchestra } from '../../context/OrchestraContext';
import {
  IntegrationConnector,
  ExternalToolDefinition,
  ToolExecutionRecord,
  IntegrationConnectionStatus,
  RiskClassification
} from '../../types/integrations';
import { ToolDefinition } from '../../types/intelligence';

type IntegrationsTab = 'connectors' | 'testbed' | 'audit' | 'permissions';

export const IntegrationsView: React.FC = () => {
  const {
    connectors,
    refreshConnectors,
    testIntegrationConnection,
    toggleIntegrationEnabled,
    toolExecutions,
    executeTool,
    services,
    agents,
    ventures
  } = useOrchestra();

  const [activeTab, setActiveTab] = useState<IntegrationsTab>('connectors');

  // Test Connection State
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; success: boolean; status: string; latencyMs: number; details?: string; error?: string } | null>(null);

  // Setup / Config modal state
  const [configModalConnector, setConfigModalConnector] = useState<IntegrationConnector | null>(null);

  // Tool Sandbox State
  const allTools = services.toolRegistry.listTools() as ToolDefinition[];
  const [selectedToolId, setSelectedToolId] = useState<string>('tool_web_research');
  const [sandboxParams, setSandboxParams] = useState<Record<string, any>>({
    query: 'FinOps Kubernetes cluster drift remediation enterprise trends 2026',
    domainFilter: 'github.com',
    url: 'https://kubernetes.io',
    industry: 'Cloud Infrastructure',
    keywords: 'Kubernetes, FinOps, EKS compaction',
    targetVentureId: 'v-1',
    to: 'partner@enterprise.internal',
    subject: 'Autonomous Pod Compaction Technical Overview',
    body: 'Hello Marcus, reviewing the pod drift telemetry from your infrastructure.'
  });
  const [isExecutingTool, setIsExecutingTool] = useState(false);
  const [latestExecutionResult, setLatestExecutionResult] = useState<ToolExecutionRecord | null>(null);

  // Audit Filter State
  const [auditStatusFilter, setAuditStatusFilter] = useState<string>('all');
  const [auditToolFilter, setAuditToolFilter] = useState<string>('all');
  const [selectedRecordForDetail, setSelectedRecordForDetail] = useState<ToolExecutionRecord | null>(null);

  const selectedTool = allTools.find(t => t.id === selectedToolId) || allTools[0];

  // Connector Counts
  const connectedCount = connectors.filter(c => c.status === 'CONNECTED').length;
  const unconfiguredCount = connectors.filter(c => c.status === 'NOT_CONFIGURED').length;
  const errorCount = connectors.filter(c => c.status === 'ERROR').length;
  const disabledCount = connectors.filter(c => !c.isEnabled).length;

  const handleTestConnector = async (id: string) => {
    setTestingId(id);
    setTestResult(null);
    try {
      const res = await testIntegrationConnection(id);
      setTestResult({ id, ...res });
    } catch (err: any) {
      setTestResult({
        id,
        success: false,
        status: 'ERROR',
        latencyMs: 0,
        error: err.message || 'Connection test timed out.'
      });
    } finally {
      setTestingId(null);
    }
  };

  const handleRunTool = async () => {
    if (!selectedTool) return;
    setIsExecutingTool(true);
    try {
      const res = await executeTool({
        toolId: selectedTool.id,
        requestingAgentId: 'operator',
        requestingAgentName: 'Human Supervisory Operator',
        parameters: sandboxParams,
        isHumanSupervisor: true
      });
      setLatestExecutionResult(res);
    } catch (err: any) {
      console.error('Tool execution error:', err);
    } finally {
      setIsExecutingTool(false);
    }
  };

  const filteredExecutions = toolExecutions.filter(rec => {
    const matchesStatus = auditStatusFilter === 'all' || rec.status === auditStatusFilter;
    const matchesTool = auditToolFilter === 'all' || rec.toolId === auditToolFilter;
    return matchesStatus && matchesTool;
  });

  const getStatusBadge = (status: IntegrationConnectionStatus) => {
    switch (status) {
      case 'CONNECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-medium bg-emerald-950/80 text-emerald-300 border border-emerald-800/80">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            CONNECTED
          </span>
        );
      case 'NOT_CONFIGURED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-medium bg-amber-950/70 text-amber-300 border border-amber-800/70">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            NOT_CONFIGURED
          </span>
        );
      case 'ERROR':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-medium bg-rose-950/80 text-rose-300 border border-rose-800/80">
            <XCircle className="w-3 h-3 text-rose-400" />
            ERROR
          </span>
        );
      case 'DISABLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-900 text-slate-400 border border-slate-800">
            DISABLED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-900 text-slate-400 border border-slate-800">
            {status}
          </span>
        );
    }
  };

  const getRiskBadge = (risk?: RiskClassification) => {
    switch (risk) {
      case 'CRITICAL':
        return <span className="px-1.5 py-0.5 text-[10px] font-mono bg-rose-950 text-rose-300 border border-rose-800 rounded font-bold">CRITICAL</span>;
      case 'HIGH':
        return <span className="px-1.5 py-0.5 text-[10px] font-mono bg-amber-950 text-amber-300 border border-amber-800 rounded font-bold">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-1.5 py-0.5 text-[10px] font-mono bg-indigo-950 text-indigo-300 border border-indigo-800 rounded font-bold">MEDIUM</span>;
      default:
        return <span className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700 rounded font-bold">LOW</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header & KPI Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2.5">
            <Plug className="w-5 h-5 text-indigo-400" />
            <span>Integrations & Execution Infrastructure</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real external information sources, search grounding, DOM extraction, B2B email gateways, and permission-based execution.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refreshConnectors()}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Refresh Status</span>
          </button>
        </div>
      </div>

      {/* Top Level Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="p-3.5 bg-[#0c121d] border border-slate-800 rounded-lg">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Connectors</div>
          <div className="text-xl font-mono font-bold text-slate-100 mt-1">{connectors.length}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Modular Gateways</div>
        </div>

        <div className="p-3.5 bg-[#0c121d] border border-slate-800 rounded-lg">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Connected</div>
          <div className="text-xl font-mono font-bold text-emerald-400 mt-1">{connectedCount}</div>
          <div className="text-[10px] text-emerald-500/80 mt-0.5">Live & Operational</div>
        </div>

        <div className="p-3.5 bg-[#0c121d] border border-slate-800 rounded-lg">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Awaiting Keys</div>
          <div className="text-xl font-mono font-bold text-amber-400 mt-1">{unconfiguredCount}</div>
          <div className="text-[10px] text-amber-500/80 mt-0.5">Zero Fabricated Calls</div>
        </div>

        <div className="p-3.5 bg-[#0c121d] border border-slate-800 rounded-lg">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Registered Tools</div>
          <div className="text-xl font-mono font-bold text-indigo-400 mt-1">{allTools.length}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Execution Handlers</div>
        </div>

        <div className="p-3.5 bg-[#0c121d] border border-slate-800 rounded-lg">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Audit History</div>
          <div className="text-xl font-mono font-bold text-sky-400 mt-1">{toolExecutions.length}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Logged Operations</div>
        </div>

        <div className="p-3.5 bg-[#0c121d] border border-slate-800 rounded-lg">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Execution Errors</div>
          <div className="text-xl font-mono font-bold text-rose-400 mt-1">
            {toolExecutions.filter(e => e.status === 'FAILED').length}
          </div>
          <div className="text-[10px] text-rose-500/80 mt-0.5">Normalized & Reported</div>
        </div>
      </div>

      {/* Primary Tab Navigation */}
      <div className="flex items-center gap-1.5 border-b border-slate-800/80 pb-2 text-xs overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('connectors')}
          className={`px-3.5 py-1.5 rounded font-medium flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'connectors'
              ? 'bg-slate-800 text-white font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Plug className="w-3.5 h-3.5 text-indigo-400" />
          <span>Connectors & Gateways ({connectors.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('testbed')}
          className={`px-3.5 py-1.5 rounded font-medium flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'testbed'
              ? 'bg-slate-800 text-white font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
          <span>Tool Execution Engine & Sandbox</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('audit')}
          className={`px-3.5 py-1.5 rounded font-medium flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'audit'
              ? 'bg-slate-800 text-white font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-sky-400" />
          <span>Execution Monitoring & Audit ({toolExecutions.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('permissions')}
          className={`px-3.5 py-1.5 rounded font-medium flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'permissions'
              ? 'bg-slate-800 text-white font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Shield className="w-3.5 h-3.5 text-amber-400" />
          <span>Agent-to-Tool Permissions Matrix</span>
        </button>
      </div>

      {/* TAB 1: CONNECTORS & GATEWAYS */}
      {activeTab === 'connectors' && (
        <div className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {connectors.map(conn => {
              const isTesting = testingId === conn.id;
              const hasTestResult = testResult?.id === conn.id;

              return (
                <div
                  key={conn.id}
                  className="bg-[#0c121d] border border-slate-800 rounded-lg p-5 flex flex-col justify-between space-y-4 hover:border-slate-700/80 transition-colors"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-indigo-400">
                          {conn.category === 'search' && <Search className="w-4 h-4 text-emerald-400" />}
                          {conn.category === 'intel' && <Globe className="w-4 h-4 text-cyan-400" />}
                          {conn.category === 'email' && <Mail className="w-4 h-4 text-amber-400" />}
                          {conn.category === 'crm' && <Building2 className="w-4 h-4 text-pink-400" />}
                          {conn.category === 'analytics' && <BarChart3 className="w-4 h-4 text-indigo-400" />}
                          {conn.category === 'payment' && <CreditCard className="w-4 h-4 text-emerald-400" />}
                          {conn.category === 'advertising' && <Layers className="w-4 h-4 text-blue-400" />}
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-slate-100">{conn.name}</h3>
                          <div className="text-[11px] text-slate-400">{conn.provider}</div>
                        </div>
                      </div>

                      {getStatusBadge(conn.status)}
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-2 mt-2">
                      {conn.description}
                    </p>

                    {/* Capabilities & Secrets Requirement */}
                    <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] space-y-1.5">
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Required Secret</span>
                        <span className="font-mono text-slate-300">{conn.requiredEnvVar}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Auth Architecture</span>
                        <span className="font-mono text-slate-300 capitalize">{conn.authType.replace('_', ' ')}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Supported Tools</span>
                        <span className="font-mono text-indigo-300">{conn.supportedToolIds.join(', ')}</span>
                      </div>
                    </div>

                    {/* Test result feedback banner */}
                    {hasTestResult && (
                      <div className={`mt-3 p-2.5 rounded text-[11px] border ${
                        testResult.success
                          ? 'bg-emerald-950/60 border-emerald-800/80 text-emerald-200'
                          : 'bg-rose-950/60 border-rose-800/80 text-rose-200'
                      }`}>
                        <div className="font-semibold flex items-center justify-between">
                          <span>{testResult.success ? 'Diagnostic Pass' : 'Connection Failed'}</span>
                          <span className="font-mono text-[10px]">{testResult.latencyMs}ms</span>
                        </div>
                        <div className="mt-1 text-[10px] text-slate-300">
                          {testResult.details || testResult.error}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleTestConnector(conn.id)}
                        disabled={isTesting}
                        className="px-2.5 py-1 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 flex items-center gap-1 transition-colors disabled:opacity-50"
                      >
                        {isTesting ? <RotateCcw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                        <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setConfigModalConnector(conn)}
                        className="px-2.5 py-1 text-xs text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/40 rounded transition-colors"
                      >
                        Configure
                      </button>
                    </div>

                    <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-400">
                      <input
                        type="checkbox"
                        checked={conn.isEnabled}
                        onChange={(e) => toggleIntegrationEnabled(conn.id, e.target.checked)}
                        className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0"
                      />
                      <span>Active</span>
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: TOOL EXECUTION ENGINE & LIVE SANDBOX */}
      {activeTab === 'testbed' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tool Selection List */}
            <div className="space-y-2 lg:col-span-1">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Registered Tool Schemas ({allTools.length})
              </h3>
              <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
                {allTools.map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setSelectedToolId(t.id);
                      setLatestExecutionResult(null);
                    }}
                    className={`w-full p-3 text-left rounded-lg border transition-colors ${
                      selectedToolId === t.id
                        ? 'bg-[#0f172a] border-indigo-500 text-slate-100 shadow-sm'
                        : 'bg-[#0c121d] border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-xs text-slate-100">{t.name}</span>
                      {getRiskBadge(t.riskLevel)}
                    </div>
                    <div className="text-[11px] font-mono text-slate-400">{t.id}</div>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-1">{t.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Execution Form & Response Viewer */}
            <div className="lg:col-span-2 space-y-4">
              {selectedTool && (
                <div className="p-5 bg-[#0c121d] border border-slate-800 rounded-lg space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-bold text-slate-100">{selectedTool.name}</h2>
                        <span className="text-xs font-mono text-indigo-400">({selectedTool.id})</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{selectedTool.description}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                        Timeout: {selectedTool.timeoutMs || 15000}ms
                      </span>
                    </div>
                  </div>

                  {/* Dynamic Parameter Inputs */}
                  <div className="space-y-3 text-xs">
                    <h4 className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">
                      Tool Input Parameters (JSON Schema Enforced)
                    </h4>

                    {selectedTool.id === 'tool_web_research' && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-slate-300 mb-1 font-medium">Search Query *</label>
                          <input
                            type="text"
                            value={sandboxParams.query || ''}
                            onChange={(e) => setSandboxParams({ ...sandboxParams, query: e.target.value })}
                            className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-slate-100 focus:outline-hidden focus:border-indigo-500 font-mono text-xs"
                            placeholder="e.g. Kubernetes spot compaction FinOps"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-300 mb-1 font-medium">Domain Filter (Optional)</label>
                          <input
                            type="text"
                            value={sandboxParams.domainFilter || ''}
                            onChange={(e) => setSandboxParams({ ...sandboxParams, domainFilter: e.target.value })}
                            className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-slate-100 focus:outline-hidden focus:border-indigo-500 font-mono text-xs"
                            placeholder="e.g. github.com or techcrunch.com"
                          />
                        </div>
                      </div>
                    )}

                    {selectedTool.id === 'tool_website_intelligence' && (
                      <div>
                        <label className="block text-slate-300 mb-1 font-medium">Target Company Website URL *</label>
                        <input
                          type="text"
                          value={sandboxParams.url || ''}
                          onChange={(e) => setSandboxParams({ ...sandboxParams, url: e.target.value })}
                          className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-slate-100 focus:outline-hidden focus:border-indigo-500 font-mono text-xs"
                          placeholder="https://example.com"
                        />
                      </div>
                    )}

                    {selectedTool.id === 'tool_lead_discovery' && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-300 mb-1 font-medium">Target Industry *</label>
                          <input
                            type="text"
                            value={sandboxParams.industry || ''}
                            onChange={(e) => setSandboxParams({ ...sandboxParams, industry: e.target.value })}
                            className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-slate-100 focus:outline-hidden focus:border-indigo-500 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-300 mb-1 font-medium">Keywords</label>
                          <input
                            type="text"
                            value={sandboxParams.keywords || ''}
                            onChange={(e) => setSandboxParams({ ...sandboxParams, keywords: e.target.value })}
                            className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-slate-100 focus:outline-hidden focus:border-indigo-500 text-xs"
                          />
                        </div>
                      </div>
                    )}

                    {selectedTool.id === 'tool_email_dispatch' && (
                      <div className="space-y-2">
                        <div className="p-2 bg-amber-950/40 border border-amber-800/60 rounded text-[11px] text-amber-200 flex items-center gap-1.5">
                          <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>Human-Gated Tool: Requires supervisory authorization. Will transition to HELD_NO_INTEGRATION if provider unconfigured.</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-slate-300 mb-1 font-medium">Recipient *</label>
                            <input
                              type="email"
                              value={sandboxParams.to || ''}
                              onChange={(e) => setSandboxParams({ ...sandboxParams, to: e.target.value })}
                              className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-slate-100 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-300 mb-1 font-medium">Subject *</label>
                            <input
                              type="text"
                              value={sandboxParams.subject || ''}
                              onChange={(e) => setSandboxParams({ ...sandboxParams, subject: e.target.value })}
                              className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-slate-100 text-xs"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-slate-300 mb-1 font-medium">Body *</label>
                          <textarea
                            rows={3}
                            value={sandboxParams.body || ''}
                            onChange={(e) => setSandboxParams({ ...sandboxParams, body: e.target.value })}
                            className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-slate-100 text-xs resize-none"
                          />
                        </div>
                      </div>
                    )}

                    {selectedTool.id === 'tool_analytics_query' && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-300 mb-1 font-medium">Target Venture</label>
                          <select
                            value={sandboxParams.targetVentureId || 'v-1'}
                            onChange={(e) => setSandboxParams({ ...sandboxParams, targetVentureId: e.target.value })}
                            className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-slate-100 text-xs"
                          >
                            {ventures.map(v => (
                              <option key={v.id} value={v.id}>{v.name} ({v.id})</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-slate-300 mb-1 font-medium">Metric Type</label>
                          <select
                            value={sandboxParams.metricType || 'PAGEVIEWS'}
                            onChange={(e) => setSandboxParams({ ...sandboxParams, metricType: e.target.value })}
                            className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-slate-100 text-xs"
                          >
                            <option value="PAGEVIEWS">PAGEVIEWS</option>
                            <option value="ACTIVE_USERS">ACTIVE_USERS</option>
                            <option value="CONVERSIONS">CONVERSIONS</option>
                            <option value="SPEND">SPEND</option>
                            <option value="REVENUE">REVENUE</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {selectedTool.id === 'tool_doc_schema_analyzer' && (
                      <div>
                        <label className="block text-slate-300 mb-1 font-medium">Raw OpenAPI / Schema Payload *</label>
                        <textarea
                          rows={4}
                          value={sandboxParams.rawContent || 'type User { id: ID! name: String email: String }\ntype Account { id: ID! balance: Float }'}
                          onChange={(e) => setSandboxParams({ ...sandboxParams, rawContent: e.target.value })}
                          className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-slate-100 text-xs font-mono resize-none"
                        />
                      </div>
                    )}
                  </div>

                  {/* Run Button */}
                  <div className="flex items-center justify-end pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={handleRunTool}
                      disabled={isExecutingTool}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-sm"
                    >
                      {isExecutingTool ? <RotateCcw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                      <span>{isExecutingTool ? 'Executing Tool...' : 'Execute Tool via Engine'}</span>
                    </button>
                  </div>

                  {/* Output Display */}
                  {latestExecutionResult && (
                    <div className="mt-4 pt-4 border-t border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                            latestExecutionResult.status === 'SUCCESS' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                            latestExecutionResult.status === 'NOT_CONFIGURED' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                            'bg-rose-950 text-rose-300 border border-rose-800'
                          }`}>
                            {latestExecutionResult.status}
                          </span>
                          <span className="text-xs font-mono text-slate-400">Duration: {latestExecutionResult.durationMs}ms</span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-500">{latestExecutionResult.id}</span>
                      </div>

                      {latestExecutionResult.errorMessage && (
                        <div className="p-3 bg-rose-950/40 border border-rose-800 text-xs text-rose-300 rounded font-mono">
                          {latestExecutionResult.errorMessage}
                        </div>
                      )}

                      {latestExecutionResult.outputData && (
                        <div className="p-3.5 bg-[#090d14] border border-slate-800 rounded-lg max-h-96 overflow-y-auto">
                          <pre className="text-[11px] font-mono text-slate-200 whitespace-pre-wrap leading-relaxed">
                            {JSON.stringify(latestExecutionResult.outputData, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: EXECUTION MONITORING & AUDIT LOG */}
      {activeTab === 'audit' && (
        <div className="space-y-4 animate-fade-in">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-[#0c121d] border border-slate-800 rounded-lg text-xs">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-slate-300">Filters:</span>
              <select
                value={auditStatusFilter}
                onChange={(e) => setAuditStatusFilter(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200"
              >
                <option value="all">All Statuses ({toolExecutions.length})</option>
                <option value="SUCCESS">SUCCESS</option>
                <option value="FAILED">FAILED</option>
                <option value="BLOCKED_PERMISSION">BLOCKED_PERMISSION</option>
                <option value="BLOCKED_APPROVAL">BLOCKED_APPROVAL</option>
                <option value="NOT_CONFIGURED">NOT_CONFIGURED</option>
              </select>

              <select
                value={auditToolFilter}
                onChange={(e) => setAuditToolFilter(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200"
              >
                <option value="all">All Tools</option>
                {allTools.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div className="text-slate-400 text-[11px] font-mono">
              Showing {filteredExecutions.length} of {toolExecutions.length} logged events
            </div>
          </div>

          {/* Table */}
          <div className="bg-[#0c121d] border border-slate-800 rounded-lg overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#090d14] text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-4">Timestamp</th>
                  <th className="py-2.5 px-4">Tool</th>
                  <th className="py-2.5 px-4">Requesting Actor</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Latency</th>
                  <th className="py-2.5 px-4">Details</th>
                  <th className="py-2.5 px-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredExecutions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500 font-sans text-xs">
                      No tool executions recorded matching current filter.
                    </td>
                  </tr>
                ) : (
                  filteredExecutions.map(rec => (
                    <tr key={rec.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                        {new Date(rec.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-200 whitespace-nowrap">
                        {rec.toolName}
                      </td>
                      <td className="py-3 px-4 text-slate-300 text-[11px] whitespace-nowrap">
                        {rec.requestingAgentName}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          rec.status === 'SUCCESS' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                          rec.status === 'NOT_CONFIGURED' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                          'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}>
                          {rec.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px] tabular-nums">
                        {rec.durationMs}ms
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px] truncate max-w-xs font-sans">
                        {rec.errorMessage || JSON.stringify(rec.inputParameters)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedRecordForDetail(rec)}
                          className="px-2 py-1 text-[11px] text-indigo-400 hover:text-indigo-300 hover:bg-slate-800 rounded font-sans"
                        >
                          View Output →
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: AGENT PERMISSIONS MATRIX */}
      {activeTab === 'permissions' && (
        <div className="space-y-4 animate-fade-in">
          <div className="p-4 bg-[#0c121d] border border-slate-800 rounded-lg">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-1">
              Section 9: Granular Agent-to-Tool Permissions Matrix
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Enforces least-privilege security. Agents can only execute tools explicitly authorized for their operational scope.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-800 rounded">
                <thead className="bg-[#090d14] text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-4">Agent Identity</th>
                    <th className="py-2.5 px-4">Role & Domain</th>
                    <th className="py-2.5 px-4">Authorized Tool IDs</th>
                    <th className="py-2.5 px-4">Supervisory Boundary</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  <tr>
                    <td className="py-3 px-4 text-indigo-300 font-bold">Market Intelligence (Sentry)</td>
                    <td className="py-3 px-4 text-slate-300 font-sans text-xs">Research & Trends</td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">tool_web_research, tool_website_intelligence, tool_doc_schema_analyzer</td>
                    <td className="py-3 px-4 text-emerald-400 font-sans text-[11px]">Read-only public data</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-amber-300 font-bold">Opportunity Hunter (Scout)</td>
                    <td className="py-3 px-4 text-slate-300 font-sans text-xs">Lead Discovery</td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">tool_web_research, tool_lead_discovery, tool_website_intelligence</td>
                    <td className="py-3 px-4 text-emerald-400 font-sans text-[11px]">Deduplicated public search</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-cyan-300 font-bold">Prospect Intelligence (Vanguard)</td>
                    <td className="py-3 px-4 text-slate-300 font-sans text-xs">Enterprise Profiler</td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">tool_web_research, tool_website_intelligence, tool_crm_account_profiler</td>
                    <td className="py-3 px-4 text-amber-400 font-sans text-[11px]">CRM read-only; no external write</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-purple-300 font-bold">Portfolio Strategist (Foundry)</td>
                    <td className="py-3 px-4 text-slate-300 font-sans text-xs">Product & Alignment</td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">tool_doc_schema_analyzer, tool_web_research</td>
                    <td className="py-3 px-4 text-emerald-400 font-sans text-[11px]">Internal synthesis only</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-pink-300 font-bold">Marketing Strategist (Helix)</td>
                    <td className="py-3 px-4 text-slate-300 font-sans text-xs">Go-To-Market Plans</td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">tool_web_research, tool_analytics_query</td>
                    <td className="py-3 px-4 text-emerald-400 font-sans text-[11px]">Strategy formation only</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-indigo-300 font-bold">Campaign Planner (Cadence)</td>
                    <td className="py-3 px-4 text-slate-300 font-sans text-xs">Campaign Checklists</td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">tool_doc_schema_analyzer</td>
                    <td className="py-3 px-4 text-amber-400 font-sans text-[11px]">Campaign activation requires human signoff</td>
                  </tr>
                  <tr className="bg-amber-950/20">
                    <td className="py-3 px-4 text-amber-400 font-bold">Outreach Assistant (Courier)</td>
                    <td className="py-3 px-4 text-slate-300 font-sans text-xs">Draft Preparation</td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">tool_crm_account_profiler, tool_web_research</td>
                    <td className="py-3 px-4 text-rose-400 font-sans font-semibold text-[11px]">
                      BLOCKED from direct email dispatch. Drafts only.
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-emerald-300 font-bold">Relationship Manager (Nexus)</td>
                    <td className="py-3 px-4 text-slate-300 font-sans text-xs">CRM Pipelines</td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">tool_crm_account_profiler</td>
                    <td className="py-3 px-4 text-emerald-400 font-sans text-[11px]">Pipeline stage transitions & logs</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-sky-300 font-bold">Growth Analyst (Prism)</td>
                    <td className="py-3 px-4 text-slate-300 font-sans text-xs">Analytics Diagnostics</td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">tool_analytics_query, tool_finops_cluster_auditor</td>
                    <td className="py-3 px-4 text-emerald-400 font-sans text-[11px]">Strictly factual telemetry; zero fake metrics</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Configuration Guide Modal */}
      {configModalConnector && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0c121d] border border-slate-700 rounded-xl max-w-lg w-full p-6 space-y-4 text-xs shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-100">
                  Configure {configModalConnector.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setConfigModalConnector(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-slate-300 leading-relaxed">
              To activate this connector without exposing client-side credentials, configure the following server environment secret in Google AI Studio or your hosting provider:
            </p>

            <div className="p-3 bg-slate-900 border border-slate-800 rounded font-mono text-[11px] text-indigo-300 space-y-1">
              <div>KEY: <span className="text-white font-bold">{configModalConnector.requiredEnvVar}</span></div>
              <div>PROVIDER: <span className="text-slate-400">{configModalConnector.provider}</span></div>
            </div>

            <div className="space-y-2 text-slate-400">
              <div className="font-semibold text-slate-300">Security Invariants:</div>
              <ul className="list-disc pl-4 space-y-1 text-[11px]">
                <li>Credentials remain strictly isolated on the backend server (`server.ts`).</li>
                <li>No API keys are stored in browser localStorage or transmitted to client bundles.</li>
                <li>Actions through this gateway require explicit human supervisory approval.</li>
              </ul>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <a
                href={configModalConnector.documentationUrl}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <span>Documentation</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <button
                type="button"
                onClick={() => setConfigModalConnector(null)}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record Inspection Modal */}
      {selectedRecordForDetail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0c121d] border border-slate-700 rounded-xl max-w-2xl w-full p-6 space-y-4 text-xs shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <span>Execution Audit: {selectedRecordForDetail.toolName}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    selectedRecordForDetail.status === 'SUCCESS' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}>
                    {selectedRecordForDetail.status}
                  </span>
                </h3>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                  ID: {selectedRecordForDetail.id} · Actor: {selectedRecordForDetail.requestingAgentName}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRecordForDetail(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <div className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] mb-1">
                  Sanitized Input Parameters
                </div>
                <pre className="p-3 bg-slate-900 border border-slate-800 rounded font-mono text-[11px] text-slate-300 max-h-36 overflow-y-auto">
                  {JSON.stringify(selectedRecordForDetail.inputParameters, null, 2)}
                </pre>
              </div>

              <div>
                <div className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] mb-1">
                  Normalized Output Payload
                </div>
                <pre className="p-3 bg-[#090d14] border border-slate-800 rounded font-mono text-[11px] text-emerald-300 max-h-64 overflow-y-auto">
                  {JSON.stringify(selectedRecordForDetail.outputData || { message: selectedRecordForDetail.errorMessage }, null, 2)}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedRecordForDetail(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
