# runtime/router.md — ルーティング規則

司令塔チャッピーが入力を各部署へ振り分けるためのキーワード対応表。

## キーワード → 部署

| キーワード例 | 部署 |
|------------|------|
| 天気 / レシピ / 買い物 / 薬 / 体調 / 歩数 | `agents/maid.md` |
| 予定 / カレンダー / メール / タスク / リマインド | `agents/secretary.md` |
| 契約書 / 法務 / 訴訟 / リスク | `agents/rooms/legal.md` |
| 財務 / 税務 / 経理 / 確定申告 / 融資 | `agents/rooms/finance.md` |
| コピー / LP / VSL / ステップメール / ファネル / 広告 | `agents/rooms/marketing.md` |
| 物件 / 不動産 / JV | `agents/rooms/realestate.md` |
| 調べて / リサーチ / 検索 | `agents/rooms/research.md` |
| ツール作って / 開発 / 実装 / バグ | `agents/rooms/dev.md` |

## チャンネル別の役割

- **LINE**: メイン入力。思いつき・タスク・質問を放り込む。親近感・即時性
- **Telegram**: 開発完了通知・セキュリティエラー・コスト警告。外からCodexを叩く
- **Web**: 可視化・脳の地図表示

## 判定不能時

池田に「どの部署で処理するか」を確認する。
