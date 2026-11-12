import React, { useState } from 'react';
import {
  MessageSquare,
  ChevronDown,
  Maximize2,
  Minimize2,
  Sparkles,
  Send,
  Users,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  X
} from 'lucide-react';
import { useOrchestra } from '../../context/OrchestraContext';
import { AgentConversation, DialogueMessage } from '../../types/dialogue';

interface CompactAgentDialogueProps {
  onOpenFullModal?: () => void;
}

export const CompactAgentDialogue: React.FC<CompactAgentDialogueProps> = ({
  onOpenFullModal
}) => {
  const {
    agentConversations,
    digitalIdentities,
    sendAgentDialogueMessage,
    startAgentDialogue,
    agents
  } = useOrchestra();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showNewConsultation, setShowNewConsultation] = useState(false);
  const [newTopic, setNewTopic] = useState('');
  const [newInitialPrompt, setNewInitialPrompt] = useState('');
  const [newTargetAgentId, setNewTargetAgentId] = useState('agt-2');

  const activeConversations = agentConversations.filter(c => c.status === 'ACTIVE');
  const currentConversation: AgentConversation | null =
    agentConversations.find(c => c.id === selectedConversationId) ||
    activeConversations[0] ||
    agentConversations[0] ||
    null;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !currentConversation || isSending) return;

    setIsSending(true);
    const content = messageInput.trim();
    setMessageInput('');

    try {
      const senderIdentity = digitalIdentities.find(i => i.agentId === currentConversation.initiatingAgentId) || {
        id: currentConversation.initiatingAgentId,
        name: currentConversation.initiatingAgentName,
        role: 'Initiating Agent'
      };

      const recipientIdentity = digitalIdentities.find(i => i.agentId === currentConversation.targetAgentId) || {
        id: currentConversation.targetAgentId,
        name: currentConversation.targetAgentName,
        role: 'Target Agent'
      };

      await sendAgentDialogueMessage(
        currentConversation.id,
        senderIdentity,
        recipientIdentity,
        content,
        'FINDINGS_SHARE'
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleStartConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.trim() || !newInitialPrompt.trim() || isSending) return;

    setIsSending(true);
    try {
      const initiator = digitalIdentities.find(i => i.agentId === 'agt-scout') || {
        id: 'agt-scout',
        name: 'Scout',
        role: 'Opportunity Hunter'
      };

      const target = digitalIdentities.find(i => i.agentId === newTargetAgentId) || {
        id: newTargetAgentId,
        name: 'Agent',
        role: 'Specialized Peer'
      };

      const created = await startAgentDialogue(
        initiator,
        target,
        newTopic.trim(),
        newInitialPrompt.trim()
      );

      setSelectedConversationId(created.id);
      setShowNewConsultation(false);
      setNewTopic('');
      setNewInitialPrompt('');
    } finally {
      setIsSending(false);
    }
  };

  // 1. CLOSED STATE: Compact bottom-dock pill
  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-40 sm:bottom-6 sm:right-6">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group px-3.5 py-2.5 bg-[#0b1019]/95 hover:bg-[#0f1725] border border-slate-700/80 hover:border-amber-500/70 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-3 transition-all cursor-pointer text-xs"
          title="Open Multi-Agent Dialogue Layer"
        >
          {/* Active pulse */}
          <div className="relative flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="absolute w-4 h-4 rounded-full bg-emerald-400/30 animate-ping" />
          </div>

          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-slate-100 tracking-tight">Agent Dialogue</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-950/80 border border-amber-700/60 text-amber-300">
              {activeConversations.length} Active
            </span>
          </div>

          {/* Mini agent avatars preview */}
          <div className="hidden sm:flex items-center -space-x-1.5 pl-1">
            <div className="w-5 h-5 rounded-full bg-indigo-600/80 border border-slate-800 flex items-center justify-center text-[9px] font-bold text-white">S</div>
            <div className="w-5 h-5 rounded-full bg-purple-600/80 border border-slate-800 flex items-center justify-center text-[9px] font-bold text-white">V</div>
            <div className="w-5 h-5 rounded-full bg-emerald-600/80 border border-slate-800 flex items-center justify-center text-[9px] font-bold text-white">C</div>
          </div>
        </button>
      </div>
    );
  }

  // 2. EXPANDED STATE: Sleek, non-intrusive communications dock
  return (
    <div className="fixed bottom-4 right-4 z-40 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] sm:w-[440px] max-h-[580px] bg-[#0a0f18] border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-200">
      {/* Dock Header */}
      <div className="px-4 py-3 bg-[#0d1422] border-b border-slate-800/90 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-100 tracking-tight">Agent Dialogue Layer</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <p className="text-[10px] text-slate-400">Autonomous peer consultations & consensus</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {onOpenFullModal && (
            <button
              type="button"
              onClick={onOpenFullModal}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
              title="Expand to Full View"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
            title="Minimize Dialogue"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Conversation Thread Selector Strip */}
      <div className="px-3 py-2 bg-[#080d16] border-b border-slate-800/80 flex items-center justify-between gap-2 overflow-x-auto text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {agentConversations.map(c => {
            const isSelected = currentConversation?.id === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setSelectedConversationId(c.id);
                  setShowNewConsultation(false);
                }}
                className={`px-2.5 py-1 rounded-md text-[11px] whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-slate-800 text-amber-300 font-semibold border border-amber-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <span>{c.initiatingAgentName} & {c.targetAgentName}</span>
                <span className="text-[9px] font-mono text-slate-400">({c.totalTurns}t)</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setShowNewConsultation(!showNewConsultation)}
          className="px-2 py-1 rounded text-[10px] font-mono font-medium text-amber-400 hover:text-amber-300 bg-amber-950/60 hover:bg-amber-950 border border-amber-800/60 shrink-0 transition-colors"
        >
          {showNewConsultation ? 'Back' : '+ Consult'}
        </button>
      </div>

      {/* Main Conversation Body */}
      {showNewConsultation ? (
        <form onSubmit={handleStartConsultation} className="p-4 space-y-3 overflow-y-auto flex-1 text-xs">
          <div className="flex items-center gap-2 text-slate-200 font-semibold pb-1 border-b border-slate-800">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Initiate Autonomous Consultation</span>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Target Specialist Agent:</label>
            <select
              value={newTargetAgentId}
              onChange={(e) => setNewTargetAgentId(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-[#060910] border border-slate-700 rounded text-slate-200 text-xs focus:outline-hidden focus:border-amber-500"
            >
              {digitalIdentities.filter(i => i.agentId !== 'agt-scout').map(i => (
                <option key={i.agentId} value={i.agentId}>
                  {i.name} — {i.role}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Consultation Objective / Topic:</label>
            <input
              type="text"
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              placeholder="e.g. Evaluate Kubernetes spot compute telemetry"
              className="w-full px-2.5 py-1.5 bg-[#060910] border border-slate-700 rounded text-slate-200 text-xs focus:outline-hidden focus:border-amber-500"
              required
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Initial Inquiry / Data Handoff:</label>
            <textarea
              value={newInitialPrompt}
              onChange={(e) => setNewInitialPrompt(e.target.value)}
              placeholder="Provide specific findings or inquiries for your peer agent to evaluate..."
              rows={3}
              className="w-full px-2.5 py-1.5 bg-[#060910] border border-slate-700 rounded text-slate-200 text-xs focus:outline-hidden focus:border-amber-500 resize-none"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowNewConsultation(false)}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSending}
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold rounded text-xs transition-colors flex items-center gap-1.5"
            >
              <Send className="w-3 h-3" />
              <span>{isSending ? 'Reasoning...' : 'Dispatch Inquiry'}</span>
            </button>
          </div>
        </form>
      ) : currentConversation ? (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Participating Agents Banner */}
          <div className="px-4 py-2 bg-[#060910] border-b border-slate-800/80 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="font-semibold text-slate-200">{currentConversation.initiatingAgentName}</span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
              <span className="font-semibold text-amber-300">{currentConversation.targetAgentName}</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[10px]">
              {currentConversation.consensusReached ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Consensus
                </span>
              ) : (
                <span className="text-amber-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Turn {currentConversation.totalTurns}/{currentConversation.maxTurns}
                </span>
              )}
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-3 space-y-3 overflow-y-auto max-h-[320px]">
            {currentConversation.messages.map((msg) => {
              const isInitiator = msg.senderAgentId === currentConversation.initiatingAgentId;
              return (
                <div
                  key={msg.id}
                  className={`p-2.5 rounded-xl border text-xs space-y-1.5 ${
                    isInitiator
                      ? 'bg-[#0e1626] border-blue-900/40 mr-4'
                      : 'bg-[#121929] border-amber-900/40 ml-4'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-200">{msg.senderName}</span>
                      <span className="text-[10px] text-slate-400">({msg.senderRole})</span>
                    </div>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {msg.messageType}
                    </span>
                  </div>

                  <p className="text-slate-300 leading-relaxed text-[11px] whitespace-pre-wrap">
                    {msg.content}
                  </p>

                  {msg.structuredHandoffData?.keyTakeaways?.length > 0 && (
                    <div className="p-1.5 rounded bg-black/40 border border-slate-800 text-[10px] text-slate-400 font-mono space-y-0.5">
                      {msg.structuredHandoffData.keyTakeaways.map((t: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-1">
                          <span className="text-amber-400">•</span>
                          <span>{t}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="text-[9px] font-mono text-slate-400 text-right">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              );
            })}

            {isSending && (
              <div className="p-2.5 rounded-xl bg-[#121929] border border-amber-900/40 ml-4 flex items-center gap-2 text-xs text-amber-300">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span className="text-[11px] font-mono">Peer agent reasoning with digital persona...</span>
              </div>
            )}
          </div>

          {/* Quick Reply Form */}
          {currentConversation.status === 'ACTIVE' ? (
            <form onSubmit={handleSendMessage} className="p-2.5 bg-[#080d16] border-t border-slate-800 flex items-center gap-2">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Ask follow-up inquiry or challenge assumption..."
                className="flex-1 px-3 py-1.5 bg-[#060910] border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-hidden focus:border-amber-500"
                disabled={isSending}
              />
              <button
                type="submit"
                disabled={!messageInput.trim() || isSending}
                className="p-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white rounded-lg transition-colors"
                title="Send Message"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <div className="p-2.5 bg-[#080d16] border-t border-slate-800 text-center text-[10px] font-mono text-slate-400">
              {currentConversation.finalSynthesis || 'Consultation concluded.'}
            </div>
          )}
        </div>
      ) : (
        <div className="p-8 text-center text-xs text-slate-400">
          No active consultations. Click "+ Consult" to start.
        </div>
      )}
    </div>
  );
};
