/**
 * ORCHESTRA Agent-to-Agent Dialogue Types
 * Contracts for multi-agent peer-to-peer communication, consultation threads,
 * collaborative delegations, and compact dialogue state.
 */

export type DialogueMessageType =
  | 'INQUIRY'
  | 'FINDINGS_SHARE'
  | 'DELEGATION_REQUEST'
  | 'CHALLENGE'
  | 'SYNTHESIS'
  | 'STATUS_UPDATE';

export interface DialogueMessage {
  id: string;
  conversationId: string;
  senderAgentId: string;
  senderName: string;
  senderRole: string;
  senderAvatar?: string;
  recipientAgentId: string;
  messageType: DialogueMessageType;
  content: string;
  structuredHandoffData?: any;
  timestamp: string;
  isThinking?: boolean;
}

export interface AgentConversation {
  id: string; // e.g. "diag-conv-101"
  topic: string;
  initiatingAgentId: string;
  initiatingAgentName: string;
  targetAgentId: string;
  targetAgentName: string;
  participatingAgentIds: string[];
  relatedTaskId?: string;
  status: 'ACTIVE' | 'CONCLUDED' | 'PAUSED';
  messages: DialogueMessage[];
  totalTurns: number;
  maxTurns: number;
  lastMessageTimestamp: string;
  consensusReached?: boolean;
  finalSynthesis?: string;
  createdAt: string;
}

export interface CompactDialogueState {
  isDockOpen: boolean;
  activeConversationId?: string;
  unreadCount: number;
  activeSessionsCount: number;
}
