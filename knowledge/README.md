# knowledge/ — 参照層（読み取り専用）

池田の生の知識コーパス。**増やさない・触らない「原資の図書館」**として扱う。
実データはコミットしない（`.gitignore`済み）。

## セットアップ

Mac mini上で既存Obsidian vaultをシンボリックリンク:

```bash
ln -s ~/Obsidian/MyVault knowledge/myvault
```

## 中身（MyVault: 約1,250ノート）

| フォルダ | 内容 | 主な利用部署 |
|---------|------|------------|
| `Tommy/` (68) | Tommyマーケティングメソッド | marketing |
| `11_Zoom/` | コンサル・MNP相談の録音/文字起こし | profile原料 / 各室 |
| `01_ビジネス/` | MNP事業・JV関連 | realestate / secretary |
| `05_マーケティング/` | ファネル・コピー・特典 | marketing |
| `08_経理・法務/` | 経理・法務・証明書 | finance / legal |
| `09_クライアント/` | クライアント情報 | secretary |
| `03_動画メモ/` (48) | 動画から抽出したメモ | research |

## 使い方の原則

- 各部署（`agents/rooms/*`）はここを **読むだけ**。書き込みは `brain/` 側へ
- 例: marketing室は `knowledge/myvault/Tommy/` を参照して施策を立てる
