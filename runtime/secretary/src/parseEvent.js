// parseEvent.js — 日本語の自然文から予定（イベント）を抽出する
// 依存ゼロ。Asia/Tokyo 固定。now を注入できるのでテスト可能。

const WD = { '日': 0, '月': 1, '火': 2, '水': 3, '木': 4, '金': 5, '土': 6 };
const WD_NAME = ['日', '月', '火', '水', '木', '金', '土'];

const pad = (n) => String(n).padStart(2, '0');

// 全角数字・記号を半角へ正規化
function normalize(s) {
  return s
    .replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/：/g, ':')
    .replace(/[～〜]/g, '~');
}

// now(Date) から JST の年月日・曜日・時分を得る
function jstParts(now) {
  const d = new Date(now.getTime() + 9 * 3600 * 1000);
  return {
    y: d.getUTCFullYear(), mo: d.getUTCMonth() + 1, da: d.getUTCDate(),
    wd: d.getUTCDay(), hh: d.getUTCHours(), mi: d.getUTCMinutes(),
  };
}
const ord = (y, m, d) => Math.floor(Date.UTC(y, m - 1, d) / 86400000);
const fromOrd = (o) => {
  const dt = new Date(o * 86400000);
  return { y: dt.getUTCFullYear(), m: dt.getUTCMonth() + 1, d: dt.getUTCDate(), wd: dt.getUTCDay() };
};

// ---- 日付の解釈 ----
function parseDay(text, j) {
  const today = ord(j.y, j.mo, j.da);
  const warnings = [];
  const consumed = [];
  let target = null;
  let m;

  if ((m = /(\d+)日後/.exec(text))) { target = today + +m[1]; consumed.push(m[0]); }
  else if ((m = /(\d+)日前/.exec(text))) { target = today - +m[1]; consumed.push(m[0]); warnings.push('過去の日付です'); }
  else if (/明々後日|明明後日|しあさって/.test(text)) { target = today + 3; consumed.push(text.match(/明々後日|明明後日|しあさって/)[0]); }
  else if (/明後日|あさって/.test(text)) { target = today + 2; consumed.push(text.match(/明後日|あさって/)[0]); }
  else if (/明日|あした|あす/.test(text)) { target = today + 1; consumed.push(text.match(/明日|あした|あす/)[0]); }
  else if (/今日|本日|きょう/.test(text)) { target = today; consumed.push(text.match(/今日|本日|きょう/)[0]); }
  else if (/昨日|きのう/.test(text)) { target = today - 1; consumed.push(text.match(/昨日|きのう/)[0]); warnings.push('過去の日付です'); }

  // M月D日
  if (target === null && (m = /(\d{1,2})月(\d{1,2})日/.exec(text))) {
    let y = j.y, o = ord(y, +m[1], +m[2]);
    if (o < today) { y += 1; o = ord(y, +m[1], +m[2]); warnings.push('今年の日付は過ぎていたため来年と解釈'); }
    target = o; consumed.push(m[0]);
  }
  // M/D
  if (target === null && (m = /(?<!\d)(\d{1,2})\/(\d{1,2})(?!\d)/.exec(text))) {
    let y = j.y, o = ord(y, +m[1], +m[2]);
    if (o < today) { y += 1; o = ord(y, +m[1], +m[2]); }
    target = o; consumed.push(m[0]);
  }
  // 再来週/来週/今週 + 曜日
  if (target === null && (m = /(再来週|来週|今週)(?:の)?([日月火水木金土])曜(?:日)?/.exec(text))) {
    const wd = WD[m[2]];
    const sun = today - j.wd;
    if (m[1] === '再来週') target = sun + 14 + wd;
    else if (m[1] === '来週') target = sun + 7 + wd;
    else { target = sun + wd; if (target < today) warnings.push('今週の指定日は過ぎています'); }
    consumed.push(m[0]);
  }
  // 来/次の/今度の + 曜日（直近の次の同曜日）
  if (target === null && (m = /(?:来|次の|今度の)([日月火水木金土])曜(?:日)?/.exec(text))) {
    const wd = WD[m[1]];
    let delta = (wd - j.wd + 7) % 7;
    if (delta === 0) delta = 7;
    target = today + delta; consumed.push(m[0]);
  }
  // 単独の曜日（今日含むこれから）
  if (target === null && (m = /([日月火水木金土])曜(?:日)?/.exec(text))) {
    const wd = WD[m[1]];
    target = today + ((wd - j.wd + 7) % 7); consumed.push(m[0]);
  }
  // D日 単独（今月。過ぎていれば来月）
  if (target === null && (m = /(?<!\d)(\d{1,2})日(?!後|前)/.exec(text))) {
    let y = j.y, mo = j.mo, o = ord(y, mo, +m[1]);
    if (o < today) { mo += 1; if (mo > 12) { mo = 1; y += 1; } o = ord(y, mo, +m[1]); }
    target = o; consumed.push(m[0]);
  }

  if (target === null) return null;
  return { ordinal: target, consumed, warnings };
}

// ---- 時刻の解釈 ----
function parseTime(text) {
  const consumed = [];
  const warnings = [];
  let startH = null, startM = 0, endH = null, endM = 0;
  let m;

  const pm = /午後|PM|pm/.test(text);
  const am = /午前|AM|am/.test(text);

  if (/正午/.test(text)) { startH = 12; startM = 0; consumed.push('正午'); }
  // 範囲: N時〜M時 / N時からM時
  else if ((m = /(\d{1,2})(?::|時)(\d{1,2})?分?\s*(?:から|~|-)\s*(\d{1,2})(?::|時)(\d{1,2})?分?/.exec(text))) {
    startH = +m[1]; startM = m[2] ? +m[2] : 0; endH = +m[3]; endM = m[4] ? +m[4] : 0; consumed.push(m[0]);
  }
  else if ((m = /(\d{1,2})時半/.exec(text))) { startH = +m[1]; startM = 30; consumed.push(m[0]); }
  else if ((m = /(\d{1,2})時(\d{1,2})分/.exec(text))) { startH = +m[1]; startM = +m[2]; consumed.push(m[0]); }
  else if ((m = /(\d{1,2}):(\d{2})/.exec(text))) { startH = +m[1]; startM = +m[2]; consumed.push(m[0]); }
  else if ((m = /(\d{1,2})時/.exec(text))) { startH = +m[1]; startM = 0; consumed.push(m[0]); }

  if (startH === null) return null;

  const apply = (h) => (pm && h < 12 ? h + 12 : am && h === 12 ? 0 : h);
  startH = apply(startH);
  if (endH !== null) endH = apply(endH);
  if (am || pm) { const t = text.match(/午前|午後|AM|PM|am|pm/); if (t) consumed.push(t[0]); }

  return { startH, startM, endH, endM, consumed, warnings };
}

// ---- タイトル抽出 ----
function extractTitle(text, consumedList) {
  let t = text;
  for (const c of consumedList) if (c) t = t.split(c).join(' ');
  t = t
    .replace(/(を|に|の|から|まで|へ|で)(?=\s|$)/g, ' ')
    .replace(/(予定を?入れて|登録して|入れといて|リマインド(して)?|教えて|お願い(します)?|して(ください)?|ください)/g, ' ')
    .replace(/[、。･・]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  // 消費後に先頭・末尾へ残った助詞を除去（例:「15時」除去後の「に田中…」→「田中…」）
  t = t.replace(/^(?:に|を|の|へ|で|と|が|から|まで)\s*/, '').replace(/\s*(?:の|と|に)$/, '').trim();
  return t || '予定';
}

/**
 * 自然文 -> イベント
 * @param {string} input
 * @param {Date} [now]
 * @returns {{title,allDay,start,end,warnings,raw}|null}
 */
export function parseEvent(input, now = new Date()) {
  const text = normalize(String(input));
  const j = jstParts(now);

  const day = parseDay(text, j);
  if (!day) return null; // 日付が取れなければ予定として成立しない

  const time = parseTime(text);
  const consumed = [...day.consumed, ...(time ? time.consumed : [])];
  const title = extractTitle(text, consumed);
  const warnings = [...day.warnings, ...(time ? time.warnings : [])];

  const dateStr = (o) => { const { y, m, d } = fromOrd(o); return `${y}-${pad(m)}-${pad(d)}`; };

  if (!time) {
    const { wd } = fromOrd(day.ordinal);
    return {
      title, allDay: true,
      start: { date: dateStr(day.ordinal) },
      end: { date: dateStr(day.ordinal + 1) },
      warnings: [...warnings, '時刻の指定がないため終日予定にしました'],
      weekday: WD_NAME[wd],
      raw: input,
    };
  }

  // 開始
  let sOrd = day.ordinal, sH = time.startH, sMin = time.startM;
  // 終了（指定があればそれ、なければ +60分）
  let eOrd = sOrd, eH, eMin;
  if (time.endH !== null) { eH = time.endH; eMin = time.endM; }
  else {
    let total = sH * 60 + sMin + 60;
    eOrd = sOrd + Math.floor(total / 1440); total %= 1440;
    eH = Math.floor(total / 60); eMin = total % 60;
  }
  const dt = (o, h, mi) => { const { y, m, d } = fromOrd(o); return `${y}-${pad(m)}-${pad(d)}T${pad(h)}:${pad(mi)}:00+09:00`; };
  const { wd } = fromOrd(sOrd);

  return {
    title, allDay: false,
    start: { dateTime: dt(sOrd, sH, sMin), timeZone: 'Asia/Tokyo' },
    end: { dateTime: dt(eOrd, eH, eMin), timeZone: 'Asia/Tokyo' },
    warnings,
    weekday: WD_NAME[wd],
    raw: input,
  };
}

export default parseEvent;
