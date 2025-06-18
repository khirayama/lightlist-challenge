# TODO

## 次のタスク



## 次以降のタスク

### 共同編集機能の実装

1. **データベーススキーマの更新**
   - TaskListDocumentテーブルの作成（taskListId、stateVector、documentState）
   - TaskListUpdateテーブルの作成（更新履歴保存用・オプション）
   - Prismaスキーマファイルの更新とマイグレーション実行

2. **共同編集用APIエンドポイントの実装**
   - GET /api/task-lists/:taskListId/collaborative/full-state
   - POST /api/task-lists/:taskListId/collaborative/sync
   - 認証・認可のミドルウェア追加

3. **サーバー側Yjsドキュメント管理サービスの実装**
   - Yjsライブラリのインストールと設定
   - Y.Docインスタンスの作成・管理サービス
   - Base64エンコーディング/デコーディング処理
   - 排他制御とトランザクション管理

4. **クライアント側共同編集機能の実装**
   - 共同編集Contextの作成
   - ポーリング機能の実装（5秒間隔）
   - Y.ArrayとY.Mapを使用したタスク管理
   - ローカル変更の検知と送信

5. **UI統合とテスト**
   - 既存のタスクリストUIとの統合
   - 同期状態の表示（同期中、最終同期時刻など）
   - エラーハンドリングとリトライ機構
   - 複数ユーザーでの動作テスト

