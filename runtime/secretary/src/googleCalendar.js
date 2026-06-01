// googleCalendar.js — Google Calendar へのイベント作成（実モード）
// googleapis は実行時のみ動的import（dry-run/テストでは読み込まない）。
//
// 認証: サービスアカウント方式。
//   1. GCPでサービスアカウントを作成しJSON鍵をDL
//   2. 対象のGoogleカレンダーを、そのサービスアカウントのメール宛に
//      「予定の変更権限」で共有する
//   3. 環境変数を設定:
//        GOOGLE_APPLICATION_CREDENTIALS = サービスアカウントJSONのパス
//        IKEDA_CALENDAR_ID              = 対象カレンダーID（既定: primary）

export async function createEvent(event, opts = {}) {
  const keyFile = opts.keyFile || process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const calendarId = opts.calendarId || process.env.IKEDA_CALENDAR_ID || 'primary';
  if (!keyFile) {
    throw new Error('GOOGLE_APPLICATION_CREDENTIALS が未設定です（サービスアカウントJSONのパス）');
  }

  // 動的import: 実モードのときだけ依存を読み込む
  const { google } = await import('googleapis');
  const auth = new google.auth.GoogleAuth({
    keyFile,
    scopes: ['https://www.googleapis.com/auth/calendar.events'],
  });
  const calendar = google.calendar({ version: 'v3', auth });

  const requestBody = {
    summary: event.title,
    start: event.start,
    end: event.end,
  };
  const res = await calendar.events.insert({ calendarId, requestBody });
  return { id: res.data.id, htmlLink: res.data.htmlLink, status: res.data.status };
}

export default createEvent;
