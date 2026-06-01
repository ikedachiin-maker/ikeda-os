# secretary — 予定文 → Googleカレンダー

`agents/secretary.md` の最初の実働機能。日本語の自然文から予定を抽出し、Googleカレンダーに登録する。
LINEからの入力は次フェーズ（`runtime/bridge/`）でこのモジュールを呼び出す。

## できること

- 「明日15時に田中さんと打ち合わせ」のような自然文 → 件名・日時を抽出
- 相対日付（今日/明日/明後日/N日後/曜日/来週X曜）、`M月D日`、`M/D` に対応
- 時刻（`15時` / `15:30` / `午後3時` / `19時半` / `10時から12時`）に対応
- 時刻なしは終日予定に。過去日付や曖昧さは warnings で通知
- 依存ゼロのパーサ + 動的importのGoogle連携（dry-runは認証不要）

## 使い方

```bash
# dry-run（既定。登録しない。認証不要）
node src/index.js "明日15時に田中さんと打ち合わせ"

# 解析結果をJSONで
node src/index.js --json "来週金曜10時から12時 歯医者"

# 実際に登録（要・認証セットアップ）
node src/index.js --create "明後日 19時半 会食"
```

## テスト

```bash
node --test        # パーサの単体テスト（12ケース）
```

## 実モード（--create）のセットアップ

1. `npm install`（googleapis を取得）
2. GCPでサービスアカウントを作成し、JSON鍵をダウンロード
3. 対象のGoogleカレンダーを、サービスアカウントのメール宛に
   **「予定の変更権限」** で共有する
4. `.env.example` を `.env` にコピーして値を設定:
   - `GOOGLE_APPLICATION_CREDENTIALS` … JSON鍵のパス
   - `IKEDA_CALENDAR_ID` … カレンダーID（既定 primary）
5. `node --env-file=.env src/index.js --create "..."`

> 既存のGCPサービスアカウント（Google Drive連携で使用中のもの）を流用可能。

## 設計メモ

- `src/parseEvent.js` … 自然文 → イベント（純粋関数・`now`注入可）
- `src/googleCalendar.js` … Calendar API 呼び出し（実モードのみ動的import）
- `src/index.js` … CLI。LINE橋からは parseEvent / createEvent を直接importして使う
- タイムゾーンは Asia/Tokyo 固定

## 次の拡張

- [ ] LINE webhook → このモジュール呼び出し（`runtime/bridge/`）
- [ ] 登録結果を `brain/memory/daily/` に記録（循環）
- [ ] 複雑文はCodex/LLMにパースを委譲（現状は決定論パーサ）
- [ ] 参加者・場所・繰り返し予定への対応
