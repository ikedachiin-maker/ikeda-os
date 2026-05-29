# brain/INDEX.md — 脳の地図

チャッピーが起動時に読む、記憶層の現在地マップ。

## 構造

```
brain/
├── wiki/        確定知識（変わらない）— entities / concepts / sources
├── memory/      流動記憶（増え続ける）
│   ├── inbox/      未整理の生キャプチャ（LINEから放り込んだもの）
│   ├── daily/      日次ログ YYYY-MM-DD.md
│   ├── decisions/  意思決定ログ
│   └── profile/    自分の棚卸し（人格・好み・地雷・50問回答・録音要約）
└── _templates/  wikiノートのテンプレート
```

## 知識と記憶を分ける理由

- **wiki = 変わらない確定知識**（例: Tommyメソッド、人物、概念）。汚れにくく検索精度が高い
- **memory = 増え続ける流動情報**（例: 今日のタスク、昨日の会話）。どんどん追記される
- 混ぜると検索精度が落ちるため物理的に分離する

## 検索方法

Markdown+Git構成のため、検索は `ripgrep`（`rg`）+ Codexの読解で行う。
意味の曖昧検索（「あの時の似た話」）はCodexが関連ファイルを読んでカバーする。

## 現在のステータス

- [ ] ikedabrain の wiki を `wiki/` へ移植
- [ ] profile（自分の棚卸し）の初回投入
- [ ] daily ログの運用開始
