import { test } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { verifySignature } from '../src/line.js';

const SECRET = 'test_channel_secret';
const sign = (body) => crypto.createHmac('sha256', SECRET).update(body).digest('base64');

test('正しい署名は検証OK', () => {
  const body = JSON.stringify({ events: [] });
  assert.equal(verifySignature(body, sign(body), SECRET), true);
});

test('改ざんボディは検証NG', () => {
  const body = JSON.stringify({ events: [] });
  const sig = sign(body);
  assert.equal(verifySignature(body + 'x', sig, SECRET), false);
});

test('署名なし/シークレットなしはNG', () => {
  const body = '{}';
  assert.equal(verifySignature(body, '', SECRET), false);
  assert.equal(verifySignature(body, sign(body), ''), false);
});
