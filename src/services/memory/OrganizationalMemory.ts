/**
 * ORCHESTRA Shared Organizational Memory Service
 * Central knowledge repository managing verified intelligence briefs, research dossiers,
 * and semantic task linkage for multi-agent retrieval.
 */

import { IntelligenceItem, IntelligenceCategory } from '../../types';
import { IPersistenceStorage, LocalStoragePersistenceAdapter } from '../persistence/StorageAdapter';
import { AuditLogger } from '../audit/AuditLogger';

export interface CreateKnowledgeInput {
  title: string;
  category: IntelligenceCategory;
  summary: string;
  keyTakeaways: string[];
  confidence?: 'high' | 'medium' | 'provisional';
  source: string; // Source attribution
  tags: string[];
  ventureId?: string;
  authorAgentId?: string;
  relatedTaskIds?: string[];
  accessLevel?: 'PUBLIC' | 'RESTRICTED' | 'CONFIDENTIAL';
}

export interface UpdateKnowledgeInput {
  title?: string;
  category?: IntelligenceCategory;
  summary?: string;
  keyTakeaways?: string[];
  confidence?: 'high' | 'medium' | 'provisional';
  source?: string;
  tags?: string[];
  ventureId?: string;
  relatedTaskIds?: string[];
  accessLevel?: 'PUBLIC' | 'RESTRICTED' | 'CONFIDENTIAL';
  verifiedByHuman?: boolean;
}

export class OrganizationalMemory {
  private storage: IPersistenceStorage<IntelligenceItem>;
  private auditLogger?: AuditLogger;

  constructor(
    storage?: IPersistenceStorage<IntelligenceItem>,
    initialKnowledge?: IntelligenceItem[],
    auditLogger?: AuditLogger
  ) {
    this.storage = storage || new LocalStoragePersistenceAdapter<IntelligenceItem>('knowledge_memory', initialKnowledge || []);
    this.auditLogger = auditLogger;
  }

  public createRecord(input: CreateKnowledgeInput, actorName = 'Agent'): IntelligenceItem {
    const now = new Date().toISOString();
    const id = `intel-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

    const record: IntelligenceItem = {
      id,
      title: input.title.trim(),
      category: input.category,
      summary: input.summary.trim(),
      keyTakeaways: input.keyTakeaways,
      confidence: input.confidence || 'medium',
      source: input.source.trim(),
      tags: input.tags,
      ventureId: input.ventureId,
      authorAgentId: input.authorAgentId,
      relatedTaskIds: input.relatedTaskIds || [],
      accessLevel: input.accessLevel || 'PUBLIC',
      verifiedByHuman: false,
      createdAt: now,
      updatedAt: now
    };

    this.storage.set(record.id, record);

    this.auditLogger?.log({
      type: 'KNOWLEDGE_INGESTED',
      title: 'Knowledge Record Ingested',
      description: `Intelligence brief "${record.title}" added to shared organizational memory.`,
      severity: 'info',
      entityType: 'knowledge',
      entityId: record.id,
      actor: { id: input.authorAgentId || 'system', name: actorName, type: input.authorAgentId ? 'agent' : 'human' },
      details: {
        category: record.category,
        source: record.source,
        tags: record.tags
      }
    });

    return record;
  }

  public updateRecord(id: string, updates: UpdateKnowledgeInput, actorName = 'Operator'): IntelligenceItem {
    const existing = this.storage.get(id);
    if (!existing) {
      throw new Error(`Knowledge record ${id} not found.`);
    }

    const updated: IntelligenceItem = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.storage.set(id, updated);
    return updated;
  }

  public getRecord(id: string): IntelligenceItem | null {
    return this.storage.get(id);
  }

  public listRecords(filter?: (item: IntelligenceItem) => boolean): IntelligenceItem[] {
    const all = this.storage.getAll();
    return filter ? all.filter(filter) : all;
  }

  public search(query: string, category?: string, ventureId?: string): IntelligenceItem[] {
    const q = query.toLowerCase().trim();
    return this.storage.query((item) => {
      const matchesCategory = !category || category === 'all' || item.category === category;
      const matchesVenture = !ventureId || ventureId === 'all' || item.ventureId === ventureId;

      if (!matchesCategory || !matchesVenture) return false;
      if (!q) return true;

      const titleMatch = item.title.toLowerCase().includes(q);
      const summaryMatch = item.summary.toLowerCase().includes(q);
      const sourceMatch = item.source.toLowerCase().includes(q);
      const tagMatch = item.tags.some((t) => t.toLowerCase().includes(q));
      const takeawayMatch = item.keyTakeaways.some((t) => t.toLowerCase().includes(q));

      return titleMatch || summaryMatch || sourceMatch || tagMatch || takeawayMatch;
    });
  }

  public linkRecordToTask(recordId: string, taskId: string): void {
    const record = this.storage.get(recordId);
    if (!record) return;

    const relatedTaskIds = Array.from(new Set([...(record.relatedTaskIds || []), taskId]));
    this.updateRecord(recordId, { relatedTaskIds });
  }

  public getRecordsForTask(taskId: string): IntelligenceItem[] {
    return this.storage.query((item) => (item.relatedTaskIds || []).includes(taskId));
  }

  public toggleHumanVerification(id: string, verifierName = 'Human Supervisor'): IntelligenceItem {
    const record = this.storage.get(id);
    if (!record) throw new Error(`Record ${id} not found.`);

    const nextVerified = !record.verifiedByHuman;
    const now = new Date().toISOString().split('T')[0];

    const updated = this.updateRecord(
      id,
      {
        verifiedByHuman: nextVerified,
        // @ts-ignore
        verifiedAt: nextVerified ? now : undefined
      },
      verifierName
    );

    this.auditLogger?.log({
      type: 'APPROVAL_DECISION',
      title: nextVerified ? 'Knowledge Verified' : 'Knowledge Reverted to Provisional',
      description: `Brief "${record.title}" verification status updated to ${nextVerified ? 'Verified' : 'Provisional'}.`,
      severity: 'notice',
      entityType: 'knowledge',
      entityId: id,
      actor: { id: 'supervisor', name: verifierName, type: 'human' }
    });

    return updated;
  }
}
