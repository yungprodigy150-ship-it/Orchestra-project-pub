import React from 'react';
import {
  LayoutDashboard,
  Bot,
  CheckSquare,
  BookOpen,
  Crosshair,
  TrendingUp,
  FolderKanban,
  Sliders,
  ChevronDown,
  Layers,
  ShieldCheck,
  Plug
} from 'lucide-react';
import { WorkspaceSection } from '../../types';
import { useOrchestra } from '../../context/OrchestraContext';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const {
    activeSection,
    setActiveSection,
    ventures,
    activeVentureFilter,
    setActiveVentureFilter,
    pendingApprovalsCount,
    tasks
  } = useOrchestra();

  const navItems: Array<{
    id: WorkspaceSection;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: number;
    badgeVariant?: 'amber' | 'slate';
  }> = [
    {
      id: 'command_centre',
      label: 'Command Centre',
      icon: LayoutDashboard,
      count: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
      badgeVariant: 'amber'
    },
    {
      id: 'agent_workforce',
      label: 'Agent Workforce',
      icon: Bot
    },
    {
      id: 'operations',
      label: 'Operations',
      icon: CheckSquare,
      count: tasks.filter(t => t.status === 'RUNNING' || t.status === 'ASSIGNED').length,
      badgeVariant: 'slate'
    },
    {
      id: 'intelligence',
      label: 'Intelligence',
      icon: BookOpen
    },
    {
      id: 'opportunities',
      label: 'Opportunities',
      icon: Crosshair
    },
    {
      id: 'growth',
      label: 'Growth',
      icon: TrendingUp
    },
    {
      id: 'portfolio',
      label: 'Portfolio',
      icon: FolderKanban
    },
    {
      id: 'integrations',
      label: 'Integrations & Tools',
      icon: Plug
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Sliders
    }
  ];

  const handleSelect = (id: WorkspaceSection) => {
    setActiveSection(id);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#090d15] border-r border-slate-800/80 flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Lockup */}
        <div className="h-14 px-5 border-b border-slate-800/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center">
              <span className="text-xs font-bold text-indigo-400 font-mono">O</span>
            </div>
            <span className="text-sm font-bold tracking-wider text-slate-100 uppercase">
              ORCHESTRA
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.5 rounded border border-slate-800 bg-slate-900/60">
            v1.0-FOUNDATION
          </span>
        </div>

        {/* Venture Workspace Switcher */}
        <div className="px-4 py-3 border-b border-slate-800/60 shrink-0">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
            Scope / Venture
          </label>
          <div className="relative">
            <select
              value={activeVentureFilter}
              onChange={(e) => setActiveVentureFilter(e.target.value)}
              className="w-full appearance-none bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-xs text-slate-200 rounded px-2.5 py-1.5 pr-7 focus:outline-hidden focus:border-indigo-500 transition-colors cursor-pointer"
            >
              <option value="all">All Portfolio Ventures</option>
              {ventures.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.stage})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Primary Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Workspaces
          </div>
          <nav className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 text-xs font-medium rounded transition-colors ${
                    isActive
                      ? 'bg-slate-800/90 text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.count !== undefined && item.count > 0 && (
                    <span
                      className={`text-[11px] font-mono tabular-nums px-1.5 py-0.2 rounded ${
                        item.badgeVariant === 'amber'
                          ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Supervisory Governance Trust Bar */}
        <div className="p-3 border-t border-slate-800/80 shrink-0 bg-[#070b11]">
          <div className="flex items-center gap-2 text-xs text-slate-300 mb-1 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Human In The Loop</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            Autonomy gate active. Production & outreach require operator approval.
          </p>
        </div>
      </aside>
    </>
  );
};
