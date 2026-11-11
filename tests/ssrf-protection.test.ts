import test from 'node:test';
import assert from 'node:assert';
import { validateTargetUrlForSSRF } from '../server.js';

test('SSRF Protection: Blocks loopback hostnames', () => {
  const localhostCheck = validateTargetUrlForSSRF('http://localhost:3000/api/providers');
  assert.strictEqual(localhostCheck.valid, false);
  assert.match(localhostCheck.error || '', /prohibited/i);

  const ip127Check = validateTargetUrlForSSRF('http://127.0.0.1:8080');
  assert.strictEqual(ip127Check.valid, false);

  const ipv6Loopback = validateTargetUrlForSSRF('http://[::1]:3000');
  assert.strictEqual(ipv6Loopback.valid, false);
});

test('SSRF Protection: Blocks cloud instance metadata endpoints', () => {
  const gcpMetadata = validateTargetUrlForSSRF('http://169.254.169.254/computeMetadata/v1/');
  assert.strictEqual(gcpMetadata.valid, false);
  assert.match(gcpMetadata.error || '', /metadata|prohibited/i);

  const gcpNamedMetadata = validateTargetUrlForSSRF('http://metadata.google.internal/computeMetadata/v1/');
  assert.strictEqual(gcpNamedMetadata.valid, false);
});

test('SSRF Protection: Blocks private RFC 1918 IPv4 ranges', () => {
  const classA = validateTargetUrlForSSRF('http://10.0.1.5/admin');
  assert.strictEqual(classA.valid, false);
  assert.match(classA.error || '', /RFC1918|prohibited/i);

  const classB = validateTargetUrlForSSRF('http://172.20.0.1:8080');
  assert.strictEqual(classB.valid, false);

  const classC = validateTargetUrlForSSRF('http://192.168.1.1/router');
  assert.strictEqual(classC.valid, false);
});

test('SSRF Protection: Blocks dangerous URL protocols (file, ftp, gopher)', () => {
  const fileCheck = validateTargetUrlForSSRF('file:///etc/passwd');
  assert.strictEqual(fileCheck.valid, false);
  assert.match(fileCheck.error || '', /protocol/i);

  const ftpCheck = validateTargetUrlForSSRF('ftp://example.com/file');
  assert.strictEqual(ftpCheck.valid, false);
});

test('SSRF Protection: Permits valid public HTTPS websites', () => {
  const validUrl = validateTargetUrlForSSRF('https://example.com/about');
  assert.strictEqual(validUrl.valid, true);
  assert.strictEqual(validUrl.parsedUrl?.hostname, 'example.com');

  const githubUrl = validateTargetUrlForSSRF('https://github.com/features');
  assert.strictEqual(githubUrl.valid, true);
});
