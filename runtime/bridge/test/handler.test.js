import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handleText } from '../src/handler.js';

const NOW = new Date('2026-06-01T00:00:00Z'); // 2026-06-01(月) 09:00 JST

test('予定文 → 確認メッセージ（自動登録オフ）', async () => {
  const r = await handleText('明日15時に田中さんと打ち合わせ', { now: NOW });
  assert.equal(r.type, 'text');
  assert.match(r.text, /【確認】/);
  assert.match(r.text, /件名: 田中さんと打ち合わせ/);
  assert.match(r.text, /2026-06-02 15:00（火）〜16:00/);
});

test('終日予定の整形', async () => {
  const r = await handleText('6月10日 出張', { now: NOW });
  assert.match(r.text, /件名: 出張/);
  assert.match(r.text, /2026-06-10（水）終日/);
});

test('予定として読めない文 → ヘルプ', async () => {
  const r = await handleText('ありがとう', { now: NOW });
  assert.match(r.text, /読み取れませんでした/);
  assert.match(r.text, /例:/);
});
