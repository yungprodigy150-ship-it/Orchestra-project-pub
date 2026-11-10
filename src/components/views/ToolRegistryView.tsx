/**
 * ORCHESTRA Tool Registry & Operational Capabilities View
 * Authoritative interface for reviewing authorized agent tools, parameter schemas,
 * human approval gates, and infrastructure execution status.
 */

import React, { useState } from 'react';
import {
  Wrench,
  Shield,
  ShieldAlert,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  Lock,
  Code2,
  ChevronDown,
  ChevronUp,
  Cpu,
  Layers,
  Filter
} from 'lucide-react';
import { useOrchestra } from '../../context/OrchestraContext';
import { ToolDefinition, ToolPermissionLevel, ToolStatus } from '../../types/intelligence';

export const ToolRegistryView: React.FC = () => {
  const { toolRegistry, agents } = useOrchestra();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPermission, setSelectedPermission] = useState<string>('all');
  const [expandedToolId, setExpandedToolId] = useState<string | null>('tool_doc_schema_analyzer');

  const tools = toolRegistry.listTools((tool) => {
    const matchesCat = selectedCategory === 'all' || tool.category === selectedCategory;
    const matchesPerm = selectedPermission === 'all' || tool.permissionLevel === selectedPermission;
    return matchesCat && matchesPerm;
  });

  const getAuthorizedAgents = (toolId: string) => {
    return agents.filter(
      (a) => a.intelligenceProfile?.authorizedToolIds?.includes(toolId)
    );
  };

  const getPermissionBadge = (level: ToolPermissionLevel) => {
    switch (level) {
      case 'PUBLIC':
        return (
          <span className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/80 text-emerald-300">
            <ShieldCheck className="w-3 h-3" />
            PUBLIC (UNRESTRICTED)
          </span>
        );
      case 'HUMAN_APPROVAL_REQUIRED':
        return (
          <span className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800/80 text-amber-300">
            <ShieldAlert className="w-3 h-3" />
            HUMAN APPROVAL GATE
          </span>
        );
      case 'RESTRICTED_ADMIN':
        return (
          <span className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-rose-950/60 border border-rose-800/80 text-rose-300">
            <Lock className="w-3 h-3" />
            ADMIN PRIVILEGED
          </span>
        );
    }
  };

  const getStatusBadge = (status: ToolStatus) => {
    switch (status) {
      case 'READY':
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800">
            LIVE / READY
          </span>
        );
      case 'SIMULATED':
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950/80 text-sky-300 border border-sky-800">
            SANDBOX PROBE
          </span>
        );
      case 'UNCONFIGURED':
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
            UNCONFIGURED
          </span>
        );
      case 'DISABLED':
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950/80 text-rose-400 border border-rose-800">
            DISABLED
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">
              Operational Tool Registry & Permission Hierarchy
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-800/80">
              {tools.length} REGISTERED
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Certified capabilities that autonomous agents can invoke. Input and output contracts are strictly enforced, with human supervisory gates on external or destructive calls.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="p-1.5 text-xs bg-slate-900 border border-slate-800 rounded text-slate-300 font-mono focus:outline-hidden"
            >
              <option value="all">All Categories</option>
              <option value="research">Research</option>
              <option value="infrastructure">Infrastructure</option>
              <option value="database">Database</option>
              <option value="outreach">Outreach</option>
              <option value="analytics">Analytics</option>
            </select>
          </div>

          <div>
            <select
              value={selectedPermission}
              onChange={(e) => setSelectedPermission(e.target.value)}
              className="p-1.5 text-xs bg-slate-900 border border-slate-800 rounded text-slate-300 font-mono focus:outline-hidden"
            >
              <option value="all">All Permissions</option>
              <option value="PUBLIC">Public</option>
              <option value="HUMAN_APPROVAL_REQUIRED">Human Approval Required</option>
              <option value="RESTRICTED_ADMIN">Restricted Admin</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tool Cards List */}
      <div className="space-y-4">
        {tools.map((tool) => {
          const isExpanded = expandedToolId === tool.id;
          const authorizedAgents = getAuthorizedAgents(tool.id);

          return (
            <div
              key={tool.id}
              className="bg-[#0c121d] border border-slate-800 rounded-lg overflow-hidden transition-all"
            >
              {/* Card Header Bar */}
              <div
                onClick={() => setExpandedToolId(isExpanded ? null : tool.id)}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-900/40 transition-colors"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded bg-slate-900 border border-slate-800 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-sm font-semibold text-slate-100">{tool.name}</h2>
                      <span className="font-mono text-[10px] text-slate-400 px-1.5 py-0.2 bg-slate-900 rounded border border-slate-800">
                        {tool.id}
                      </span>
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 bg-indigo-950/50 text-indigo-300 rounded border border-indigo-900/60">
                        {tool.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-2xl">
                      {tool.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  {getPermissionBadge(tool.permissionLevel)}
                  {getStatusBadge(tool.status)}
                  <button
                    type="button"
                    className="p-1 text-slate-400 hover:text-slate-200"
                    aria-label={isExpanded ? 'Collapse tool details' : 'Expand tool details'}
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Status Notice Banner if present */}
              {tool.statusNotice && (
                <div className="px-5 py-2 bg-slate-900/60 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{tool.statusNotice}</span>
                </div>
              )}

              {/* Expanded Schema Inspector */}
              {isExpanded && (
                <div className="p-5 border-t border-slate-800/80 bg-[#090d15] space-y-5 animate-fade-in">
                  {/* Authorized Agents */}
                  <div>
                    <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                      Authorized Agent Roster ({authorizedAgents.length})
                    </h3>
                    {authorizedAgents.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">
                        No agent currently authorized for this tool in their intelligence profile.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {authorizedAgents.map((ag) => (
                          <div
                            key={ag.id}
                            className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-xs flex items-center gap-2 text-slate-300 font-mono"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span className="font-semibold">{ag.name}</span>
                            <span className="text-[10px] text-slate-400">({ag.code})</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Schema Schematics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Input Schema */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
                        <span>Input Schema Contract</span>
                        <span className="text-[10px] text-indigo-400">JSON Schema v7</span>
                      </h4>
                      <pre className="p-3 bg-slate-950 border border-slate-800 rounded text-[11px] font-mono text-slate-300 overflow-x-auto max-h-56 leading-relaxed">
                        {JSON.stringify(tool.inputSchema, null, 2)}
                      </pre>
                    </div>

                    {/* Output Schema */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
                        <span>Output Schema Contract</span>
                        <span className="text-[10px] text-emerald-400">Validated Structure</span>
                      </h4>
                      <pre className="p-3 bg-slate-950 border border-slate-800 rounded text-[11px] font-mono text-slate-300 overflow-x-auto max-h-56 leading-relaxed">
                        {JSON.stringify(tool.outputSchema, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
