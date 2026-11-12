/**
 * ORCHESTRA External Account Connectivity Types
 * Scoped integrations for Google Workspace, GitHub, LinkedIn, OpenRouter,
 * Hugging Face, and cloud providers with permission levels and audit logs.
 */

export type AccountCategory = 'workspace' | 'developer' | 'social' | 'ai_provider' | 'cloud_infrastructure';

export interface ExternalConnectedAccount {
  id: string; // e.g. "acc-gh-org"
  name: string;
  provider: 'google_workspace' | 'github' | 'linkedin' | 'openrouter' | 'huggingface' | 'cloud_infra';
  category: AccountCategory;
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

export interface AccountActivityRecord {
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
