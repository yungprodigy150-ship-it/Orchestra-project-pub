import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  RotateCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Layers,
  FileText,
  Copy,
  Check,
  Bot,
  TrendingUp,
  Target,
  Building2,
  Briefcase,
  Database
} from 'lucide-react';
import { useOrchestra } from '../../context/OrchestraContext';
import {
  CoordinatedWorkflowExecution,
  WorkflowStepState,
  MarketIntelligenceOutput,
  OpportunityHunterOutput,
  ProspectIntelligenceOutput,
  PortfolioStrategyOutput,
  CompetitorTeardown,
  IntelligenceSourceCitation
} from '../../types/workforce';
import { Agent, TaskPriority, TaskStatus } from '../../types';

interface WorkflowExecutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedAgent?: Agent | null;
}

export const WorkflowExecutionModal: React.FC<WorkflowExecutionModalProps> = ({
  isOpen,
  onClose,
  preselectedAgent
}) => {
  const {
    ventures,
    agents,
    activeWorkflow,
    setActiveWorkflow,
    workflows,
    launchWorkflow,
    executeAgentTask,
    approveWorkflow,
    rejectWorkflow
  } = useOrchestra();

  // Execution configuration state
  const [executionMode, setExecutionMode] = useState<'coordinated' | 'single'>(
    preselectedAgent ? 'single' : 'coordinated'
  );
  const [selectedAgentId, setSelectedAgentId] = useState<string>(
    preselectedAgent?.id || 'agt-2'
  );
  const [selectedVentureId, setSelectedVentureId] = useState<string>(ventures[0]?.id || 'v-1');
  const [targetIndustry, setTargetIndustry] = useState('Enterprise Cloud Infrastructure & FinOps');
  const [customObjective, setCustomObjective] = useState(
    'Identify high-margin expansion vectors, competitive displacement opportunities, and qualify initial enterprise prospects.'
  );
  const [contextNotes, setContextNotes] = useState(
    'Focus on mid-to-large enterprises ($100M+ revenue) undergoing cloud migrations with multi-cloud cost escalation.'
  );
  const [priority, setPriority] = useState<TaskPriority>('high');

  // Execution runtime status
  const [isRunning, setIsRunning] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'synthesis' | 'market' | 'opportunity' | 'prospect' | 'portfolio' | 'hierarchy' | 'json'>('synthesis');
  const [copiedJson, setCopiedJson] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState('');
  const [showRevisionInput, setShowRevisionInput] = useState(false);

  // Sync preselected agent changes
  useEffect(() => {
    if (preselectedAgent) {
      setExecutionMode('single');
      setSelectedAgentId(preselectedAgent.id);
    }
  }, [preselectedAgent]);

  // Sync latest active workflow when workflows update
  const currentExecution: CoordinatedWorkflowExecution | null = activeWorkflow || workflows[0] || null;

  if (!isOpen) return null;

  const handleLaunch = async () => {
    setIsRunning(true);
    setRunError(null);
    try {
      if (executionMode === 'coordinated') {
        const wf = await launchWorkflow({
          objective: customObjective,
          workflowType: 'coordinated_opportunity_pipeline',
          targetVentureId: selectedVentureId,
          industrySector: targetIndustry,
          contextNotes,
          priority,
          requireApprovalBeforeFinalize: true
        });
        setActiveWorkflow(wf);
        setActiveTab('synthesis');
      } else {
        await executeAgentTask(
          selectedAgentId,
          customObjective,
          selectedVentureId,
          priority,
          contextNotes
        );
        // Switch active tab to appropriate agent output
        if (selectedAgentId === 'agt-2') setActiveTab('market');
        else if (selectedAgentId === 'agt-scout') setActiveTab('opportunity');
        else if (selectedAgentId === 'agt-3') setActiveTab('prospect');
        else if (selectedAgentId === 'agt-4') setActiveTab('portfolio');
        else setActiveTab('synthesis');
      }
    } catch (err: any) {
      console.error('Workflow launch failed:', err);
      setRunError(err?.message || 'Execution error encountered. Please check provider settings.');
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopyJson = () => {
    if (!currentExecution) return;
    navigator.clipboard.writeText(JSON.stringify(currentExecution, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  // Find step outputs based on agentRole
  const marketStep = currentExecution?.steps.find(s => s.agentRole === 'market_intelligence');
  const oppStep = currentExecution?.steps.find(s => s.agentRole === 'opportunity_hunter');
  const prospectStep = currentExecution?.steps.find(s => s.agentRole === 'prospect_intelligence');
  const portfolioStep = currentExecution?.steps.find(s => s.agentRole === 'portfolio_strategist');

  const marketData = (marketStep?.output as MarketIntelligenceOutput) || null;
  const oppData = (oppStep?.output as OpportunityHunterOutput) || null;
  const prospectData = (prospectStep?.output as ProspectIntelligenceOutput) || null;
  const portfolioData = (portfolioStep?.output as PortfolioStrategyOutput) || null;
  const synthesisData = currentExecution?.synthesizedReport || null;

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'RUNNING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-medium rounded bg-indigo-950/60 border border-indigo-700/60 text-indigo-300">
            <RotateCw className="w-3 h-3 animate-spin text-indigo-400" />
            PIPELINE EXECUTING
          </span>
        );
      case 'WAITING_FOR_APPROVAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-medium rounded bg-amber-950/60 border border-amber-700/60 text-amber-300">
            <ShieldAlert className="w-3 h-3 text-amber-400" />
            HUMAN APPROVAL REQUIRED
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-medium rounded bg-emerald-950/60 border border-emerald-700/60 text-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            APPROVED & INGESTED
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-medium rounded bg-rose-950/60 border border-rose-700/60 text-rose-300">
            <AlertCircle className="w-3 h-3 text-rose-400" />
            EXECUTION FAILED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-medium rounded bg-slate-800 text-slate-300">
            {status}
          </span>
        );
    }
  };

  const getStepStatusIcon = (stepStatus: TaskStatus) => {
    switch (stepStatus) {
      case 'COMPLETED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'RUNNING':
        return <RotateCw className="w-4 h-4 text-indigo-400 animate-spin" />;
      case 'FAILED':
        return <AlertCircle className="w-4 h-4 text-rose-400" />;
      case 'WAITING_FOR_APPROVAL':
        return <ShieldAlert className="w-4 h-4 text-amber-400" />;
      default:
        return <div className="w-2.5 h-2.5 rounded-full bg-slate-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-6xl bg-[#0b1019] border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] z-10"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/90 bg-[#0d1422]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-base font-bold text-slate-100 tracking-tight">
                  Multi-Agent Workforce Orchestration
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950/70 border border-indigo-700/50 text-indigo-300">
                  STAGE 4 WORKFORCE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Execute autonomous cross-agent intelligence pipelines with structured schema governance and human signoff.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {currentExecution && getStatusBadge(currentExecution.status)}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body: Split 2-Column Workspace */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 min-h-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
          {/* Left Column: Launch & Configuration Controls (4 cols) */}
          <div className="lg:col-span-4 p-5 space-y-5 bg-[#090e17]/80 overflow-y-auto">
            {/* Mode Selector */}
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
                Execution Architecture
              </label>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#070b12] border border-slate-800 rounded-lg">
                <button
                  type="button"
                  onClick={() => setExecutionMode('coordinated')}
                  className={`px-3 py-2 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5 ${
                    executionMode === 'coordinated'
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>4-Agent Pipeline</span>
                </button>
                <button
                  type="button"
                  onClick={() => setExecutionMode('single')}
                  className={`px-3 py-2 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5 ${
                    executionMode === 'single'
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>Single Agent</span>
                </button>
              </div>
            </div>

            {/* Target Venture */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Target Venture Pod
              </label>
              <select
                value={selectedVentureId}
                onChange={(e) => setSelectedVentureId(e.target.value)}
                className="w-full px-3 py-2 bg-[#0c121d] border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-hidden focus:border-indigo-500"
              >
                {ventures.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.name} — {v.stage.toUpperCase()} ({v.tagline})
                  </option>
                ))}
              </select>
            </div>

            {/* Single Agent Picker if in single mode */}
            {executionMode === 'single' && (
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Assigned Specialized Agent
                </label>
                <select
                  value={selectedAgentId}
                  onChange={(e) => setSelectedAgentId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0c121d] border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-hidden focus:border-indigo-500 font-mono"
                >
                  {agents.map(a => (
                    <option key={a.id} value={a.id}>
                      [{a.code}] {a.name} — {a.role}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Target Industry or Segment */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Target Domain & Industry
                </label>
                <div className="flex gap-1 text-[10px] text-slate-500">
                  <button
                    type="button"
                    onClick={() => setTargetIndustry('Enterprise Cloud FinOps & Kubernetes')}
                    className="hover:text-indigo-400 underline decoration-slate-700"
                  >
                    FinOps
                  </button>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={() => setTargetIndustry('Real-time Data Streaming & CDC Pipelines')}
                    className="hover:text-indigo-400 underline decoration-slate-700"
                  >
                    CDC
                  </button>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={() => setTargetIndustry('Knowledge Graph AI & Context Engines')}
                    className="hover:text-indigo-400 underline decoration-slate-700"
                  >
                    Graph AI
                  </button>
                </div>
              </div>
              <input
                type="text"
                value={targetIndustry}
                onChange={(e) => setTargetIndustry(e.target.value)}
                className="w-full px-3 py-2 bg-[#0c121d] border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-hidden focus:border-indigo-500"
                placeholder="e.g. Healthcare Compliance Automation"
              />
            </div>

            {/* Objective Directive */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Mission Objective Directive
              </label>
              <textarea
                value={customObjective}
                onChange={(e) => setCustomObjective(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-[#0c121d] border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-hidden focus:border-indigo-500 resize-none"
                placeholder="Specify the exact intelligence target, constraints, and hypothesis..."
              />
            </div>

            {/* Context & Prior Memory Notes */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Strategic Constraints & Memory Seeds
              </label>
              <textarea
                value={contextNotes}
                onChange={(e) => setContextNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 bg-[#0c121d] border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-hidden focus:border-indigo-500 resize-none text-slate-400"
                placeholder="Include internal memory notes or domain requirements..."
              />
            </div>

            {/* Priority Selection */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Task Priority
              </label>
              <div className="grid grid-cols-4 gap-1">
                {(['low', 'medium', 'high', 'critical'] as TaskPriority[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-1 text-[11px] font-mono uppercase rounded transition-colors ${
                      priority === p
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'bg-[#0c121d] border border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Pipeline Launch CTA */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleLaunch}
                disabled={isRunning}
                className={`w-full py-2.5 px-4 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  isRunning
                    ? 'bg-indigo-900/60 text-indigo-300 cursor-not-allowed border border-indigo-700/50'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg hover:shadow-indigo-500/20 active:scale-[0.99]'
                }`}
              >
                {isRunning ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin text-indigo-300" />
                    <span>Executing Intelligence Pipeline...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>
                      {executionMode === 'coordinated'
                        ? 'Dispatch 4-Agent Coordinated Pipeline'
                        : 'Launch Specialized Agent Mission'}
                    </span>
                  </>
                )}
              </button>

              {runError && (
                <div className="mt-3 p-2.5 rounded bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  <span>{runError}</span>
                </div>
              )}
            </div>

            {/* History of Past Executions in Drawer */}
            {workflows.length > 0 && (
              <div className="pt-4 border-t border-slate-800/80">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Recent Workflow Pipelines ({workflows.length})
                </div>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {workflows.slice(0, 5).map(wf => (
                    <button
                      key={wf.id}
                      type="button"
                      onClick={() => {
                        setActiveWorkflow(wf);
                        setActiveTab('synthesis');
                      }}
                      className={`w-full text-left p-2 rounded border text-xs transition-colors flex items-center justify-between ${
                        activeWorkflow?.id === wf.id
                          ? 'bg-slate-800/90 border-indigo-500/60 text-white'
                          : 'bg-[#0c121d] border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="truncate mr-2">
                        <div className="font-mono text-[11px] text-slate-300 truncate">
                          {wf.title}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {new Date(wf.startedAt || wf.createdAt).toLocaleTimeString()} · {wf.steps.length} steps
                        </div>
                      </div>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded uppercase ${
                        wf.status === 'COMPLETED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                        wf.status === 'WAITING_FOR_APPROVAL' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                        'bg-indigo-950 text-indigo-400 border border-indigo-800'
                      }`}>
                        {wf.status.slice(0, 7)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Live Step Tracker & Structured Output Viewer (8 cols) */}
          <div className="lg:col-span-8 flex flex-col min-h-0 bg-[#0c121f]">
            {/* Step Progress Timeline */}
            {currentExecution && (
              <div className="px-6 py-3.5 bg-[#090e18] border-b border-slate-800">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                    Pipeline Execution Timeline
                  </span>
                  <span className="font-mono text-[11px] text-slate-400">
                    Step {currentExecution.currentStepIndex} of {currentExecution.totalSteps} · {currentExecution.steps.filter(s => s.status === 'COMPLETED').length} Completed
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {currentExecution.steps.map((step) => {
                    const isStepActive = currentExecution.currentStepIndex === step.stepIndex;
                    return (
                      <div
                        key={step.stepIndex}
                        onClick={() => {
                          if (step.agentRole === 'market_intelligence') setActiveTab('market');
                          else if (step.agentRole === 'opportunity_hunter') setActiveTab('opportunity');
                          else if (step.agentRole === 'prospect_intelligence') setActiveTab('prospect');
                          else if (step.agentRole === 'portfolio_strategist') setActiveTab('portfolio');
                          else setActiveTab('synthesis');
                        }}
                        className={`p-2 rounded border cursor-pointer transition-all ${
                          isStepActive && currentExecution.status === 'RUNNING'
                            ? 'bg-indigo-950/70 border-indigo-500 text-white'
                            : step.status === 'COMPLETED'
                            ? 'bg-slate-900/90 border-slate-700/80 text-slate-200'
                            : step.status === 'FAILED'
                            ? 'bg-rose-950/50 border-rose-800 text-rose-300'
                            : 'bg-[#070b12] border-slate-800/80 text-slate-500'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-mono text-slate-400">0{step.stepIndex}</span>
                          {getStepStatusIcon(step.status)}
                        </div>
                        <div className="font-mono text-[11px] font-semibold truncate">
                          {step.agentName}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {step.title}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Navigation Tabs for Output Sections */}
            <div className="flex items-center justify-between px-6 border-b border-slate-800 bg-[#0e1422] overflow-x-auto">
              <div className="flex items-center gap-1 py-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('synthesis')}
                  className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === 'synthesis'
                      ? 'border-indigo-500 text-white font-semibold'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Executive Synthesis</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('market')}
                  className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === 'market'
                      ? 'border-indigo-500 text-white font-semibold'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Market Intelligence</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('opportunity')}
                  className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === 'opportunity'
                      ? 'border-indigo-500 text-white font-semibold'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Target className="w-3.5 h-3.5 text-amber-400" />
                  <span>Opportunity Hunter</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('prospect')}
                  className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === 'prospect'
                      ? 'border-indigo-500 text-white font-semibold'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Prospect Intel</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('portfolio')}
                  className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === 'portfolio'
                      ? 'border-indigo-500 text-white font-semibold'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5 text-purple-400" />
                  <span>Portfolio Strategy</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('hierarchy')}
                  className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === 'hierarchy'
                      ? 'border-indigo-500 text-white font-semibold'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Database className="w-3.5 h-3.5 text-blue-400" />
                  <span>Delegation Tree</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('json')}
                  className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === 'json'
                      ? 'border-indigo-500 text-white font-semibold'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>Raw JSON</span>
                </button>
              </div>

              {currentExecution && (
                <button
                  type="button"
                  onClick={handleCopyJson}
                  className="px-2.5 py-1 text-xs text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded flex items-center gap-1 transition-colors"
                  title="Copy full execution record as JSON"
                >
                  {copiedJson ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span className="text-[11px] font-mono">{copiedJson ? 'Copied' : 'JSON'}</span>
                </button>
              )}
            </div>

            {/* Structured Findings Canvas */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6">
              {!currentExecution ? (
                <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-800 rounded-xl bg-[#090d15]/50">
                  <Bot className="w-12 h-12 text-slate-600 mb-3" />
                  <h3 className="text-sm font-semibold text-slate-200">
                    No Workflow Execution Selected
                  </h3>
                  <p className="text-xs text-slate-400 max-w-md mt-1 mb-4">
                    Configure your mission parameters in the left panel and click &quot;Dispatch 4-Agent Coordinated Pipeline&quot; to begin autonomous market research, prospect analysis, and venture synthesis.
                  </p>
                  <button
                    type="button"
                    onClick={handleLaunch}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Run Default Pipeline</span>
                  </button>
                </div>
              ) : (
                <>
                  {/* TAB 1: EXECUTIVE SYNTHESIS */}
                  {activeTab === 'synthesis' && (
                    <div className="space-y-5">
                      {synthesisData ? (
                        <>
                          <div className="p-4 rounded-lg bg-indigo-950/30 border border-indigo-800/50 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-mono font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5" />
                                Master Orchestrator Briefing · Atlas
                              </span>
                              <span className="text-xs font-mono text-emerald-400">
                                Impact: {synthesisData.commercialImpactEstimate}
                              </span>
                            </div>
                            <h3 className="text-base font-bold text-slate-100">
                              {synthesisData.executiveSummary}
                            </h3>
                            <p className="text-xs text-slate-300 leading-relaxed">
                              Risk Assessment: {synthesisData.riskAssessment}
                            </p>
                          </div>

                          {/* Key Findings List */}
                          <div>
                            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                              <span>Core Cross-Agent Findings</span>
                              <span className="text-[11px] font-mono text-slate-400">
                                ({synthesisData.keyFindings?.length || 0})
                              </span>
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {synthesisData.keyFindings?.map((finding: string, i: number) => (
                                <div
                                  key={i}
                                  className="p-3 bg-[#090d16] border border-slate-800 rounded-lg text-xs text-slate-200 flex items-start gap-2.5"
                                >
                                  <span className="w-5 h-5 rounded bg-indigo-950/80 text-indigo-400 font-mono text-[10px] flex items-center justify-center shrink-0 border border-indigo-800/60">
                                    0{i + 1}
                                  </span>
                                  <span className="leading-relaxed">{finding}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Recommended Initiatives */}
                          <div>
                            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                              Recommended Initiatives & Next Steps
                            </h4>
                            <div className="space-y-2">
                              {synthesisData.recommendedInitiatives?.map((init: string, i: number) => (
                                <div
                                  key={i}
                                  className="p-3 bg-[#090d16] border border-slate-800 rounded-lg flex items-center justify-between gap-4 text-xs"
                                >
                                  <div className="flex items-center gap-3">
                                    <span className="text-slate-500 font-mono text-[11px] font-bold">
                                      #{i + 1}
                                    </span>
                                    <span className="text-slate-200 font-medium">{init}</span>
                                  </div>
                                  <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-slate-800 text-indigo-300 border border-slate-700 shrink-0">
                                    Strategic Action
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="p-8 text-center text-xs text-slate-400 border border-slate-800 rounded-lg bg-[#090d15]/50">
                          Synthesis in progress. Atlas will formulate final executive recommendations once all agent steps conclude.
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 2: MARKET INTELLIGENCE (Sentry) */}
                  {activeTab === 'market' && (
                    <div className="space-y-5">
                      {marketData ? (
                        <>
                          <div className="p-4 bg-[#090d16] border border-slate-800 rounded-lg">
                            <div className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider mb-1">
                              Market Overview · Sentry (MKT-INTEL)
                            </div>
                            <h3 className="text-sm font-semibold text-slate-100 mb-2">
                              {marketData.marketOverview}
                            </h3>
                            <div className="text-xs text-slate-300">
                              <span className="font-semibold text-slate-400">Target Audience: </span>
                              {marketData.targetAudience}
                            </div>
                          </div>

                          {/* Customer Pain Points */}
                          <div>
                            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                              Validated Customer Pain Points
                            </h4>
                            <div className="space-y-2">
                              {marketData.customerPainPoints?.map((pain: string, i: number) => (
                                <div
                                  key={i}
                                  className="p-3 bg-[#090d16] border border-slate-800 rounded-lg flex items-start gap-3 text-xs"
                                >
                                  <span className="text-slate-500 font-mono text-[10px] font-bold">0{i + 1}</span>
                                  <span className="text-slate-200">{pain}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Competitor Landscape */}
                          <div>
                            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                              Competitor Landscape & Weaknesses
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {marketData.competitorLandscape?.map((c: CompetitorTeardown, i: number) => (
                                <div key={i} className="p-3 bg-[#090d16] border border-slate-800 rounded-lg text-xs space-y-1.5">
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-slate-200">{c.competitorName}</span>
                                    {c.marketShareEstimate && (
                                      <span className="font-mono text-[10px] text-slate-400">{c.marketShareEstimate}</span>
                                    )}
                                  </div>
                                  <div className="text-slate-300 text-[11px]">
                                    <span className="text-slate-500">Strengths: </span>
                                    {c.keyStrengths}
                                  </div>
                                  <div className="text-[11px] text-emerald-400">
                                    <span className="text-slate-500">Weaknesses: </span>
                                    {c.keyWeaknesses}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Market Opportunities */}
                          <div>
                            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                              Market Opportunities & Recommended Next Steps
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="p-3 bg-[#090d16] border border-slate-800 rounded-lg space-y-1 text-xs">
                                <div className="font-semibold text-emerald-400">Opportunities</div>
                                <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                                  {marketData.marketOpportunities?.map((opp: string, i: number) => (
                                    <li key={i}>{opp}</li>
                                  ))}
                                </ul>
                              </div>
                              <div className="p-3 bg-[#090d16] border border-slate-800 rounded-lg space-y-1 text-xs">
                                <div className="font-semibold text-indigo-400">Next Steps</div>
                                <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                                  {marketData.recommendedNextSteps?.map((step: string, i: number) => (
                                    <li key={i}>{step}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>

                          {/* Evidence and Sources */}
                          <div className="p-3 bg-[#090d16] border border-slate-800 rounded-lg space-y-2">
                            <div className="text-xs font-semibold text-slate-300">Supporting Evidence & Citations</div>
                            <div className="flex flex-wrap gap-2">
                              {marketData.evidenceAndSources?.map((source: IntelligenceSourceCitation, i: number) => (
                                <span key={i} className="px-2 py-1 bg-slate-800/80 border border-slate-700 rounded text-[11px] font-mono text-slate-300">
                                  {source.title} ({source.verificationConfidence})
                                </span>
                              ))}
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="p-8 text-center text-xs text-slate-400 border border-slate-800 rounded-lg">
                          No market intelligence output generated yet.
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 3: OPPORTUNITY HUNTER (Scout) */}
                  {activeTab === 'opportunity' && (
                    <div className="space-y-5">
                      {oppData ? (
                        <>
                          <div className="p-4 bg-[#090d16] border border-slate-800 rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider">
                                Opportunity Hunter · Scout (OPP-HUNTER)
                              </span>
                              <span className="text-xs font-mono text-emerald-400">
                                Potential Value: {oppData.potentialValue}
                              </span>
                            </div>
                            <h3 className="text-sm font-semibold text-slate-100">
                              {oppData.opportunityTitle}
                            </h3>
                            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                              {oppData.description}
                            </p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                            <div className="p-3 bg-[#090d16] border border-slate-800 rounded-lg space-y-1">
                              <div className="text-slate-400">Target Market</div>
                              <div className="font-semibold text-slate-200">{oppData.targetMarket}</div>
                            </div>
                            <div className="p-3 bg-[#090d16] border border-slate-800 rounded-lg space-y-1">
                              <div className="text-slate-400">Relevant Product Match</div>
                              <div className="font-semibold text-indigo-400">{oppData.relevantProduct}</div>
                            </div>
                          </div>

                          {/* Recommended Action & Evidence */}
                          <div className="p-3.5 bg-amber-950/20 border border-amber-800/40 rounded-lg text-xs space-y-1.5">
                            <div className="font-semibold text-amber-400">Recommended Action</div>
                            <div className="text-slate-200">{oppData.recommendedAction}</div>
                          </div>

                          <div className="p-3 bg-[#090d16] border border-slate-800 rounded-lg space-y-1 text-xs">
                            <div className="font-semibold text-slate-300">Supporting Evidence</div>
                            <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
                              {oppData.supportingEvidence?.map((ev: string, i: number) => (
                                <li key={i}>{ev}</li>
                              ))}
                            </ul>
                          </div>
                        </>
                      ) : (
                        <div className="p-8 text-center text-xs text-slate-400 border border-slate-800 rounded-lg">
                          No opportunity intelligence generated yet.
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 4: PROSPECT INTEL (Vanguard) */}
                  {activeTab === 'prospect' && (
                    <div className="space-y-5">
                      {prospectData ? (
                        <>
                          <div className="p-4 bg-[#090d16] border border-slate-800 rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider">
                                Prospect Intelligence · Vanguard (PRSP-INTEL)
                              </span>
                              <span className="text-xs font-mono font-bold text-indigo-400">
                                Qualification Score: {prospectData.qualificationScore}/100
                              </span>
                            </div>
                            <h3 className="text-base font-bold text-slate-100">
                              {prospectData.organizationName}
                            </h3>
                            <div className="text-xs text-slate-400 mt-1">
                              Industry: {prospectData.industry} · Source: {prospectData.websiteOrPublicSource}
                            </div>
                            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                              {prospectData.businessOverview}
                            </p>
                          </div>

                          {/* Identified Needs */}
                          <div>
                            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                              Identified Enterprise Needs
                            </h4>
                            <div className="space-y-2">
                              {prospectData.identifiedNeeds?.map((need: string, i: number) => (
                                <div key={i} className="p-2.5 bg-[#090d16] border border-slate-800 rounded text-xs text-slate-300 flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                                  <span>{need}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Recommended Approach Vector */}
                          <div className="p-3.5 bg-cyan-950/20 border border-cyan-800/40 rounded-lg text-xs space-y-1.5">
                            <div className="font-semibold text-cyan-400">Recommended Executive Outreach Approach</div>
                            <div className="text-slate-300 leading-relaxed font-mono text-[11px]">
                              {prospectData.recommendedApproach}
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="p-8 text-center text-xs text-slate-400 border border-slate-800 rounded-lg">
                          No prospect intelligence generated yet.
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 5: PORTFOLIO STRATEGY (Foundry) */}
                  {activeTab === 'portfolio' && (
                    <div className="space-y-5">
                      {portfolioData ? (
                        <>
                          <div className="p-4 bg-[#090d16] border border-slate-800 rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[11px] font-mono text-purple-400 uppercase tracking-wider">
                                Portfolio Strategist · Foundry (PORT-STRAT)
                              </span>
                              <span className="text-xs font-mono font-bold text-emerald-400">
                                Product Evaluated: {portfolioData.product}
                              </span>
                            </div>
                            <h3 className="text-sm font-semibold text-slate-100 mb-2">
                              Value Proposition: {portfolioData.coreValueProposition}
                            </h3>
                            <div className="text-xs text-slate-300">
                              <span className="font-semibold text-slate-400">Market Positioning: </span>
                              {portfolioData.marketPositioning}
                            </div>
                          </div>

                          {/* Recommended Improvements */}
                          <div>
                            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                              Recommended Roadmap Improvements
                            </h4>
                            <div className="space-y-2">
                              {portfolioData.recommendedImprovements?.map((imp: string, i: number) => (
                                <div key={i} className="p-3 bg-[#090d16] border border-slate-800 rounded-lg text-xs flex items-center justify-between gap-4">
                                  <span className="text-slate-200">{imp}</span>
                                  <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-slate-800 text-purple-300 border border-slate-700 shrink-0 uppercase">
                                    Roadmap Item
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="p-8 text-center text-xs text-slate-400 border border-slate-800 rounded-lg">
                          No portfolio strategy output generated yet.
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 6: DELEGATION TREE & ORGANIZATIONAL MEMORY */}
                  {activeTab === 'hierarchy' && (
                    <div className="space-y-5">
                      <div className="p-4 bg-[#090d16] border border-slate-800 rounded-lg">
                        <div className="text-[11px] font-mono text-indigo-400 uppercase tracking-wider mb-1">
                          Parent & Subtask Delegation Chain
                        </div>
                        <p className="text-xs text-slate-400">
                          Traceable execution tree linking master orchestration, delegated subtasks, and verified knowledge memory ingestion.
                        </p>
                      </div>

                      <div className="space-y-3 font-mono text-xs">
                        <div className="p-3 bg-slate-900 border border-indigo-600/40 rounded-lg">
                          <div className="flex items-center justify-between text-slate-300">
                            <span className="font-bold text-white">MASTER WORKFLOW PIPELINE: {currentExecution.id}</span>
                            <span className="text-[11px] text-indigo-400">Atlas Orchestrator</span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-1">
                            {currentExecution.title}
                          </div>
                        </div>

                        <div className="pl-6 border-l-2 border-indigo-500/40 space-y-3">
                          {currentExecution.steps.map((st) => (
                            <div key={st.stepIndex} className="p-3 bg-[#090d16] border border-slate-800 rounded-lg text-slate-300 space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-slate-200">
                                  Step {st.stepIndex}: {st.agentName} ({st.agentRole})
                                </span>
                                <span className={`text-[10px] px-2 py-0.5 rounded uppercase ${
                                  st.status === 'COMPLETED' ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-800 text-slate-400'
                                }`}>
                                  {st.status}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-400 flex items-center gap-4">
                                <span>Task: {st.taskId || 'delegated-subtask'}</span>
                                <span>Duration: {st.durationMs ? `${st.durationMs}ms` : 'N/A'}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 7: RAW JSON INSPECTOR */}
                  {activeTab === 'json' && (
                    <div className="bg-[#070b12] border border-slate-800 rounded-lg p-4 font-mono text-xs text-slate-300 overflow-x-auto max-h-[480px]">
                      <pre>{JSON.stringify(currentExecution, null, 2)}</pre>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Bottom Decision Footer: Operator Human Approval Gate */}
            {currentExecution && (
              <div className="px-6 py-4 bg-[#0a0f19] border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="text-xs text-slate-400">
                    <span className="font-semibold text-slate-300">Human Governance Gate: </span>
                    {currentExecution.status === 'WAITING_FOR_APPROVAL'
                      ? 'Review structured findings before approving deployment'
                      : currentExecution.status === 'COMPLETED'
                      ? 'Approved by Human Operator'
                      : 'Workflow in progression'}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {currentExecution.status === 'WAITING_FOR_APPROVAL' && (
                    <>
                      {showRevisionInput ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={revisionNotes}
                            onChange={(e) => setRevisionNotes(e.target.value)}
                            placeholder="Specify revision instructions..."
                            className="px-2.5 py-1.5 bg-[#0c121d] border border-slate-700 rounded text-xs text-slate-200 w-56"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              rejectWorkflow(currentExecution.id, revisionNotes);
                              setShowRevisionInput(false);
                            }}
                            className="px-3 py-1.5 text-xs font-semibold text-rose-300 bg-rose-950 hover:bg-rose-900 border border-rose-800 rounded transition-colors"
                          >
                            Submit Rejection
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowRevisionInput(false)}
                            className="p-1.5 text-slate-400 hover:text-slate-200"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setShowRevisionInput(true)}
                          className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors"
                        >
                          Request Revision
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => approveWorkflow(currentExecution.id, 'Approved by Human Operator for executive delivery')}
                        className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded flex items-center gap-1.5 transition-colors shadow-sm"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Authorize & Ingest Deliverable</span>
                      </button>
                    </>
                  )}

                  {currentExecution.status === 'COMPLETED' && (
                    <button
                      type="button"
                      onClick={handleLaunch}
                      className="px-3 py-1.5 text-xs text-indigo-300 hover:text-white bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 rounded flex items-center gap-1.5 transition-colors"
                    >
                      <RotateCw className="w-3 h-3" />
                      <span>Rerun Pipeline</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
