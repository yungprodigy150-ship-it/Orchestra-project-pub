import test from 'node:test';
import assert from 'node:assert';
import {
  AgentIdentityService,
  INITIAL_DIGITAL_IDENTITIES,
  AutonomousBrowserService,
  ExternalAccountService,
  AIDiscoveryService,
  AgentDialogueService,
  INITIAL_CONVERSATIONS,
  AuditLogger,
  LocalStoragePersistenceAdapter
} from '../src/services/index.js';
import { validateTargetUrlForSSRF } from '../server.js';

test('Agent Identity: lists initial identities with distinct user-agent signatures and certificates', () => {
  const auditStorage = new LocalStoragePersistenceAdapter<any>('test_audit_ident', []);
  const auditLogger = new AuditLogger(auditStorage);
  const identService = new AgentIdentityService(auditLogger);

  const identities = identService.listIdentities();
  assert.ok(identities.length >= 5, 'Should have at least 5 initialized digital identities');

  const scout = identService.getIdentity('agt-scout');
  assert.ok(scout, 'Scout identity should exist');
  assert.strictEqual(scout?.role, 'Opportunity Hunter');
  assert.strictEqual(scout?.callsign, 'SCOUT-01');
  assert.match(scout?.userAgentSignature || '', /ORCHESTRA-Agent\/1\.0/);
  assert.match(scout?.digitalCertificateId || '', /cert-sha256/);
  assert.strictEqual(scout?.permissionLevel, 'execute');

  const courier = identService.getIdentity('agt-out-asst');
  assert.ok(courier, 'Courier identity should exist');
  assert.strictEqual(courier?.permissionLevel, 'restricted', 'Courier must be restricted under human supervision');
});

test('Agent Identity: permission level updates enforce least-privilege auditing', () => {
  const auditStorage = new LocalStoragePersistenceAdapter<any>('test_audit_perm', []);
  const auditLogger = new AuditLogger(auditStorage);
  const identService = new AgentIdentityService(auditLogger);

  const updated = identService.updatePermissionLevel('agt-scout', 'observe');
  assert.strictEqual(updated.permissionLevel, 'observe');

  const events = auditLogger.getEvents();
  assert.ok(events.some(e => e.title.includes('Agent Permission Updated: Scout (OBSERVE)')));
});

test('Autonomous Browser Service: session management and SSRF protection', async () => {
  const auditStorage = new LocalStoragePersistenceAdapter<any>('test_audit_browser', []);
  const auditLogger = new AuditLogger(auditStorage);
  const browserService = new AutonomousBrowserService(auditLogger);

  const session = await browserService.createSession(
    'agt-scout',
    'Scout',
    'Evaluate enterprise cloud storage pricing disclosures'
  );

  assert.ok(session.id.startsWith('brows-sess-'));
  assert.strictEqual(session.status, 'ACTIVE');
  assert.strictEqual(session.tabs.length, 1);
  assert.strictEqual(session.runtimeType, 'BUILTIN_DOM_RUNTIME');

  // SSRF validation prevents browser from accessing internal or localhost targets
  const ssrfAttempt = validateTargetUrlForSSRF('http://127.0.0.1:3000/api/providers');
  assert.strictEqual(ssrfAttempt.valid, false);

  const validTarget = validateTargetUrlForSSRF('https://news.ycombinator.com');
  assert.strictEqual(validTarget.valid, true);
});

test('External Accounts: permission checking and activity auditing', () => {
  const auditStorage = new LocalStoragePersistenceAdapter<any>('test_audit_accounts', []);
  const auditLogger = new AuditLogger(auditStorage);
  const accountService = new ExternalAccountService(auditLogger);

  // Record an action
  const activity = accountService.recordActivity({
    accountId: 'acc-google-workspace',
    agentId: 'agt-scout',
    agentName: 'Scout',
    action: 'SEARCH_DOCUMENTS',
    resourceTarget: 'Drive folder: SEC Filings',
    status: 'SUCCESS'
  });

  assert.ok(activity.id.startsWith('act-'));
  assert.strictEqual(activity.status, 'SUCCESS');

  const history = accountService.listActivities();
  assert.ok(history.length >= 1);
  assert.strictEqual(history[0].action, 'SEARCH_DOCUMENTS');
});

test('AI Discovery & Routing: evaluates task objectives into intelligent routing recommendations', async () => {
  const auditStorage = new LocalStoragePersistenceAdapter<any>('test_audit_ai', []);
  const auditLogger = new AuditLogger(auditStorage);
  const discoveryService = new AIDiscoveryService(auditLogger);

  const evalResult = await discoveryService.evaluateRouting(
    'Extract database CDC changes from enterprise PostgreSQL logical replication streams'
  );

  assert.ok(evalResult.recommendedModelId);
  assert.ok(evalResult.recommendedProvider);
  assert.ok(evalResult.rationales.length > 0);
  assert.ok(typeof evalResult.estimatedCostUsd === 'number');
});

test('Agent Dialogue: peer-to-peer consultation enforces turn limits and consensus tracking', async () => {
  const auditStorage = new LocalStoragePersistenceAdapter<any>('test_audit_dialogue', []);
  const auditLogger = new AuditLogger(auditStorage);
  const dialogueStorage = new LocalStoragePersistenceAdapter<any>('agent_dialogues', INITIAL_CONVERSATIONS);
  const dialogueService = new AgentDialogueService(auditLogger, dialogueStorage);

  const conversations = dialogueService.listConversations();
  assert.ok(conversations.length >= 1, 'Initial dialogue seeds should be present');

  const activeConv = conversations[0];
  assert.strictEqual(activeConv.maxTurns, 6, 'Anti-loop safety caps dialogues at 6 turns');
  assert.ok(activeConv.participatingAgentIds.includes('agt-scout'));
  assert.ok(activeConv.participatingAgentIds.includes('agt-2'));

  // Test anti-loop guardrail: when reaching max turns, status concludes
  const simulatedConv = {
    ...activeConv,
    id: 'test-conv-limit',
    totalTurns: 6,
    status: 'ACTIVE' as const,
    messages: [...activeConv.messages]
  };
  dialogueStorage.set('test-conv-limit', simulatedConv);

  const messageAttempt = await dialogueService.sendMessage(
    'test-conv-limit',
    { id: 'agt-scout', name: 'Scout', role: 'Opportunity Hunter' },
    { id: 'agt-2', name: 'Vanguard', role: 'Market Intelligence' },
    'Follow up past limit'
  );

  assert.strictEqual(messageAttempt, null, 'Message past turn cap must be blocked');
  const fetched = dialogueService.getConversation('test-conv-limit');
  assert.strictEqual(fetched?.status, 'CONCLUDED');
});
