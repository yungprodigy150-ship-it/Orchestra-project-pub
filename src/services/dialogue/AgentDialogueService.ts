/**
 * ORCHESTRA Agent Dialogue Service
 * Manages peer-to-peer agent consultations, structured handoffs,
 * consensus evaluations, and anti-loop safety boundaries.
 */

import { AgentConversation, DialogueMessage, DialogueMessageType } from '../../types/dialogue';
import { AuditLogger } from '../audit/AuditLogger';
import { LocalStoragePersistenceAdapter } from '../persistence/StorageAdapter';

export const INITIAL_CONVERSATIONS: AgentConversation[] = [
  {
    id: 'diag-conv-01',
    topic: 'RelaySync CDC Replication Bottlenecks & EKS Spot Compaction',
    initiatingAgentId: 'agt-scout',
    initiatingAgentName: 'Scout',
    targetAgentId: 'agt-2',
    targetAgentName: 'Vanguard',
    participatingAgentIds: ['agt-scout', 'agt-2'],
    relatedTaskId: 'task-101',
    status: 'ACTIVE',
    totalTurns: 3,
    maxTurns: 6,
    lastMessageTimestamp: '2026-11-11T23:15:00Z',
    consensusReached: true,
    finalSynthesis: 'Vanguard validated that RelaySync logical slot compaction eliminates Debezium WAL lag without pod restarts.',
    createdAt: '2026-11-11T23:00:00Z',
    messages: [
      {
        id: 'msg-01',
        conversationId: 'diag-conv-01',
        senderAgentId: 'agt-scout',
        senderName: 'Scout',
        senderRole: 'Opportunity Hunter',
        senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&fit=crop&crop=faces',
        recipientAgentId: 'agt-2',
        messageType: 'INQUIRY',
        content: 'Vanguard, I surfaced 3 enterprise data engineering leads suffering from Postgres WAL replication lag. Can you cross-reference their architecture against RelaySync zero-lag CDC specs?',
        timestamp: '2026-11-11T23:00:00Z'
      },
      {
        id: 'msg-02',
        conversationId: 'diag-conv-01',
        senderAgentId: 'agt-2',
        senderName: 'Vanguard',
        senderRole: 'Market Intelligence Agent',
        senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&fit=crop&crop=faces',
        recipientAgentId: 'agt-scout',
        messageType: 'FINDINGS_SHARE',
        content: 'Analyzed their public telemetry. Two of the accounts run Kafka Connect clusters exceeding 250MB/s WAL backlog. RelaySync eliminates this bottleneck by offloading logical slots to S3 Glacier during off-market hours. High probability fit.',
        structuredHandoffData: {
          keyTakeaways: ['WAL backlog over 250MB/s', 'Zero-lag CDC provides immediate ROI'],
          consensusReached: false
        },
        timestamp: '2026-11-11T23:05:00Z'
      },
      {
        id: 'msg-03',
        conversationId: 'diag-conv-01',
        senderAgentId: 'agt-scout',
        senderName: 'Scout',
        senderRole: 'Opportunity Hunter',
        senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&fit=crop&crop=faces',
        recipientAgentId: 'agt-2',
        messageType: 'SYNTHESIS',
        content: 'Consensus reached. I will forward these architectural parameters to Courier to stage a technical executive brief for supervisory signoff.',
        timestamp: '2026-11-11T23:15:00Z'
      }
    ]
  }
];

export class AgentDialogueService {
  private auditLogger: AuditLogger;
  private storage: LocalStoragePersistenceAdapter<AgentConversation>;

  constructor(auditLogger: AuditLogger, storage?: LocalStoragePersistenceAdapter<AgentConversation>) {
    this.auditLogger = auditLogger;
    this.storage =
      storage ||
      new LocalStoragePersistenceAdapter<AgentConversation>('agent_dialogues', INITIAL_CONVERSATIONS);
  }

  public listConversations(): AgentConversation[] {
    return this.storage.getAll().sort(
      (a, b) => new Date(b.lastMessageTimestamp).getTime() - new Date(a.lastMessageTimestamp).getTime()
    );
  }

  public getConversation(id: string): AgentConversation | null {
    return this.storage.get(id);
  }

  /**
   * Start a new dialogue between two agents
   */
  public async startConversation(
    initiatingAgent: { id: string; name: string; role: string; avatar?: string },
    targetAgent: { id: string; name: string; role: string; avatar?: string; specialization?: string },
    topic: string,
    initialPrompt: string,
    relatedTaskId?: string
  ): Promise<AgentConversation> {
    const convId = `diag-conv-${Date.now()}`;
    const now = new Date().toISOString();

    const initialMsg: DialogueMessage = {
      id: `msg-${Date.now()}-01`,
      conversationId: convId,
      senderAgentId: initiatingAgent.id,
      senderName: initiatingAgent.name,
      senderRole: initiatingAgent.role,
      senderAvatar: initiatingAgent.avatar,
      recipientAgentId: targetAgent.id,
      messageType: 'INQUIRY',
      content: initialPrompt,
      timestamp: now
    };

    const newConv: AgentConversation = {
      id: convId,
      topic,
      initiatingAgentId: initiatingAgent.id,
      initiatingAgentName: initiatingAgent.name,
      targetAgentId: targetAgent.id,
      targetAgentName: targetAgent.name,
      participatingAgentIds: [initiatingAgent.id, targetAgent.id],
      relatedTaskId,
      status: 'ACTIVE',
      messages: [initialMsg],
      totalTurns: 1,
      maxTurns: 6,
      lastMessageTimestamp: now,
      createdAt: now
    };

    this.storage.set(convId, newConv);

    this.auditLogger.log({
      type: 'TASK_EXECUTION',
      title: `Agent Dialogue Started: ${initiatingAgent.name} ➔ ${targetAgent.name}`,
      description: `Topic: "${topic}"`,
      severity: 'info',
      actor: { id: initiatingAgent.id, name: initiatingAgent.name, type: 'agent' }
    });

    // Automatically trigger peer response from target agent
    await this.triggerPeerResponse(convId, targetAgent, initiatingAgent, topic, relatedTaskId);

    return this.getConversation(convId) || newConv;
  }

  /**
   * Send a follow-up message in an existing conversation
   */
  public async sendMessage(
    conversationId: string,
    senderAgent: { id: string; name: string; role: string; avatar?: string },
    recipientAgent: { id: string; name: string; role: string; avatar?: string; specialization?: string },
    content: string,
    messageType: DialogueMessageType = 'FINDINGS_SHARE'
  ): Promise<DialogueMessage | null> {
    const conv = this.getConversation(conversationId);
    if (!conv) return null;

    if (conv.status === 'CONCLUDED' || conv.totalTurns >= conv.maxTurns) {
      conv.status = 'CONCLUDED';
      this.storage.set(conv.id, conv);
      return null;
    }

    const now = new Date().toISOString();
    const newMsg: DialogueMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      conversationId,
      senderAgentId: senderAgent.id,
      senderName: senderAgent.name,
      senderRole: senderAgent.role,
      senderAvatar: senderAgent.avatar,
      recipientAgentId: recipientAgent.id,
      messageType,
      content,
      timestamp: now
    };

    conv.messages.push(newMsg);
    conv.totalTurns += 1;
    conv.lastMessageTimestamp = now;

    if (conv.totalTurns >= conv.maxTurns) {
      conv.status = 'CONCLUDED';
      conv.finalSynthesis = `Conversation concluded at maximum turn limit (${conv.maxTurns}).`;
    }

    this.storage.set(conv.id, conv);

    // If conversation is still active, trigger recipient agent reasoning
    if (conv.status === 'ACTIVE') {
      await this.triggerPeerResponse(conversationId, recipientAgent, senderAgent, conv.topic, conv.relatedTaskId);
    }

    return newMsg;
  }

  /**
   * Call server dialogue reasoning engine to generate an authentic peer response
   */
  private async triggerPeerResponse(
    conversationId: string,
    recipientAgent: { id: string; name: string; role: string; avatar?: string; specialization?: string },
    initiatingAgent: { id: string; name: string; role: string; avatar?: string },
    topic: string,
    relatedTaskId?: string
  ): Promise<void> {
    const conv = this.getConversation(conversationId);
    if (!conv || conv.status !== 'ACTIVE') return;

    try {
      const resp = await fetch('/api/dialogue/reason', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          topic,
          initiatingAgent,
          recipientAgent,
          messages: conv.messages,
          taskContext: relatedTaskId
        })
      });

      if (resp.ok) {
        const data = await resp.json();
        if (data.message) {
          conv.messages.push(data.message);
          conv.totalTurns += 1;
          conv.lastMessageTimestamp = data.message.timestamp;

          if (data.message.structuredHandoffData?.consensusReached) {
            conv.consensusReached = true;
          }

          if (conv.totalTurns >= conv.maxTurns) {
            conv.status = 'CONCLUDED';
            conv.finalSynthesis = 'Consultation successfully concluded with consensus.';
          }

          this.storage.set(conv.id, conv);
        }
      }
    } catch (err) {
      console.warn('[Dialogue Service] Peer response trigger notice:', err);
    }
  }
}
