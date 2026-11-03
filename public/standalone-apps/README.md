---
title: standalone-apps（スタンドアロン Web アプリケーション群）
description: ToyBox リポジトリ内で管理・配信するスタンドアロン Web アプリケーションの一覧と構成規則。
tags: ["standalone-apps", "Luxyno"]
---

# standalone-apps

バックエンド API に依存せずブラウザ単体で動作するスタンドアロン Web アプリケーションを管理するディレクトリです。`public/` 配下に置かれているため、ToyBox の Express サーバーから `/standalone-apps/<アプリ名>/` としてそのまま静的配信できます。

## 管理規則

- アプリケーションごとにサブフォルダ（`public/standalone-apps/<アプリ名>/`）を切り、それぞれを 1 つの独立したソフトウェア単位（`<プロジェクト>`）として扱う（`AGENTS.md` 1.9、doc スキル）。
- 各アプリフォルダ直下に `README.md`（版番号・使い方・リリースノート）と `doc/`（仕様書・設計書）を配置する。

## アプリケーション一覧

| アプリ名          | パス                | 版番号  | 概要 |
| :---------------- | :------------------ | :------ | :--- |
| [Luxyno](luxyno/) | `luxyno/index.html` | `0.1.0` | Markdown と Mermaid ダイアグラムのリアルタイム仕様書・インフォグラフィックビューアー |
