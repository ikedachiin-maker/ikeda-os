# ikeda-os

池田宜史の個人OS / AI秘書システム。Mac mini上でCodexを常駐させ、デジタル分身「チャッピー」を司令塔に、生活・仕事を自律運用するための土台リポジトリ。

> 参考: つかささん講義「最強の個人OS（デジタル分身 / AIメイド / AI秘書）」。
> 動画は Claude Code + OpenClaw(VPS) + Supabaseブレイン構成だったが、本プロジェクトは **Codex on Mac mini + Markdown+Gitブレイン** で再構成する。

## 設計思想（5層アーキテクチャ）

「変わらないもの → 増え続けるもの → 振る舞い → 実行 → ガード」を物理的に分離する。
実行エンジン（Claude ↔ Codex）を差し替えても壊れない構造。

| 層 | ディレクトリ | 役割 |
|----|------------|------|
| 🎯 指示 | `AGENTS.md` | チャッピー司令塔の人格・最上位ルール（Codexが自動で読む） |
| 🧠 記憶 | `brain/` | SSoT。確定知識(wiki) + 流動記憶(memory)を分離 |
| 📚 参照 | `knowledge/` | 読み取り専用の知識コーパス（MyVaultをシンボリックリンク） |
| 👥 振る舞い | `agents/` | 旧室（部署）= 司令塔/メイド/秘書/専門室 |
| ⚙️ 実行 | `runtime/` | LINE/Telegram橋・定時タスク・ルーティング |
| 🛡 ガード | `ops/` | セキュリティ × タイパ × コスパの3本柱 |

## セットアップ（Mac mini）

1. このリポジトリを clone
2. `knowledge/` に既存Obsidian vaultをリンク:
   ```bash
   ln -s ~/Obsidian/MyVault knowledge/myvault
   ```
3. `brain/wiki/` に ikedabrain の wiki を移植
4. Codexを起動し `AGENTS.md` を読み込ませて司令塔を起動

## 注意

- `knowledge/` 配下の実データ（個人情報・1,250ノート）は **コミットしない**（`.gitignore`済み）
- `brain/memory/` の個人記憶も公開リポジトリでは扱いに注意（現状は構造のみ）
