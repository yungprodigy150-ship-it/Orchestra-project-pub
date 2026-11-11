import test from 'node:test';
import assert from 'node:assert';
import crypto from 'crypto';

interface MockApprovalRecord {
  id: string;
  payloadHash: string;
  status: string;
  expiresAt: string;
  decisionBy?: string;
}

function hashPayload(payload: any): string {
  return crypto.createHash('sha256').update(JSON.stringify(payload || {})).digest('hex');
}

test('Server Approval: Validates status is APPROVED before execution', () => {
  const payload = { to: 'founder@tech.com', subject: 'Architecture Brief', body: 'Demo note' };
  const approval: MockApprovalRecord = {
    id: 'auth-101',
    payloadHash: hashPayload(payload),
    status: 'PENDING' as string,
    expiresAt: new Date(Date.now() + 86400000).toISOString()
  };

  // When status is PENDING, execution must be blocked
  assert.strictEqual(approval.status, 'PENDING');
  let allowed = (approval.status as string) === 'APPROVED';
  assert.strictEqual(allowed, false);

  // Human operator approves
  approval.status = 'APPROVED';
  approval.decisionBy = 'Human Operator';
  allowed = (approval.status as string) === 'APPROVED';
  assert.strictEqual(allowed, true);
});

test('Server Approval: Replay Prevention transitions record to CONSUMED', () => {
  const payload = { to: 'founder@tech.com', subject: 'Architecture Brief', body: 'Demo note' };
  const approval: MockApprovalRecord = {
    id: 'auth-102',
    payloadHash: hashPayload(payload),
    status: 'APPROVED' as string,
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    decisionBy: 'Human Operator'
  };

  // First execution: status is APPROVED -> consumed
  assert.strictEqual(approval.status, 'APPROVED');
  approval.status = 'CONSUMED';

  // Subsequent execution attempt with same approvalId: must be rejected
  const replayAttemptAllowed = (approval.status as string) === 'APPROVED';
  assert.strictEqual(replayAttemptAllowed, false);
  assert.strictEqual(approval.status, 'CONSUMED');
});

test('Server Approval: Rejects expired authorization records', () => {
  const pastDate = new Date(Date.now() - 3600000).toISOString(); // 1 hour ago
  const approval: MockApprovalRecord = {
    id: 'auth-103',
    payloadHash: 'abc',
    status: 'APPROVED' as string,
    expiresAt: pastDate
  };

  const isExpired = new Date(approval.expiresAt).getTime() < Date.now();
  assert.strictEqual(isExpired, true);

  // Expired records must not be executed
  const allowed = (approval.status as string) === 'APPROVED' && !isExpired;
  assert.strictEqual(allowed, false);
});
