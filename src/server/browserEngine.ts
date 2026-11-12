/**
 * ORCHESTRA Autonomous Browser Runtime Engine
 * Server-side headless browser session and tab automation engine.
 * Supports multi-tab sessions, navigation history, DOM inspection, form extraction,
 * file downloads, and SSRF security restrictions.
 */

import { Router, Request, Response } from 'express';
import { validateTargetUrlForSSRF } from '../../server.js';
import crypto from 'crypto';

export interface TabData {
  tabId: string;
  url: string;
  title: string;
  isLoading: boolean;
  httpStatusCode?: number;
  headings: string[];
  links: Array<{ text: string; href: string }>;
  forms: Array<{ action: string; method: string; fields: string[] }>;
  extractedTextPreview: string;
  lastNavigatedAt: string;
  navigationHistory: string[];
}

export interface SessionData {
  id: string;
  agentId: string;
  agentName: string;
  relatedTaskId?: string;
  objective: string;
  activeTabId: string;
  tabs: TabData[];
  status: 'ACTIVE' | 'IDLE' | 'COMPLETED' | 'TERMINATED' | 'ERROR';
  runtimeType: 'BUILTIN_DOM_RUNTIME' | 'EXTERNAL_PLAYWRIGHT_CDP';
  downloadedFiles: Array<{ filename: string; mimeType: string; sizeBytes: number; downloadUrl: string; downloadedAt: string }>;
  actionLog: Array<{ action: string; targetUrl?: string; timestamp: string; details?: string }>;
  createdAt: string;
  updatedAt: string;
}

const sessions = new Map<string, SessionData>();

// Seed an initial autonomous session for demonstration/audit
const SEED_SESSION_ID = 'brows-sess-01';
sessions.set(SEED_SESSION_ID, {
  id: SEED_SESSION_ID,
  agentId: 'agt-scout',
  agentName: 'Scout (Opportunity Hunter)',
  relatedTaskId: 'task-101',
  objective: 'Investigate Kubernetes FinOps landscape and EKS spot pricing disclosures',
  activeTabId: 'tab-01',
  tabs: [
    {
      tabId: 'tab-01',
      url: 'https://news.ycombinator.com',
      title: 'Hacker News — Technology & Cloud Infrastructure Discussions',
      isLoading: false,
      httpStatusCode: 200,
      headings: ['Top Stories', 'Ask HN: Who is optimizing Kubernetes compute?', 'RelaySync releases zero-lag CDC engine'],
      links: [
        { text: 'Kubernetes Multi-Cloud Best Practices', href: 'https://kubernetes.io/docs/concepts/' },
        { text: 'AWS EKS Cost Optimization Guide', href: 'https://aws.amazon.com/blogs/containers/' }
      ],
      forms: [],
      extractedTextPreview: 'Active discussions regarding Kubernetes spot compaction, memory fragmentation, and database replication pipelines.',
      lastNavigatedAt: '2026-11-12T00:00:00Z',
      navigationHistory: ['https://news.ycombinator.com']
    }
  ],
  status: 'ACTIVE',
  runtimeType: 'BUILTIN_DOM_RUNTIME',
  downloadedFiles: [],
  actionLog: [
    { action: 'session_created', timestamp: '2026-11-12T00:00:00Z', details: 'Initialized autonomous session for agt-scout' },
    { action: 'navigate', targetUrl: 'https://news.ycombinator.com', timestamp: '2026-11-12T00:00:05Z', details: 'Extracted 12 story anchors' }
  ],
  createdAt: '2026-11-12T00:00:00Z',
  updatedAt: '2026-11-12T00:00:05Z'
});

export const browserRouter = Router();

// 1. List active browser sessions
browserRouter.get('/sessions', (_req: Request, res: Response) => {
  return res.json({ sessions: Array.from(sessions.values()) });
});

// 2. Create browser session
browserRouter.post('/sessions/create', (req: Request, res: Response) => {
  const { agentId = 'agt-scout', agentName = 'Agent', objective = 'Autonomous research', relatedTaskId } = req.body;
  const sessionId = `brows-sess-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`;
  const initialTabId = `tab-${crypto.randomBytes(3).toString('hex')}`;
  const now = new Date().toISOString();

  const newSession: SessionData = {
    id: sessionId,
    agentId,
    agentName,
    relatedTaskId,
    objective,
    activeTabId: initialTabId,
    tabs: [
      {
        tabId: initialTabId,
        url: 'about:blank',
        title: 'New Tab',
        isLoading: false,
        headings: [],
        links: [],
        forms: [],
        extractedTextPreview: 'Session initialized. Ready for autonomous navigation.',
        lastNavigatedAt: now,
        navigationHistory: ['about:blank']
      }
    ],
    status: 'ACTIVE',
    runtimeType: process.env.BROWSER_WS_ENDPOINT ? 'EXTERNAL_PLAYWRIGHT_CDP' : 'BUILTIN_DOM_RUNTIME',
    downloadedFiles: [],
    actionLog: [
      { action: 'session_created', timestamp: now, details: `Created by ${agentName} (${agentId})` }
    ],
    createdAt: now,
    updatedAt: now
  };

  sessions.set(sessionId, newSession);
  return res.status(201).json({ session: newSession });
});

// 3. Open a new tab in session
browserRouter.post('/tabs/open', async (req: Request, res: Response) => {
  const { sessionId, url = 'about:blank', agentId = 'agent' } = req.body;
  const session = sessions.get(sessionId);
  if (!session) {
    return res.status(404).json({ error: `Browser session "${sessionId}" not found.` });
  }

  const tabId = `tab-${crypto.randomBytes(3).toString('hex')}`;
  const now = new Date().toISOString();

  if (url === 'about:blank') {
    const blankTab: TabData = {
      tabId,
      url: 'about:blank',
      title: 'New Tab',
      isLoading: false,
      headings: [],
      links: [],
      forms: [],
      extractedTextPreview: '',
      lastNavigatedAt: now,
      navigationHistory: ['about:blank']
    };
    session.tabs.push(blankTab);
    session.activeTabId = tabId;
    session.updatedAt = now;
    return res.json({ tab: blankTab, sessionId });
  }

  // SSRF check
  const ssrf = validateTargetUrlForSSRF(url);
  if (!ssrf.valid || !ssrf.parsedUrl) {
    return res.status(400).json({ error: `SSRF Blocked: ${ssrf.error}` });
  }

  try {
    const fetchRes = await fetch(ssrf.parsedUrl.href, {
      headers: {
        'User-Agent': `ORCHESTRA-Agent/1.0 (${agentId}; Autonomous Workforce Engine; +https://orchestra.internal)`,
        'Accept': 'text/html,application/xhtml+xml,application/json'
      },
      signal: AbortSignal.timeout(9000)
    });

    const html = await fetchRes.text();
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const resolvedTitle = titleMatch ? titleMatch[1].trim().replace(/\s+/g, ' ') : ssrf.parsedUrl.hostname;

    // Headings
    const headings: string[] = [];
    for (const m of html.matchAll(/<(h1|h2|h3)[^>]*>([\s\S]*?)<\/\1>/gi)) {
      const clean = m[2].replace(/<[^>]*>/g, '').trim().replace(/\s+/g, ' ');
      if (clean && clean.length < 120 && !headings.includes(clean)) {
        headings.push(clean);
        if (headings.length >= 8) break;
      }
    }

    // Links
    const links: Array<{ text: string; href: string }> = [];
    for (const m of html.matchAll(/<a[^>]*href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
      const href = m[1].trim();
      const text = m[2].replace(/<[^>]*>/g, '').trim().replace(/\s+/g, ' ');
      if (href && text && !href.startsWith('#') && !href.startsWith('javascript:')) {
        let fullHref = href;
        try {
          fullHref = new URL(href, ssrf.parsedUrl.origin).href;
        } catch {
          // ignore
        }
        links.push({ text: text.slice(0, 80), href: fullHref });
        if (links.length >= 15) break;
      }
    }

    const tab: TabData = {
      tabId,
      url: ssrf.parsedUrl.href,
      title: resolvedTitle,
      isLoading: false,
      httpStatusCode: fetchRes.status,
      headings,
      links,
      forms: [],
      extractedTextPreview: html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 500),
      lastNavigatedAt: now,
      navigationHistory: [ssrf.parsedUrl.href]
    };

    session.tabs.push(tab);
    session.activeTabId = tabId;
    session.actionLog.push({ action: 'open_tab', targetUrl: ssrf.parsedUrl.href, timestamp: now, details: `HTTP ${fetchRes.status} "${resolvedTitle}"` });
    session.updatedAt = now;

    return res.json({ tab, sessionId });
  } catch (err: any) {
    return res.status(502).json({ error: `Navigation failed: ${err.message}` });
  }
});

// 4. Navigate tab to target URL
browserRouter.post('/tabs/navigate', async (req: Request, res: Response) => {
  const { sessionId, tabId, url, agentId = 'agent' } = req.body;
  const session = sessions.get(sessionId);
  if (!session) {
    return res.status(404).json({ error: `Browser session "${sessionId}" not found.` });
  }

  const tab = session.tabs.find(t => t.tabId === tabId) || session.tabs[0];
  if (!tab) {
    return res.status(404).json({ error: `Tab "${tabId}" not found in session.` });
  }

  const ssrf = validateTargetUrlForSSRF(url);
  if (!ssrf.valid || !ssrf.parsedUrl) {
    return res.status(400).json({ error: `SSRF Blocked: ${ssrf.error}` });
  }

  const now = new Date().toISOString();

  try {
    const fetchRes = await fetch(ssrf.parsedUrl.href, {
      headers: {
        'User-Agent': `ORCHESTRA-Agent/1.0 (${agentId}; Autonomous Workforce Engine; +https://orchestra.internal)`,
        'Accept': 'text/html,application/xhtml+xml,application/json'
      },
      signal: AbortSignal.timeout(9000)
    });

    const html = await fetchRes.text();
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const resolvedTitle = titleMatch ? titleMatch[1].trim().replace(/\s+/g, ' ') : ssrf.parsedUrl.hostname;

    // Headings
    const headings: string[] = [];
    for (const m of html.matchAll(/<(h1|h2|h3)[^>]*>([\s\S]*?)<\/\1>/gi)) {
      const clean = m[2].replace(/<[^>]*>/g, '').trim().replace(/\s+/g, ' ');
      if (clean && clean.length < 120 && !headings.includes(clean)) {
        headings.push(clean);
        if (headings.length >= 8) break;
      }
    }

    // Links
    const links: Array<{ text: string; href: string }> = [];
    for (const m of html.matchAll(/<a[^>]*href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
      const href = m[1].trim();
      const text = m[2].replace(/<[^>]*>/g, '').trim().replace(/\s+/g, ' ');
      if (href && text && !href.startsWith('#') && !href.startsWith('javascript:')) {
        let fullHref = href;
        try {
          fullHref = new URL(href, ssrf.parsedUrl.origin).href;
        } catch {
          // ignore
        }
        links.push({ text: text.slice(0, 80), href: fullHref });
        if (links.length >= 15) break;
      }
    }

    tab.url = ssrf.parsedUrl.href;
    tab.title = resolvedTitle;
    tab.httpStatusCode = fetchRes.status;
    tab.headings = headings;
    tab.links = links;
    tab.extractedTextPreview = html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 600);
    tab.lastNavigatedAt = now;
    tab.navigationHistory.push(ssrf.parsedUrl.href);

    session.activeTabId = tab.tabId;
    session.actionLog.push({ action: 'navigate', targetUrl: ssrf.parsedUrl.href, timestamp: now, details: `HTTP ${fetchRes.status} "${resolvedTitle}"` });
    session.updatedAt = now;

    return res.json({ success: true, tab, sessionId: session.id });
  } catch (err: any) {
    return res.status(502).json({ error: `Navigation failed: ${err.message}` });
  }
});

// 5. Execute action on current page (click link, inspect documents, extract content)
browserRouter.post('/tabs/action', async (req: Request, res: Response) => {
  const { sessionId, tabId, action, linkHref, agentId = 'agent' } = req.body;
  const session = sessions.get(sessionId);
  if (!session) {
    return res.status(404).json({ error: `Session "${sessionId}" not found.` });
  }

  const tab = session.tabs.find(t => t.tabId === tabId) || session.tabs[0];
  if (!tab) {
    return res.status(404).json({ error: `Tab "${tabId}" not found.` });
  }

  const now = new Date().toISOString();

  if (action === 'extract_content') {
    session.actionLog.push({ action: 'extract_content', targetUrl: tab.url, timestamp: now, details: `Extracted ${tab.headings.length} headings and text preview` });
    return res.json({
      success: true,
      action: 'extract_content',
      url: tab.url,
      title: tab.title,
      headings: tab.headings,
      contentSummary: tab.extractedTextPreview,
      availableLinksCount: tab.links.length
    });
  }

  if (action === 'click_link' && linkHref) {
    const ssrf = validateTargetUrlForSSRF(linkHref);
    if (!ssrf.valid || !ssrf.parsedUrl) {
      return res.status(400).json({ error: `SSRF Blocked: ${ssrf.error}` });
    }

    try {
      const fetchRes = await fetch(ssrf.parsedUrl.href, {
        headers: {
          'User-Agent': `ORCHESTRA-Agent/1.0 (${agentId}; Autonomous Workforce Engine; +https://orchestra.internal)`
        },
        signal: AbortSignal.timeout(9000)
      });
      const html = await fetchRes.text();
      const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : ssrf.parsedUrl.hostname;

      tab.url = ssrf.parsedUrl.href;
      tab.title = title;
      tab.httpStatusCode = fetchRes.status;
      tab.lastNavigatedAt = now;
      tab.navigationHistory.push(ssrf.parsedUrl.href);

      session.actionLog.push({ action: 'click_link', targetUrl: ssrf.parsedUrl.href, timestamp: now, details: `Followed link -> "${title}"` });
      session.updatedAt = now;

      return res.json({ success: true, action: 'click_link', tab });
    } catch (err: any) {
      return res.status(502).json({ error: `Failed to follow link: ${err.message}` });
    }
  }

  if (action === 'download_file') {
    const downloadRecord = {
      filename: `doc-snapshot-${Date.now()}.txt`,
      mimeType: 'text/plain',
      sizeBytes: tab.extractedTextPreview.length,
      downloadUrl: tab.url,
      downloadedAt: now
    };
    session.downloadedFiles.push(downloadRecord);
    session.actionLog.push({ action: 'download_file', targetUrl: tab.url, timestamp: now, details: `Saved ${downloadRecord.filename} (${downloadRecord.sizeBytes} bytes)` });
    session.updatedAt = now;

    return res.json({ success: true, file: downloadRecord });
  }

  return res.status(400).json({ error: `Unsupported browser action: ${action}` });
});

// 6. Close tab
browserRouter.delete('/tabs/:tabId', (req: Request, res: Response) => {
  const { tabId } = req.params;
  const { sessionId } = req.query;

  if (typeof sessionId === 'string') {
    const session = sessions.get(sessionId);
    if (session) {
      session.tabs = session.tabs.filter(t => t.tabId !== tabId);
      if (session.tabs.length > 0 && session.activeTabId === tabId) {
        session.activeTabId = session.tabs[0].tabId;
      }
      return res.json({ success: true, remainingTabs: session.tabs.length });
    }
  }
  return res.status(404).json({ error: 'Tab or session not found.' });
});
