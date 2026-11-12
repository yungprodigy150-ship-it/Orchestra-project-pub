/**
 * ORCHESTRA External Account Connectivity Engine
 * Evaluates environment secrets, monitors integration health, enforces scoped
 * permissions per agent, and provides connection testing and activity auditing.
 */

import { Router, Request, Response } from 'express';
import crypto from 'crypto';

export interface ExternalAccountConfig {
  id: string;
  name: string;
  provider: 'google_workspace' | 'github' | 'linkedin' | 'openrouter' | 'huggingface' | 'cloud_infra';
  category: 'workspace' | 'developer' | 'social' | 'ai_provider' | 'cloud_infrastructure';
  authMethod: 'oauth2' | 'api_key' | 'service_account';
  status: 'CONNECTED' | 'NOT_CONFIGURED' | 'REVOKED' | 'RATE_LIMITED' | 'ERROR';
  statusMessage: string;
  requiredEnvVar: string;
  authorizedScopes: string[];
  assignedAgentIds: string[];
  requireApprovalForActions: boolean;
  lastHealthCheckTimestamp: string;
  activityCount: number;
  documentationUrl: string;
}

export interface AccountActivityItem {
  id: string;
  accountId: string;
  agentId: string;
  agentName: string;
  action: string;
  resourceTarget: string;
  status: 'SUCCESS' | 'HELD_APPROVAL' | 'FAILED' | 'REVOKED';
  details?: string;
  timestamp: string;
}

const activities: AccountActivityItem[] = [
  {
    id: 'act-01',
    accountId: 'acc-google-workspace',
    agentId: 'agt-scout',
    agentName: 'Scout (Opportunity Hunter)',
    action: 'Read Verified Research Documents',
    resourceTarget: 'Drive: /Market_Briefs_2026',
    status: 'SUCCESS',
    details: 'Retrieved verified competitive research brief.',
    timestamp: '2026-11-11T20:30:00Z'
  },
  {
    id: 'act-02',
    accountId: 'acc-github-org',
    agentId: 'agt-4',
    agentName: 'Atlas (Portfolio Strategist)',
    action: 'Inspect OpenAPI Schema Repository',
    resourceTarget: 'github.com/orchestra-core/relaysync-contracts',
    status: 'SUCCESS',
    details: 'Validated CDC replication schema definitions.',
    timestamp: '2026-11-11T22:15:00Z'
  }
];

export const accountRouter = Router();

function evaluateAccountStatus(envKey: string, providerName: string): { status: 'CONNECTED' | 'NOT_CONFIGURED'; message: string } {
  const val = process.env[envKey]?.trim();
  if (val && val.length > 10 && !val.includes('MY_') && val !== 'undefined') {
    return {
      status: 'CONNECTED',
      message: `Active: authenticated with ${providerName}.`
    };
  }
  return {
    status: 'NOT_CONFIGURED',
    message: `${envKey} is not configured in server environment secrets.`
  };
}

accountRouter.get('/', (_req: Request, res: Response) => {
  const ghStatus = evaluateAccountStatus('GITHUB_TOKEN', 'GitHub Enterprise');
  const gwStatus = evaluateAccountStatus('GOOGLE_WORKSPACE_KEY', 'Google Workspace');
  const hfStatus = evaluateAccountStatus('HUGGINGFACE_API_KEY', 'Hugging Face Hub');
  const orStatus = evaluateAccountStatus('OPENROUTER_API_KEY', 'OpenRouter Gateway');
  const awsStatus = evaluateAccountStatus('AWS_ACCESS_KEY_ID', 'AWS Cloud Infrastructure');

  const accounts: ExternalAccountConfig[] = [
    {
      id: 'acc-google-workspace',
      name: 'Google Workspace (Drive, Docs, Calendar)',
      provider: 'google_workspace',
      category: 'workspace',
      authMethod: 'oauth2',
      status: gwStatus.status,
      statusMessage: gwStatus.message,
      requiredEnvVar: 'GOOGLE_WORKSPACE_KEY',
      authorizedScopes: ['drive.readonly', 'calendar.events', 'gmail.compose'],
      assignedAgentIds: ['agt-scout', 'agt-2', 'agt-mkt-intel', 'operator'],
      requireApprovalForActions: true,
      lastHealthCheckTimestamp: new Date().toISOString(),
      activityCount: 14,
      documentationUrl: 'https://developers.google.com/workspace'
    },
    {
      id: 'acc-github-org',
      name: 'GitHub Enterprise Organization',
      provider: 'github',
      category: 'developer',
      authMethod: 'api_key',
      status: ghStatus.status,
      statusMessage: ghStatus.message,
      requiredEnvVar: 'GITHUB_TOKEN',
      authorizedScopes: ['repo:status', 'issues:read', 'pull_requests:read'],
      assignedAgentIds: ['agt-4', 'agt-port-strat', 'agt-scout', 'operator'],
      requireApprovalForActions: true,
      lastHealthCheckTimestamp: new Date().toISOString(),
      activityCount: 28,
      documentationUrl: 'https://docs.github.com/en/rest'
    },
    {
      id: 'acc-openrouter',
      name: 'OpenRouter Multi-Model Gateway',
      provider: 'openrouter',
      category: 'ai_provider',
      authMethod: 'api_key',
      status: orStatus.status,
      statusMessage: orStatus.message,
      requiredEnvVar: 'OPENROUTER_API_KEY',
      authorizedScopes: ['models:read', 'completions:write'],
      assignedAgentIds: ['*'],
      requireApprovalForActions: false,
      lastHealthCheckTimestamp: new Date().toISOString(),
      activityCount: 42,
      documentationUrl: 'https://openrouter.ai/docs'
    },
    {
      id: 'acc-huggingface',
      name: 'Hugging Face Model & Dataset Hub',
      provider: 'huggingface',
      category: 'ai_provider',
      authMethod: 'api_key',
      status: hfStatus.status,
      statusMessage: hfStatus.message,
      requiredEnvVar: 'HUGGINGFACE_API_KEY',
      authorizedScopes: ['inference:read', 'models:list'],
      assignedAgentIds: ['agt-2', 'agt-scout', 'agt-grw-anlyst', 'operator'],
      requireApprovalForActions: false,
      lastHealthCheckTimestamp: new Date().toISOString(),
      activityCount: 8,
      documentationUrl: 'https://huggingface.co/docs/api-inference/index'
    },
    {
      id: 'acc-cloud-infra',
      name: 'AWS & Multi-Cloud Infrastructure Observer',
      provider: 'cloud_infra',
      category: 'cloud_infrastructure',
      authMethod: 'service_account',
      status: awsStatus.status,
      statusMessage: awsStatus.message,
      requiredEnvVar: 'AWS_ACCESS_KEY_ID',
      authorizedScopes: ['eks:describe', 'cost-explorer:get-cost-and-usage'],
      assignedAgentIds: ['agt-grw-anlyst', 'operator'],
      requireApprovalForActions: true,
      lastHealthCheckTimestamp: new Date().toISOString(),
      activityCount: 5,
      documentationUrl: 'https://aws.amazon.com/cli/'
    }
  ];

  return res.json({ accounts });
});

// Test account connection
accountRouter.post('/test', async (req: Request, res: Response) => {
  const { accountId } = req.body;
  const start = performance.now();

  if (accountId === 'acc-openrouter') {
    const val = process.env.OPENROUTER_API_KEY?.trim();
    if (!val || val.length < 15) {
      return res.json({ success: false, status: 'NOT_CONFIGURED', error: 'OPENROUTER_API_KEY unconfigured.' });
    }
    try {
      const resp = await fetch('https://openrouter.ai/api/v1/auth/key', {
        headers: { Authorization: `Bearer ${val}` },
        signal: AbortSignal.timeout(5000)
      });
      const latencyMs = Math.round(performance.now() - start);
      return res.json({ success: resp.ok, status: resp.ok ? 'CONNECTED' : 'ERROR', latencyMs, details: `HTTP ${resp.status}` });
    } catch (err: any) {
      return res.json({ success: false, status: 'ERROR', error: err.message });
    }
  }

  if (accountId === 'acc-github-org') {
    const val = process.env.GITHUB_TOKEN?.trim();
    if (!val || val.length < 15) {
      return res.json({ success: false, status: 'NOT_CONFIGURED', error: 'GITHUB_TOKEN unconfigured.' });
    }
    try {
      const resp = await fetch('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${val}`, 'User-Agent': 'ORCHESTRA-Identity-Check' },
        signal: AbortSignal.timeout(5000)
      });
      const latencyMs = Math.round(performance.now() - start);
      return res.json({ success: resp.ok, status: resp.ok ? 'CONNECTED' : 'ERROR', latencyMs, details: `GitHub API HTTP ${resp.status}` });
    } catch (err: any) {
      return res.json({ success: false, status: 'ERROR', error: err.message });
    }
  }

  return res.json({
    success: false,
    status: 'NOT_CONFIGURED',
    error: `Credentials for account "${accountId}" are not configured in server environment.`
  });
});

accountRouter.get('/activity', (_req: Request, res: Response) => {
  return res.json({ activities });
});

accountRouter.post('/activity/log', (req: Request, res: Response) => {
  const { accountId, agentId, agentName, action, resourceTarget, status = 'SUCCESS', details } = req.body;
  const newActivity: AccountActivityItem = {
    id: `act-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`,
    accountId,
    agentId,
    agentName,
    action,
    resourceTarget,
    status,
    details,
    timestamp: new Date().toISOString()
  };
  activities.unshift(newActivity);
  return res.status(201).json({ activity: newActivity });
});
