# runtime/schedules/ — 定時タスク

Mac mini上の cron / launchd でCodexを定時起動し、自律ループを実現する。
（OpenClawが既製で持っていた「自律性」をここで自作する部分）

## 想定タスク

| 時刻 | タスク | 担当 |
|------|--------|------|
| 毎朝 7:00 | 天気・気温・今日の予定を通知 | maid |
| 毎晩 22:00 | 「今日の振り返り連絡」 | secretary |
| 毎晩 23:00 | `brain/memory/inbox/` を整理して daily へ | chappy |
| 随時 | コスト閾値チェック（→ Telegram警告） | ops/cost |

## ステータス

- [ ] launchd plist 作成
- [ ] 各タスクのプロンプト定義
