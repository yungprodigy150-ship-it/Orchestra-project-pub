/**
 * ORCHESTRA External Account Service
 * Client-side interface to connected enterprise accounts (Google Workspace,
 * GitHub, LinkedIn, OpenRouter, Hugging Face, AWS) and least-privilege scoping.
 */

import { ExternalConnectedAccount, AccountActivityRecord } from '../../types/accounts';
import { AuditLogger } from '../audit/AuditLogger';
import { LocalStoragePersistenceAdapter } from '../persistence/StorageAdapter';

export class ExternalAccountService {
  private auditLogger: AuditLogger;
  private accountsStorage: LocalStoragePersistenceAdapter<ExternalConnectedAccount>;
  private activityStorage: LocalStoragePersistenceAdapter<AccountActivityRecord>;

  constructor(
    auditLogger: AuditLogger,
    accountsStorage?: LocalStoragePersistenceAdapter<ExternalConnectedAccount>,
    activityStorage?: LocalStoragePersistenceAdapter<AccountActivityRecord>
  ) {
    this.auditLogger = auditLogger;
    this.accountsStorage =
      accountsStorage ||
      new LocalStoragePersistenceAdapter<ExternalConnectedAccount>('external_accounts', []);
    this.activityStorage =
      activityStorage ||
      new LocalStoragePersistenceAdapter<AccountActivityRecord>('account_activities', []);
  }

  public async fetchAccounts(): Promise<ExternalConnectedAccount[]> {
    try {
      const resp = await fetch('/api/accounts');
      if (resp.ok) {
        const data = await resp.json();
        if (Array.isArray(data.accounts)) {
          this.accountsStorage.setAll(data.accounts);
          return data.accounts;
        }
      }
    } catch {
      // offline fallback
    }
    return this.accountsStorage.getAll();
  }

  public listAccounts(): ExternalConnectedAccount[] {
    return this.accountsStorage.getAll();
  }

  public async testConnection(accountId: string): Promise<{ success: boolean; status: string; details?: string; error?: string }> {
    try {
      const resp = await fetch('/api/accounts/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId })
      });
      const data = await resp.json();
      return data;
    } catch (err: any) {
      return { success: false, status: 'ERROR', error: err.message || 'Connection test failed.' };
    }
  }

  public listActivities(): AccountActivityRecord[] {
    return this.activityStorage.getAll().sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  public recordActivity(activity: Omit<AccountActivityRecord, 'id' | 'timestamp'>): AccountActivityRecord {
    const id = `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const fullRecord: AccountActivityRecord = {
      ...activity,
      id,
      timestamp: new Date().toISOString()
    };
    this.activityStorage.set(id, fullRecord);

    this.auditLogger.log({
      type: 'TASK_EXECUTION',
      title: `Account Action: ${activity.action} [${activity.status}]`,
      description: `Agent ${activity.agentName} interacted with ${activity.resourceTarget}.`,
      severity: activity.status === 'SUCCESS' ? 'info' : 'warning',
      actor: { id: activity.agentId, name: activity.agentName, type: 'agent' }
    });

    fetch('/api/accounts/activity/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fullRecord)
    }).catch(() => {});

    return fullRecord;
  }

  public isAgentPermitted(agentId: string, accountId: string): boolean {
    const account = this.accountsStorage.get(accountId);
    if (!account) return false;
    if (account.assignedAgentIds.includes('*') || account.assignedAgentIds.includes(agentId)) {
      return true;
    }
    return false;
  }
}
