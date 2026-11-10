import { X, Bot, Shield, CheckCircle, Activity, Play, Pause, Sparkles, Layers, Edit3, Clock, Wrench, Cpu, Database, AlertTriangle, Key } from 'lucide-react';
import { AgentAutonomy } from '../../types';
import { useOrchestra } from '../../context/OrchestraContext';

export const AgentDetailDrawer: React.FC = () => {
  const {
    activeAgentForDrawer,
    setActiveAgentForDrawer,
    updateAgentAutonomy,
    toggleAgentStatus,
    setAgentBeingEdited,
    setIsEditAgentModalOpen,
    ventures,
    tasks,
    setActiveTaskForDrawer,
    toolRegistry
  } = useOrchestra();

  if (!activeAgentForDrawer) return null;
  const agent = activeAgentForDrawer;
  const assignedVentures = ventures.filter(v => agent.assignedVentureIds.includes(v.id));
  const agentTasks = tasks.filter(t => t.assignedAgentId === agent.id);

  const handleEditClick = () => {
    setAgentBeingEdited(agent);
    setIsEditAgentModalOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
      <div
        className="fixed inset-0"
        onClick={() => setActiveAgentForDrawer(null)}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-xl bg-[#0b101b] border-l border-slate-800 h-full shadow-2xl flex flex-col z-10 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-start justify-between bg-[#0e1422]">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200">
              <Bot className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-0.5">
                <span>{agent.code}</span>
                <span aria-hidden="true">·</span>
                <span>{agent.department}</span>
              </div>
              <h2 className="text-lg font-semibold text-slate-100 tracking-tight">
                {agent.name}
              </h2>
              <p className="text-xs text-slate-400">{agent.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleEditClick}
              className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded transition-colors flex items-center gap-1 text-xs"
              title="Edit Agent Details"
            >
              <Edit3 className="w-4 h-4 text-indigo-400" />
              <span className="hidden sm:inline">Edit</span>
            </button>
            <button
              onClick={() => setActiveAgentForDrawer(null)}
              className="p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded transition-colors"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Status & Control Bar */}
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-md flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400 mb-1">Operational State</div>
              <div className="text-sm font-medium flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${agent.status === 'executing' ? 'bg-indigo-400' : agent.status === 'awaiting_approval' ? 'bg-amber-400' : agent.status === 'paused' ? 'bg-rose-400' : 'bg-emerald-400'}`} />
                <span className="capitalize text-slate-200">{agent.status.replace('_', ' ')}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => toggleAgentStatus(agent.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded flex items-center gap-1.5 transition-colors ${
                agent.status === 'paused'
                  ? 'bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-emerald-300'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              {agent.status === 'paused' ? (
                <>
                  <Play className="w-3.5 h-3.5" /> Activate Agent
                </>
              ) : (
                <>
                  <Pause className="w-3.5 h-3.5" /> Deactivate / Pause
                </>
              )}
            </button>
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-900/40 border border-slate-800/80 rounded text-xs font-mono">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Registered At</span>
              <span className="text-slate-300">{new Date(agent.createdAt).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Last Configured</span>
              <span className="text-slate-300">{new Date(agent.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Autonomy Level Settings */}
          <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-md">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              <Shield className="w-4 h-4 text-indigo-400" />
              Human Governance & Autonomy Level
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Defines whether actions generated by {agent.name} can execute autonomously or require human verification.
            </p>

            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'full', label: 'Full Autonomy', desc: 'Auto-executes tasks' },
                  { id: 'approval_required', label: 'Approval Required', desc: 'Human gate before execution' },
                  { id: 'supervised', label: 'Supervised', desc: 'Step-by-step human review' }
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => updateAgentAutonomy(agent.id, opt.id as AgentAutonomy)}
                  className={`p-2.5 text-left rounded border transition-colors ${
                    agent.autonomy === opt.id
                      ? 'bg-indigo-950/40 border-indigo-500/60 text-slate-100 ring-1 ring-indigo-500/30'
                      : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-medium text-slate-200">{opt.label}</div>
                  <div className="text-[11px] text-slate-400 mt-1 leading-tight">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Description & Responsibilities */}
          <div className="space-y-3">
            <div>
              <h4 className="text-xs font-semibold text-slate-300 tracking-wider uppercase mb-1.5">
                Core Identity & Mission
              </h4>
              <div className="text-sm text-slate-300 bg-slate-900/30 p-4 rounded border border-slate-800/80 leading-relaxed">
                {agent.description}
              </div>
            </div>

            {agent.responsibilities && agent.responsibilities.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-slate-300 tracking-wider uppercase mb-1.5">
                  Assigned Responsibilities
                </h4>
                <ul className="bg-slate-900/30 p-3 rounded border border-slate-800/80 space-y-1 text-xs text-slate-300">
                  {agent.responsibilities.map((resp, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-indigo-400 font-mono">•</span>
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Runtime Model & Provider Specification */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 tracking-wider uppercase mb-2">
              Underlying Model Specification
            </h4>
            <div className="bg-slate-900/60 border border-slate-800 rounded-md p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">AI Provider</span>
                <span className="font-mono uppercase">{agent.provider}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Active Inference Model</span>
                <span className="font-mono text-indigo-400">{agent.model}</span>
              </div>
              {agent.modelConfig && (
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Inference Temperature / Tokens</span>
                  <span className="font-mono">{agent.modelConfig.temperature} / {agent.modelConfig.maxTokens}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Historical Reliability</span>
                <span className="font-mono tabular-nums text-emerald-400">{agent.reliabilityScore}%</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Lifetime Completed Tasks</span>
                <span className="font-mono tabular-nums">{agent.completedTasksTotal}</span>
              </div>
            </div>
          </div>

          {/* Capabilities */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 tracking-wider uppercase mb-2">
              Registered Capabilities
            </h4>
            <div className="flex flex-wrap gap-2">
              {agent.capabilities.map((cap, i) => (
                <div
                  key={i}
                  className="px-2.5 py-1 bg-slate-800/60 border border-slate-700/60 text-slate-300 text-xs rounded"
                >
                  {cap}
                </div>
              ))}
            </div>
          </div>

          {/* Intelligence Profile & Safety Guardrails */}
          {agent.intelligenceProfile && (
            <div className="space-y-3 pt-2 border-t border-slate-800/80">
              <h4 className="text-xs font-semibold text-slate-200 tracking-wider uppercase flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                Intelligence Profile & Safety Limits
              </h4>

              <div className="bg-[#090d15] border border-slate-800 rounded-md p-4 space-y-3 text-xs">
                {/* Operational Identity */}
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                    Operational Identity
                  </span>
                  <p className="text-slate-300 leading-relaxed bg-slate-900/50 p-2.5 rounded border border-slate-800/60">
                    {agent.intelligenceProfile.operationalIdentity}
                  </p>
                </div>

                {/* System Instruction */}
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                    System Instruction Directive
                  </span>
                  <p className="text-slate-300 leading-relaxed bg-slate-900/50 p-2.5 rounded border border-slate-800/60 font-mono text-[11px]">
                    {agent.intelligenceProfile.systemInstruction}
                  </p>
                </div>

                {/* Strategic Objectives */}
                {agent.intelligenceProfile.objectives && agent.intelligenceProfile.objectives.length > 0 && (
                  <div>
                    <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                      Strategic Objectives
                    </span>
                    <ul className="space-y-1 bg-slate-900/40 p-2.5 rounded border border-slate-800/60 text-slate-300">
                      {agent.intelligenceProfile.objectives.map((obj, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-emerald-400 font-bold">•</span>
                          <span>{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Authorized Tools */}
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1.5 flex items-center justify-between">
                    <span>Authorized Tools</span>
                    <span className="text-indigo-400 font-semibold">{agent.intelligenceProfile.authorizedToolIds.length} Granted</span>
                  </span>
                  <div className="space-y-1.5">
                    {agent.intelligenceProfile.authorizedToolIds.map((tid) => {
                      const toolDef = toolRegistry.getTool(tid);
                      return (
                        <div
                          key={tid}
                          className="flex items-center justify-between p-2 bg-slate-900/60 border border-slate-800 rounded"
                        >
                          <div className="flex items-center gap-2">
                            <Wrench className="w-3.5 h-3.5 text-indigo-400" />
                            <span className="font-medium text-slate-200">{toolDef?.name || tid}</span>
                          </div>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                            {toolDef?.permissionLevel || 'GATED'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Execution Limits & Memory */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/60 text-[11px] font-mono">
                  <div className="p-2 bg-slate-900/40 rounded border border-slate-800/40">
                    <span className="text-slate-400 block text-[10px] uppercase">Memory Access</span>
                    <span className="text-indigo-300 font-semibold">{agent.intelligenceProfile.memoryAccessLevel}</span>
                  </div>
                  <div className="p-2 bg-slate-900/40 rounded border border-slate-800/40">
                    <span className="text-slate-400 block text-[10px] uppercase">Timeout Policy</span>
                    <span className="text-slate-200 font-semibold">{agent.intelligenceProfile.executionLimits.timeoutMs}ms</span>
                  </div>
                  <div className="p-2 bg-slate-900/40 rounded border border-slate-800/40">
                    <span className="text-slate-400 block text-[10px] uppercase">Max Retries</span>
                    <span className="text-slate-200 font-semibold">{agent.intelligenceProfile.executionLimits.maxRetries}</span>
                  </div>
                  <div className="p-2 bg-slate-900/40 rounded border border-slate-800/40">
                    <span className="text-slate-400 block text-[10px] uppercase">Step Limit</span>
                    <span className="text-slate-200 font-semibold">{agent.intelligenceProfile.executionLimits.maxAutonomousSteps} steps</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Assigned Ventures */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 tracking-wider uppercase mb-2">
              Assigned Venture Workspaces
            </h4>
            <div className="space-y-2">
              {assignedVentures.map((v) => (
                <div key={v.id} className="p-3 bg-slate-900/50 border border-slate-800 rounded flex items-center justify-between text-xs">
                  <div>
                    <span className="font-medium text-slate-200">{v.name}</span>
                    <span className="text-slate-400 ml-2 font-mono capitalize">({v.stage})</span>
                  </div>
                  <span className="text-slate-400">{v.primaryMetricLabel}: <strong className="text-slate-200 font-mono tabular-nums">{v.primaryMetricValue}</strong></span>
                </div>
              ))}
            </div>
          </div>

          {/* Active Tasks Assigned */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 tracking-wider uppercase mb-2">
              Assigned Workload ({agentTasks.length})
            </h4>
            {agentTasks.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No tasks currently queued for this agent.</p>
            ) : (
              <div className="space-y-2">
                {agentTasks.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setActiveAgentForDrawer(null);
                      setActiveTaskForDrawer(t);
                    }}
                    className="w-full text-left p-3 bg-slate-900/50 hover:bg-slate-900 border border-slate-800 rounded text-xs transition-colors group"
                  >
                    <div className="flex items-center justify-between text-slate-400 mb-1">
                      <span className="font-mono">{t.id}</span>
                      <span className="capitalize">{t.status.replace('_', ' ')}</span>
                    </div>
                    <div className="font-medium text-slate-200 group-hover:text-indigo-400 transition-colors">
                      {t.title}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-[#0e1422] flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono">Last active {agent.lastActive}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleEditClick}
              className="px-3 py-1.5 text-xs text-indigo-300 bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-800/80 rounded transition-colors"
            >
              Edit Configuration
            </button>
            <button
              onClick={() => setActiveAgentForDrawer(null)}
              className="px-3 py-1.5 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 rounded transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
