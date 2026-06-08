// handler.js — 受信テキスト1件を処理して返信メッセージを作る（純粋ロジック・テスト可能）
import { parseEvent } from '../../secretary/src/parseEvent.js';

const HELP = [
  '予定を登録できます。例:',
  '・明日15時に田中さんと打ち合わせ',
  '・来週金曜10時〜12時 歯医者',
  '・6月20日 出張',
].join('\n');

function fmtEvent(ev) {
  const when = ev.allDay
    ? `${ev.start.date}（${ev.weekday}）終日`
    : `${ev.start.dateTime.slice(0, 16).replace('T', ' ')}（${ev.weekday}）〜${ev.end.dateTime.slice(11, 16)}`;
  let s = `件名: ${ev.title}\n日時: ${when}`;
  if (ev.warnings.length) s += `\n注意: ${ev.warnings.join(' / ')}`;
  return s;
}

/**
 * @param {string} text 受信テキスト
 * @param {{autoCreate?:boolean, now?:Date, calendar?:object}} [opts]
 * @returns {Promise<{type:'text', text:string}>}
 */
export async function handleText(text, opts = {}) {
  const { autoCreate = false, now, calendar } = opts;
  const ev = parseEvent(text, now);

  if (!ev) {
    return { type: 'text', text: `「${text}」から予定を読み取れませんでした。\n\n${HELP}` };
  }

  if (autoCreate) {
    try {
      const { createEvent } = await import('../../secretary/src/googleCalendar.js');
      const res = await createEvent(ev, calendar || {});
      let t = `✓ カレンダーに登録しました\n\n${fmtEvent(ev)}`;
      if (res.htmlLink) t += `\n\n${res.htmlLink}`;
      return { type: 'text', text: t };
    } catch (e) {
      return { type: 'text', text: `登録でエラーが出ました: ${e.message}\n\n解釈内容:\n${fmtEvent(ev)}` };
    }
  }

  // 確認モード（自動登録オフ）
  return { type: 'text', text: `【確認】この内容で登録しますか？\n\n${fmtEvent(ev)}` };
}

export { fmtEvent };
