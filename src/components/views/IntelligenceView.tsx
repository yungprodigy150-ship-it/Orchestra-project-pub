import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  CheckCircle,
  Clock,
  ShieldCheck,
  Tag,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { useOrchestra } from '../../context/OrchestraContext';
import { IntelligenceItem, IntelligenceCategory } from '../../types';
import { Modal } from '../common/Modal';

export const IntelligenceView: React.FC = () => {
  const {
    intelligence,
    ventures,
    agents,
    activeVentureFilter,
    addIntelligence,
    toggleVerifyIntelligence
  } = useOrchestra();

  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New item form
  const [title, setTitle] = useState('');
  const [ventureId, setVentureId] = useState(ventures[0]?.id || 'v-1');
  const [category, setCategory] = useState<IntelligenceCategory>('competitive_intel');
  const [summary, setSummary] = useState('');
  const [takeawaysInput, setTakeawaysInput] = useState('');
  const [confidence, setConfidence] = useState<'high' | 'medium' | 'provisional'>('high');
  const [source, setSource] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  const categories: Array<{ id: IntelligenceCategory; label: string }> = [
    { id: 'competitive_intel', label: 'Competitive Intel' },
    { id: 'market_signal', label: 'Market Signals' },
    { id: 'technical_architecture', label: 'Tech Architecture' },
    { id: 'customer_research', label: 'Customer Research' },
    { id: 'regulatory_risk', label: 'Regulatory & Risk' }
  ];

  const filteredItems = intelligence.filter(item => {
    const matchesVenture = activeVentureFilter === 'all' || item.ventureId === activeVentureFilter;
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesQuery = !searchQuery ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesVenture && matchesCategory && matchesQuery;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !summary.trim()) return;

    const keyTakeaways = takeawaysInput
      .split('\n')
      .map(t => t.trim())
      .filter(Boolean);

    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    addIntelligence({
      title: title.trim(),
      ventureId: ventureId || undefined,
      category,
      summary: summary.trim(),
      keyTakeaways: keyTakeaways.length > 0 ? keyTakeaways : ['Key strategic insight captured.'],
      confidence,
      source: source.trim() || 'Internal Synthesizer',
      authorAgentId: 'agt-2',
      tags: tags.length > 0 ? tags : ['General']
    });

    setTitle('');
    setSummary('');
    setTakeawaysInput('');
    setSource('');
    setTagsInput('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight">
            Intelligence & Shared Organizational Memory
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Accumulated technical knowledge, competitor dossiers, market benchmarks, and cross-venture intelligence.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Research Brief</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Category buttons */}
        <div className="flex items-center gap-1 p-1 bg-[#0c121d] border border-slate-800 rounded-lg overflow-x-auto">
          <button
            type="button"
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
              categoryFilter === 'all'
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Categories ({intelligence.length})
          </button>
          {categories.map(cat => {
            const count = intelligence.filter(i => i.category === cat.id).length;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                  categoryFilter === cat.id
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat.label} ({count})
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
              placeholder="Search knowledge repository..."
              className="w-full pl-8 pr-3 py-1.5 bg-[#0c121d] border border-slate-800 rounded text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Intelligence Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map((item) => {
          const venture = ventures.find(v => v.id === item.ventureId);
          const author = agents.find(a => a.id === item.authorAgentId);

          return (
            <div
              key={item.id}
              className="bg-[#0c121d] border border-slate-800 rounded-lg p-5 flex flex-col justify-between space-y-4 hover:border-slate-700/80 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                    <span>{venture?.name || 'Cross-Portfolio'}</span>
                    <span aria-hidden="true">·</span>
                    <span className="capitalize">{item.category.replace('_', ' ')}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleVerifyIntelligence(item.id)}
                      className={`text-[11px] font-mono px-2 py-0.5 rounded border transition-colors flex items-center gap-1 ${
                        item.verifiedByHuman
                          ? 'bg-emerald-950/60 border-emerald-800/80 text-emerald-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                      title="Click to toggle human verification"
                    >
                      <ShieldCheck className="w-3 h-3" />
                      <span>{item.verifiedByHuman ? 'Human Verified' : 'Provisional'}</span>
                    </button>
                  </div>
                </div>

                <h3 className="text-sm font-semibold text-slate-100 tracking-tight leading-snug mb-2">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  {item.summary}
                </p>

                {/* Key Takeaways list */}
                <div className="bg-slate-900/60 rounded p-3 border border-slate-800/80 space-y-1.5">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Key Architectural & Market Takeaways
                  </div>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {item.keyTakeaways.map((takeaway, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-indigo-400 font-mono mt-0.5">•</span>
                        <span>{takeaway}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Provenance & Tags */}
              <div className="pt-3 border-t border-slate-800/80 text-[11px] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="text-slate-400 truncate">
                  Source: <span className="text-slate-300 italic">{item.source}</span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {item.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-1.5 py-0.5 bg-slate-800/60 text-slate-400 rounded font-mono"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Intelligence Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Strategic Intelligence Brief"
        description="Record verified research, market analysis, or technical architecture findings into shared organizational memory."
      >
        <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Brief Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Hyperscaler FinOps Pricing Shifts & Container Overhead"
              className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Relevant Venture</label>
              <select
                value={ventureId}
                onChange={(e) => setVentureId(e.target.value)}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded text-slate-100 focus:outline-hidden focus:border-indigo-500"
              >
                <option value="">Cross-Portfolio / General</option>
                {ventures.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded text-slate-100 focus:outline-hidden focus:border-indigo-500"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Executive Summary <span className="text-rose-400">*</span></label>
            <textarea
              rows={3}
              required
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="High-level narrative of the findings..."
              className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Key Takeaways (one per line)
            </label>
            <textarea
              rows={3}
              value={takeawaysInput}
              onChange={(e) => setTakeawaysInput(e.target.value)}
              placeholder="Takeaway 1&#10;Takeaway 2&#10;Takeaway 3"
              className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Source / Citation</label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="e.g. SEC 10-K Filings & Customer Interviews"
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Tags (comma separated)</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="e.g. Kubernetes, FinOps, Pricing"
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
              />
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
              Ingest Brief
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
