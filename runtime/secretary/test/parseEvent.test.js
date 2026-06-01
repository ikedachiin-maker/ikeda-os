import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseEvent } from '../src/parseEvent.js';

// 基準時刻: 2026-06-01(月) 09:00 JST
const NOW = new Date('2026-06-01T00:00:00Z'); // = 09:00 JST

test('明日 + 時刻', () => {
  const ev = parseEvent('明日15時に田中さんと打ち合わせ', NOW);
  assert.equal(ev.allDay, false);
  assert.equal(ev.start.dateTime, '2026-06-02T15:00:00+09:00');
  assert.equal(ev.end.dateTime, '2026-06-02T16:00:00+09:00'); // 既定+60分
  assert.equal(ev.title, '田中さんと打ち合わせ');
});

test('時刻なし → 終日', () => {
  const ev = parseEvent('6月10日 出張', NOW);
  assert.equal(ev.allDay, true);
  assert.equal(ev.start.date, '2026-06-10');
  assert.equal(ev.end.date, '2026-06-11');
  assert.equal(ev.title, '出張');
});

test('時刻範囲（から〜まで）', () => {
  const ev = parseEvent('来週金曜10時から12時 歯医者', NOW);
  // 来週金曜 = 6/12
  assert.equal(ev.start.dateTime, '2026-06-12T10:00:00+09:00');
  assert.equal(ev.end.dateTime, '2026-06-12T12:00:00+09:00');
  assert.equal(ev.title, '歯医者');
});

test('明後日 + 時半', () => {
  const ev = parseEvent('明後日 19時半 会食', NOW);
  assert.equal(ev.start.dateTime, '2026-06-03T19:30:00+09:00');
});

test('午後の適用', () => {
  const ev = parseEvent('明日 午後3時 ミーティング', NOW);
  assert.equal(ev.start.dateTime, '2026-06-02T15:00:00+09:00');
});

test('N日後', () => {
  const ev = parseEvent('3日後 10:00 通院', NOW);
  assert.equal(ev.start.dateTime, '2026-06-04T10:00:00+09:00');
});

test('単独の曜日（これから来る水曜）', () => {
  const ev = parseEvent('水曜 14時 撮影', NOW); // 6/1月 → 6/3水
  assert.equal(ev.start.dateTime, '2026-06-03T14:00:00+09:00');
});

test('M/D 形式 + コロン時刻', () => {
  const ev = parseEvent('6/20 13:30 内見', NOW);
  assert.equal(ev.start.dateTime, '2026-06-20T13:30:00+09:00');
});

test('過去日付の警告', () => {
  const ev = parseEvent('昨日 レポート', NOW);
  assert.ok(ev.warnings.some((w) => w.includes('過去')));
});

test('日付なしは null', () => {
  const ev = parseEvent('ありがとう', NOW);
  assert.equal(ev, null);
});

test('全角数字を正規化', () => {
  const ev = parseEvent('明日１０時 朝会', NOW);
  assert.equal(ev.start.dateTime, '2026-06-02T10:00:00+09:00');
});

test('日付が過ぎたM月D日は翌年', () => {
  const ev = parseEvent('1月5日 新年会', NOW); // 6/1時点で1/5は過去 → 2027
  assert.equal(ev.start.date, '2027-01-05');
});
