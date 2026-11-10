import React, { useState } from 'react';
import { Menu, Search, Plus, Bell, ShieldAlert } from 'lucide-react';
import { useOrchestra } from '../../context/OrchestraContext';
import { Modal } from '../common/Modal';

interface HeaderProps {
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu }) => {
  const {
    activeSection,
    activeVentureFilter,
    ventures,
    pendingApprovalsCount,
    setIsCommandPaletteOpen,
    createTask,
    agents
  } = useOrchestra();

  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskVentureId, setTaskVentureId] = useState(ventures[0]?.id || 'v-1');
  const [taskAgentId, setTaskAgentId] = useState('agt-1');
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [taskApprovalRequired, setTaskApprovalRequired] = useState(true);

  const sectionLabels: Record<string, string> = {
    command_centre: 'Command Centre',
    agent_workforce: 'Agent Workforce',
    operations: 'Operations',
    intelligence: 'Intelligence',
    opportunities: 'Opportunities',
    growth: 'Growth',
    portfolio: 'Portfolio',
    settings: 'Settings'
  };

  const selectedVenture = ventures.find(v => v.id === activeVentureFilter);

  const handleCreateTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    createTask({
      title: taskTitle.trim(),
      description: taskDescription.trim() || 'No additional scope provided.',
      ventureId: taskVentureId,
      assignedAgentId: taskAgentId || undefined,
      priority: taskPriority,
      approvalRequired: taskApprovalRequired
    });

    setTaskTitle('');
    setTaskDescription('');
    setIsNewTaskModalOpen(false);
  };

  return (
    <>
      <header className="h-14 px-6 border-b border-slate-800/80 bg-[#090d15]/95 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between gap-4">
        {/* Left Zone: Mobile toggle & Contextual Breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="md:hidden p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-xs text-slate-400 truncate">
            <span className="font-semibold text-slate-200">ORCHESTRA</span>
            <span aria-hidden="true">/</span>
            <span className="text-slate-300 font-medium">{sectionLabels[activeSection]}</span>
            {selectedVenture && (
              <>
                <span aria-hidden="true">/</span>
                <span className="text-indigo-400 font-mono">{selectedVenture.name}</span>
              </>
            )}
          </div>
        </div>

        {/* Center Zone: Quick Search trigger button */}
        <div className="flex-1 max-w-md hidden sm:block">
          <button
            type="button"
            onClick={() => setIsCommandPaletteOpen(true)}
            className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-slate-400 bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-500" />
              <span>Search intelligence, agents, tasks...</span>
            </div>
            <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-400 rounded">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Zone: Decision Alert Counter & Primary Action CTA */}
        <div className="flex items-center gap-3 shrink-0">
          {pendingApprovalsCount > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-amber-300 bg-amber-950/40 border border-amber-900/60 rounded">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-mono tabular-nums">{pendingApprovalsCount}</span>
              <span className="hidden sm:inline">decision{pendingApprovalsCount > 1 ? 's' : ''} pending</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsNewTaskModalOpen(true)}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Task</span>
          </button>
        </div>
      </header>

      {/* New Task Creation Modal */}
      <Modal
        isOpen={isNewTaskModalOpen}
        onClose={() => setIsNewTaskModalOpen(false)}
        title="Create Operational Task"
        description="Delegate a structured task to a specialized agent or create an operational workstream."
      >
        <form onSubmit={handleCreateTaskSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Task Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="e.g. Conduct competitive teardown on Datadog pricing shift"
              className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Target Venture</label>
              <select
                value={taskVentureId}
                onChange={(e) => setTaskVentureId(e.target.value)}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded text-slate-100 focus:outline-hidden focus:border-indigo-500"
              >
                {ventures.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.stage})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Delegate to Agent</label>
              <select
                value={taskAgentId}
                onChange={(e) => setTaskAgentId(e.target.value)}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded text-slate-100 focus:outline-hidden focus:border-indigo-500"
              >
                <option value="">Unassigned (Operations Queue)</option>
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} · {a.department} ({a.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Priority</label>
              <select
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value as any)}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded text-slate-100 focus:outline-hidden focus:border-indigo-500 capitalize"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2 p-2.5 bg-slate-900/60 border border-slate-800 rounded cursor-pointer hover:border-slate-700 transition-colors">
                <input
                  type="checkbox"
                  checked={taskApprovalRequired}
                  onChange={(e) => setTaskApprovalRequired(e.target.checked)}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-0"
                />
                <span className="text-slate-300">Require Human Approval Gate</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Detailed Scope & Requirements</label>
            <textarea
              rows={4}
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              placeholder="Provide background context, required deliverables, evaluation criteria, and relevant references..."
              className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsNewTaskModalOpen(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded transition-colors"
            >
              Create & Dispatch Task
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};
