/**
 * ORCHESTRA Autonomous Browser Runtime Types
 * Contracts for multi-tab browser sessions, navigation history, DOM inspection,
 * form interactions, document downloads, and runtime status.
 */

export interface BrowserTabState {
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

export interface BrowserSessionRecord {
  id: string; // Session ID e.g. "brows-sess-101"
  agentId: string;
  agentName: string;
  relatedTaskId?: string;
  objective: string;
  activeTabId: string;
  tabs: BrowserTabState[];
  status: 'ACTIVE' | 'IDLE' | 'COMPLETED' | 'TERMINATED' | 'ERROR';
  runtimeType: 'BUILTIN_DOM_RUNTIME' | 'EXTERNAL_PLAYWRIGHT_CDP';
  downloadedFiles: Array<{ filename: string; mimeType: string; sizeBytes: number; downloadUrl: string; downloadedAt: string }>;
  actionLog: Array<{ action: string; targetUrl?: string; timestamp: string; details?: string }>;
  createdAt: string;
  updatedAt: string;
}

export interface BrowserActionRequest {
  sessionId: string;
  tabId?: string;
  action: 'navigate' | 'open_tab' | 'close_tab' | 'click_link' | 'fill_form' | 'extract_content' | 'download_file';
  targetUrl?: string;
  linkHref?: string;
  formData?: Record<string, string>;
  agentId: string;
}

export interface BrowserActionResponse {
  success: boolean;
  sessionId: string;
  tabId: string;
  currentUrl: string;
  title: string;
  summary: string;
  extractedContent?: any;
  downloadedFile?: any;
  durationMs: number;
  error?: string;
}
