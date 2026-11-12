/**
 * ORCHESTRA Autonomous Internet Workforce: Agent Digital Identity Types
 * Represents each agent's persistent internet presence, cryptographic certificate,
 * external credentials, and least-privilege permission levels.
 */

export type AgentAutonomyPermissionLevel = 'observe' | 'assist' | 'execute' | 'restricted';

export interface AgentExternalAccountAccess {
  accountId: string;
  accountType: 'google_workspace' | 'github' | 'linkedin' | 'openrouter' | 'huggingface' | 'cloud_infra';
  accountName: string;
  scopeLevel: 'read_only' | 'draft_only' | 'authorized_execution';
  isGranted: boolean;
  grantedAt: string;
}

export interface AgentDigitalIdentity {
  id: string; // Unique identity ID, e.g. "ident-agt-scout"
  agentId: string; // Matching registered agent ID, e.g. "agt-scout"
  name: string;
  callsign: string;
  avatar: string;
  role: string;
  description: string;
  specialization: string;
  capabilities: string[];
  assignedResponsibilities: string[];
  availableModels: string[];
  connectedToolIds: string[];
  authorizedExternalAccounts: AgentExternalAccountAccess[];
  permissionLevel: AgentAutonomyPermissionLevel;
  userAgentSignature: string;
  digitalCertificateId: string;
  operationalStatus: 'ACTIVE' | 'IDLE' | 'BUSY' | 'PAUSED' | 'RESTRICTED';
  totalExecutionsCount: number;
  totalConversationsCount: number;
  lastActiveTimestamp: string;
  createdAt: string;
}
