import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCw,
  Mail,
  Megaphone,
  Key,
  DollarSign,
  Send,
  FileText,
  User,
  ArrowRight,
  ExternalLink,
  Info
} from 'lucide-react';
import { useOrchestra } from '../../context/OrchestraContext';
import { ApprovalRecord, ApprovalDecision, ApprovalItemType } from '../../types';

interface ApprovalQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApprovalQueueModal: React.FC<ApprovalQueueModalProps> = ({
  isOpen,
  onClose
}) => {
  const { approvals, resolveApproval, commercialIntegrations } = useOrchestra();

  const [filterType, setFilterType] = useState<string>('all');
  const [filterDecision, setFilterDecision] = useState<string>('PENDING');
  const [selectedApproval, setSelectedApproval] = useState<ApprovalRecord | null>(null);
  const [revisionNotes, setRevisionNotes] = useState('');
  const [showRevisionInput, setShowRevisionInput] = useState(false);

  if (!isOpen) return null;

  const filteredApprovals = approvals.filter(item => {
    const matchesType = filterType === 'all' || item.itemType === filterType;
    const matchesDecision = filterDecision === 'all' || item.decision === filterDecision;
    return matchesType && matchesDecision;
  });

  const activeItem = selectedApproval || filteredApprovals[0] || null;

  const getItemTypeBadge = (type: ApprovalItemType) => {
    switch (type) {
      case 'outgoing_email':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-blue-950/70 border border-blue-800/60 text-blue-300">
            <Mail className="w-3 h-3" />
            Outgoing Email
          </span>
        );
      case 'campaign_publication':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-purple-950/70 border border-purple-800/60 text-purple-300">
            <Megaphone className="w-3 h-3" />
            Campaign Launch
          </span>
        );
      case 'financial_commitment':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-amber-950/70 border border-amber-800/60 text-amber-300">
            <DollarSign className="w-3 h-3" />
            Financial Budget
          </span>
        );
      case 'external_api_action':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/70 border border-emerald-800/60 text-emerald-300">
            <Key className="w-3 h-3" />
            API Consequence
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
            <FileText className="w-3 h-3" />
            External Action
          </span>
        );
    }
  };

  const getDecisionBadge = (decision: ApprovalDecision) => {
    switch (decision) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-amber-950/80 border border-amber-700 text-amber-300">
            <Clock className="w-3 h-3" />
            Awaiting Human Decision
          </span>
        );
      case 'APPROVE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/80 border border-emerald-700 text-emerald-300">
            <CheckCircle2 className="w-3 h-3" />
            Authorized
          </span>
        );
      case 'REJECT':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-rose-950/80 border border-rose-700 text-rose-300">
            <AlertCircle className="w-3 h-3" />
            Rejected
          </span>
        );
      case 'REQUEST_REVISION':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-950/80 border border-indigo-700 text-indigo-300">
            <RotateCw className="w-3 h-3" />
            Revision Requested
          </span>
        );
    }
  };

  const emailConnector = commercialIntegrations.find(c => c.category === 'email');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-5xl bg-[#0b1019] border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] z-10"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/90 bg-[#0d1422]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-base font-bold text-slate-100 tracking-tight">
                  Centralized Human Approval Queue
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/80 border border-amber-700/60 text-amber-300">
                  {approvals.filter(a => a.decision === 'PENDING').length} PENDING GATES
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Strict supervisory authorization for external communications, campaign publishing, and financial commitments.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="px-6 py-2.5 bg-[#080d16] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[11px]">Decision:</span>
            <div className="flex gap-1 p-0.5 bg-[#05080e] border border-slate-800 rounded">
              {['PENDING', 'APPROVE', 'REJECT', 'all'].map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setFilterDecision(d)}
                  className={`px-2 py-1 rounded text-[11px] font-mono capitalize transition-colors ${
                    filterDecision === d
                      ? 'bg-slate-800 text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {d === 'all' ? 'All' : d.toLowerCase().replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[11px]">Action Category:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-2 py-1 bg-[#0c121d] border border-slate-800 rounded text-xs text-slate-300"
            >
              <option value="all">All Action Types</option>
              <option value="outgoing_email">Outgoing Emails</option>
              <option value="campaign_publication">Campaign Publications</option>
              <option value="financial_commitment">Financial Commitments</option>
              <option value="external_api_action">External API Actions</option>
            </select>
          </div>
        </div>

        {/* Body Grid: Master List on Left, Detail & Authorization on Right */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 min-h-0 divide-y md:divide-y-0 md:divide-x divide-slate-800">
          {/* Left Column: Items List (5 cols) */}
          <div className="md:col-span-5 p-4 space-y-2 bg-[#090e17]/80 overflow-y-auto max-h-[60vh] md:max-h-none">
            {filteredApprovals.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-800 rounded-lg">
                No approval records matching criteria.
              </div>
            ) : (
              filteredApprovals.map(item => {
                const isSelected = activeItem?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedApproval(item);
                      setShowRevisionInput(false);
                    }}
                    className={`p-3 rounded-lg border text-xs cursor-pointer transition-all space-y-1.5 ${
                      isSelected
                        ? 'bg-slate-800/90 border-amber-500/80 text-white shadow-xs'
                        : 'bg-[#0c121d] border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      {getItemTypeBadge(item.itemType)}
                      {getDecisionBadge(item.decision)}
                    </div>
                    <div className="font-semibold text-slate-200 line-clamp-1">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center justify-between">
                      <span>{item.requestingAgentName}</span>
                      <span className="font-mono text-[10px]">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Inspection, Proposed Content & Action Buttons (7 cols) */}
          <div className="md:col-span-7 p-6 flex flex-col justify-between overflow-y-auto bg-[#0a0f19]">
            {activeItem ? (
              <div className="space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    {getItemTypeBadge(activeItem.itemType)}
                    {getDecisionBadge(activeItem.decision)}
                  </div>
                  <h3 className="text-base font-bold text-slate-100">
                    {activeItem.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {activeItem.description}
                  </p>
                </div>

                {/* Metadata Strip */}
                <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-[#070b12] border border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-500 text-[11px] block">Requesting Agent:</span>
                    <span className="font-mono text-indigo-400 font-semibold">{activeItem.requestingAgentName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block">Queued At:</span>
                    <span className="font-mono text-slate-300">{new Date(activeItem.timestamp).toLocaleString()}</span>
                  </div>
                  {activeItem.relatedProspectName && (
                    <div>
                      <span className="text-slate-500 text-[11px] block">Related Prospect Account:</span>
                      <span className="text-slate-200 font-medium">{activeItem.relatedProspectName}</span>
                    </div>
                  )}
                  {activeItem.relatedCampaignName && (
                    <div>
                      <span className="text-slate-500 text-[11px] block">Related Campaign:</span>
                      <span className="text-slate-200 font-medium">{activeItem.relatedCampaignName}</span>
                    </div>
                  )}
                </div>

                {/* Proposed Content Preview Canvas */}
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    <span>Proposed Communication / Action Content</span>
                    <span className="text-[10px] font-mono text-amber-400">Strictly Staged</span>
                  </div>
                  <div className="p-4 rounded-lg bg-[#060910] border border-slate-800 text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
                    {activeItem.proposedContent}
                  </div>
                </div>

                {/* Integration Status Notice */}
                {activeItem.itemType === 'outgoing_email' && (
                  <div className="p-3 rounded-lg bg-blue-950/30 border border-blue-800/40 text-xs text-blue-300 flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-blue-200">Email Gateway Status: </span>
                      {emailConnector?.status === 'CONNECTED' ? (
                        <span className="text-emerald-400">CONNECTED — Real dispatch will execute upon approval.</span>
                      ) : (
                        <span>
                          NOT_CONFIGURED. Approving this communication will record authorization and stage the dispatch in local logs without executing mock external calls.
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Prior Decision Record if already decided */}
                {activeItem.decision !== 'PENDING' && (
                  <div className="p-3 rounded-lg bg-[#070b12] border border-slate-800 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-300">Decision Record:</span>
                      <span className="font-mono text-slate-400">{activeItem.decisionTimestamp ? new Date(activeItem.decisionTimestamp).toLocaleString() : ''}</span>
                    </div>
                    <div className="text-slate-400">
                      Decided by: <span className="text-slate-200 font-mono">{activeItem.decisionBy}</span>
                    </div>
                    {activeItem.decisionNotes && (
                      <div className="text-slate-300 italic">Notes: &quot;{activeItem.decisionNotes}&quot;</div>
                    )}
                    {activeItem.executionResult && (
                      <div className="pt-2 border-t border-slate-800/80 text-[11px] font-mono text-emerald-400">
                        Result: [{activeItem.executionResult.status}] {activeItem.executionResult.message}
                      </div>
                    )}
                  </div>
                )}

                {/* Authorization Actions */}
                {activeItem.decision === 'PENDING' && (
                  <div className="pt-4 border-t border-slate-800 space-y-3">
                    {showRevisionInput ? (
                      <div className="space-y-2">
                        <textarea
                          value={revisionNotes}
                          onChange={(e) => setRevisionNotes(e.target.value)}
                          placeholder="Provide specific feedback or revision guidelines for the requesting agent..."
                          rows={2}
                          className="w-full px-3 py-2 bg-[#0c121d] border border-slate-700 rounded text-xs text-slate-200 focus:outline-hidden focus:border-indigo-500"
                        />
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              resolveApproval(activeItem.id, 'REQUEST_REVISION', revisionNotes);
                              setShowRevisionInput(false);
                              setRevisionNotes('');
                            }}
                            className="px-3.5 py-1.5 text-xs font-semibold text-indigo-300 bg-indigo-950 hover:bg-indigo-900 border border-indigo-700 rounded transition-colors"
                          >
                            Submit Revision Request
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowRevisionInput(false)}
                            className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => setShowRevisionInput(true)}
                          className="px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                          <span>Request Revision</span>
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => resolveApproval(activeItem.id, 'REJECT', 'Rejected by operator')}
                            className="px-3.5 py-2 text-xs font-semibold text-rose-300 hover:text-white bg-rose-950/70 hover:bg-rose-900 border border-rose-800 rounded-lg transition-colors"
                          >
                            Reject Action
                          </button>

                          <button
                            type="button"
                            onClick={() => resolveApproval(activeItem.id, 'APPROVE', 'Explicitly authorized by human operator')}
                            className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
                          >
                            <ShieldCheck className="w-4 h-4" />
                            <span>Authorize & Dispatch</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                Select an approval item from the queue to inspect.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
