import React, { useState } from 'react';
import {
  TrendingUp,
  Plus,
  Target,
  Megaphone,
  CheckCircle,
  Clock,
  Layers,
  FileText,
  Users,
  Calendar,
  RotateCw,
  Sparkles,
  Bot,
  ShieldAlert,
  ArrowRight,
  Activity,
  AlertTriangle,
  Zap,
  BarChart3,
  Sliders,
  DollarSign,
  CheckSquare
} from 'lucide-react';
import { useOrchestra } from '../../context/OrchestraContext';
import {
  CommercialCampaign,
  TrackableCampaignStatus,
  MarketingStrategyOutput,
  GrowthAnalysisOutput
} from '../../types';
import { Modal } from '../common/Modal';

export const GrowthView: React.FC = () => {
  const {
    commercialCampaigns,
    ventures,
    agents,
    activeVentureFilter,
    createCommercialCampaign,
    updateCommercialCampaignStatus,
    recordCampaignPerformance,
    executeMarketingStrategy,
    executeCampaignPlanning,
    executeGrowthAnalysis,
    commercialIntegrations,
    updateIntegrationStatus,
    setIsApprovalModalOpen
  } = useOrchestra();

  // Active Tab: Campaigns, Marketing Strategies, Growth Analysis, Integrations
  const [activeTab, setActiveTab] = useState<'campaigns' | 'strategies' | 'growth_analysis' | 'integrations'>('campaigns');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedVentureId, setSelectedVentureId] = useState<string>('all');

  // Modals & Inspection State
  const [isCreateCampaignModalOpen, setIsCreateCampaignModalOpen] = useState(false);
  const [selectedCampaignForDetail, setSelectedCampaignForDetail] = useState<CommercialCampaign | null>(null);

  // Manual Campaign Form State
  const [campName, setCampName] = useState('');
  const [campVentureId, setCampVentureId] = useState(ventures[0]?.id || 'v-1');
  const [campObjective, setCampObjective] = useState('');
  const [campAudience, setCampAudience] = useState('');
  const [campConcept, setCampConcept] = useState('');
  const [campChannelsInput, setCampChannelsInput] = useState('Direct Outreach, Developer Editorial, Kubernetes Newsletter');
  const [campTimeline, setCampTimeline] = useState('4 weeks');
  const [campBudget, setCampBudget] = useState('$1,500 staging allocation');

  // AI Marketing Strategist State
  const [stratVentureId, setStratVentureId] = useState(ventures[0]?.id || 'v-1');
  const [stratObjective, setStratObjective] = useState('Displace legacy monitoring tools with autonomous eBPF compaction in Q1');
  const [isGeneratingStrategy, setIsGeneratingStrategy] = useState(false);
  const [generatedStrategy, setGeneratedStrategy] = useState<MarketingStrategyOutput | null>(null);

  // AI Growth Analysis State
  const [isAnalyzingGrowth, setIsAnalyzingGrowth] = useState(false);
  const [growthReport, setGrowthReport] = useState<GrowthAnalysisOutput | null>(null);

  const campaignStatuses: TrackableCampaignStatus[] = [
    'DRAFT',
    'PLANNED',
    'AWAITING_APPROVAL',
    'APPROVED',
    'ACTIVE',
    'PAUSED',
    'COMPLETED',
    'CANCELLED'
  ];

  const filteredCampaigns = commercialCampaigns.filter(c => {
    const matchesVenture = (selectedVentureId === 'all' && activeVentureFilter === 'all')
      || (selectedVentureId !== 'all' ? c.ventureId === selectedVentureId : c.ventureId === activeVentureFilter);
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesVenture && matchesStatus;
  });

  const handleCreateManualCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campName.trim() || !campObjective.trim()) return;

    createCommercialCampaign({
      name: campName.trim(),
      ventureId: campVentureId,
      status: 'PLANNED',
      objective: campObjective.trim(),
      targetAudience: campAudience.trim() || 'Enterprise software engineering leads',
      concept: campConcept.trim() || 'Empirical technical value demonstration',
      channels: campChannelsInput.split(',').map(s => s.trim()).filter(Boolean),
      contentRequirements: ['Technical benchmark dossier', 'Interactive ROI worksheet'],
      timeline: campTimeline.trim() || '4 weeks',
      budgetEstimate: campBudget.trim() || '$1,000',
      performanceIndicators: ['20 qualified inbound inquiries', '4 enterprise pilot conversions'],
      assignedAgentId: 'agt-cmp-plan',
      executionChecklist: [
        { id: `chk-${Date.now()}-1`, step: 'Draft technical benchmark narrative', assignedRole: 'Technical Editorial', isCompleted: false },
        { id: `chk-${Date.now()}-2`, step: 'Enrich target account list', assignedRole: 'Prospect Intelligence', isCompleted: false },
        { id: `chk-${Date.now()}-3`, step: 'Submit outreach package to Human Approval Queue', assignedRole: 'Outreach Assistant', isCompleted: false }
      ]
    });

    setCampName('');
    setCampObjective('');
    setCampAudience('');
    setCampConcept('');
    setIsCreateCampaignModalOpen(false);
  };

  const handleRunMarketingStrategist = async () => {
    setIsGeneratingStrategy(true);
    try {
      const { output } = await executeMarketingStrategy(stratVentureId, stratObjective);
      setGeneratedStrategy(output);
    } catch (err: any) {
      console.error('Marketing strategy generation error:', err);
    } finally {
      setIsGeneratingStrategy(false);
    }
  };

  const handleRunGrowthAudit = async () => {
    setIsAnalyzingGrowth(true);
    try {
      const { output } = await executeGrowthAnalysis('Q4 Commercial Pipeline Audit');
      setGrowthReport(output);
    } catch (err: any) {
      console.error('Growth analysis audit error:', err);
    } finally {
      setIsAnalyzingGrowth(false);
    }
  };

  const getStatusBadge = (status: TrackableCampaignStatus) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-800';
      case 'PLANNED':
        return 'bg-indigo-950/80 text-indigo-300 border-indigo-800';
      case 'AWAITING_APPROVAL':
        return 'bg-amber-950/80 text-amber-300 border-amber-800';
      case 'APPROVED':
        return 'bg-cyan-950/80 text-cyan-300 border-cyan-800';
      case 'PAUSED':
        return 'bg-slate-800 text-slate-300 border-slate-700';
      case 'COMPLETED':
        return 'bg-emerald-950 text-emerald-400 border-emerald-700';
      case 'CANCELLED':
        return 'bg-rose-950 text-rose-300 border-rose-800';
      default:
        return 'bg-slate-900 text-slate-400 border-slate-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">
              Commercial Operations & Campaign Management
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950/70 border border-indigo-700/50 text-indigo-300">
              GROWTH WORKFORCE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Coordinate multi-venture marketing strategies, trackable campaign lifecycles, bottleneck audits, and integration gateways.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIsCreateCampaignModalOpen(true)}
            className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Campaign</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-1">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('campaigns')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'campaigns'
                ? 'bg-slate-800 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5 text-indigo-400" />
            <span>Campaign Workstreams ({commercialCampaigns.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('strategies')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'strategies'
                ? 'bg-slate-800 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Marketing Strategist (Helix)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('growth_analysis')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'growth_analysis'
                ? 'bg-slate-800 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Growth & Bottleneck Audit (Prism)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('integrations')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'integrations'
                ? 'bg-slate-800 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>Integration Gateways ({commercialIntegrations.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: CAMPAIGNS ROSTER */}
      {activeTab === 'campaigns' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="p-3 bg-[#0c121d] border border-slate-800 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="text-slate-400 text-[11px] font-semibold">Filter Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1 bg-[#080d16] border border-slate-800 rounded text-xs text-slate-200 font-mono"
              >
                <option value="all">All Statuses ({commercialCampaigns.length})</option>
                {campaignStatuses.map(st => (
                  <option key={st} value={st}>
                    {st.replace('_', ' ')} ({commercialCampaigns.filter(c => c.status === st).length})
                  </option>
                ))}
              </select>

              <span className="text-slate-400 text-[11px] font-semibold ml-2">Product:</span>
              <select
                value={selectedVentureId}
                onChange={(e) => setSelectedVentureId(e.target.value)}
                className="px-2.5 py-1 bg-[#080d16] border border-slate-800 rounded text-xs text-slate-200"
              >
                <option value="all">All Products</option>
                {ventures.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Campaign Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredCampaigns.map((camp) => {
              const venture = ventures.find(v => v.id === camp.ventureId);
              const completedSteps = camp.executionChecklist.filter(item => item.isCompleted).length;
              return (
                <div
                  key={camp.id}
                  className="p-5 rounded-lg bg-[#0c121d] border border-slate-800 hover:border-slate-700 transition-colors space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-indigo-300">
                            {venture?.name || 'Venture'}
                          </span>
                          <select
                            value={camp.status}
                            onChange={(e) => updateCommercialCampaignStatus(camp.id, e.target.value as TrackableCampaignStatus)}
                            className={`px-2 py-0.5 rounded font-mono text-[10px] font-semibold uppercase border ${getStatusBadge(camp.status)} focus:outline-hidden`}
                          >
                            {campaignStatuses.map(st => (
                              <option key={st} value={st}>{st.replace('_', ' ')}</option>
                            ))}
                          </select>
                        </div>
                        <h3 className="text-sm font-bold text-slate-100">
                          {camp.name}
                        </h3>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {camp.objective}
                    </p>

                    {/* Channels & Timeline */}
                    <div className="flex flex-wrap gap-1.5">
                      {camp.channels.map((ch, i) => (
                        <span key={i} className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800/80 border border-slate-700 text-slate-300">
                          {ch}
                        </span>
                      ))}
                    </div>

                    {/* Actual Measured Metrics Block */}
                    {camp.actualPerformanceData && camp.actualPerformanceData.isMeasured && (
                      <div className="p-3 rounded bg-[#070b12] border border-slate-800 text-xs">
                        <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1.5 font-semibold">
                          <span className="text-emerald-400 flex items-center gap-1 font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Measured Actual Performance
                          </span>
                          <span className="font-mono text-[10px]">
                            {camp.actualPerformanceData.lastRecordedAt ? new Date(camp.actualPerformanceData.lastRecordedAt).toLocaleDateString() : 'Active Telemetry'}
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-2 font-mono text-center">
                          <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                            <div className="text-slate-400 text-[10px]">Impressions</div>
                            <div className="font-bold text-slate-200">{camp.actualPerformanceData.impressions?.toLocaleString() || 0}</div>
                          </div>
                          <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                            <div className="text-slate-400 text-[10px]">Clicks</div>
                            <div className="font-bold text-slate-200">{camp.actualPerformanceData.clicks?.toLocaleString() || 0}</div>
                          </div>
                          <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                            <div className="text-slate-400 text-[10px]">Inbounds</div>
                            <div className="font-bold text-indigo-400">{camp.actualPerformanceData.leadsGenerated || 0}</div>
                          </div>
                          <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                            <div className="text-slate-400 text-[10px]">Conversions</div>
                            <div className="font-bold text-emerald-400">{camp.actualPerformanceData.conversions || 0}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Execution Checklist Progress */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="flex items-center gap-1 font-semibold">
                          <CheckSquare className="w-3.5 h-3.5 text-indigo-400" />
                          Operational Checklist
                        </span>
                        <span className="font-mono">{completedSteps}/{camp.executionChecklist.length} steps completed</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full transition-all"
                          style={{ width: `${(completedSteps / Math.max(camp.executionChecklist.length, 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400 font-mono">
                      Timeline: {camp.timeline}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedCampaignForDetail(camp)}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-200 transition-colors"
                    >
                      Inspect Checklist & Collateral →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: MARKETING STRATEGIST (HELIX) */}
      {activeTab === 'strategies' && (
        <div className="space-y-6">
          {/* Action Trigger Card */}
          <div className="p-5 rounded-lg bg-[#0c121d] border border-slate-800 space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <h2 className="text-base font-bold text-slate-100">
                  Marketing Strategist (Helix) — Positioning & Acquisition Planner
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                Formulate comprehensive B2B positioning narratives, customer pain points, acquisition channel selections, and pricing recommendations.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Portfolio Product Being Marketed</label>
                <select
                  value={stratVentureId}
                  onChange={(e) => setStratVentureId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#080d16] border border-slate-800 rounded-lg text-xs text-slate-200"
                >
                  {ventures.map(v => (
                    <option key={v.id} value={v.id}>{v.name} — {v.tagline}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Mission Objective</label>
                <input
                  type="text"
                  value={stratObjective}
                  onChange={(e) => setStratObjective(e.target.value)}
                  placeholder="e.g. Expand into European healthcare compliance markets"
                  className="w-full px-3 py-2 bg-[#080d16] border border-slate-800 rounded-lg text-xs text-slate-200"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleRunMarketingStrategist}
                disabled={isGeneratingStrategy}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
              >
                {isGeneratingStrategy ? (
                  <>
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Helix Formulating Marketing Strategy...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate Structured Marketing Plan</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Generated Output Brief */}
          {generatedStrategy && (
            <div className="p-6 rounded-lg bg-[#0c121d] border border-slate-800 space-y-5">
              <div className="p-4 rounded-lg bg-emerald-950/20 border border-emerald-800/40 space-y-1.5">
                <div className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
                  Product Positioning Blueprint · {generatedStrategy.productBeingMarketed}
                </div>
                <h3 className="text-base font-bold text-slate-100">
                  Value Prop: {generatedStrategy.valueProposition}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Positioning: {generatedStrategy.competitivePositioning}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-lg bg-[#080d16] border border-slate-800 space-y-2">
                  <h4 className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">Validated Customer Pain Points</h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                    {generatedStrategy.customerPainPoints.map((pain, i) => (
                      <li key={i}>{pain}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-lg bg-[#080d16] border border-slate-800 space-y-2">
                  <h4 className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">Recommended Acquisition Channels</h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                    {generatedStrategy.recommendedChannels.map((ch, i) => (
                      <li key={i}>{ch}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-[#080d16] border border-slate-800 text-xs space-y-2">
                <h4 className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">Full Marketing Strategy Narrative</h4>
                <p className="text-slate-300 leading-relaxed font-mono text-[11px]">
                  {generatedStrategy.marketingStrategy}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-[#080d16] border border-slate-800 rounded-lg">
                  <span className="text-slate-400 text-[11px] font-semibold block mb-1">Budget Considerations:</span>
                  <p className="text-slate-300 text-[11px]">{generatedStrategy.budgetConsiderations}</p>
                </div>
                <div className="p-3 bg-[#080d16] border border-slate-800 rounded-lg">
                  <span className="text-slate-400 text-[11px] font-semibold block mb-1">Success Metrics:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {generatedStrategy.successMetrics.map((met, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                        {met}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: GROWTH ANALYST (PRISM) */}
      {activeTab === 'growth_analysis' && (
        <div className="space-y-6">
          <div className="p-5 rounded-lg bg-[#0c121d] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <h2 className="text-base font-bold text-slate-100">
                  Growth Analyst (Prism) — Pipeline Bottlenecks & Conversion Diagnostics
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                Prism strictly inspects factual recorded relationships, campaigns, and approval turnaround to find growth opportunities without fabricating numbers.
              </p>
            </div>

            <button
              type="button"
              onClick={handleRunGrowthAudit}
              disabled={isAnalyzingGrowth}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm shrink-0 transition-all"
            >
              {isAnalyzingGrowth ? (
                <>
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Auditing Pipeline Data...</span>
                </>
              ) : (
                <>
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Execute Growth Audit</span>
                </>
              )}
            </button>
          </div>

          {/* Growth Analysis Report Output */}
          {growthReport && (
            <div className="p-6 rounded-lg bg-[#0c121d] border border-slate-800 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300">
                    DATA RELIABILITY: {growthReport.dataReliability.toUpperCase()}
                  </span>
                  <h3 className="text-base font-bold text-slate-100 mt-1">
                    Operating Period: {growthReport.analysisPeriod}
                  </h3>
                </div>
              </div>

              {/* Performance Observations */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Empirical Performance Observations
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {growthReport.performanceObservations.map((obs, i) => (
                    <div key={i} className="p-3 rounded-lg bg-[#080d16] border border-slate-800 text-xs text-slate-300">
                      {obs}
                    </div>
                  ))}
                </div>
              </div>

              {/* Identified Bottlenecks & Growth Opportunities */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-lg bg-rose-950/20 border border-rose-800/40 space-y-2">
                  <div className="font-semibold text-rose-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    <span>Identified Commercial Bottlenecks</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1.5 text-slate-300 text-[11px]">
                    {growthReport.identifiedBottlenecks.map((bot, i) => (
                      <li key={i}>{bot}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-lg bg-emerald-950/20 border border-emerald-800/40 space-y-2">
                  <div className="font-semibold text-emerald-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-emerald-400" />
                    <span>High-Leverage Growth Vectors</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1.5 text-slate-300 text-[11px]">
                    {growthReport.growthOpportunities.map((opp, i) => (
                      <li key={i}>{opp}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Suggested Growth Experiments */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Testable Growth Experiments
                </h4>
                <div className="space-y-2">
                  {growthReport.suggestedExperiments.map((exp, i) => (
                    <div key={i} className="p-3 bg-[#080d16] border border-slate-800 rounded-lg flex items-center justify-between gap-4 text-xs">
                      <div>
                        <div className="font-semibold text-slate-200">{exp.experiment}</div>
                        <div className="text-slate-400 text-[11px] mt-0.5">Hypothesis: {exp.hypothesis}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-mono text-emerald-400 font-bold block">{exp.metric}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{exp.estimatedTimeframe}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: INTEGRATION GATEWAYS */}
      {activeTab === 'integrations' && (
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-[#0c121d] border border-slate-800">
            <h3 className="text-sm font-bold text-slate-100">
              Commercial Integration Gateway Status
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Genuine configuration state of third-party communications, CRM sync, social platforms, analytics, and payment infrastructure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {commercialIntegrations.map((conn) => {
              const isConnected = conn.status === 'CONNECTED';
              return (
                <div
                  key={conn.id}
                  className="p-4 rounded-lg bg-[#0c121d] border border-slate-800 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded uppercase bg-slate-800 text-slate-300">
                        {conn.category}
                      </span>
                      <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase ${
                        isConnected ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                        'bg-slate-900 text-slate-400 border border-slate-800'
                      }`}>
                        {conn.status}
                      </span>
                    </div>

                    <h4 className="text-sm font-semibold text-slate-200">
                      {conn.name}
                    </h4>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      {conn.description}
                    </p>

                    <div className="p-2 rounded bg-[#070b12] border border-slate-800 text-[10px] font-mono text-slate-400">
                      Required Secret: <span className="text-amber-400">{conn.requiredEnvVar}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-500">
                    {conn.configNotes}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DETAIL MODAL FOR CAMPAIGN */}
      {selectedCampaignForDetail && (
        <Modal
          isOpen={!!selectedCampaignForDetail}
          onClose={() => setSelectedCampaignForDetail(null)}
          title={`Campaign: ${selectedCampaignForDetail.name}`}
          description={`Status: ${selectedCampaignForDetail.status} · Timeline: ${selectedCampaignForDetail.timeline}`}
          maxWidth="xl"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-lg bg-[#070b12] border border-slate-800 space-y-1">
              <span className="text-slate-400 font-semibold block">Strategic Objective:</span>
              <p className="text-slate-200">{selectedCampaignForDetail.objective}</p>
            </div>

            <div>
              <h4 className="font-semibold text-slate-300 mb-2">Content & Collateral Requirements</h4>
              <ul className="list-disc list-inside space-y-1 text-slate-300">
                {selectedCampaignForDetail.contentRequirements.map((req, i) => (
                  <li key={i}>{req}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-300 mb-2">Execution Checklist</h4>
              <div className="space-y-2">
                {selectedCampaignForDetail.executionChecklist.map((step) => (
                  <div key={step.id} className="p-2.5 rounded bg-[#090d16] border border-slate-800 flex items-center justify-between gap-3">
                    <span className="text-slate-200 font-medium">{step.step}</span>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                        {step.assignedRole}
                      </span>
                      <span className={`px-2 py-0.5 rounded font-mono text-[10px] uppercase ${
                        step.isCompleted ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'
                      }`}>
                        {step.isCompleted ? 'Completed' : 'Pending'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* MANUAL CREATE CAMPAIGN MODAL */}
      <Modal
        isOpen={isCreateCampaignModalOpen}
        onClose={() => setIsCreateCampaignModalOpen(false)}
        title="Create New Commercial Campaign"
        description="Define campaign parameters, target technical audience, and initial operational checklist."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateManualCampaign} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Campaign Title *</label>
            <input
              type="text"
              value={campName}
              onChange={(e) => setCampName(e.target.value)}
              placeholder="e.g. Q1 Kubernetes FinOps Migration Blitz"
              className="w-full px-3 py-2 bg-[#0c121d] border border-slate-800 rounded text-xs text-slate-200"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Related Venture</label>
              <select
                value={campVentureId}
                onChange={(e) => setCampVentureId(e.target.value)}
                className="w-full px-3 py-2 bg-[#0c121d] border border-slate-800 rounded text-xs text-slate-200"
              >
                {ventures.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Estimated Timeline</label>
              <input
                type="text"
                value={campTimeline}
                onChange={(e) => setCampTimeline(e.target.value)}
                placeholder="4 weeks"
                className="w-full px-3 py-2 bg-[#0c121d] border border-slate-800 rounded text-xs text-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Core Campaign Objective *</label>
            <textarea
              value={campObjective}
              onChange={(e) => setCampObjective(e.target.value)}
              rows={2}
              placeholder="Specify the measurable target (e.g. acquire 20 qualified mid-market audits)..."
              className="w-full px-3 py-2 bg-[#0c121d] border border-slate-800 rounded text-xs text-slate-200 resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Distribution Channels (Comma separated)</label>
            <input
              type="text"
              value={campChannelsInput}
              onChange={(e) => setCampChannelsInput(e.target.value)}
              className="w-full px-3 py-2 bg-[#0c121d] border border-slate-800 rounded text-xs text-slate-200 font-mono"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsCreateCampaignModalOpen(false)}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded"
            >
              Create Campaign Plan
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
