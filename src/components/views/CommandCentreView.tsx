import React from 'react';
import {
  ShieldAlert,
  ArrowRight,
  Bot,
  Activity,
  Layers,
  CheckCircle,
  Clock,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { useOrchestra } from '../../context/OrchestraContext';

export const CommandCentreView: React.FC = () => {
  const {
    tasks,
    agents,
    ventures,
    systemEvents,
    activeVentureFilter,
    pendingApprovalsCount,
    setActiveTaskForDrawer,
    setActiveAgentForDrawer,
    setActiveSection,
    setIsWorkflowModalOpen,
    setPreselectedAgentForWorkflow,
    approvals,
    setIsApprovalModalOpen
  } = useOrchestra();

  const filteredTasks = tasks.filter(t => activeVentureFilter === 'all' || t.ventureId === activeVentureFilter);
  const filteredVentures = ventures.filter(v => activeVentureFilter === 'all' || v.id === activeVentureFilter);

  const pendingApprovalTasks = filteredTasks.filter(t => t.status === 'WAITING_FOR_APPROVAL' || t.approvalStatus === 'pending');
  const pendingCommercialApprovals = approvals.filter(a => a.decision === 'PENDING');
  const inProgressTasks = filteredTasks.filter(t => t.status === 'RUNNING' || t.status === 'ASSIGNED');
  const activeAgentsCount = agents.filter(a => a.status === 'executing' || a.status === 'idle').length;

  return (
    <div className="space-y-6">
      {/* Top Banner / Mission Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight">
            Central Operational Command
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time multi-venture orchestration, supervisory decision gates, and digital workforce coordination.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setPreselectedAgentForWorkflow(null);
              setIsWorkflowModalOpen(true);
            }}
            className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <span>Launch Pipeline</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <div className="flex items-center gap-2 text-xs border-l border-slate-800 pl-3">
            <span className="text-slate-400">System State:</span>
            <span className="font-mono text-emerald-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Nominal · Autonomy Enforced
            </span>
          </div>
        </div>
      </div>

      {/* Top Metric Strip (Tabular Figures) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-[#0c121d] border border-slate-800 rounded-lg">
          <div className="text-xs text-slate-400 mb-1">Human Decision Queue</div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-bold font-mono tabular-nums ${pendingApprovalsCount > 0 ? 'text-amber-400' : 'text-slate-200'}`}>
              {pendingApprovalsCount}
            </span>
            <span className="text-xs text-slate-400">awaiting signoff</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            {pendingApprovalsCount > 0 ? 'Action required before dispatch' : 'No execution bottlenecks'}
          </div>
        </div>

        <div className="p-4 bg-[#0c121d] border border-slate-800 rounded-lg">
          <div className="text-xs text-slate-400 mb-1">Active Workforce</div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-100">
              {activeAgentsCount}
            </span>
            <span className="text-xs text-slate-400 font-mono">/ {agents.length} agents ready</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            Multi-model routing active
          </div>
        </div>

        <div className="p-4 bg-[#0c121d] border border-slate-800 rounded-lg">
          <div className="text-xs text-slate-400 mb-1">Tasks in Pipeline</div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-100">
              {inProgressTasks.length}
            </span>
            <span className="text-xs text-slate-400 font-mono">executing now</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            {filteredTasks.length} total operational tasks
          </div>
        </div>

        <div className="p-4 bg-[#0c121d] border border-slate-800 rounded-lg">
          <div className="text-xs text-slate-400 mb-1">Managed Ventures</div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-100">
              {ventures.length}
            </span>
            <span className="text-xs text-slate-400">portfolio products</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            Across FinOps, CDC & Graph AI
          </div>
        </div>
      </div>

      {/* Critical Section 1: Human Approval Gate */}
      {(pendingApprovalTasks.length > 0 || pendingCommercialApprovals.length > 0) && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-semibold text-slate-100 tracking-tight">
                Supervisory Decision Gate ({pendingApprovalTasks.length + pendingCommercialApprovals.length})
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {pendingCommercialApprovals.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsApprovalModalOpen(true)}
                  className="px-2.5 py-1 text-xs font-semibold text-amber-300 bg-amber-950/80 hover:bg-amber-900 border border-amber-700 rounded transition-colors"
                >
                  Review {pendingCommercialApprovals.length} Commercial Action{pendingCommercialApprovals.length > 1 ? 's' : ''} →
                </button>
              )}
              <span className="text-xs text-slate-400">
                Autonomous execution paused until human authorization
              </span>
            </div>
          </div>

          <div className="space-y-2">
            {pendingApprovalTasks.map((task) => {
              const v = ventures.find(item => item.id === task.ventureId);
              const agt = agents.find(item => item.id === task.assignedAgentId);
              const deliverable = task.deliverables?.[0];

              return (
                <div
                  key={task.id}
                  className="p-4 bg-amber-950/15 border border-amber-900/40 rounded-lg hover:border-amber-700/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                      <span>{task.id}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-slate-300 font-sans">{v?.name || 'Venture'}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-amber-400 font-sans">Delegated to {agt?.name || 'Agent'}</span>
                    </div>

                    <h3 className="text-sm font-semibold text-slate-100 truncate">
                      {task.title}
                    </h3>

                    {deliverable && (
                      <p className="text-xs text-slate-300 italic line-clamp-1">
                        Artifact ready: {deliverable.title} — {deliverable.summary}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={() => setActiveTaskForDrawer(task)}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded flex items-center gap-1.5 transition-colors"
                    >
                      <span>Inspect & Sign Off</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Main Grid: Active Workstreams & System Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Active Operations Queue */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-100 tracking-tight flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400" />
              Active Workstreams & Tasks
            </h2>
            <button
              onClick={() => setActiveSection('operations')}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
            >
              <span>View Operations Queue</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="bg-[#0c121d] border border-slate-800 rounded-lg divide-y divide-slate-800/80 overflow-hidden">
            {filteredTasks.slice(0, 5).map((task) => {
              const v = ventures.find(item => item.id === task.ventureId);
              const agt = agents.find(item => item.id === task.assignedAgentId);

              return (
                <div
                  key={task.id}
                  onClick={() => setActiveTaskForDrawer(task)}
                  className="p-3.5 hover:bg-slate-900/60 transition-colors cursor-pointer flex items-center justify-between gap-4 group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mb-1">
                      <span>{task.id}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-slate-300 font-sans">{v?.name}</span>
                      <span aria-hidden="true">·</span>
                      <span className="capitalize">{task.priority} Priority</span>
                    </div>

                    <div className="text-xs font-medium text-slate-200 group-hover:text-indigo-300 transition-colors truncate">
                      {task.title}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 text-right">
                    <div className="hidden sm:block text-[11px] text-slate-400">
                      <div>{agt?.name || 'Unassigned'}</div>
                      <div className="capitalize text-slate-400">{task.status.replace('_', ' ')}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-300 transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Portfolio Snapshot Strip */}
          <div className="pt-2 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-100 tracking-tight flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                Venture Operations Summary
              </h2>
              <button
                onClick={() => setActiveSection('portfolio')}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
              >
                <span>All Ventures</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {filteredVentures.map((v) => (
                <div
                  key={v.id}
                  className="p-3.5 bg-[#0c121d] border border-slate-800 rounded-lg hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-200">{v.name}</span>
                    <span className="font-mono text-[10px] text-slate-400 uppercase">{v.stage}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mb-3">
                    {v.tagline}
                  </p>
                  <div className="pt-2 border-t border-slate-800/80 text-[11px] flex items-center justify-between">
                    <span className="text-slate-400">{v.primaryMetricLabel}</span>
                    <span className="font-mono text-slate-200 font-semibold tabular-nums">{v.primaryMetricValue}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 span): System Events & Workforce Overview */}
        <div className="space-y-6">
          {/* Workforce Pod Status */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-100 tracking-tight flex items-center gap-2">
                <Bot className="w-4 h-4 text-indigo-400" />
                Agent Workforce Readiness
              </h2>
              <button
                onClick={() => setActiveSection('agent_workforce')}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
              >
                <span>Directory</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="bg-[#0c121d] border border-slate-800 rounded-lg divide-y divide-slate-800/80">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  onClick={() => setActiveAgentForDrawer(agent)}
                  className="p-3 hover:bg-slate-900/60 transition-colors cursor-pointer flex items-center justify-between text-xs group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-slate-300 font-mono text-[10px] shrink-0">
                      {agent.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-slate-200 group-hover:text-indigo-300 transition-colors truncate">
                        {agent.name}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {agent.role}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-[11px] font-mono text-slate-300 capitalize">
                      {agent.status.replace('_', ' ')}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {agent.autonomy.replace('_', ' ')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Audit Event Feed */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-100 tracking-tight flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              Organizational Event Log
            </h2>

            <div className="bg-[#0c121d] border border-slate-800 rounded-lg p-3 space-y-3 max-h-80 overflow-y-auto text-xs">
              {systemEvents.map((evt) => (
                <div key={evt.id} className="pb-2.5 border-b border-slate-800/60 last:border-b-0 last:pb-0">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mb-1">
                    <span className="text-slate-300 font-sans font-medium">{evt.title}</span>
                    <span>{evt.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {evt.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
