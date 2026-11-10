import React, { useState } from 'react';
import {
  Bot,
  Plus,
  Shield,
  Cpu,
  Activity,
  Pause,
  Play,
  CheckCircle,
  Search,
  SlidersHorizontal,
  Layers,
  Sparkles,
  TrendingUp,
  Target,
  Building2,
  Briefcase,
  ArrowRight,
  ShieldAlert,
  Mail,
  Users,
  BarChart3,
  Send
} from 'lucide-react';
import { useOrchestra } from '../../context/OrchestraContext';
import { Agent, AgentDepartment, AgentAutonomy } from '../../types';
import { Modal } from '../common/Modal';

export const AgentWorkforceView: React.FC = () => {
  const {
    agents,
    ventures,
    registerAgent,
    updateAgentAutonomy,
    toggleAgentStatus,
    setActiveAgentForDrawer,
    setAgentBeingEdited,
    setIsEditAgentModalOpen,
    workflows,
    setActiveWorkflow,
    setIsWorkflowModalOpen,
    setPreselectedAgentForWorkflow,
    setActiveSection
  } = useOrchestra();

  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  // New Agent Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState<AgentDepartment>('Research');
  const [description, setDescription] = useState('');
  const [capabilitiesInput, setCapabilitiesInput] = useState('');
  const [provider, setProvider] = useState<'gemini' | 'anthropic' | 'openai' | 'local'>('gemini');
  const [model, setModel] = useState('gemini-2.5-flash');
  const [autonomy, setAutonomy] = useState<AgentAutonomy>('approval_required');
  const [selectedVentureIds, setSelectedVentureIds] = useState<string[]>([ventures[0]?.id || 'v-1']);

  const departments: AgentDepartment[] = ['Orchestration', 'Research', 'Engineering', 'Growth', 'Operations'];

  const filteredAgents = agents.filter(agent => {
    const matchesDept = departmentFilter === 'all' || agent.department === departmentFilter;
    const matchesQuery = !searchQuery || agent.name.toLowerCase().includes(searchQuery.toLowerCase()) || agent.role.toLowerCase().includes(searchQuery.toLowerCase()) || agent.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesQuery;
  });

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    const capabilities = capabilitiesInput
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    registerAgent({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      role: role.trim() || 'Specialized Agent',
      department,
      description: description.trim() || 'Autonomous enterprise agent.',
      capabilities: capabilities.length > 0 ? capabilities : ['Task Execution', 'Context Synthesis'],
      provider,
      model,
      status: 'idle',
      autonomy,
      assignedVentureIds: selectedVentureIds
    });

    setName('');
    setCode('');
    setRole('');
    setDescription('');
    setCapabilitiesInput('');
    setIsRegisterModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Registration CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight">
            Agent Workforce Registry
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Specialized autonomous agents, inter-agent capability matrices, and supervisory governance models.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              setPreselectedAgentForWorkflow(null);
              setIsWorkflowModalOpen(true);
            }}
            className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
            <span>Launch Coordinated Workflow</span>
          </button>
          <button
            type="button"
            onClick={() => setIsRegisterModalOpen(true)}
            className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Register Agent</span>
          </button>
        </div>
      </div>

      {/* Stage 5: Commercial Operations & Growth Workforce Highlight */}
      <div className="p-4 bg-gradient-to-r from-[#0d121c] via-[#101726] to-[#0c121e] border border-cyan-900/60 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300">
              Commercial Operations & Growth Workforce (Stage 5 Architecture)
            </h2>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            5 Commercial Agents · Human-Gated Outreach · Trackable Pipelines · Zero Fabricated Metrics
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* 1. Marketing Strategist */}
          <div className="p-3 bg-[#080d16]/90 border border-slate-800 hover:border-pink-600/50 rounded-lg flex flex-col justify-between transition-colors">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-pink-950/80 border border-pink-800/80 text-pink-300 font-bold">
                  MKT-STRAT
                </span>
                <span className="text-[10px] font-mono text-slate-400">Helix</span>
              </div>
              <div className="text-xs font-bold text-slate-200">Marketing Strategist</div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed line-clamp-2">
                Positioning, value props, acquisition channels & budget models.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveSection('growth')}
              className="mt-3 w-full py-1 text-[11px] font-semibold text-pink-300 hover:text-white bg-pink-950/40 hover:bg-pink-900/60 border border-pink-800/60 rounded flex items-center justify-center gap-1 transition-colors"
            >
              <span>Formulate Strategy</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* 2. Campaign Planner */}
          <div className="p-3 bg-[#080d16]/90 border border-slate-800 hover:border-indigo-600/50 rounded-lg flex flex-col justify-between transition-colors">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-950/80 border border-indigo-800/80 text-indigo-300 font-bold">
                  CMP-PLAN
                </span>
                <span className="text-[10px] font-mono text-slate-400">Cadence</span>
              </div>
              <div className="text-xs font-bold text-slate-200">Campaign Planner</div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed line-clamp-2">
                End-to-end execution checklists, schedules, content assets & goals.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveSection('growth')}
              className="mt-3 w-full py-1 text-[11px] font-semibold text-indigo-300 hover:text-white bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-800/60 rounded flex items-center justify-center gap-1 transition-colors"
            >
              <span>Plan Campaign</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* 3. Outreach Assistant */}
          <div className="p-3 bg-[#080d16]/90 border border-slate-800 hover:border-amber-600/50 rounded-lg flex flex-col justify-between transition-colors">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-800/80 text-amber-300 font-bold">
                  OUT-ASST
                </span>
                <span className="text-[10px] font-mono text-slate-400">Courier</span>
              </div>
              <div className="text-xs font-bold text-slate-200 flex items-center gap-1">
                <span>Outreach Assistant</span>
                <span className="text-[9px] px-1 py-0.2 bg-amber-900/60 text-amber-200 rounded border border-amber-700/60">Gated</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed line-clamp-2">
                Drafts multi-channel copy for human review. Never self-dispatches.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveSection('opportunities')}
              className="mt-3 w-full py-1 text-[11px] font-semibold text-amber-300 hover:text-white bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800/60 rounded flex items-center justify-center gap-1 transition-colors"
            >
              <span>Draft Outreach</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* 4. Relationship Manager */}
          <div className="p-3 bg-[#080d16]/90 border border-slate-800 hover:border-emerald-600/50 rounded-lg flex flex-col justify-between transition-colors">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 font-bold">
                  REL-MGR
                </span>
                <span className="text-[10px] font-mono text-slate-400">Nexus</span>
              </div>
              <div className="text-xs font-bold text-slate-200">Relationship Manager</div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed line-clamp-2">
                CRM pipeline tracking, contact health, qualification & log history.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveSection('opportunities')}
              className="mt-3 w-full py-1 text-[11px] font-semibold text-emerald-300 hover:text-white bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800/60 rounded flex items-center justify-center gap-1 transition-colors"
            >
              <span>Inspect CRM</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* 5. Growth Analyst */}
          <div className="p-3 bg-[#080d16]/90 border border-slate-800 hover:border-sky-600/50 rounded-lg flex flex-col justify-between transition-colors">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-950/80 border border-sky-800/80 text-sky-300 font-bold">
                  GRW-ANLYST
                </span>
                <span className="text-[10px] font-mono text-slate-400">Prism</span>
              </div>
              <div className="text-xs font-bold text-slate-200">Growth Analyst</div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed line-clamp-2">
                Analyzes recorded records, identifies pipeline bottlenecks & tests.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveSection('growth')}
              className="mt-3 w-full py-1 text-[11px] font-semibold text-sky-300 hover:text-white bg-sky-950/40 hover:bg-sky-900/60 border border-sky-800/60 rounded flex items-center justify-center gap-1 transition-colors"
            >
              <span>Run Growth Audit</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Stage 4: Specialized Intelligence Workforce Highlight */}
      <div className="p-4 bg-gradient-to-r from-[#0b101b] via-[#0d1424] to-[#0c121e] border border-indigo-950/80 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-300">
              Specialized Business Intelligence Agents (Stage 4 Architecture)
            </h2>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Autonomous handoffs · Structured JSON schema · Supervisory human gating
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 1. Market Intelligence */}
          <div className="p-3 bg-[#080d16]/90 border border-slate-800 hover:border-emerald-600/50 rounded-lg flex flex-col justify-between transition-colors">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 font-bold">
                  MKT-INTEL
                </span>
                <span className="text-[10px] font-mono text-slate-400">Sentry · agt-2</span>
              </div>
              <div className="text-xs font-bold text-slate-200">Market Intelligence</div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Industry dynamics, customer pain points, competitor weaknesses & market risks.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const agt = agents.find(a => a.code === 'MKT-INTEL' || a.id === 'agt-2');
                setPreselectedAgentForWorkflow(agt || null);
                setIsWorkflowModalOpen(true);
              }}
              className="mt-3 w-full py-1 text-[11px] font-semibold text-emerald-300 hover:text-white bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800/60 rounded flex items-center justify-center gap-1 transition-colors"
            >
              <span>Run Intel Mission</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* 2. Opportunity Hunter */}
          <div className="p-3 bg-[#080d16]/90 border border-slate-800 hover:border-amber-600/50 rounded-lg flex flex-col justify-between transition-colors">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-800/80 text-amber-300 font-bold">
                  OPP-HUNTER
                </span>
                <span className="text-[10px] font-mono text-slate-400">Scout · agt-scout</span>
              </div>
              <div className="text-xs font-bold text-slate-200">Opportunity Hunter</div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Market gaps, software distribution vectors, partnership channels & revenue targets.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const agt = agents.find(a => a.code === 'OPP-HUNTER' || a.id === 'agt-scout');
                setPreselectedAgentForWorkflow(agt || null);
                setIsWorkflowModalOpen(true);
              }}
              className="mt-3 w-full py-1 text-[11px] font-semibold text-amber-300 hover:text-white bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800/60 rounded flex items-center justify-center gap-1 transition-colors"
            >
              <span>Run Hunter Mission</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* 3. Prospect Intelligence */}
          <div className="p-3 bg-[#080d16]/90 border border-slate-800 hover:border-cyan-600/50 rounded-lg flex flex-col justify-between transition-colors">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/80 text-cyan-300 font-bold">
                  PRSP-INTEL
                </span>
                <span className="text-[10px] font-mono text-slate-400">Vanguard · agt-3</span>
              </div>
              <div className="text-xs font-bold text-slate-200">Prospect Intelligence</div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Enterprise research, tech stack profiling, buying centers & readiness scoring.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const agt = agents.find(a => a.code === 'PRSP-INTEL' || a.id === 'agt-3');
                setPreselectedAgentForWorkflow(agt || null);
                setIsWorkflowModalOpen(true);
              }}
              className="mt-3 w-full py-1 text-[11px] font-semibold text-cyan-300 hover:text-white bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-800/60 rounded flex items-center justify-center gap-1 transition-colors"
            >
              <span>Run Prospect Mission</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* 4. Portfolio Strategist */}
          <div className="p-3 bg-[#080d16]/90 border border-slate-800 hover:border-purple-600/50 rounded-lg flex flex-col justify-between transition-colors">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-950/80 border border-purple-800/80 text-purple-300 font-bold">
                  PORT-STRAT
                </span>
                <span className="text-[10px] font-mono text-slate-400">Foundry · agt-4</span>
              </div>
              <div className="text-xs font-bold text-slate-200">Portfolio Strategist</div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Venture product fit, positioning strategy, roadmap recommendations & pricing.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const agt = agents.find(a => a.code === 'PORT-STRAT' || a.id === 'agt-4');
                setPreselectedAgentForWorkflow(agt || null);
                setIsWorkflowModalOpen(true);
              }}
              className="mt-3 w-full py-1 text-[11px] font-semibold text-purple-300 hover:text-white bg-purple-950/40 hover:bg-purple-900/60 border border-purple-800/60 rounded flex items-center justify-center gap-1 transition-colors"
            >
              <span>Run Portfolio Mission</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Active / Recent Workflow Execution Banner if available */}
      {workflows.length > 0 && (
        <div className="p-3.5 bg-[#0a0f19] border border-slate-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase ${
              workflows[0].status === 'COMPLETED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
              workflows[0].status === 'WAITING_FOR_APPROVAL' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
              'bg-indigo-950 text-indigo-300 border border-indigo-800'
            }`}>
              {workflows[0].status}
            </span>
            <div>
              <span className="font-semibold text-slate-200">Latest Pipeline: </span>
              <span className="text-slate-400">{workflows[0].title}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setActiveWorkflow(workflows[0]);
              setIsWorkflowModalOpen(true);
            }}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-medium flex items-center gap-1.5 transition-colors self-start sm:self-auto shrink-0"
          >
            <span>Inspect Pipeline Output</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Department Segmented Controls (Functional Buttons) */}
        <div className="flex items-center gap-1 p-1 bg-[#0c121d] border border-slate-800 rounded-lg overflow-x-auto">
          <button
            type="button"
            onClick={() => setDepartmentFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
              departmentFilter === 'all'
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Departments ({agents.length})
          </button>
          {departments.map(dept => {
            const count = agents.filter(a => a.department === dept).length;
            return (
              <button
                key={dept}
                type="button"
                onClick={() => setDepartmentFilter(dept)}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                  departmentFilter === dept
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {dept} ({count})
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="w-full md:w-64">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search agent roster..."
              className="w-full pl-8 pr-3 py-1.5 bg-[#0c121d] border border-slate-800 rounded text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Agents Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAgents.map((agent) => {
          const assignedVentures = ventures.filter(v => agent.assignedVentureIds.includes(v.id));

          return (
            <div
              key={agent.id}
              className="bg-[#0c121d] border border-slate-800 hover:border-slate-700/80 rounded-lg p-5 flex flex-col justify-between transition-colors space-y-4"
            >
              {/* Agent Title & Identity */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-indigo-400 font-mono text-xs font-bold">
                      {agent.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                        {agent.name}
                        <span className="text-[11px] font-mono text-slate-400 font-normal">
                          {agent.code}
                        </span>
                      </h3>
                      <div className="text-[11px] text-slate-400">
                        {agent.department} · {agent.role}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleAgentStatus(agent.id)}
                    className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
                    title={agent.status === 'paused' ? 'Resume agent' : 'Pause agent'}
                  >
                    {agent.status === 'paused' ? (
                      <Play className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Pause className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </button>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {agent.description}
                </p>
              </div>

              {/* Capabilities */}
              <div>
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Registered Capabilities
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {agent.capabilities.slice(0, 3).map((cap, i) => (
                    <span
                      key={i}
                      className="text-[11px] px-2 py-0.5 bg-slate-800/60 border border-slate-700/60 rounded text-slate-300 font-mono"
                    >
                      {cap}
                    </span>
                  ))}
                  {agent.capabilities.length > 3 && (
                    <span className="text-[11px] text-slate-400 py-0.5 font-mono">
                      +{agent.capabilities.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="pt-3 border-t border-slate-800/80 text-[11px] space-y-1.5">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Model Engine</span>
                  <span className="font-mono text-slate-200">{agent.model}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Autonomy Policy</span>
                  <span className="font-mono capitalize text-slate-200">
                    {agent.autonomy.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Execution Reliability</span>
                  <span className="font-mono tabular-nums text-emerald-400">
                    {agent.reliabilityScore}% ({agent.completedTasksTotal} tasks)
                  </span>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">
                  {assignedVentures.length} venture pod{assignedVentures.length !== 1 ? 's' : ''}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setPreselectedAgentForWorkflow(agent);
                      setIsWorkflowModalOpen(true);
                    }}
                    className="px-2 py-1 text-xs text-indigo-300 hover:text-white bg-indigo-950/60 hover:bg-indigo-900 border border-indigo-800/60 rounded transition-colors flex items-center gap-1"
                    title="Launch targeted mission for this agent"
                  >
                    <Play className="w-2.5 h-2.5 fill-current" />
                    <span>Run</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAgentBeingEdited(agent);
                      setIsEditAgentModalOpen(true);
                    }}
                    className="px-2 py-1 text-xs text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveAgentForDrawer(agent)}
                    className="px-2.5 py-1 text-xs text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/40 rounded transition-colors"
                  >
                    Inspect →
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Registration Modal */}
      <Modal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        title="Register Specialized Agent"
        description="Add a new specialized autonomous agent to the ORCHESTRA workforce registry."
      >
        <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Agent Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Oracle"
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Codename / Identifier <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. ORACLE-07"
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value as any)}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded text-slate-100 focus:outline-hidden focus:border-indigo-500"
              >
                {departments.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Role / Function</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Compliance & Vulnerability Auditor"
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Description & Purpose</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline this agent's core responsibilities and execution boundaries..."
              className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">AI Provider</label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value as any)}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded text-slate-100 focus:outline-hidden focus:border-indigo-500 capitalize"
              >
                <option value="gemini">Google Gemini</option>
                <option value="anthropic">Anthropic Claude</option>
                <option value="openai">OpenAI GPT</option>
                <option value="local">Local Ollama</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Inference Model</label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g. gemini-2.5-flash"
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded text-slate-100 focus:outline-hidden focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Autonomy Level</label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'full', label: 'Full Autonomy' },
                  { id: 'approval_required', label: 'Approval Required' },
                  { id: 'supervised', label: 'Supervised' }
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setAutonomy(opt.id as AgentAutonomy)}
                  className={`p-2 text-center rounded border transition-colors ${
                    autonomy === opt.id
                      ? 'bg-indigo-950/40 border-indigo-500/60 text-slate-100 font-medium'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Capabilities (comma separated)</label>
            <input
              type="text"
              value={capabilitiesInput}
              onChange={(e) => setCapabilitiesInput(e.target.value)}
              placeholder="e.g. CVE Verification, Compliance Mapping, Code Static Analysis"
              className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsRegisterModalOpen(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded transition-colors"
            >
              Deploy Agent
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
