import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Filter,
  Search,
  Clock,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  LayoutList,
  Columns
} from 'lucide-react';
import { useOrchestra } from '../../context/OrchestraContext';
import { Task, TaskStatus, TaskPriority } from '../../types';

export const OperationsView: React.FC = () => {
  const {
    tasks,
    agents,
    ventures,
    activeVentureFilter,
    setActiveTaskForDrawer
  } = useOrchestra();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');

  const filteredTasks = tasks.filter(task => {
    const matchesVenture = activeVentureFilter === 'all' || task.ventureId === activeVentureFilter;
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    const matchesQuery = !searchQuery || task.title.toLowerCase().includes(searchQuery.toLowerCase()) || task.description.toLowerCase().includes(searchQuery.toLowerCase()) || task.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesVenture && matchesStatus && matchesPriority && matchesQuery;
  });

  const statuses: Array<{ id: TaskStatus; label: string }> = [
    { id: 'PENDING', label: 'Pending' },
    { id: 'ASSIGNED', label: 'Assigned' },
    { id: 'RUNNING', label: 'Running' },
    { id: 'WAITING_FOR_APPROVAL', label: 'Approval Required' },
    { id: 'COMPLETED', label: 'Completed' },
    { id: 'FAILED', label: 'Failed' },
    { id: 'CANCELLED', label: 'Cancelled' }
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight">
            Operations & Task Delegation
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Mission delegation queue, priority scheduling, human approval checkpoints, and execution audit history.
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 p-1 bg-[#0c121d] border border-slate-800 rounded self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded transition-colors ${
              viewMode === 'table' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Table View"
          >
            <LayoutList className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('kanban')}
            className={`p-1.5 rounded transition-colors ${
              viewMode === 'kanban' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Kanban Board"
          >
            <Columns className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Status segmented filters */}
        <div className="flex items-center gap-1 p-1 bg-[#0c121d] border border-slate-800 rounded-lg overflow-x-auto">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
              statusFilter === 'all'
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Tasks ({tasks.length})
          </button>
          {statuses.map(s => {
            const count = tasks.filter(t => t.status === s.id).length;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setStatusFilter(s.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                  statusFilter === s.id
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {s.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Priority Filter and Search */}
        <div className="flex items-center gap-2">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-[#0c121d] border border-slate-800 text-xs text-slate-300 rounded px-2.5 py-1.5 focus:outline-hidden focus:border-indigo-500"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-48 pl-8 pr-3 py-1.5 bg-[#0c121d] border border-slate-800 rounded text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Content Rendering based on ViewMode */}
      {viewMode === 'table' ? (
        <div className="bg-[#0c121d] border border-slate-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#080d15] border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Task / Objective</th>
                  <th className="py-3 px-4">Venture</th>
                  <th className="py-3 px-4">Delegated To</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Governance</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                      No operational tasks match the selected criteria.
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((task) => {
                    const venture = ventures.find(v => v.id === task.ventureId);
                    const agent = agents.find(a => a.id === task.assignedAgentId);

                    return (
                      <tr
                        key={task.id}
                        className="hover:bg-slate-900/60 transition-colors group cursor-pointer"
                        onClick={() => setActiveTaskForDrawer(task)}
                      >
                        <td className="py-3.5 px-4 max-w-sm">
                          <div className="font-mono text-[11px] text-slate-400 mb-0.5">
                            {task.id}
                          </div>
                          <div className="font-medium text-slate-200 group-hover:text-indigo-300 transition-colors">
                            {task.title}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap text-slate-300 font-sans">
                          {venture?.name || 'General Portfolio'}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {agent ? (
                            <span className="text-slate-200 font-medium">{agent.name} <span className="text-slate-400 text-[11px] font-mono">({agent.code})</span></span>
                          ) : (
                            <span className="text-slate-400 italic">Unassigned</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={`capitalize font-mono text-[11px] ${
                            task.priority === 'critical' ? 'text-rose-400 font-bold' :
                            task.priority === 'high' ? 'text-amber-400 font-semibold' :
                            task.priority === 'medium' ? 'text-slate-300' : 'text-slate-400'
                          }`}>
                            {task.priority}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="capitalize font-mono text-[11px] text-slate-300">
                            {task.status.replace('_', ' ')}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {task.approvalRequired ? (
                            <span className={`text-[11px] font-mono ${
                              task.approvalStatus === 'approved' ? 'text-emerald-400' :
                              task.approvalStatus === 'rejected' ? 'text-rose-400' : 'text-amber-400'
                            }`}>
                              {task.approvalStatus === 'approved' ? 'Human Signed' : 'Approval Gate'}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px] font-mono">Autonomous</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveTaskForDrawer(task);
                            }}
                            className="px-2.5 py-1 text-xs text-indigo-400 hover:text-indigo-300 hover:bg-slate-800 rounded transition-colors"
                          >
                            Inspect →
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Kanban View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          {statuses.map((column) => {
            const columnTasks = filteredTasks.filter(t => t.status === column.id);
            return (
              <div key={column.id} className="bg-[#0c121d] border border-slate-800 rounded-lg p-3 flex flex-col min-h-96">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs">
                  <span className="font-semibold text-slate-200">{column.label}</span>
                  <span className="font-mono text-slate-400 text-[11px]">{columnTasks.length}</span>
                </div>

                <div className="space-y-2 flex-1 overflow-y-auto">
                  {columnTasks.map((task) => {
                    const agent = agents.find(a => a.id === task.assignedAgentId);
                    return (
                      <div
                        key={task.id}
                        onClick={() => setActiveTaskForDrawer(task)}
                        className="p-3 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 rounded cursor-pointer transition-colors space-y-2"
                      >
                        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                          <span>{task.id}</span>
                          <span className="capitalize">{task.priority}</span>
                        </div>
                        <div className="text-xs font-medium text-slate-200 line-clamp-2">
                          {task.title}
                        </div>
                        <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80 flex items-center justify-between">
                          <span>{agent?.name || 'Unassigned'}</span>
                          {task.approvalRequired && (
                            <span className="text-amber-400 text-[10px] font-mono">GATE</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
