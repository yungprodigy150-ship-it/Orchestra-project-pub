import React, { useState } from 'react';
import {
  Crosshair,
  Plus,
  ArrowRight,
  TrendingUp,
  DollarSign,
  UserCheck,
  Building,
  Calendar,
  CheckCircle,
  Clock,
  Search,
  Filter,
  Mail,
  Send,
  ShieldAlert,
  Bot,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  RotateCw,
  FileText,
  Users,
  Compass
} from 'lucide-react';
import { useOrchestra } from '../../context/OrchestraContext';
import {
  Opportunity,
  OpportunityStage,
  RelationshipRecord,
  CRMPipelineStage,
  RelationshipCategory
} from '../../types';
import { Modal } from '../common/Modal';

export const OpportunitiesView: React.FC = () => {
  const {
    opportunities,
    relationships,
    ventures,
    agents,
    activeVentureFilter,
    createOpportunity,
    updateOpportunityStage,
    createRelationship,
    updateRelationshipStage,
    executeOutreachPreparation,
    setIsApprovalModalOpen,
    approvals,
    discoveredLeads,
    discoverLeads,
    promoteLeadToCRM
  } = useOrchestra();

  // Active Tab: CRM Pipeline, Strategic Opportunities, Discovered Leads, Outreach Drafter
  const [activeTab, setActiveTab] = useState<'crm' | 'opportunities' | 'leads' | 'outreach_drafter'>('crm');

  // Lead Discovery State
  const [leadIndustry, setLeadIndustry] = useState('Cloud Infrastructure & Kubernetes');
  const [leadGeography, setLeadGeography] = useState('Global');
  const [leadKeywords, setLeadKeywords] = useState('EKS, Spot Compaction, FinOps');
  const [leadTargetVenture, setLeadTargetVenture] = useState(ventures[0]?.id || 'v-1');
  const [isDiscoveringLeads, setIsDiscoveringLeads] = useState(false);
  const [leadFeedback, setLeadFeedback] = useState<string | null>(null);

  // Filters
  const [crmStageFilter, setCrmStageFilter] = useState<string>('all');
  const [selectedVentureId, setSelectedVentureId] = useState<string>('all');
  const [industryFilter, setIndustryFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isAddRelationshipModalOpen, setIsAddRelationshipModalOpen] = useState(false);
  const [isAddOppModalOpen, setIsAddOppModalOpen] = useState(false);
  const [selectedRelationshipForDetail, setSelectedRelationshipForDetail] = useState<RelationshipRecord | null>(null);

  // New Relationship Form
  const [orgName, setOrgName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactDetails, setContactDetails] = useState('');
  const [industry, setIndustry] = useState('');
  const [relatedProductId, setRelatedProductId] = useState(ventures[0]?.id || 'v-1');
  const [category, setCategory] = useState<RelationshipCategory>('prospect');
  const [initialStage, setInitialStage] = useState<CRMPipelineStage>('QUALIFIED');
  const [estimatedValue, setEstimatedValue] = useState('$50,000 ARR');
  const [relNotes, setRelNotes] = useState('');

  // Quick Outreach Drafter State
  const [outreachTargetOrg, setOutreachTargetOrg] = useState('');
  const [outreachContext, setOutreachContext] = useState('');
  const [outreachVentureId, setOutreachVentureId] = useState(ventures[0]?.id || 'v-1');
  const [isDraftingOutreach, setIsDraftingOutreach] = useState(false);
  const [outreachSuccessMessage, setOutreachSuccessMessage] = useState<string | null>(null);

  const crmStages: CRMPipelineStage[] = [
    'DISCOVERED',
    'RESEARCHING',
    'QUALIFIED',
    'CONTACT_PREPARED',
    'AWAITING_APPROVAL',
    'CONTACTED',
    'RESPONDED',
    'NEGOTIATION',
    'CONVERTED',
    'UNQUALIFIED'
  ];

  // Distinct Industries for Filter
  const distinctIndustries = Array.from(new Set(relationships.map(r => r.industry))).filter(Boolean);

  // Filtered CRM Relationships
  const filteredRelationships = relationships.filter(rel => {
    const matchesVenture = (selectedVentureId === 'all' && activeVentureFilter === 'all')
      || (selectedVentureId !== 'all' ? rel.relatedProductId === selectedVentureId : rel.relatedProductId === activeVentureFilter);
    const matchesStage = crmStageFilter === 'all' || rel.pipelineStage === crmStageFilter;
    const matchesIndustry = industryFilter === 'all' || rel.industry === industryFilter;
    const matchesCategory = categoryFilter === 'all' || rel.relationshipCategory === categoryFilter;
    const matchesQuery = !searchQuery
      || rel.organization.toLowerCase().includes(searchQuery.toLowerCase())
      || (rel.contactName && rel.contactName.toLowerCase().includes(searchQuery.toLowerCase()))
      || rel.notes.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesVenture && matchesStage && matchesIndustry && matchesCategory && matchesQuery;
  });

  const pendingApprovalsCount = approvals.filter(a => a.decision === 'PENDING').length;

  const handleCreateRelationship = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim() || !industry.trim()) return;

    createRelationship({
      organization: orgName.trim(),
      contactName: contactName.trim() || undefined,
      contactDetails: contactDetails.trim() || undefined,
      industry: industry.trim(),
      relatedProductId,
      relationshipCategory: category,
      pipelineStage: initialStage,
      source: 'Manual BD Operator Entry',
      notes: relNotes.trim() || 'Account created for commercial investigation.',
      assignedAgentId: 'agt-rel-mgr',
      nextRecommendedAction: 'Assign Outreach Assistant to formulate preliminary value proposition',
      estimatedValue: estimatedValue.trim() || undefined,
      qualificationScore: 80
    });

    setOrgName('');
    setContactName('');
    setContactDetails('');
    setIndustry('');
    setRelNotes('');
    setIsAddRelationshipModalOpen(false);
  };

  const handleRunOutreachDraft = async (org: string, context: string, vId: string, relId?: string) => {
    setIsDraftingOutreach(true);
    setOutreachSuccessMessage(null);
    try {
      const { output, approval } = await executeOutreachPreparation(vId, org, context, relId);
      setOutreachSuccessMessage(`Outreach draft generated by Courier and submitted to Human Approval Queue (ID: ${approval.id}).`);
    } catch (err: any) {
      console.error('Failed to generate outreach draft:', err);
    } finally {
      setIsDraftingOutreach(false);
    }
  };

  const getStageColor = (stage: CRMPipelineStage) => {
    switch (stage) {
      case 'QUALIFIED':
        return 'bg-indigo-950/80 text-indigo-300 border-indigo-800';
      case 'CONTACT_PREPARED':
        return 'bg-purple-950/80 text-purple-300 border-purple-800';
      case 'AWAITING_APPROVAL':
        return 'bg-amber-950/80 text-amber-300 border-amber-800';
      case 'CONTACTED':
        return 'bg-blue-950/80 text-blue-300 border-blue-800';
      case 'RESPONDED':
        return 'bg-cyan-950/80 text-cyan-300 border-cyan-800';
      case 'NEGOTIATION':
        return 'bg-yellow-950/80 text-yellow-300 border-yellow-800';
      case 'CONVERTED':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-800';
      case 'UNQUALIFIED':
        return 'bg-slate-800 text-slate-400 border-slate-700';
      default:
        return 'bg-slate-900 text-slate-300 border-slate-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">
              Business Development & Relationship CRM
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950/70 border border-indigo-700/50 text-indigo-300">
              STAGE 5 COMMERCIAL WORKFORCE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Centralized enterprise prospect pipeline, multi-product matching, outreach staging, and relationship history.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {pendingApprovalsCount > 0 && (
            <button
              type="button"
              onClick={() => setIsApprovalModalOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold text-amber-300 bg-amber-950/80 hover:bg-amber-900 border border-amber-700/80 rounded flex items-center gap-1.5 transition-colors shadow-sm animate-pulse"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Review Approvals ({pendingApprovalsCount})</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsAddRelationshipModalOpen(true)}
            className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add CRM Prospect</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-1">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('crm')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'crm'
                ? 'bg-slate-800 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            <span>Lightweight CRM Pipeline ({relationships.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('opportunities')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'opportunities'
                ? 'bg-slate-800 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5 text-amber-400" />
            <span>Market Signals ({opportunities.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('leads')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'leads'
                ? 'bg-slate-800 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            <span>Discovered Leads ({discoveredLeads.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('outreach_drafter')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'outreach_drafter'
                ? 'bg-slate-800 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Send className="w-3.5 h-3.5 text-cyan-400" />
            <span>Outreach Drafter (Courier)</span>
          </button>
        </div>
      </div>

      {/* TAB 1: LIGHTWEIGHT CRM PIPELINE */}
      {activeTab === 'crm' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="p-3 bg-[#0c121d] border border-slate-800 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-slate-400 text-[11px] font-semibold">Filter Stage:</span>
              <select
                value={crmStageFilter}
                onChange={(e) => setCrmStageFilter(e.target.value)}
                className="px-2.5 py-1 bg-[#080d16] border border-slate-800 rounded text-xs text-slate-200"
              >
                <option value="all">All Stages ({relationships.length})</option>
                {crmStages.map(st => (
                  <option key={st} value={st}>
                    {st.replace('_', ' ')} ({relationships.filter(r => r.pipelineStage === st).length})
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
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>

              {distinctIndustries.length > 0 && (
                <>
                  <span className="text-slate-400 text-[11px] font-semibold ml-2">Industry:</span>
                  <select
                    value={industryFilter}
                    onChange={(e) => setIndustryFilter(e.target.value)}
                    className="px-2.5 py-1 bg-[#080d16] border border-slate-800 rounded text-xs text-slate-200"
                  >
                    <option value="all">All Industries</option>
                    {distinctIndustries.map(ind => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </>
              )}
            </div>

            <div className="w-full sm:w-64">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search prospect or contact..."
                  className="w-full pl-8 pr-3 py-1 bg-[#080d16] border border-slate-800 rounded text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* CRM Roster Table */}
          <div className="bg-[#0c121d] border border-slate-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-[#090d16] text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Organization & Contact</th>
                    <th className="py-3 px-4">Related Product</th>
                    <th className="py-3 px-4">Pipeline Stage</th>
                    <th className="py-3 px-4">Est. Value</th>
                    <th className="py-3 px-4">Score</th>
                    <th className="py-3 px-4">Next Recommended Action</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredRelationships.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-xs text-slate-500">
                        No CRM relationships matching current filters. Click &quot;Add CRM Prospect&quot; to register an account.
                      </td>
                    </tr>
                  ) : (
                    filteredRelationships.map((rel) => {
                      const venture = ventures.find(v => v.id === rel.relatedProductId);
                      return (
                        <tr key={rel.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-200">{rel.organization}</div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                              <span>{rel.contactName || 'Public Engineering Profile'}</span>
                              <span>·</span>
                              <span className="font-mono text-slate-500">{rel.industry}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-medium text-indigo-300 font-mono text-[11px]">
                              {venture?.name || 'AetherCloud'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <select
                              value={rel.pipelineStage}
                              onChange={(e) => updateRelationshipStage(rel.id, e.target.value as CRMPipelineStage)}
                              className={`px-2 py-0.5 rounded font-mono text-[10px] font-semibold border ${getStageColor(rel.pipelineStage)} focus:outline-hidden`}
                            >
                              {crmStages.map(st => (
                                <option key={st} value={st}>
                                  {st.replace('_', ' ')}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="py-3 px-4 font-mono text-emerald-400 font-bold">
                            {rel.estimatedValue || '—'}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-300">
                            {rel.qualificationScore ? (
                              <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">
                                {rel.qualificationScore}/100
                              </span>
                            ) : '—'}
                          </td>
                          <td className="py-3 px-4 text-slate-300 text-[11px] max-w-xs truncate">
                            {rel.nextRecommendedAction}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setOutreachTargetOrg(rel.organization);
                                  setOutreachContext(rel.notes);
                                  setOutreachVentureId(rel.relatedProductId);
                                  setActiveTab('outreach_drafter');
                                }}
                                className="px-2 py-1 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 rounded text-indigo-300 hover:text-white transition-colors text-[11px] flex items-center gap-1"
                                title="Draft personalized outreach with Courier"
                              >
                                <Mail className="w-3 h-3" />
                                <span>Draft</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setSelectedRelationshipForDetail(rel)}
                                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 hover:text-white transition-colors text-[11px]"
                              >
                                Inspect
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DISCOVERED STRATEGIC OPPORTUNITIES */}
      {activeTab === 'opportunities' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {opportunities.map(opp => {
              const venture = ventures.find(v => v.id === opp.ventureId);
              return (
                <div
                  key={opp.id}
                  className="p-4 rounded-lg bg-[#0c121d] border border-slate-800 hover:border-slate-700 transition-colors space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                        {venture?.name || 'Venture'}
                      </span>
                      <h3 className="text-sm font-semibold text-slate-100 mt-1.5">
                        {opp.title}
                      </h3>
                      <div className="text-xs text-slate-400">{opp.partnerOrLead}</div>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {opp.estimatedValue}
                    </span>
                  </div>

                  <div className="p-2.5 rounded bg-[#070b12] border border-slate-800 text-xs text-slate-300">
                    <span className="text-slate-500 text-[11px] block">Strategic Rationale:</span>
                    {opp.scorecard?.rationale || 'High-leverage enterprise expansion vector.'}
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-slate-400">Next Step: {opp.nextStepDate}</span>
                    <button
                      type="button"
                      onClick={() => {
                        createRelationship({
                          organization: opp.partnerOrLead,
                          industry: 'Enterprise Software',
                          relatedProductId: opp.ventureId,
                          relationshipCategory: 'prospect',
                          pipelineStage: 'QUALIFIED',
                          source: 'Strategic Opportunities Pipeline',
                          notes: opp.scorecard?.rationale || opp.title,
                          assignedAgentId: 'agt-rel-mgr',
                          nextRecommendedAction: opp.nextStep,
                          estimatedValue: opp.estimatedValue,
                          qualificationScore: 85
                        });
                        setActiveTab('crm');
                      }}
                      className="px-2 py-1 text-xs text-indigo-400 hover:text-white hover:bg-indigo-950/60 rounded transition-colors flex items-center gap-1"
                    >
                      <span>Promote to CRM</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: OUTREACH DRAFTER (COURIER) */}
      {activeTab === 'outreach_drafter' && (
        <div className="max-w-3xl mx-auto p-6 bg-[#0c121d] border border-slate-800 rounded-xl space-y-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <h2 className="text-base font-bold text-slate-100">
                Outreach Assistant (Courier) — Personalized Communication Staging
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Formulate bespoke B2B outbound emails matching prospect architectural pain points. Communications are strictly drafted and automatically submitted to the Centralized Human Approval Queue.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Target Organization / Enterprise Prospect</label>
              <input
                type="text"
                value={outreachTargetOrg}
                onChange={(e) => setOutreachTargetOrg(e.target.value)}
                placeholder="e.g. Nexus Capital Infrastructure, Datacore GmbH"
                className="w-full px-3 py-2 bg-[#080d16] border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Matching Portfolio Product</label>
                <select
                  value={outreachVentureId}
                  onChange={(e) => setOutreachVentureId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#080d16] border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-hidden focus:border-indigo-500"
                >
                  {ventures.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.name} — {v.valueProposition.slice(0, 45)}...
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Pre-filled Prospect Context / Diagnostics</label>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setOutreachTargetOrg('Nexus Capital Infrastructure');
                      setOutreachContext('Migrating 300+ nodes to EKS with high off-peak compute drift.');
                      setOutreachVentureId('v-1');
                    }}
                    className="px-2 py-1 rounded bg-slate-800 text-[10px] text-slate-300 hover:text-white"
                  >
                    Preset: Nexus
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOutreachTargetOrg('StrataData Cloud');
                      setOutreachContext('Replacing fragile Debezium Postgres connectors streaming into Snowflake.');
                      setOutreachVentureId('v-2');
                    }}
                    className="px-2 py-1 rounded bg-slate-800 text-[10px] text-slate-300 hover:text-white"
                  >
                    Preset: StrataData
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Architectural Context & Observed Challenges</label>
              <textarea
                value={outreachContext}
                onChange={(e) => setOutreachContext(e.target.value)}
                rows={3}
                placeholder="Include details about their cloud infrastructure, database architecture, or recent tech hiring..."
                className="w-full px-3 py-2 bg-[#080d16] border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-hidden focus:border-indigo-500 resize-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              <div className="text-[11px] text-amber-400 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Zero autonomous sending. Drafts must be approved in the Approval Queue.</span>
              </div>

              <button
                type="button"
                onClick={() => handleRunOutreachDraft(outreachTargetOrg || 'Target Enterprise', outreachContext || 'Kubernetes FinOps migration', outreachVentureId)}
                disabled={isDraftingOutreach || !outreachTargetOrg.trim()}
                className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all ${
                  isDraftingOutreach || !outreachTargetOrg.trim()
                    ? 'bg-indigo-950 text-indigo-400 cursor-not-allowed border border-indigo-800'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
                }`}
              >
                {isDraftingOutreach ? (
                  <>
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Courier Formulating Draft...</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-3.5 h-3.5" />
                    <span>Generate Personalized Draft</span>
                  </>
                )}
              </button>
            </div>

            {outreachSuccessMessage && (
              <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-lg text-xs text-emerald-300 flex items-center justify-between gap-3">
                <span>{outreachSuccessMessage}</span>
                <button
                  type="button"
                  onClick={() => setIsApprovalModalOpen(true)}
                  className="px-2.5 py-1 bg-emerald-900 hover:bg-emerald-800 rounded text-[11px] font-semibold text-white shrink-0"
                >
                  View in Approval Queue →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: DISCOVERED LEADS & PUBLIC ENGINE */}
      {activeTab === 'leads' && (
        <div className="space-y-6 animate-fade-in">
          {/* Discovery Query Bar */}
          <div className="p-4 bg-[#0c121d] border border-slate-800 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Compass className="w-4 h-4 text-emerald-400" />
                  <span>Public Lead Discovery Engine (Scout · OPP-HUNTER)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Discovers real target organizations via search grounding. Deduplicates by corporate domain. Zero fabricated contact details.
                </p>
              </div>

              {leadFeedback && (
                <div className="text-xs text-emerald-400 font-medium px-3 py-1 bg-emerald-950/60 border border-emerald-800 rounded">
                  {leadFeedback}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs pt-1">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Target Industry</label>
                <input
                  type="text"
                  value={leadIndustry}
                  onChange={(e) => setLeadIndustry(e.target.value)}
                  className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-slate-100 text-xs"
                  placeholder="e.g. Cloud Infrastructure"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Geography</label>
                <input
                  type="text"
                  value={leadGeography}
                  onChange={(e) => setLeadGeography(e.target.value)}
                  className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-slate-100 text-xs"
                  placeholder="e.g. Global, Europe, North America"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Keywords</label>
                <input
                  type="text"
                  value={leadKeywords}
                  onChange={(e) => setLeadKeywords(e.target.value)}
                  className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-slate-100 text-xs"
                  placeholder="e.g. Kubernetes, FinOps, EKS"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Match Venture Pod</label>
                <select
                  value={leadTargetVenture}
                  onChange={(e) => setLeadTargetVenture(e.target.value)}
                  className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-slate-100 text-xs"
                >
                  {ventures.map(v => (
                    <option key={v.id} value={v.id}>{v.name} ({v.id})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={async () => {
                  if (!leadIndustry.trim()) return;
                  setIsDiscoveringLeads(true);
                  setLeadFeedback(null);
                  try {
                    const res = await discoverLeads({
                      industry: leadIndustry,
                      geography: leadGeography,
                      keywords: leadKeywords.split(',').map(s => s.trim()).filter(Boolean),
                      targetVentureId: leadTargetVenture
                    });
                    setLeadFeedback(`Ingested ${res.newLeads.length} new organizations (${res.duplicateCount} duplicates filtered).`);
                  } catch (err: any) {
                    setLeadFeedback(`Discovery error: ${err.message}`);
                  } finally {
                    setIsDiscoveringLeads(false);
                  }
                }}
                disabled={isDiscoveringLeads}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-sm"
              >
                {isDiscoveringLeads ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                <span>{isDiscoveringLeads ? 'Scout Searching Web Index...' : 'Discover Real Leads'}</span>
              </button>
            </div>
          </div>

          {/* Leads Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {discoveredLeads.map(lead => {
              const matchingVenture = ventures.find(v => v.id === lead.relevantProductId);

              return (
                <div
                  key={lead.id}
                  className="p-5 bg-[#0c121d] border border-slate-800 rounded-lg flex flex-col justify-between space-y-3 hover:border-slate-700 transition-colors"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div>
                        <h4 className="text-sm font-bold text-slate-100">{lead.organizationName}</h4>
                        {lead.website && (
                          <a
                            href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] text-indigo-400 hover:text-indigo-300 font-mono flex items-center gap-1 mt-0.5"
                          >
                            <span>{lead.domain || lead.website}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>

                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800">
                        {lead.confidenceScore}% Match
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400">
                      {lead.industry} · {lead.location || 'Global'}
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed mt-2.5 line-clamp-3">
                      {lead.qualificationReason}
                    </p>

                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>Venture Match</span>
                      <span className="text-indigo-300 font-semibold">{matchingVenture?.name || lead.relevantProductId}</span>
                    </div>

                    {lead.estimatedTechSpend && (
                      <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                        <span>Estimated Spend</span>
                        <span className="text-emerald-400 font-semibold">{lead.estimatedTechSpend}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(lead.discoveryTimestamp).toLocaleDateString()}
                    </span>

                    {lead.promotedToRelationshipId ? (
                      <span className="px-2.5 py-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 rounded font-semibold flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-emerald-400" />
                        <span>In CRM ({lead.promotedToRelationshipId})</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          const relId = promoteLeadToCRM(lead.id);
                          if (relId) {
                            setLeadFeedback(`Promoted ${lead.organizationName} to CRM pipeline (ID: ${relId}).`);
                          }
                        }}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-bold flex items-center gap-1 transition-colors shadow-sm"
                      >
                        <span>Promote to CRM</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DETAIL MODAL FOR CRM RELATIONSHIP */}
      {selectedRelationshipForDetail && (
        <Modal
          isOpen={!!selectedRelationshipForDetail}
          onClose={() => setSelectedRelationshipForDetail(null)}
          title={`CRM Account: ${selectedRelationshipForDetail.organization}`}
          description={`Stage: ${selectedRelationshipForDetail.pipelineStage} · Industry: ${selectedRelationshipForDetail.industry}`}
          maxWidth="xl"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-[#070b12] border border-slate-800">
              <div>
                <span className="text-slate-500 block">Contact Information:</span>
                <span className="text-slate-200 font-medium">
                  {selectedRelationshipForDetail.contactName || 'Public Profile'} ({selectedRelationshipForDetail.contactDetails || 'No direct phone/email recorded'})
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Estimated Commercial Value:</span>
                <span className="text-emerald-400 font-mono font-bold">
                  {selectedRelationshipForDetail.estimatedValue || 'Unquantified'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Pipeline Stage:</span>
                <span className={`px-2 py-0.5 rounded font-mono text-[10px] uppercase border ${getStageColor(selectedRelationshipForDetail.pipelineStage)}`}>
                  {selectedRelationshipForDetail.pipelineStage}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Qualification Score:</span>
                <span className="text-indigo-300 font-mono font-bold">
                  {selectedRelationshipForDetail.qualificationScore || 80}/100
                </span>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-slate-300 mb-1">Account Diagnostic Notes</h4>
              <p className="text-slate-300 p-3 rounded bg-[#090d16] border border-slate-800 leading-relaxed">
                {selectedRelationshipForDetail.notes}
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-slate-300 mb-2">Interaction Timeline History</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedRelationshipForDetail.interactionHistory.map((item) => (
                  <div key={item.id} className="p-2.5 rounded bg-[#070b12] border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-slate-400 text-[10px]">
                      <span className="font-mono text-indigo-400 uppercase">{item.type}</span>
                      <span>{new Date(item.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="text-slate-200 text-xs">{item.summary}</div>
                    <div className="text-slate-500 text-[10px]">Actor: {item.actor}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* CREATE RELATIONSHIP MODAL */}
      <Modal
        isOpen={isAddRelationshipModalOpen}
        onClose={() => setIsAddRelationshipModalOpen(false)}
        title="Add Prospect to CRM"
        description="Register an organization, qualification parameters, and assigned portfolio product."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateRelationship} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Organization Name *</label>
            <input
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="e.g. CloudScale GmbH"
              className="w-full px-3 py-2 bg-[#0c121d] border border-slate-800 rounded text-xs text-slate-200 focus:outline-hidden focus:border-indigo-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Contact Name (Public / Verified)</label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="e.g. Sarah Jenkins"
                className="w-full px-3 py-2 bg-[#0c121d] border border-slate-800 rounded text-xs text-slate-200 focus:outline-hidden focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Legitimately Sourced Details</label>
              <input
                type="text"
                value={contactDetails}
                onChange={(e) => setContactDetails(e.target.value)}
                placeholder="e.g. s.jenkins@cloudscale.io"
                className="w-full px-3 py-2 bg-[#0c121d] border border-slate-800 rounded text-xs text-slate-200 focus:outline-hidden focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Industry Vertical *</label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g. High-Frequency Trading, MedTech"
                className="w-full px-3 py-2 bg-[#0c121d] border border-slate-800 rounded text-xs text-slate-200 focus:outline-hidden focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Related Portfolio Product</label>
              <select
                value={relatedProductId}
                onChange={(e) => setRelatedProductId(e.target.value)}
                className="w-full px-3 py-2 bg-[#0c121d] border border-slate-800 rounded text-xs text-slate-200"
              >
                {ventures.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Pipeline Stage</label>
              <select
                value={initialStage}
                onChange={(e) => setInitialStage(e.target.value as CRMPipelineStage)}
                className="w-full px-3 py-2 bg-[#0c121d] border border-slate-800 rounded text-xs text-slate-200 font-mono"
              >
                {crmStages.map(st => (
                  <option key={st} value={st}>{st.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Estimated Value</label>
              <input
                type="text"
                value={estimatedValue}
                onChange={(e) => setEstimatedValue(e.target.value)}
                placeholder="$50,000 ARR"
                className="w-full px-3 py-2 bg-[#0c121d] border border-slate-800 rounded text-xs text-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Diagnostic Notes & Context</label>
            <textarea
              value={relNotes}
              onChange={(e) => setRelNotes(e.target.value)}
              rows={2}
              placeholder="Describe their operational challenge or cloud architecture..."
              className="w-full px-3 py-2 bg-[#0c121d] border border-slate-800 rounded text-xs text-slate-200 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddRelationshipModalOpen(false)}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded"
            >
              Save Prospect
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
