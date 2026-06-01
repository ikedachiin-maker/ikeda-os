#!/usr/bin/env node
// index.js — secretary CLI
// 使い方:
//   node src/index.js "明日15時に田中さんと打ち合わせ"          # dry-run（既定。登録しない）
//   node src/index.js --create "来週金曜10時から12時 歯医者"     # 実際にカレンダー登録
//   node src/index.js --json "明後日 19時 会食"                  # 解析結果をJSONで出力
//
// LINE橋（runtime/bridge）からは parseEvent + createEvent を直接呼ぶ想定。

import { parseEvent } from './parseEvent.js';

function fmt(ev) {
  const when = ev.allDay
    ? `${ev.start.date}（${ev.weekday}）終日`
    : `${ev.start.dateTime.slice(0, 16).replace('T', ' ')}（${ev.weekday}）〜 ${ev.end.dateTime.slice(11, 16)}`;
  const lines = [
    `件名 : ${ev.title}`,
    `日時 : ${when}`,
  ];
  if (ev.warnings.length) lines.push(`注意 : ${ev.warnings.join(' / ')}`);
  return lines.join('\n');
}

async function main() {
  const argv = process.argv.slice(2);
  const create = argv.includes('--create');
  const asJson = argv.includes('--json');
  const text = argv.filter((a) => !a.startsWith('--')).join(' ').trim();

  if (!text) {
    console.error('使い方: node src/index.js [--create|--json] "予定の文章"');
    process.exit(1);
  }

  const ev = parseEvent(text);
  if (!ev) {
    console.error(`✗ 日付を読み取れませんでした: "${text}"`);
    console.error('  例: 「明日15時に打ち合わせ」「6月10日 終日 出張」「来週金曜10時〜12時 歯医者」');
    process.exit(2);
  }

  if (asJson) { console.log(JSON.stringify(ev, null, 2)); return; }

  if (!create) {
    console.log('【dry-run】以下の内容で登録できます（--create で実行）\n');
    console.log(fmt(ev));
    return;
  }

  const { createEvent } = await import('./googleCalendar.js');
  const res = await createEvent(ev);
  console.log('✓ カレンダー登録しました\n');
  console.log(fmt(ev));
  if (res.htmlLink) console.log(`\nURL : ${res.htmlLink}`);
}

main().catch((e) => { console.error('✗ エラー:', e.message); process.exit(1); });
