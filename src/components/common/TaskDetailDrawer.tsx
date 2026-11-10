import React, { useState } from 'react';
import {
  X,
  CheckCircle,
  Clock,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  AlertOctagon,
  BookOpen,
  Cpu,
  Layers,
  Ban
} from 'lucide-react';
import { Task, TaskStatus } from '../../types';
import { useOrchestra } from '../../context/OrchestraContext';

export const TaskDetailDrawer: React.FC = () => {
  const {
    activeTaskForDrawer,
    setActiveTaskForDrawer,
    agents,
    ventures,
    intelligence,
    approveTask,
    rejectTask,
    updateTaskStatus,
    reassignTask
  } = useOrchestra();

  const [approvalFeedback, setApprovalFeedback] = useState('');
  const [showReassignSelect, setShowReassignSelect] = useState(false);

  if (!activeTaskForDrawer) return null;
  const task = activeTaskForDrawer;
  const venture = ventures.find(v => v.id === task.ventureId);
  const assignedAgent = agents.find(a => a.id === task.assignedAgentId);
  const linkedBriefs = intelligence.filter(i => (task.relatedKnowledgeIds || []).includes(i.id));

  const handleApprove = () => {
    approveTask(task.id, approvalFeedback);
    setApprovalFeedback('');
  };

  const handleReject = () => {
    rejectTask(task.id, approvalFeedback);
    setApprovalFeedback('');
  };

  const standardStatuses: TaskStatus[] = [
    'PENDING',
    'ASSIGNED',
    'RUNNING',
    'WAITING_FOR_APPROVAL',
    'COMPLETED',
    'FAILED',
    'CANCELLED'
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
      <div
        className="fixed inset-0"
        onClick={() => setActiveTaskForDrawer(null)}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-2xl bg-[#0b101b] border-l border-slate-800 h-full shadow-2xl flex flex-col z-10 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-start justify-between bg-[#0e1422]">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1 font-mono">
              <span>{task.id}</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-300 font-sans">{venture?.name || 'General Portfolio'}</span>
              <span aria-hidden="true">·</span>
              <span className="capitalize">{task.priority} priority</span>
            </div>
            <h2 className="text-lg font-semibold text-slate-100 tracking-tight leading-snug">
              {task.title}
            </h2>
          </div>
          <button
            onClick={() => setActiveTaskForDrawer(null)}
            className="p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded transition-colors"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Status & Assignment Banner */}
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-md flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs text-slate-400 mb-1">Execution Status</div>
              <div className="text-sm font-medium text-slate-200 flex items-center gap-2">
                {task.status === 'WAITING_FOR_APPROVAL' && (
                  <span className="text-amber-400 flex items-center gap-1.5">
                    <Clock className="w-4 h-4" /> Awaiting Human Review
                  </span>
                )}
                {task.status === 'RUNNING' && (
                  <span className="text-blue-400 flex items-center gap-1.5">
                    <Clock className="w-4 h-4" /> Running
                  </span>
                )}
                {task.status === 'ASSIGNED' && (
                  <span className="text-indigo-400 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4" /> Assigned
                  </span>
                )}
                {task.status === 'PENDING' && (
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-4 h-4" /> Pending
                  </span>
                )}
                {task.status === 'COMPLETED' && (
                  <span className="text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" /> Completed
                  </span>
                )}
                {task.status === 'FAILED' && (
                  <span className="text-rose-400 flex items-center gap-1.5">
                    <AlertOctagon className="w-4 h-4" /> Failed
                  </span>
                )}
                {task.status === 'CANCELLED' && (
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Ban className="w-4 h-4" /> Cancelled
                  </span>
                )}
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-400 mb-1">Delegated Agent</div>
              {showReassignSelect ? (
                <div className="flex items-center gap-2">
                  <select
                    className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded px-2 py-1"
                    defaultValue={task.assignedAgentId || ''}
                    onChange={(e) => {
                      if (e.target.value) reassignTask(task.id, e.target.value);
                      setShowReassignSelect(false);
                    }}
                  >
                    <option value="" disabled>Select agent</option>
                    {agents.map(a => (
                      <option key={a.id} value={a.id}>{a.name} ({a.department})</option>
                    ))}
                  </select>
                  <button
                    onClick={() => setShowReassignSelect(false)}
                    className="text-xs text-slate-400 hover:text-slate-200"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-200">
                    {assignedAgent ? `${assignedAgent.name} (${assignedAgent.code})` : 'Unassigned'}
                  </span>
                  <button
                    onClick={() => setShowReassignSelect(true)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 underline"
                  >
                    Reassign
                  </button>
                </div>
              )}
            </div>

            <div>
              <div className="text-xs text-slate-400 mb-1">Approval Gate</div>
              <div className="text-sm font-mono text-slate-300">
                {task.approvalRequired ? (
                  task.approvalStatus === 'approved' ? (
                    <span className="text-emerald-400">Approved</span>
                  ) : task.approvalStatus === 'rejected' ? (
                    <span className="text-rose-400">Revision Requested</span>
                  ) : (
                    <span className="text-amber-400">Required</span>
                  )
                ) : (
                  <span className="text-slate-400">Autonomous</span>
                )}
              </div>
            </div>
          </div>

          {/* Timestamps Strip */}
          <div className="grid grid-cols-3 gap-3 p-3 bg-slate-900/40 border border-slate-800/80 rounded text-xs font-mono">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Created</span>
              <span className="text-slate-300">{new Date(task.createdAt).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Started</span>
              <span className="text-slate-300">{task.startedAt ? new Date(task.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Completed</span>
              <span className="text-slate-300">{task.completedAt ? new Date(task.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</span>
            </div>
          </div>

          {/* Task Description */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 tracking-wider uppercase mb-2">
              Objective & Detailed Description
            </h4>
            <div className="text-sm text-slate-300 leading-relaxed bg-slate-900/30 p-4 rounded border border-slate-800/80">
              {task.description}
            </div>
          </div>

          {/* Error Information (if failed) */}
          {task.errorInfo && (
            <div className="p-4 bg-rose-950/20 border border-rose-900/50 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-rose-300 text-xs font-semibold">
                <AlertOctagon className="w-4 h-4 text-rose-400" />
                <span>Execution Error: {task.errorInfo.code}</span>
              </div>
              <p className="text-xs text-rose-200">{task.errorInfo.message}</p>
              {task.errorInfo.details && (
                <div className="p-2.5 bg-black/40 rounded border border-rose-900/40 text-[11px] font-mono text-rose-300 whitespace-pre-wrap">
                  {task.errorInfo.details}
                </div>
              )}
              <div className="text-[10px] text-rose-400/80 font-mono">
                Recoverable: {task.errorInfo.recoverable ? 'Yes' : 'No'} · Logged at {task.errorInfo.timestamp}
              </div>
            </div>
          )}

          {/* Execution Results (if present) */}
          {task.executionResults && (
            <div className="p-4 bg-indigo-950/20 border border-indigo-900/40 rounded-lg space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-indigo-300 font-semibold flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-indigo-400" />
                  Execution Result Record
                </span>
                <span className="font-mono text-slate-400 text-[11px]">
                  Completed at {new Date(task.executionResults.completedAt).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {task.executionResults.outputSummary}
              </p>
              {task.executionResults.metrics && (
                <div className="flex items-center gap-4 pt-2 border-t border-indigo-900/30 text-[11px] font-mono text-slate-400">
                  {task.executionResults.metrics.durationMs && (
                    <span>Duration: <strong className="text-slate-200">{task.executionResults.metrics.durationMs}ms</strong></span>
                  )}
                  {task.executionResults.metrics.tokensConsumed && (
                    <span>Tokens: <strong className="text-slate-200">{task.executionResults.metrics.tokensConsumed}</strong></span>
                  )}
                  {task.executionResults.metrics.confidenceScore && (
                    <span>Confidence: <strong className="text-emerald-400">{(task.executionResults.metrics.confidenceScore * 100).toFixed(0)}%</strong></span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Linked Shared Organizational Memory */}
          {linkedBriefs.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-300 tracking-wider uppercase mb-2 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                Linked Organizational Memory ({linkedBriefs.length})
              </h4>
              <div className="space-y-2">
                {linkedBriefs.map(brief => (
                  <div key={brief.id} className="p-3 bg-slate-900/60 border border-slate-800 rounded text-xs space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>{brief.category.replace('_', ' ')}</span>
                      <span>{brief.verifiedByHuman ? 'Verified' : 'Provisional'}</span>
                    </div>
                    <div className="font-medium text-slate-200">{brief.title}</div>
                    <div className="text-slate-400 text-[11px] line-clamp-1">{brief.summary}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Generated Deliverables (Agent Output) */}
          {task.deliverables && task.deliverables.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold text-slate-300 tracking-wider uppercase">
                  Generated Deliverables ({task.deliverables.length})
                </h4>
                <span className="text-xs text-indigo-400 font-mono">Artifact Ready</span>
              </div>
              <div className="space-y-3">
                {task.deliverables.map((d, idx) => (
                  <div key={idx} className="bg-slate-900/80 border border-slate-800 rounded-md p-4">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span className="font-semibold text-slate-200">{d.title}</span>
                      <span className="font-mono uppercase text-slate-400">{d.type}</span>
                    </div>
                    <p className="text-xs text-slate-300 mb-3 italic">{d.summary}</p>
                    <div className="p-3 bg-black/40 rounded border border-slate-800/60 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                      {d.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Human Review & Approval Action Area */}
          {task.approvalRequired && task.status === 'WAITING_FOR_APPROVAL' && (
            <div className="p-4 bg-amber-950/20 border border-amber-900/40 rounded-lg">
              <div className="flex items-center gap-2 text-amber-300 font-semibold text-sm mb-1">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                Human Supervisory Decision Gate
              </div>
              <p className="text-xs text-amber-200/80 mb-3">
                This deliverable requires human review before dispatch or production publication in accordance with ORCHESTRA Governance Policy.
              </p>
              <textarea
                value={approvalFeedback}
                onChange={(e) => setApprovalFeedback(e.target.value)}
                placeholder="Optional supervisory notes or specific revision instructions..."
                className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 mb-3 resize-none h-18"
              />
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleApprove}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded flex items-center gap-1.5 transition-colors"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  Authorize & Approve
                </button>
                <button
                  type="button"
                  onClick={handleReject}
                  className="px-3.5 py-2 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800 text-xs font-medium rounded transition-colors"
                >
                  Request Revision
                </button>
              </div>
            </div>
          )}

          {/* Manual Status Overrides for Operator */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 tracking-wider uppercase mb-2">
              Operator Status Transition
            </h4>
            <div className="flex flex-wrap items-center gap-2">
              {standardStatuses.map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => updateTaskStatus(task.id, st)}
                  className={`px-3 py-1 text-xs rounded transition-colors font-mono ${
                    task.status === st
                      ? 'bg-slate-700 text-white font-medium border border-slate-600'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  Mark {st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Audit Trail */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 tracking-wider uppercase mb-2">
              Operational Audit Trail
            </h4>
            <div className="space-y-2 border-l border-slate-800 ml-2 pl-4">
              {task.auditLogs.map((log) => (
                <div key={log.id} className="relative text-xs">
                  <div className="text-slate-400 font-mono text-[11px] mb-0.5">
                    {log.timestamp} · <span className="text-slate-200 font-sans">{log.actor}</span>
                  </div>
                  <div className="text-slate-300">{log.action}</div>
                  {log.notes && (
                    <div className="text-slate-400 italic text-[11px] mt-0.5">{log.notes}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-[#0e1422] flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono">Created {new Date(task.createdAt).toLocaleDateString()}</span>
          <button
            onClick={() => setActiveTaskForDrawer(null)}
            className="px-3 py-1.5 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 rounded transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
