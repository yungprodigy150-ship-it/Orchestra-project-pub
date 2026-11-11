import test from 'node:test';
import assert from 'node:assert';
import { isAgentAuthorizedOnServer } from '../server.js';

test('Agent Authorization: Scout is authorized for research and lead discovery', () => {
  assert.strictEqual(isAgentAuthorizedOnServer('agt-scout', 'tool_lead_discovery'), true);
  assert.strictEqual(isAgentAuthorizedOnServer('agt-scout', 'tool_web_research'), true);
  assert.strictEqual(isAgentAuthorizedOnServer('agt-scout', 'tool_website_intelligence'), true);

  // Scout must NOT be authorized for email dispatch or financial commits
  assert.strictEqual(isAgentAuthorizedOnServer('agt-scout', 'tool_email_dispatch'), false);
  assert.strictEqual(isAgentAuthorizedOnServer('agt-scout', 'tool_external_billing_api'), false);
});

test('Agent Authorization: Outreach Assistant is strictly barred from direct email dispatch', () => {
  // Outreach Assistant prepares drafts and queries CRM profiles, but can NEVER dispatch emails directly
  assert.strictEqual(isAgentAuthorizedOnServer('agt-out-asst', 'tool_crm_account_profiler'), true);
  assert.strictEqual(isAgentAuthorizedOnServer('agt-out-asst', 'tool_web_research'), true);
  assert.strictEqual(isAgentAuthorizedOnServer('agt-out-asst', 'tool_email_dispatch'), false);
});

test('Agent Authorization: Market Intelligence Agent permissions', () => {
  assert.strictEqual(isAgentAuthorizedOnServer('agt-mkt-intel', 'tool_web_research'), true);
  assert.strictEqual(isAgentAuthorizedOnServer('agt-mkt-intel', 'tool_website_intelligence'), true);
  assert.strictEqual(isAgentAuthorizedOnServer('agt-mkt-intel', 'tool_doc_schema_analyzer'), true);
  assert.strictEqual(isAgentAuthorizedOnServer('agt-mkt-intel', 'tool_email_dispatch'), false);
});

test('Agent Authorization: Operator has full supervisory permissions', () => {
  assert.strictEqual(isAgentAuthorizedOnServer('operator', 'tool_web_research'), true);
  assert.strictEqual(isAgentAuthorizedOnServer('operator', 'tool_email_dispatch'), true);
  assert.strictEqual(isAgentAuthorizedOnServer('operator', 'tool_external_billing_api'), true);
  assert.strictEqual(isAgentAuthorizedOnServer('human-operator', 'tool_email_dispatch'), true);
});

test('Agent Authorization: Unknown or rogue agent is completely blocked', () => {
  assert.strictEqual(isAgentAuthorizedOnServer('agt-unknown-attacker', 'tool_web_research'), false);
  assert.strictEqual(isAgentAuthorizedOnServer('rogue-script', 'tool_email_dispatch'), false);
});
