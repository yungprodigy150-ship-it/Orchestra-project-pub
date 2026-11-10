import React, { useState } from 'react';
import {
  FolderKanban,
  Plus,
  ExternalLink,
  Target,
  Bot,
  Activity,
  Code,
  Layers,
  ChevronRight
} from 'lucide-react';
import { useOrchestra } from '../../context/OrchestraContext';
import { Venture, VentureStage } from '../../types';
import { Modal } from '../common/Modal';

export const PortfolioView: React.FC = () => {
  const {
    ventures,
    agents,
    tasks,
    addVenture,
    setActiveVentureFilter,
    setActiveSection
  } = useOrchestra();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Venture State
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [stage, setStage] = useState<VentureStage>('mvp');
  const [description, setDescription] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [valueProposition, setValueProposition] = useState('');
  const [techStackInput, setTechStackInput] = useState('');
  const [primaryMetricLabel, setPrimaryMetricLabel] = useState('Active Users');
  const [primaryMetricValue, setPrimaryMetricValue] = useState('1,000');
  const [secondaryMetricLabel, setSecondaryMetricLabel] = useState('Mo. Run-Rate');
  const [secondaryMetricValue, setSecondaryMetricValue] = useState('$10,000');
  const [repoIdentifier, setRepoIdentifier] = useState('');

  const stages: Array<{ id: VentureStage; label: string }> = [
    { id: 'ideation', label: 'Ideation' },
    { id: 'mvp', label: 'MVP / Validation' },
    { id: 'growth', label: 'Growth' },
    { id: 'scaling', label: 'Scaling' }
  ];

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !tagline.trim()) return;

    const techStack = techStackInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    addVenture({
      name: name.trim(),
      tagline: tagline.trim(),
      stage,
      description: description.trim() || 'Software product venture within the ORCHESTRA portfolio.',
      targetAudience: targetAudience.trim() || 'Enterprise software teams',
      valueProposition: valueProposition.trim() || 'Solves critical operational workflows.',
      techStack: techStack.length > 0 ? techStack : ['TypeScript', 'React', 'Node.js'],
      primaryMetricLabel: primaryMetricLabel.trim() || 'Active Nodes',
      primaryMetricValue: primaryMetricValue.trim() || '0',
      secondaryMetricLabel: secondaryMetricLabel.trim() || 'ARR',
      secondaryMetricValue: secondaryMetricValue.trim() || '$0',
      repoIdentifier: repoIdentifier.trim() || undefined
    });

    setName('');
    setTagline('');
    setDescription('');
    setTargetAudience('');
    setValueProposition('');
    setTechStackInput('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight">
            Software Venture Portfolio
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Centralized directory of managed products, strategic objectives, allocated agent pods, and commercial traction.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Venture</span>
        </button>
      </div>

      {/* Ventures Cards */}
      <div className="space-y-6">
        {ventures.map((v) => {
          const assignedAgents = agents.filter(a => v.assignedAgentIds.includes(a.id));
          const ventureTasks = tasks.filter(t => t.ventureId === v.id);

          return (
            <div
              key={v.id}
              className="bg-[#0c121d] border border-slate-800 rounded-lg p-6 space-y-5 hover:border-slate-700/80 transition-colors"
            >
              {/* Top row: Name, Stage, and Quick Focus Button */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-bold text-slate-100 tracking-tight">
                      {v.name}
                    </h2>
                    <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-slate-900 border border-slate-700/60 text-indigo-400 font-semibold">
                      {v.stage}
                    </span>
                    {v.repoIdentifier && (
                      <span className="text-xs text-slate-400 font-mono hidden md:inline">
                        {v.repoIdentifier}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 mt-1 font-medium">
                    {v.tagline}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveVentureFilter(v.id);
                      setActiveSection('operations');
                    }}
                    className="px-3 py-1.5 text-xs bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded text-slate-200 transition-colors flex items-center gap-1.5"
                  >
                    <span>Filter Operations</span>
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                  </button>
                </div>
              </div>

              {/* Description & Value Proposition Split */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 bg-slate-900/60 rounded border border-slate-800/80 space-y-1.5">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Core Architectural Description
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    {v.description}
                  </p>
                  <div className="pt-2 text-[11px] text-slate-400">
                    Target ICP: <strong className="text-slate-300 font-normal">{v.targetAudience}</strong>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-900/60 rounded border border-slate-800/80 space-y-1.5">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Differentiated Value Proposition
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    {v.valueProposition}
                  </p>
                  <div className="pt-2 flex flex-wrap gap-1">
                    {v.techStack.map((tech, idx) => (
                      <span key={idx} className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Business Objectives with Progress */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-300 tracking-wider uppercase">
                  Strategic Milestone Objectives
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {v.objectives.map((obj) => (
                    <div key={obj.id} className="p-3 bg-slate-900/40 border border-slate-800/80 rounded space-y-2">
                      <div className="flex items-start justify-between text-xs gap-2">
                        <span className="font-medium text-slate-200 line-clamp-2">{obj.title}</span>
                        <span className="text-[11px] font-mono text-slate-400 shrink-0">{obj.targetQuarter}</span>
                      </div>
                      <div className="space-y-1">
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-indigo-500 h-full rounded-full transition-all"
                            style={{ width: `${obj.progressPercent}%` }}
                          />
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 text-right">
                          {obj.progressPercent}% complete
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Metrics & Agent Pod Bar */}
              <div className="pt-3 border-t border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-6">
                  <div>
                    <span className="text-slate-400 text-[11px] block">{v.primaryMetricLabel}</span>
                    <span className="text-base font-bold font-mono text-slate-100 tabular-nums">{v.primaryMetricValue}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">{v.secondaryMetricLabel}</span>
                    <span className="text-base font-bold font-mono text-emerald-400 tabular-nums">{v.secondaryMetricValue}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Active Workstreams</span>
                    <span className="text-base font-bold font-mono text-slate-200 tabular-nums">{ventureTasks.length} tasks</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">Assigned Agents:</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {assignedAgents.map(a => (
                      <span key={a.id} className="text-xs px-2 py-0.5 bg-slate-800/80 text-slate-300 rounded border border-slate-700/60 font-mono">
                        {a.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Venture Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register Software Venture"
        description="Add a new software product or business initiative to the ORCHESTRA portfolio."
      >
        <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Venture Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. VectorCache"
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Product Stage</label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as any)}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded text-slate-100 focus:outline-hidden focus:border-indigo-500 capitalize"
              >
                {stages.map(s => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">
              One-Line Tagline <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g. Ultra-low latency semantic caching for enterprise LLM endpoints"
              className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Comprehensive Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Technical architecture, target deployment topology, and core capabilities..."
              className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Target ICP Audience</label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="e.g. AI Engineers and Infrastructure Teams"
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Core Tech Stack (comma separated)</label>
              <input
                type="text"
                value={techStackInput}
                onChange={(e) => setTechStackInput(e.target.value)}
                placeholder="e.g. Rust, Redis, gRPC, TypeScript"
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Primary Metric Label & Target</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={primaryMetricLabel}
                  onChange={(e) => setPrimaryMetricLabel(e.target.value)}
                  placeholder="Metric Label"
                  className="w-2/3 p-2 bg-slate-900 border border-slate-700 rounded text-slate-100"
                />
                <input
                  type="text"
                  value={primaryMetricValue}
                  onChange={(e) => setPrimaryMetricValue(e.target.value)}
                  placeholder="Value"
                  className="w-1/3 p-2 bg-slate-900 border border-slate-700 rounded text-slate-100 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Secondary Metric (e.g. Run-Rate)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={secondaryMetricLabel}
                  onChange={(e) => setSecondaryMetricLabel(e.target.value)}
                  placeholder="Metric Label"
                  className="w-2/3 p-2 bg-slate-900 border border-slate-700 rounded text-slate-100"
                />
                <input
                  type="text"
                  value={secondaryMetricValue}
                  onChange={(e) => setSecondaryMetricValue(e.target.value)}
                  placeholder="Value"
                  className="w-1/3 p-2 bg-slate-900 border border-slate-700 rounded text-slate-100 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded transition-colors"
            >
              Register Venture
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
