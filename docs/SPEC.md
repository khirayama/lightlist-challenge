# プロダクト仕様

## 概要

Hobby Baselineは、マルチプラットフォーム対応のアプリケーションです。Web、iOS、Androidで動作し、ユーザーの好みに応じたテーマと言語の設定が可能です。

## 機能仕様

### トップ画面

- **表示内容**
  - 「Hello World」のメッセージを中央に表示
  - 設定ページへのナビゲーションボタン
- **デザイン**
  - シンプルで直感的なレイアウト
  - プラットフォームに応じたネイティブな見た目

### 設定ページ

- **テーマ設定**
  - システム（デバイスの設定に従う）
  - ライト（明るいテーマ）
  - ダーク（暗いテーマ）
  - 選択はラジオボタンで実装
  - 変更は即座に反映される

- **言語設定**
  - 日本語
  - 英語
  - 選択はラジオボタンで実装
  - 変更は即座に反映される
  - アプリケーション全体のテキストが切り替わる

## 技術仕様

### API
- Express.jsベースのRESTful API
- PostgreSQLデータベース（Prisma ORM使用）
- JWT認証（現在は仮実装）
- エンドポイント:
  - GET /api/settings/:userId - 設定取得
  - PUT /api/settings/:userId - 設定更新

### Web
- Next.js 15（App Router）
- Tailwind CSSによるスタイリング
- i18nextによる多言語対応
- next-themesによるテーマ管理

### Native（iOS/Android）
- React Native（Expo）
- NativeWindによるスタイリング
- Expo Routerによるナビゲーション
- AsyncStorageによる設定の永続化
- expo-localizationによるデバイス言語の検出
