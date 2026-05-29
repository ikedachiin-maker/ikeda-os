# runtime/bridge/ — チャンネル橋

スマホ（LINE/Telegram）→ Mac mini上のCodex を繋ぐ橋。

## 設計方針（前回の検討結果）

Codexモバイルの標準ルートは「スマホ → OpenAIクラウド」だが、
ローカルの `brain/` や `knowledge/` に触るには Mac mini上のCodexを叩く必要がある。
そのため自作の橋を1枚噛ませる:

- **方式A**: Tailscale + SSH でスマホからMac miniへ安全に接続
- **方式B**: Telegram/LINE bot → webhook → Codex CLI 起動

## セキュリティ

- 公開VPSに晒さず、Tailscaleの内部ネットワークで閉じる（→ `ops/security.md`）

## ステータス

- [ ] 方式の確定（A or B）
- [ ] LINE webhook 受け口
- [ ] Telegram bot（通知用）
