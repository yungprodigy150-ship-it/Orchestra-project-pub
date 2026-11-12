import React, { useState } from 'react';
import {
  Globe,
  ShieldCheck,
  Key,
  Cpu,
  Terminal,
  ExternalLink,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  Play,
  ArrowRight,
  FileText,
  Lock,
  Layers,
  Sparkles,
  Zap,
  Clock,
  Eye,
  Download,
  Link as LinkIcon
} from 'lucide-react';
import { useOrchestra } from '../../../context/OrchestraContext';
import { AgentAutonomyPermissionLevel } from '../../../types/identity';
import { BrowserSessionRecord, BrowserTabState } from '../../../types/browser';

export const InternetWorkforceSubView: React.FC = () => {
  const {
    digitalIdentities,
    updateAgentPermissionLevel,
    browserSessions,
    createBrowserSession,
    openBrowserTab,
    navigateBrowserTab,
    performBrowserAction,
    closeBrowserTab,
    externalAccounts,
    refreshExternalAccounts,
    testAccountConnection,
    accountActivities,
    discoveredModels,
    evaluateModelRouting,
    startAgentDialogue
  } = useOrchestra();

  const [activeSubTab, setActiveSubTab] = useState<'identities' | 'browser' | 'accounts' | 'routing'>('identities');

  // Browser state
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    browserSessions[0]?.id || null
  );
  const [newSessionAgentId, setNewSessionAgentId] = useState<string>('agt-scout');
  const [newSessionObjective, setNewSessionObjective] = useState<string>('');
  const [isLaunchingSession, setIsLaunchingSession] = useState(false);
  const [tabUrlInput, setTabUrlInput] = useState('');
  const [isNavigating, setIsNavigating] = useState(false);
  const [activeTabInspection, setActiveTabInspection] = useState<'content' | 'headings' | 'links' | 'forms'>('content');

  // Account testing state
  const [testingAccountId, setTestingAccountId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ accountId: string; status: string; details?: string } | null>(null);

  // Model routing test state
  const [routingTaskPrompt, setRoutingTaskPrompt] = useState('Extract CDC schema changes from enterprise Postgres replication logs');
  const [routingEvaluation, setRoutingEvaluation] = useState<any | null>(null);
  const [isEvaluatingRouting, setIsEvaluatingRouting] = useState(false);

  const activeSession: BrowserSessionRecord | null =
    browserSessions.find(s => s.id === selectedSessionId) || browserSessions[0] || null;

  const currentTab: BrowserTabState | null =
    activeSession?.tabs.find(t => t.tabId === activeSession.activeTabId) ||
    activeSession?.tabs[0] ||
    null;

  const handleLaunchSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSessionObjective.trim() || isLaunchingSession) return;
    setIsLaunchingSession(true);
    try {
      const identity = digitalIdentities.find(i => i.agentId === newSessionAgentId);
      const session = await createBrowserSession(
        newSessionAgentId,
        identity?.name || 'Agent',
        newSessionObjective.trim()
      );
      setSelectedSessionId(session.id);
      setNewSessionObjective('');
    } finally {
      setIsLaunchingSession(false);
    }
  };

  const handleNavigateTab = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSession || !currentTab || !tabUrlInput.trim() || isNavigating) return;
    setIsNavigating(true);
    try {
      await navigateBrowserTab(activeSession.id, currentTab.tabId, tabUrlInput.trim(), activeSession.agentId);
      setTabUrlInput('');
    } finally {
      setIsNavigating(false);
    }
  };

  const handleTestAccount = async (accountId: string) => {
    setTestingAccountId(accountId);
    try {
      const res = await testAccountConnection(accountId);
      setTestResult({
        accountId,
        status: res.status,
        details: res.details || res.error
      });
    } finally {
      setTestingAccountId(null);
    }
  };

  const handleEvaluateRouting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!routingTaskPrompt.trim() || isEvaluatingRouting) return;
    setIsEvaluatingRouting(true);
    try {
      const evalResult = await evaluateModelRouting(routingTaskPrompt.trim());
      setRoutingEvaluation(evalResult);
    } finally {
      setIsEvaluatingRouting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-navigation tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-3">
        <div className="flex items-center gap-1.5 bg-[#090e17] p-1 border border-slate-800 rounded-lg">
          <button
            type="button"
            onClick={() => setActiveSubTab('identities')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'identities'
                ? 'bg-slate-800 text-amber-300 font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Digital Identities ({digitalIdentities.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('browser')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'browser'
                ? 'bg-slate-800 text-cyan-300 font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Browser Runtime ({browserSessions.length} Sessions)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('accounts')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'accounts'
                ? 'bg-slate-800 text-indigo-300 font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Connected Accounts ({externalAccounts.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('routing')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'routing'
                ? 'bg-slate-800 text-emerald-300 font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>AI Discovery & Routing</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>SSRF-Safe Sandbox Enforced</span>
        </div>
      </div>

      {/* TAB 1: DIGITAL IDENTITIES */}
      {activeSubTab === 'identities' && (
        <div className="space-y-4">
          <div className="p-3 bg-[#0a0f19] border border-slate-800 rounded-lg text-xs text-slate-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>
                Each agent operates with an authentic cryptographic digital certificate, explicit autonomy boundaries, and an identified User-Agent signature.
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Zero Impersonation Policy</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {digitalIdentities.map((identity) => (
              <div
                key={identity.id}
                className="p-5 bg-[#0b101a] border border-slate-800 hover:border-slate-700 rounded-xl space-y-4 transition-colors"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={identity.avatar}
                      alt={identity.name}
                      className="w-12 h-12 rounded-full object-cover border border-slate-700 shadow-md"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-100">{identity.name}</h3>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {identity.callsign}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{identity.role}</p>
                    </div>
                  </div>

                  {/* Permission Badge & Selector */}
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                        identity.permissionLevel === 'restricted'
                          ? 'bg-rose-950/80 border border-rose-800/80 text-rose-300'
                          : identity.permissionLevel === 'execute'
                          ? 'bg-emerald-950/80 border border-emerald-800/80 text-emerald-300'
                          : identity.permissionLevel === 'assist'
                          ? 'bg-blue-950/80 border border-blue-800/80 text-blue-300'
                          : 'bg-slate-800 border border-slate-700 text-slate-300'
                      }`}
                    >
                      {identity.permissionLevel}
                    </span>
                    <select
                      value={identity.permissionLevel}
                      onChange={(e) => updateAgentPermissionLevel(identity.agentId, e.target.value as AgentAutonomyPermissionLevel)}
                      className="text-[10px] bg-[#070b12] border border-slate-700 rounded px-1.5 py-0.5 text-slate-300 focus:outline-hidden focus:border-amber-500"
                    >
                      <option value="observe">Observe (Read-Only)</option>
                      <option value="assist">Assist (Draft Only)</option>
                      <option value="execute">Execute (Direct Action)</option>
                      <option value="restricted">Restricted (Human Gated)</option>
                    </select>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {identity.description}
                </p>

                {/* Identity Attributes */}
                <div className="p-3 bg-[#070b13] border border-slate-800/80 rounded-lg space-y-2 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Specialization:</span>
                    <span className="text-slate-200 font-medium text-right">{identity.specialization}</span>
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <span className="text-slate-400 shrink-0">User-Agent:</span>
                    <span className="text-[10px] font-mono text-amber-300/90 break-all text-right">
                      {identity.userAgentSignature}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Digital Certificate:</span>
                    <span className="text-[10px] font-mono text-cyan-300">{identity.digitalCertificateId}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Authorized Accounts:</span>
                    <div className="flex items-center gap-1">
                      {identity.authorizedExternalAccounts.map((acc, idx) => (
                        <span
                          key={idx}
                          className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-800 text-slate-300 border border-slate-700"
                        >
                          {acc.accountType} ({acc.scopeLevel})
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Activity Footer */}
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1">
                  <span>Executions: {identity.totalExecutionsCount}</span>
                  <span>Consultations: {identity.totalConversationsCount}</span>
                  <span>Status: <span className="text-emerald-400">{identity.operationalStatus}</span></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: AUTONOMOUS BROWSER RUNTIME */}
      {activeSubTab === 'browser' && (
        <div className="space-y-4">
          {/* Launcher Strip */}
          <form
            onSubmit={handleLaunchSession}
            className="p-3.5 bg-[#0b101a] border border-slate-800 rounded-xl flex flex-col sm:flex-row items-center gap-3 text-xs"
          >
            <div className="flex items-center gap-2 shrink-0">
              <Globe className="w-4 h-4 text-cyan-400" />
              <span className="font-semibold text-slate-200">New Autonomous Session:</span>
            </div>

            <select
              value={newSessionAgentId}
              onChange={(e) => setNewSessionAgentId(e.target.value)}
              className="px-2.5 py-1.5 bg-[#070b13] border border-slate-700 rounded text-slate-200 text-xs shrink-0"
            >
              {digitalIdentities.map(i => (
                <option key={i.agentId} value={i.agentId}>{i.name} ({i.role})</option>
              ))}
            </select>

            <input
              type="text"
              value={newSessionObjective}
              onChange={(e) => setNewSessionObjective(e.target.value)}
              placeholder="e.g. Inspect public SEC 10-K filings for enterprise database spend signals"
              className="flex-1 px-3 py-1.5 bg-[#070b13] border border-slate-700 rounded text-slate-200 placeholder-slate-500 text-xs focus:outline-hidden focus:border-cyan-500 w-full sm:w-auto"
              required
            />

            <button
              type="submit"
              disabled={isLaunchingSession}
              className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-semibold rounded text-xs transition-colors shrink-0 flex items-center gap-1.5"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>{isLaunchingSession ? 'Opening...' : 'Launch Session'}</span>
            </button>
          </form>

          {/* Browser Workstation Grid */}
          {activeSession ? (
            <div className="bg-[#0b101a] border border-slate-800 rounded-xl overflow-hidden flex flex-col">
              {/* Session Bar */}
              <div className="px-4 py-2.5 bg-[#0e1524] border-b border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-200">{activeSession.agentName}</span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-300 italic">"{activeSession.objective}"</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 border border-cyan-800 text-cyan-300">
                    {activeSession.runtimeType}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {activeSession.tabs.length} Tab{activeSession.tabs.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* Multi-Tab Selector Strip */}
              <div className="px-3 py-1.5 bg-[#080d16] border-b border-slate-800/90 flex items-center gap-1.5 overflow-x-auto text-xs">
                {activeSession.tabs.map((tab) => {
                  const isActive = tab.tabId === activeSession.activeTabId;
                  return (
                    <div
                      key={tab.tabId}
                      className={`px-3 py-1 rounded-t-md flex items-center gap-2 transition-colors cursor-pointer border-t border-x ${
                        isActive
                          ? 'bg-[#0b101a] border-slate-700 text-cyan-300 font-semibold'
                          : 'bg-[#060910] border-transparent text-slate-400 hover:text-slate-200'
                      }`}
                      onClick={() => {
                        activeSession.activeTabId = tab.tabId;
                      }}
                    >
                      <Globe className="w-3 h-3 text-cyan-400" />
                      <span className="max-w-[140px] truncate text-[11px]">{tab.title || tab.url}</span>
                      {activeSession.tabs.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            closeBrowserTab(activeSession.id, tab.tabId);
                          }}
                          className="text-slate-500 hover:text-rose-400 text-[10px]"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  );
                })}

                <button
                  type="button"
                  onClick={() => openBrowserTab(activeSession.id, 'https://news.ycombinator.com', activeSession.agentId)}
                  className="px-2 py-0.5 rounded text-[10px] text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800 border border-slate-700 shrink-0"
                >
                  + New Tab
                </button>
              </div>

              {/* Tab Navigation Address Bar */}
              {currentTab && (
                <div className="p-3 bg-[#0a0f18] border-b border-slate-800/80 flex items-center gap-2">
                  <form onSubmit={handleNavigateTab} className="flex-1 flex items-center gap-2">
                    <input
                      type="text"
                      value={tabUrlInput || currentTab.url}
                      onChange={(e) => setTabUrlInput(e.target.value)}
                      placeholder="https://..."
                      className="flex-1 px-3 py-1.5 bg-[#060910] border border-slate-700 rounded text-xs text-slate-200 font-mono focus:outline-hidden focus:border-cyan-500"
                    />
                    <button
                      type="submit"
                      disabled={isNavigating}
                      className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-semibold flex items-center gap-1"
                    >
                      <RefreshCw className={`w-3 h-3 ${isNavigating ? 'animate-spin' : ''}`} />
                      <span>{isNavigating ? 'Loading...' : 'Go'}</span>
                    </button>
                  </form>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => performBrowserAction(activeSession.id, currentTab.tabId, 'extract_content', undefined, activeSession.agentId)}
                      className="px-2.5 py-1.5 bg-cyan-950/60 hover:bg-cyan-950 border border-cyan-800 text-cyan-300 rounded text-xs font-mono"
                    >
                      Extract Text
                    </button>
                    <button
                      type="button"
                      onClick={() => performBrowserAction(activeSession.id, currentTab.tabId, 'download_file', undefined, activeSession.agentId)}
                      className="px-2.5 py-1.5 bg-indigo-950/60 hover:bg-indigo-950 border border-indigo-800 text-indigo-300 rounded text-xs font-mono flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      <span>Save Snapshot</span>
                    </button>
                  </div>
                </div>
              )}

              {/* DOM Analysis & Content Inspection Viewport */}
              {currentTab ? (
                <div className="p-4 space-y-4">
                  {/* Inspection Mode Toggles */}
                  <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2 text-xs">
                    {(
                      [
                        { id: 'content', label: `Page Text (${(currentTab.extractedTextPreview || '').length} chars)` },
                        { id: 'headings', label: `Headings Hierarchy (${currentTab.headings.length})` },
                        { id: 'links', label: `Discovered Hyperlinks (${currentTab.links.length})` },
                        { id: 'forms', label: `Forms & Inputs (${currentTab.forms.length})` }
                      ] as const
                    ).map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setActiveTabInspection(m.id)}
                        className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                          activeTabInspection === m.id
                            ? 'bg-slate-800 text-cyan-300 font-semibold'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>

                  {/* Mode 1: Content Text */}
                  {activeTabInspection === 'content' && (
                    <div className="p-3 bg-[#060a12] border border-slate-800 rounded-lg max-h-80 overflow-y-auto text-xs text-slate-300 font-mono leading-relaxed whitespace-pre-wrap">
                      {currentTab.extractedTextPreview || 'No content extracted yet.'}
                    </div>
                  )}

                  {/* Mode 2: Headings */}
                  {activeTabInspection === 'headings' && (
                    <div className="space-y-1.5 max-h-80 overflow-y-auto">
                      {currentTab.headings.length > 0 ? (
                        currentTab.headings.map((h, idx) => (
                          <div
                            key={idx}
                            className="p-2 rounded bg-[#060a12] border border-slate-800 text-xs flex items-center gap-2 text-slate-300 font-medium"
                          >
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-amber-400">
                              #{idx + 1}
                            </span>
                            <span>{h}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400">No headings detected on this document.</p>
                      )}
                    </div>
                  )}

                  {/* Mode 3: Links */}
                  {activeTabInspection === 'links' && (
                    <div className="space-y-1.5 max-h-80 overflow-y-auto">
                      {currentTab.links.length > 0 ? (
                        currentTab.links.slice(0, 30).map((l, idx) => (
                          <div
                            key={idx}
                            className="p-2 rounded bg-[#060a12] border border-slate-800 text-xs flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <LinkIcon className="w-3 h-3 text-cyan-400 shrink-0" />
                              <span className="text-slate-200 font-medium truncate">{l.text || '(Untitled Link)'}</span>
                              <span className="text-[10px] font-mono text-slate-400 truncate">{l.href}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => performBrowserAction(activeSession.id, currentTab.tabId, 'click_link', l.href, activeSession.agentId)}
                              className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800 hover:bg-cyan-900 shrink-0"
                            >
                              Navigate →
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400">No hyperlinks extracted.</p>
                      )}
                    </div>
                  )}

                  {/* Mode 4: Forms */}
                  {activeTabInspection === 'forms' && (
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {currentTab.forms.length > 0 ? (
                        currentTab.forms.map((f, idx) => (
                          <div key={idx} className="p-3 rounded bg-[#060a12] border border-slate-800 text-xs space-y-2">
                            <div className="flex items-center justify-between text-[11px] font-mono text-amber-300">
                              <span>Action: {f.action || 'Self'}</span>
                              <span>Method: {f.method.toUpperCase()}</span>
                            </div>
                            <div className="space-y-1">
                              {f.fields.map((fieldName, fIdx) => (
                                <div key={fIdx} className="text-[10px] font-mono text-slate-300 flex items-center gap-2">
                                  <span className="text-slate-400">Field:</span>
                                  <span className="px-1 bg-slate-800 rounded">{fieldName}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400">No interactive HTML forms found on page.</p>
                      )}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-slate-400 bg-[#0b101a] border border-slate-800 rounded-xl">
              No active browser sessions. Use the form above to deploy an autonomous session.
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CONNECTED ACCOUNTS */}
      {activeSubTab === 'accounts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Scoped enterprise accounts authorized for agent observation, drafts, and execution.
            </p>
            <button
              type="button"
              onClick={refreshExternalAccounts}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Refresh</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {externalAccounts.map((acc) => (
              <div
                key={acc.id}
                className="p-4 bg-[#0b101a] border border-slate-800 rounded-xl space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-1.5">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 uppercase font-bold">
                      {acc.provider}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        acc.status === 'CONNECTED'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}
                    >
                      {acc.status}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-100">{acc.name}</h3>
                  <p className="text-[11px] text-slate-400 mt-1">{acc.statusMessage}</p>
                </div>

                <div className="p-2.5 bg-[#070b13] border border-slate-800 rounded text-[10px] space-y-1 font-mono">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Scope:</span>
                    <span className="text-indigo-300 truncate max-w-[140px]">{acc.authorizedScopes.join(', ')}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Auth:</span>
                    <span className="text-slate-300">{acc.authMethod}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400">
                    {acc.assignedAgentIds.includes('*') ? 'All Agents' : `${acc.assignedAgentIds.length} Agents`}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleTestAccount(acc.id)}
                    disabled={testingAccountId === acc.id}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 rounded text-[11px] font-medium transition-colors"
                  >
                    {testingAccountId === acc.id ? 'Testing...' : 'Test Connection'}
                  </button>
                </div>

                {testResult?.accountId === acc.id && (
                  <div className="p-2 bg-black/40 border border-slate-800 rounded text-[10px] font-mono text-slate-300">
                    Status: <span className="text-amber-300">{testResult.status}</span>
                    {testResult.details && <p className="text-slate-400 mt-0.5">{testResult.details}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Account Audit Activity Log */}
          <div className="p-4 bg-[#0a0f18] border border-slate-800 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>External Account Audit Activity Log</span>
            </h4>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {accountActivities.map((act) => (
                <div key={act.id} className="p-2 rounded bg-[#060910] border border-slate-800 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200">{act.agentName}</span>
                    <span className="text-[10px] font-mono text-slate-400">({act.action})</span>
                    <span className="text-[11px] text-slate-300">{act.resourceTarget}</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400">{act.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AI DISCOVERY & INTELLIGENT MODEL ROUTING */}
      {activeSubTab === 'routing' && (
        <div className="space-y-4">
          <div className="p-4 bg-[#0b101a] border border-slate-800 rounded-xl space-y-3">
            <h3 className="text-xs font-bold text-slate-100 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>Intelligent Model Capability Router</span>
            </h3>
            <p className="text-xs text-slate-400">
              Evaluates task complexity, context length, coding requirements, and pricing to route missions dynamically across Google Gemini, Groq, and OpenRouter.
            </p>

            <form onSubmit={handleEvaluateRouting} className="flex items-center gap-2">
              <input
                type="text"
                value={routingTaskPrompt}
                onChange={(e) => setRoutingTaskPrompt(e.target.value)}
                placeholder="Enter task objective to evaluate..."
                className="flex-1 px-3 py-2 bg-[#060910] border border-slate-700 rounded text-xs text-slate-200 focus:outline-hidden focus:border-emerald-500"
                required
              />
              <button
                type="submit"
                disabled={isEvaluatingRouting}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold rounded text-xs transition-colors flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{isEvaluatingRouting ? 'Evaluating...' : 'Evaluate Route'}</span>
              </button>
            </form>

            {routingEvaluation && (
              <div className="p-3.5 bg-[#060a12] border border-emerald-900/60 rounded-lg space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">Recommended Model:</span>
                  <span className="text-emerald-400 font-mono font-bold">{routingEvaluation.recommendedModelId}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Provider:</span>
                  <span className="text-slate-200 font-mono">{routingEvaluation.recommendedProvider}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Estimated Cost:</span>
                  <span className="text-emerald-400 font-mono">${routingEvaluation.estimatedCostUsd}</span>
                </div>
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-400">Routing Rationales:</span>
                  <ul className="list-disc list-inside text-[11px] text-slate-300 mt-1 space-y-0.5">
                    {routingEvaluation.rationales.map((r: string, idx: number) => (
                      <li key={idx}>{r}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Model Catalog Table */}
          <div className="bg-[#0b101a] border border-slate-800 rounded-xl overflow-hidden">
            <div className="px-4 py-3 bg-[#0d1422] border-b border-slate-800 text-xs font-bold text-slate-200">
              Discovered AI Model Catalog ({discoveredModels.length} Models)
            </div>
            <div className="divide-y divide-slate-800 text-xs">
              {discoveredModels.map((m) => (
                <div key={m.id} className="p-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200">{m.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                        {m.provider}
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-slate-400 mt-0.5">{m.contextLength.toLocaleString()} tokens context</p>
                  </div>
                  <div className="text-right text-[11px] font-mono shrink-0">
                    <div className="text-emerald-400">${m.inputCostPer1M} / 1M input</div>
                    <div className="text-slate-400">{m.benchmarks?.latencyMs || 280}ms latency</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
