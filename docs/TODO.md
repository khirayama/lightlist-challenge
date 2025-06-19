# TODO

## 次のタスク

1. **クライアント側共同編集機能の実装**

   - 共同編集Contextの作成
   - ポーリング機能の実装（5秒間隔）
   - Y.ArrayとY.Mapを使用したタスク管理
   - ローカル変更の検知と送信

   **実装計画（小さなステップ）**:
   
   a. **Yjs依存関係の追加**
      - packages/sdkにYjsパッケージを追加
      - 型定義の確認と設定
   
   b. **共同編集サービスクラスの作成**
      - packages/sdk/src/services/CollaborativeService.tsを作成
      - Yjsドキュメントの初期化処理
      - Base64エンコード/デコード処理
   
   c. **API通信メソッドの実装**
      - fetchFullState: 完全な状態を取得
      - sync: 差分同期を実行
      - エラーハンドリングとリトライロジック
   
   d. **CollaborativeContextの作成（Web）**
      - apps/web/src/contexts/CollaborativeContext.tsxを作成
      - Yjsドキュメントの状態管理
      - 5秒間隔のポーリング機能
      - 同期状態（isLoading, isSyncing, lastSyncTime）の管理
   
   e. **タスク操作ヘルパー関数の実装**
      - addTask: Y.Arrayにタスクを追加
      - updateTask: Y.Mapのタスクを更新
      - deleteTask: Y.Arrayからタスクを削除
      - タスクIDの生成関数（clientID-timestamp-random形式）
   
   f. **既存UIとの統合準備**
      - タスクリスト画面でCollaborativeContextを使用する準備
      - ローカル状態とYjsドキュメントの同期方法の設計

## 次以降のタスク

### 共同編集機能の実装

5. **UI統合とテスト**
   - 既存のタスクリストUIとの統合
   - 同期状態の表示（同期中、最終同期時刻など）
   - エラーハンドリングとリトライ機構
   - 複数ユーザーでの動作テスト
