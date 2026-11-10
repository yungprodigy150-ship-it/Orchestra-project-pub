import React, { useState, useEffect, useRef } from 'react';
import { Search, Bot, CheckSquare, BookOpen, Briefcase, Target, ArrowRight, X } from 'lucide-react';
import { useOrchestra } from '../../context/OrchestraContext';
import { WorkspaceSection } from '../../types';

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    setActiveSection,
    tasks,
    agents,
    ventures,
    intelligence,
    opportunities,
    setActiveTaskForDrawer,
    setActiveAgentForDrawer
  } = useOrchestra();

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(!isCommandPaletteOpen);
      }
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        setIsCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setIsCommandPaletteOpen]);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const q = query.toLowerCase().trim();

  const filteredTasks = q ? tasks.filter(t => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)).slice(0, 4) : [];
  const filteredAgents = q ? agents.filter(a => a.name.toLowerCase().includes(q) || a.role.toLowerCase().includes(q) || a.department.toLowerCase().includes(q)).slice(0, 3) : [];
  const filteredVentures = q ? ventures.filter(v => v.name.toLowerCase().includes(q) || v.tagline.toLowerCase().includes(q)).slice(0, 3) : [];
  const filteredIntel = q ? intelligence.filter(i => i.title.toLowerCase().includes(q) || i.tags.some(tag => tag.toLowerCase().includes(q))).slice(0, 3) : [];

  const navigationSections: Array<{ id: WorkspaceSection; label: string; icon: any }> = [
    { id: 'command_centre', label: 'Command Centre', icon: Target },
    { id: 'agent_workforce', label: 'Agent Workforce', icon: Bot },
    { id: 'operations', label: 'Operations & Tasks', icon: CheckSquare },
    { id: 'intelligence', label: 'Intelligence & Research', icon: BookOpen },
    { id: 'opportunities', label: 'Opportunities & Prospects', icon: Target },
    { id: 'portfolio', label: 'Portfolio Ventures', icon: Briefcase },
  ];

  const filteredNav = q ? navigationSections.filter(n => n.label.toLowerCase().includes(q)) : navigationSections;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/75 backdrop-blur-xs">
      <div
        className="fixed inset-0"
        onClick={() => setIsCommandPaletteOpen(false)}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-xl bg-[#0c121d] border border-slate-800 rounded-lg shadow-2xl overflow-hidden z-10 flex flex-col">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800">
          <Search className="w-4 h-4 text-slate-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks, agents, ventures, intelligence or jump to..."
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-hidden"
          />
          <button
            onClick={() => setIsCommandPaletteOpen(false)}
            className="text-xs text-slate-400 hover:text-slate-200 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-4">
          {/* Quick Navigation */}
          <div>
            <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Workspaces
            </div>
            <div className="space-y-0.5">
              {filteredNav.map((n) => {
                const Icon = n.icon;
                return (
                  <button
                    key={n.id}
                    onClick={() => {
                      setActiveSection(n.id);
                      setIsCommandPaletteOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 rounded transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400" />
                      <span>{n.label}</span>
                    </div>
                    <ArrowRight className="w-3 h-3 text-slate-500 opacity-0 group-hover:opacity-100" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Matched Agents */}
          {filteredAgents.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Agents
              </div>
              <div className="space-y-0.5">
                {filteredAgents.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => {
                      setActiveAgentForDrawer(a);
                      setIsCommandPaletteOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 rounded transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Bot className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="font-medium text-slate-200">{a.name}</span>
                      <span className="text-slate-500 font-mono text-[11px]">({a.code})</span>
                      <span className="text-slate-400 text-[11px]">· {a.role}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matched Tasks */}
          {filteredTasks.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Tasks
              </div>
              <div className="space-y-0.5">
                {filteredTasks.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setActiveTaskForDrawer(t);
                      setIsCommandPaletteOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 rounded transition-colors"
                  >
                    <div className="flex items-center gap-2 text-slate-400 text-[11px] mb-0.5 font-mono">
                      <span>{t.id}</span>
                      <span>·</span>
                      <span className="capitalize">{t.status.replace('_', ' ')}</span>
                    </div>
                    <div className="font-medium text-slate-200 truncate">{t.title}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matched Intelligence */}
          {filteredIntel.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Intelligence Briefs
              </div>
              <div className="space-y-0.5">
                {filteredIntel.map((i) => (
                  <button
                    key={i.id}
                    onClick={() => {
                      setActiveSection('intelligence');
                      setIsCommandPaletteOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 rounded transition-colors"
                  >
                    <div className="font-medium text-slate-200 truncate">{i.title}</div>
                    <div className="text-slate-400 text-[11px] mt-0.5">{i.category.replace('_', ' ')} · {i.confidence} confidence</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matched Ventures */}
          {filteredVentures.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Ventures
              </div>
              <div className="space-y-0.5">
                {filteredVentures.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => {
                      setActiveSection('portfolio');
                      setIsCommandPaletteOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 rounded transition-colors"
                  >
                    <div className="font-medium text-slate-200">{v.name}</div>
                    <div className="text-slate-400 text-[11px] truncate">{v.tagline}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 border-t border-slate-800/80 bg-[#090d14] flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span>Navigation: <kbd className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded font-mono">↑</kbd> <kbd className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded font-mono">↓</kbd></span>
            <span>Select: <kbd className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded font-mono">↵</kbd></span>
          </div>
          <span>Close: <kbd className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded font-mono">ESC</kbd></span>
        </div>
      </div>
    </div>
  );
};
