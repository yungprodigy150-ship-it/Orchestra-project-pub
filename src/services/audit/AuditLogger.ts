/**
 * ORCHESTRA Activity & Audit Log Service
 * Records system events, lifecycle state transitions, approval gates, and error traces.
 */

import { SystemEvent, AuditEventType } from '../../types';
import { IPersistenceStorage, LocalStoragePersistenceAdapter } from '../persistence/StorageAdapter';

export interface LogEventInput {
  type: AuditEventType;
  title: string;
  description: string;
  severity?: 'info' | 'notice' | 'action_required' | 'warning' | 'error';
  entityType?: 'task' | 'agent' | 'knowledge' | 'system' | 'governance' | 'venture';
  entityId?: string;
  relatedTaskId?: string;
  actor?: {
    id: string;
    name: string;
    type: 'human' | 'agent' | 'system';
  };
  details?: Record<string, any>;
}

export class AuditLogger {
  private storage: IPersistenceStorage<SystemEvent>;
  private listeners: Array<(event: SystemEvent) => void> = [];

  constructor(storage?: IPersistenceStorage<SystemEvent>, initialEvents?: SystemEvent[]) {
    this.storage = storage || new LocalStoragePersistenceAdapter<SystemEvent>('audit_events', initialEvents || []);
  }

  public log(input: LogEventInput): SystemEvent {
    const event: SystemEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
      type: input.type,
      title: input.title,
      description: input.description,
      severity: input.severity || 'info',
      entityType: input.entityType,
      entityId: input.entityId,
      relatedTaskId: input.relatedTaskId,
      actor: input.actor || {
        id: 'sys-orchestrator',
        name: 'ORCHESTRA Core',
        type: 'system'
      },
      details: input.details
    };

    this.storage.set(event.id, event);
    this.notify(event);
    return event;
  }

  public getEvents(limit = 100): SystemEvent[] {
    const all = this.storage.getAll();
    // Sort descending by timestamp
    return all.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, limit);
  }

  public getEventsForEntity(entityType: string, entityId: string): SystemEvent[] {
    return this.storage
      .query((e) => e.entityType === entityType && e.entityId === entityId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public getEventsForTask(taskId: string): SystemEvent[] {
    return this.storage
      .query((e) => e.relatedTaskId === taskId || (e.entityType === 'task' && e.entityId === taskId))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public subscribe(listener: (event: SystemEvent) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(event: SystemEvent): void {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.error('[AuditLogger] Listener execution error', err);
      }
    });
  }
}
