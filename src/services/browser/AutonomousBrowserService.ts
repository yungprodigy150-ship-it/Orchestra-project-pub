/**
 * ORCHESTRA Autonomous Browser Service
 * Client-side interface to the server-side autonomous browser automation runtime.
 * Coordinates multi-tab web exploration, link navigation, DOM extraction, and downloads.
 */

import { BrowserSessionRecord, BrowserTabState, BrowserActionResponse } from '../../types/browser';
import { AuditLogger } from '../audit/AuditLogger';
import { LocalStoragePersistenceAdapter } from '../persistence/StorageAdapter';

export class AutonomousBrowserService {
  private storage: LocalStoragePersistenceAdapter<BrowserSessionRecord>;
  private auditLogger: AuditLogger;

  constructor(auditLogger: AuditLogger, storage?: LocalStoragePersistenceAdapter<BrowserSessionRecord>) {
    this.auditLogger = auditLogger;
    this.storage =
      storage ||
      new LocalStoragePersistenceAdapter<BrowserSessionRecord>('browser_sessions', []);
  }

  public listSessions(): BrowserSessionRecord[] {
    return this.storage.getAll().sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  public getSession(id: string): BrowserSessionRecord | null {
    return this.storage.get(id);
  }

  /**
   * Create an isolated autonomous browser session for an agent
   */
  public async createSession(
    agentId: string,
    agentName: string,
    objective: string,
    relatedTaskId?: string
  ): Promise<BrowserSessionRecord> {
    try {
      const resp = await fetch('/api/browser/sessions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId, agentName, objective, relatedTaskId })
      });
      const data = await resp.json();
      if (resp.ok && data.session) {
        this.storage.set(data.session.id, data.session);
        this.auditLogger.log({
          type: 'TASK_EXECUTION',
          title: `Browser Session Opened: ${agentName}`,
          description: `Objective: "${objective}"`,
          severity: 'info',
          actor: { id: agentId, name: agentName, type: 'agent' }
        });
        return data.session;
      }
    } catch {
      // offline fallback
    }

    const localId = `brows-sess-${Date.now()}`;
    const initialTabId = `tab-local-${Date.now()}`;
    const localSession: BrowserSessionRecord = {
      id: localId,
      agentId,
      agentName,
      relatedTaskId,
      objective,
      activeTabId: initialTabId,
      tabs: [{
        tabId: initialTabId,
        url: 'about:blank',
        title: 'New Tab',
        isLoading: false,
        headings: [],
        links: [],
        forms: [],
        extractedTextPreview: 'Local session created.',
        lastNavigatedAt: new Date().toISOString(),
        navigationHistory: ['about:blank']
      }],
      status: 'ACTIVE',
      runtimeType: 'BUILTIN_DOM_RUNTIME',
      downloadedFiles: [],
      actionLog: [{ action: 'session_created', timestamp: new Date().toISOString() }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.storage.set(localId, localSession);
    return localSession;
  }

  /**
   * Open a new tab in session and navigate
   */
  public async openTab(sessionId: string, url: string, agentId = 'agent'): Promise<BrowserTabState | null> {
    try {
      const resp = await fetch('/api/browser/tabs/open', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, url, agentId })
      });
      const data = await resp.json();
      if (resp.ok && data.tab) {
        const session = this.getSession(sessionId);
        if (session) {
          session.tabs.push(data.tab);
          session.activeTabId = data.tab.tabId;
          session.updatedAt = new Date().toISOString();
          this.storage.set(session.id, session);
        }
        return data.tab;
      }
    } catch {
      // offline
    }
    return null;
  }

  /**
   * Navigate an existing tab to a URL
   */
  public async navigate(sessionId: string, tabId: string, url: string, agentId = 'agent'): Promise<BrowserTabState | null> {
    try {
      const resp = await fetch('/api/browser/tabs/navigate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, tabId, url, agentId })
      });
      const data = await resp.json();
      if (resp.ok && data.tab) {
        const session = this.getSession(sessionId);
        if (session) {
          session.tabs = session.tabs.map(t => t.tabId === tabId ? data.tab : t);
          session.activeTabId = tabId;
          session.updatedAt = new Date().toISOString();
          this.storage.set(session.id, session);
        }
        return data.tab;
      }
    } catch {
      // offline
    }
    return null;
  }

  /**
   * Perform action on current page (click link, download, extract)
   */
  public async performAction(
    sessionId: string,
    tabId: string,
    action: 'click_link' | 'extract_content' | 'download_file',
    linkHref?: string,
    agentId = 'agent'
  ): Promise<any> {
    try {
      const resp = await fetch('/api/browser/tabs/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, tabId, action, linkHref, agentId })
      });
      const data = await resp.json();
      if (resp.ok) {
        // Refresh local session
        const session = this.getSession(sessionId);
        if (session && data.tab) {
          session.tabs = session.tabs.map(t => t.tabId === tabId ? data.tab : t);
          this.storage.set(session.id, session);
        }
        return data;
      }
    } catch {
      // offline
    }
    return null;
  }

  /**
   * Close a specific tab
   */
  public closeTab(sessionId: string, tabId: string): void {
    const session = this.getSession(sessionId);
    if (!session) return;
    session.tabs = session.tabs.filter(t => t.tabId !== tabId);
    if (session.tabs.length > 0 && session.activeTabId === tabId) {
      session.activeTabId = session.tabs[0].tabId;
    }
    this.storage.set(session.id, session);
    fetch(`/api/browser/tabs/${tabId}?sessionId=${sessionId}`, { method: 'DELETE' }).catch(() => {});
  }
}
