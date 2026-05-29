# brain/wiki/ — 確定知識層

既存の `ikedabrain`（claude-obsidianの「LLM Wiki Pattern」）の中身をここへ移植する。

## 移植元

`~/Desktop/マーケティング/ikedabrain/wiki/`
- `entities/` … 人物・組織・ツール
- `concepts/` … 概念・パターン
- `sources/` … 出典
- `comparisons/` … 比較
- `questions/` … 未解決の問い

## ノート形式

frontmatter（type / title / status / related / sources / tags）+ 本文。
テンプレートは `brain/_templates/` を参照。

## 移植コマンド例

```bash
cp -r ~/Desktop/マーケティング/ikedabrain/wiki/* brain/wiki/
cp -r ~/Desktop/マーケティング/ikedabrain/_templates/* brain/_templates/
```
