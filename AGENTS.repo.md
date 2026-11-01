# AGENTS.repo.md

本リポジトリ（ToyBox）固有の規則・例外を定める。`AGENTS.md` や `.claude/skills/` と食い違うときは、本ファイルを優先する（`AGENTS.md` 4 章）。共有ファイルではないため、他のリポジトリへ持ち出さない。

## 1. リポジトリの概要

- AI エージェントを備えた Node.js（Express）の API サーバーと、そのフロントエンド（`public/`）
- データストアは Google Cloud Datastore。本番は Google Cloud（`cloudbuild.yaml`, `Dockerfile`）へデプロイする
- `package.json` は `"type": "module"` のため、CommonJS のスクリプトは拡張子を `.cjs` にする

## 2. 開発の規則

- 開発対象のソフトウェア内で使用する生成 AI は、Google GenAI SDK（`@google/genai`）を使用する。詳細は [公式リファレンス](https://googleapis.github.io/js-genai/release_docs/index.html) を参照する

## 3. ドキュメントの格納先（doc スキルの例外）

本リポジトリは doc スキルの格納先より前から運用しているため、次の構成を正とする。プロジェクトのルートはリポジトリ直下（`<プロジェクト>/` = `./`）。

| 種類                 | doc スキルの既定                  | 本リポジトリ                                     |
| :------------------- | :-------------------------------- | :----------------------------------------------- |
| アーキテクチャ設計書 | `doc/2.ARCHITECTURE.md`           | `doc/2.DESIGN.md`                                |
| 詳細設計書           | `doc/3.detailed_design/features/` | 同じ（目次は `doc/3.detailed_design/README.md`） |
| 実装ドキュメント     | `doc/4.implementation/`           | `doc/3.implementation/`                          |

運用資料は次のファイルで管理する。

- `doc/9.運用資料_ローカル開発環境_初期設定マニュアル.md`
- `doc/9.運用資料_ローカル開発環境_デプロイマニュアル.md`
- `doc/9.運用資料_Google_Cloud_初期設定マニュアル.md`
- `doc/9.運用資料_Google_Cloud_デプロイマニュアル.md`
- `doc/9.運用資料_エンドユーザー向けマニュアル.md`

## 4. ローカル開発環境（devenv スキル）

- 開発サーバーは `npm run dev`（Datastore エミュレーターに接続する）で起動する
- 事前に `npm run emulator` で Datastore エミュレーター（`localhost:8081`）を起動しておく必要がある。起動していない場合は、ユーザーに確認してから起動する
- 環境の初期設定は `doc/9.運用資料_ローカル開発環境_初期設定マニュアル.md` を参照する
