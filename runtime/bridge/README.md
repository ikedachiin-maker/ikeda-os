# runtime/bridge/ — LINE橋

LINEから送った予定文を、Mac mini上の secretary（`runtime/secretary/`）へ渡してカレンダー登録する橋。
LINE Webhook を受けるローカルNodeサーバとして実装。

## 構成

- `src/server.js` … HTTPサーバ。`POST /webhook` でLINEイベント受信、`GET /` でヘルスチェック
- `src/line.js` … 署名検証（X-Line-Signature）/ 返信API（reply）
- `src/handler.js` … 受信テキスト → `parseEvent` → 返信文（純粋ロジック）
- 確認モード（既定）/ 自動登録モード（`BRIDGE_AUTO_CREATE=true`）

## 動作（ローカル検証済み）

```
LINE「明日15時に田中さんと打ち合わせ」
 → 署名検証OK → 解釈
 → 返信「【確認】件名: 田中さんと打ち合わせ / 日時: 2026-06-09 15:00（火）〜16:00」
```

## テスト

```bash
node --test   # handler 3 + signature 3 = 6ケース
```

## 起動

```bash
cp .env.example .env   # 値を設定
node --env-file=.env src/server.js
```

## 本番接続の手順（go-live）

1. **LINEチャンネル発行**: LINE Developers で Messaging API チャンネルを作成
   → `LINE_CHANNEL_SECRET` / `LINE_CHANNEL_ACCESS_TOKEN` を `.env` に設定
2. **公開URLを用意**（Mac miniは自宅なので外から届くように）:
   - 推奨: **Cloudflare Tunnel**（`cloudflared`）でローカル3000番を公開。固定URL・無料・安全
   - 代替: ngrok / Tailscale Funnel
3. LINEチャンネルの **Webhook URL** に `https://<公開URL>/webhook` を設定し、Webhookを有効化
4. 自分のLINEで友だち追加して予定文を送る → 返信が来れば成立
5. 実カレンダー登録まで通すなら `BRIDGE_AUTO_CREATE=true` ＋ secretary側のGoogle認証

## 既存LINE Harnessとの関係（要・判断）

池田さんは別途 **LINE Harness（Cloudflare Workers + D1）でLINE CRMを運用中**。
この橋は**別系統**として作ってある。go-live時の選択:

- **推奨: 新規の個人用LINEチャンネルを使う** … 秘書は私用。マーケCRMと混ぜない方がクリーン
- 代替: 既存Harnessに相乗り（Workersから自宅Mac miniのこのサーバを叩く構成。経路が増える）

## セキュリティ（→ `ops/security.md`）

- 署名検証必須（実装済み）。公開はCloudflare Tunnel等で、サーバ自体は直接外部に晒さない
- トークン類は `.env`（コミットしない）

## ステータス

- [x] LINE Webhook 受け口・署名検証・返信（ローカル検証済み）
- [ ] LINEチャンネル発行 + 公開URL（Cloudflare Tunnel）
- [ ] `BRIDGE_AUTO_CREATE` + secretary認証で実登録
- [ ] Telegram通知（開発完了/エラー/コスト警告）
- [ ] 登録結果を `brain/memory/daily/` に記録（循環）
