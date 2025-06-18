# プロダクト仕様

## 概要

Lightlistは、マルチプラットフォーム対応のアプリケーションです。
Web、iOS、Androidで動作し、共同編集機能を備えた共有型タスクリスト管理アプリケーションです。

## 画面仕様および機能仕様

### 共通仕様

- ダークモード対応
- 多言語対応（日本語/英語）
- レスポンシブデザイン
  - PC・タブレット: サイドバー＋メインコンテンツ
  - モバイル: ドロワーメニュー＋メインコンテンツ
- アクセシビリティを考慮する

#### ユーザビリティ

- **エラー回復機能**

  - 削除操作の取り消し機能（5秒間のUndo表示）
  - 編集中の内容の自動保存とリカバリー
  - ネットワークエラー時の自動リトライ（最大3回）

- **進捗表示**

  - API通信中のローディングインジケーター
  - 一括処理（並び替え、削除など）のプログレスバー
  - タスク数が多い場合の段階的読み込み

- **オフライン対応**

  - オフライン時の操作をキューに保存
  - オンライン復帰時に自動同期
  - オフライン状態の明確な表示
  - オフライン時でも全機能が利用可能（ローカルストレージを活用）
  - オンライン復帰時の競合解決メカニズム

- **キーボードショートカット**
  - `Ctrl/Cmd + N`: 新しいタスク追加
  - `Ctrl/Cmd + Enter`: タスク保存
  - `Delete`: 選択したタスクの削除
  - `Ctrl/Cmd + /`: ショートカット一覧表示

#### アクセシビリティ

- **WAI-ARIA対応**

  - 適切なrole属性の設定（navigation, main, form等）
  - aria-labelとaria-describedbyの活用
  - ライブリージョンの設定（aria-live, aria-atomic）

- **フォーカス管理**

  - 論理的なタブ順序の設定
  - フォーカストラップ（モーダル内）
  - 視認性の高いフォーカスインジケーター（2px以上のアウトライン）

- **色覚対応**

  - 色のみに依存しない情報伝達
  - 完了状態：チェックマーク＋取り消し線
  - エラー状態：アイコン＋テキスト説明
  - 重要度：アイコン＋ラベル

- **読み上げ対応**

  - 画像・アイコンの代替テキスト
  - フォーム要素の明確なラベル付け
  - エラーメッセージの即時通知

- **操作性**
  - タッチターゲット最小サイズ: 44x44px
  - クリック可能領域の十分な余白
  - ドラッグ操作の代替手段提供

### トップ画面（/）

#### レイアウト

- ドロワーナビゲーション
  - サイドバー: PC・タブレット表示の場合はサイドバー、モバイルの場合はドロワーメニュー
    - ユーザ名(ない場合はメールアドレス)と設定アイコン: 設定ページに遷移
    - タスクリストのリスト:
      - 並び替えハンドル
      - タスクリスト名
      - 背景色設定ボタン:
        - カラーピッカーでタスクリストの背景色を選択
        - プリセットカラー（8色程度）から選択可能
        - 選択した色は即座に反映され、自動保存
      - 削除ボタン:
        - タスクリストの削除
        - 確認ダイアログ表示
    - タスクリストの追加ボタン:
      - 新しいタスクリストの作成
      - 入力フィールドをモーダル表示
      - 保存ボタン: タスクリスト名を保存
  - メインコンテンツ: PC・タブレット表示の場合はサイドバーに横並び、モバイルの場合はメインコンテンツ
    - タスクリストカルーセル: タスクリストを横スクロールおよび横スワイプで移動できるカルーセル表示
      - タスクリストの詳細表示:
        - 背景色: サイドバーで設定した色が反映される
        - タスクリスト名: 編集可能
          - ダブルクリックまたはEnterキーで編集モード
          - Escapeキーで編集キャンセル
          - 自動保存（フォーカスアウト時）
        - 共有ボタン:
          - 機能: タスクリストの共有リンクを表示
          - 共有リンクのコピー機能
        - タスクテキスト入力フィールド: 新しいタスクのテキスト
          - 機能: 「今日」「明日」「月曜日」「2025/06/18」などが先頭にある場合、日付を設定(日英対応)
          - プレースホルダー: 「タスクを入力...」（言語に応じて変更）
          - オートコンプリート: 過去のタスクから候補表示
          - aria-label: 「新しいタスクを入力」
        - タスク追加ボタン:
          - 新しいタスクの追加
          - 設定で、上に追加するか下に追加するかを選択可能(デフォルトは上)
        - タスクのソートボタン:
          - 機能: タスクの並び替え(完了・未完了、日付有無、日付順の優先度で並び替え)
          - ソート中のアニメーション表示
          - ソート完了時の通知（「並び替えが完了しました」）
          - aria-label: 「タスクを並び替え」
        - 完了タスクの削除ボタン:
          - 機能: 完了済みタスクを一括削除
          - 確認ダイアログ表示: 「完了済みタスクを削除しますか？」
        - タスクリスト:
          - 並び替えハンドル
            - ドラッグ中の視覚的フィードバック（影、透明度）
            - ドロップ位置のプレビュー表示
            - キーボード操作: Alt + 上下矢印キー
            - aria-label: 「タスクを移動」
          - 完了チェックボックス
            - スペースキーでのトグル対応
            - チェック時のアニメーション
            - aria-label: 「タスクを完了にする」
          - タスク名: 編集可能
            - クリックまたはF2キーで編集モード
            - 編集中の枠線表示
            - 変更時の自動保存インジケーター
          - 日付設定ボタン
            - カレンダーのキーボード操作対応
            - 今日の日付のハイライト
            - aria-label: 「期限を設定」
- タスクリスト作成モーダル
  - モーダル開閉時のフォーカス管理
  - Escapeキーでのモーダル閉じる
  - タスクリスト名入力フィールド: 新しいタスクリスト名
    - 自動フォーカス
    - 最大文字数制限（50文字）と残り文字数表示
    - aria-required="true"
  - タスクリスト追加ボタン: 新しいタスクリストの追加
    - 無効化状態の明確な表示（空欄時）
    - 作成中のローディング表示

#### その他

- 未認証状態の場合、ログインページにリダイレクト
- **レスポンシブデザイン**
  - ブレークポイント: 640px（モバイル）、768px（タブレット）、1024px（デスクトップ）
  - タッチジェスチャー対応（スワイプ、ピンチズーム）
- **パフォーマンス**
  - 仮想スクロール（100件以上のタスク表示時）
  - 画像の遅延読み込み
  - Service Workerによるキャッシュ

### ユーザー登録画面（/register）

#### レイアウト

- ユーザ登録フォーム
  - エラーメッセージ: エラーが発生した場合に表示
  - メールアドレス(必須)
    - type: email
    - バリデーション: RFC準拠のメール形式
    - プレースホルダー: 「メールアドレスを入力」
  - パスワード(必須)
    - type: password
    - プレースホルダー: 「パスワードを入力」
    - 要件: 大文字・小文字・数字を含む
  - パスワード確認(必須)
    - type: password
    - プレースホルダー: 「パスワードを再入力」
    - バリデーション: パスワードとの一致確認
  - 「ユーザー登録」ボタン:
    - 「登録中...」テキスト表示: 送信中のローディング状態表示
  - 「既にアカウントをお持ちの方は ログイン」リンク:
    - ログイン画面へのリンク

#### その他

- フォームバリデーション
  - リアルタイムでの入力検証
  - パスワード不一致時のエラー表示
  - APIエラー時の詳細メッセージ表示
  - メールアドレス: RFC準拠の形式チェック
  - パスワード: 大文字・小文字・数字を含む強度チェック
  - パスワード確認: 入力パスワードとの一致確認
- 登録処理
  - フォーム送信時にAPIへPOSTリクエスト
  - 成功時:
    - 自動ログイン → トップ画面へリダイレクト
    - 最初のタスクリストを自動生成(日本語の場合は「📝個人」、英語の場合は「📝Personal」)
  - 失敗時: エラーメッセージ表示
- 処理フロー
  1. フロントエンドでバリデーション
  2. APIへ登録リクエスト送信
  3. 成功時: JWTトークンとユーザー情報を受信
  4. localStorageなどユーザ環境に認証情報を保存(apps/web、apps/nativeでそれぞれ適切な方法で保存)
  5. 認証状態を更新
  6. トップ画面へリダイレクト

### ログイン画面（/login）

#### レイアウト

- ログインフォーム
  - エラーメッセージ: エラーが発生した場合に表示
  - メールアドレス(必須)
    - type: email
    - バリデーション: RFC準拠のメール形式
    - プレースホルダー: 「メールアドレスを入力」
  - パスワード(必須)
    - type: password
    - プレースホルダー: 「パスワードを入力」
    - 要件: 大文字・小文字・数字を含む
  - 「パスワードを忘れた方はこちら」リンク: パスワードリセット画面へのリンク
  - 「ログイン」ボタン:
    - 「ログイン中...」テキスト表示: 送信中のローディング状態表示
  - 「アカウントをお持ちでない方は ユーザー登録」リンク: ユーザー登録画面へのリンク

#### その他

- フォームバリデーション
  - リアルタイムでの入力検証
  - パスワード不一致時のエラー表示
  - APIエラー時の詳細メッセージ表示
- ログイン処理
  - フォーム送信時にAPIへPOSTリクエスト
  - 成功時:
    - 自動ログイン → トップ画面へリダイレクト
    - 最初のタスクリストを自動生成(日本語の場合は「📝個人」、英語の場合は「📝Personal」)
    - 設定をデフォルト値で保存
  - 失敗時: エラーメッセージ表示
- 処理フロー
  1. APIへ認証リクエスト送信
  2. 成功時: JWTトークンとユーザー情報を受信
  3. localStorageなどユーザ環境に認証情報を保存(apps/web、apps/nativeでそれぞれ適切な方法で保存)
  4. 認証状態を更新
  5. トップ画面へリダイレクト

### 設定ページ（/settings）

#### レイアウト

- ホームに戻るボタン: トップ画面へ戻る
- 設定変更セクション
  - プロフィール設定セクション（認証済みユーザーのみ）
    - ユーザ名編集
      - テキスト入力フィールド: blurで更新
  - テーマ設定セレクトボックス
    - 選択肢
      - システム（デバイスの設定に従う）
      - ライト（明るいテーマ）
      - ダーク（暗いテーマ）
    - 選択と同時に即座に反映
  - 言語設定セレクトボックス:
    - 選択肢:
      - 日本語
      - English
    - 選択と同時にアプリケーション全体の言語が切り替わり
  - タスクの挿入位置セレクトボックス
    - 選択肢:
      - 上に追加（新しいタスクを上部に追加、デフォルト）
      - 下に追加（新しいタスクを下部に追加）
    - 選択と同時に設定が保存され、次回のタスク追加時に反映
  - 自動並び替えチェックボックス:
    - 機能: タスクの自動並び替え（完了・未完了、日付有無、日付順の優先度で並び替え）
    - チェック状態で自動並び替えを有効化/無効化
- ログアウトボタン:
  - 機能: ログアウト処理を実行し、トップ画面へリダイレクト
  - 確認ダイアログ表示: 「ログアウトしますか？」
  - ログアウト処理中のローディング表示
- アカウント削除ボタン:
  - 機能: アカウント削除処理を実行し、トップ画面へリダイレクト
  - 確認ダイアログ表示: 「本当にアカウントを削除しますか？」の確認
  - 二段階確認（メールアドレスの再入力要求）
  - 削除処理中の進捗表示
  - 削除完了後の猶予期間（24時間以内なら復元可能）の案内

#### その他

- 未認証状態の場合、ログインページにリダイレクト
- **アクセシビリティ考慮**
  - 各設定項目に適切なラベルとヘルプテキスト
  - 設定変更時の確認メッセージ（スクリーンリーダー対応）
  - キーボードのみでの操作可能
- ログアウト処理フロー
  1. APIへログアウトリクエスト送信
  2. localStorageなどユーザ環境から認証情報を削除
  3. 認証状態をクリア
  4. トップ画面を再表示（未認証状態）

### 認証状態管理

- **永続化**: localStorageなどユーザ環境に認証情報を保存(apps/web、apps/nativeでそれぞれ適切な方法で保存)
- **保存データ**
  - JWTトークン
  - ユーザー情報（ID、メールアドレス）
- **セッション復元**: ページロード時にlocalStorageなどから認証状態を復元

## 技術仕様

### API仕様

#### ベース情報

- **サーバー**: Express.js
- **データベース**: PostgreSQL
- **ORM**: Prisma
- **認証方式**: JWT
- **ベースURL**: http://localhost:3001

#### エンドポイント詳細

##### POST /api/auth/register

**説明**: ユーザー登録

**リクエスト**:

```json
{
  "email": "user@example.com",
  "password": "TestPass123"
}
```

**デバイス情報**: User-AgentヘッダーとIPアドレスから自動生成

**レスポンス（成功）**:

```json
{
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "cmbz060iw0000ki5g9h2hwg8n",
      "email": "user@example.com",
      "name": null
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600000,
    "refreshExpiresIn": 31536000000
  }
}
```

**エラーレスポンス**:

```json
{
  "error": "User already exists with this email"
}
```

##### POST /api/auth/login

**説明**: ユーザーログイン

**リクエスト**:

```json
{
  "email": "user@example.com",
  "password": "TestPass123"
}
```

**デバイス情報**: User-AgentヘッダーとIPアドレスから自動生成

**レスポンス（成功）**:

```json
{
  "message": "Login successful",
  "data": {
    "user": {
      "id": "cmbz060iw0000ki5g9h2hwg8n",
      "email": "user@example.com",
      "name": null
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600000,
    "refreshExpiresIn": 31536000000
  }
}
```

**エラーレスポンス**:

```json
{
  "error": "Invalid email or password"
}
```

##### POST /api/auth/logout

**説明**: ユーザーログアウト

**レスポンス**:

```json
{
  "message": "Logout successful"
}
```

##### GET /api/users/:userId/profile

**説明**: ユーザープロフィール取得

**レスポンス（成功）**:

```json
{
  "message": "User profile retrieved successfully",
  "data": {
    "user": {
      "id": "cmbz060iw0000ki5g9h2hwg8n",
      "email": "user@example.com",
      "name": "田中太郎",
      "createdAt": "2025-06-17T10:00:00.000Z",
      "updatedAt": "2025-06-17T10:30:00.000Z"
    }
  }
}
```

##### PUT /api/users/:userId/profile

**説明**: ユーザープロフィール更新

**リクエスト**:

```json
{
  "name": "田中太郎"
}
```

**レスポンス（成功）**:

```json
{
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "id": "cmbz060iw0000ki5g9h2hwg8n",
      "email": "user@example.com",
      "name": "田中太郎",
      "createdAt": "2025-06-17T10:00:00.000Z",
      "updatedAt": "2025-06-17T10:30:00.000Z"
    }
  }
}
```

##### DELETE /api/users/:userId

**説明**: アカウント削除

**レスポンス（成功）**:

```json
{
  "message": "Account deleted successfully"
}
```

##### GET /api/users/:userId/settings

**説明**: ユーザー設定取得

**レスポンス（成功）**:

```json
{
  "message": "Settings retrieved successfully",
  "data": {
    "settings": {
      "theme": "system",
      "language": "ja",
      "taskInsertPosition": "top",
      "autoSort": false
    }
  }
}
```

##### PUT /api/users/:userId/settings

**説明**: ユーザー設定更新

**リクエスト**:

```json
{
  "theme": "dark",
  "language": "en",
  "taskInsertPosition": "bottom",
  "autoSort": true
}
```

**レスポンス（成功）**:

```json
{
  "message": "Settings updated successfully",
  "data": {
    "settings": {
      "theme": "dark",
      "language": "en",
      "taskInsertPosition": "bottom",
      "autoSort": true
    }
  }
}
```

##### GET /api/task-lists

**説明**: タスクリスト一覧取得

**レスポンス（成功）**:

```json
{
  "message": "Task lists retrieved successfully",
  "data": {
    "taskLists": [
      {
        "id": "cmbz060iw0000ki5g9h2hwg8n",
        "name": "📝個人",
        "order": 0,
        "color": "#FFE4E1",
        "taskCount": 5,
        "completedCount": 2,
        "createdAt": "2025-06-17T10:00:00.000Z",
        "updatedAt": "2025-06-17T10:30:00.000Z"
      }
    ]
  }
}
```

##### POST /api/task-lists

**説明**: タスクリスト作成

**リクエスト**:

```json
{
  "name": "仕事"
}
```

**レスポンス（成功）**:

```json
{
  "message": "Task list created successfully",
  "data": {
    "taskList": {
      "id": "cmbz060iw0001ki5g9h2hwg8n",
      "name": "仕事",
      "order": 1,
      "color": "#FFFFFF",
      "createdAt": "2025-06-17T10:00:00.000Z",
      "updatedAt": "2025-06-17T10:00:00.000Z"
    }
  }
}
```

##### PUT /api/task-lists/:taskListId

**説明**: タスクリスト更新

**リクエスト**:

```json
{
  "name": "プロジェクトA",
  "order": 2,
  "color": "#E6E6FA"
}
```

**レスポンス（成功）**:

```json
{
  "message": "Task list updated successfully",
  "data": {
    "taskList": {
      "id": "cmbz060iw0001ki5g9h2hwg8n",
      "name": "プロジェクトA",
      "order": 2,
      "color": "#E6E6FA",
      "createdAt": "2025-06-17T10:00:00.000Z",
      "updatedAt": "2025-06-17T11:00:00.000Z"
    }
  }
}
```

##### DELETE /api/task-lists/:taskListId

**説明**: タスクリスト削除

**レスポンス（成功）**:

```json
{
  "message": "Task list deleted successfully"
}
```

##### GET /api/task-lists/:taskListId/tasks

**説明**: タスク一覧取得

**レスポンス（成功）**:

```json
{
  "message": "Tasks retrieved successfully",
  "data": {
    "tasks": [
      {
        "id": "cmbz060iw0002ki5g9h2hwg8n",
        "content": "買い物リスト作成",
        "completed": false,
        "dueDate": "2025-06-18T00:00:00.000Z",
        "order": 0,
        "createdAt": "2025-06-17T10:00:00.000Z",
        "updatedAt": "2025-06-17T10:00:00.000Z"
      }
    ]
  }
}
```

##### POST /api/task-lists/:taskListId/tasks

**説明**: タスク作成

**リクエスト**:

```json
{
  "content": "明日 ミーティング資料準備"
}
```

**レスポンス（成功）**:

```json
{
  "message": "Task created successfully",
  "data": {
    "task": {
      "id": "cmbz060iw0003ki5g9h2hwg8n",
      "content": "ミーティング資料準備",
      "completed": false,
      "dueDate": "2025-06-19T00:00:00.000Z",
      "order": 0,
      "createdAt": "2025-06-17T10:00:00.000Z",
      "updatedAt": "2025-06-17T10:00:00.000Z"
    }
  }
}
```

##### PUT /api/tasks/:taskId

**説明**: タスク更新

**リクエスト**:

```json
{
  "content": "資料作成完了",
  "completed": true,
  "dueDate": null
}
```

**レスポンス（成功）**:

```json
{
  "message": "Task updated successfully",
  "data": {
    "task": {
      "id": "cmbz060iw0003ki5g9h2hwg8n",
      "content": "資料作成完了",
      "completed": true,
      "dueDate": null,
      "order": 0,
      "createdAt": "2025-06-17T10:00:00.000Z",
      "updatedAt": "2025-06-17T11:00:00.000Z"
    }
  }
}
```

##### DELETE /api/tasks/:taskId

**説明**: タスク削除

**レスポンス（成功）**:

```json
{
  "message": "Task deleted successfully"
}
```

##### POST /api/task-lists/:taskListId/share

**説明**: タスクリスト共有リンク生成

**リクエスト**:

```json
{
  "permission": "edit"
}
```

**レスポンス（成功）**:

```json
{
  "message": "Share link created successfully",
  "data": {
    "shareUrl": "https://lightlist.ai/share/abc123def456",
    "shareToken": "abc123def456",
    "permission": "edit"
  }
}
```

##### GET /api/share/:shareToken

**説明**: 共有タスクリスト情報取得

**レスポンス（成功）**:

```json
{
  "message": "Shared task list retrieved successfully",
  "data": {
    "taskList": {
      "id": "cmbz060iw0001ki5g9h2hwg8n",
      "name": "買い物リスト",
      "permission": "edit"
    }
  }
}
```

##### DELETE /api/task-lists/:taskListId/share

**説明**: タスクリスト共有解除

**レスポンス（成功）**:

```json
{
  "message": "Share link deleted successfully"
}
```

##### GET /health

**説明**: ヘルスチェック

**レスポンス**:

```json
{
  "status": "ok",
  "timestamp": "2025-06-16T11:17:38.827Z"
}
```

#### セキュリティ仕様

- **レート制限**: 15分間に100リクエスト
- **パスワード要件**: 大文字・小文字・数字を含む
- **JWT（アクセストークン）有効期限**: 1時間
- **リフレッシュトークン有効期限**: 1年間
- **プロアクティブトークン更新**: 期限の5分前に自動リフレッシュ実行
- **リアクティブトークン更新**: 401エラー時に自動でリフレッシュ実行
- **同時リクエスト制御**: 重複リフレッシュ防止メカニズム実装
- **🆕 デバイス別セッション管理**: デバイスごとのリフレッシュトークン管理
- **🆕 複数端末対応**: 最大5台のデバイスで同時ログイン可能
- **🆕 デバイス識別**: サーバーサイドでUser-AgentとIPアドレスから自動生成（SHA-256ハッシュ使用）
- **CORS**: 有効
- **Helmet**: セキュリティヘッダー設定済み

### Web技術仕様

#### フレームワーク・ライブラリ

- **Next.js**: 15 (App Router)
- **React**: 18
- **TypeScript**: 厳密な型定義
- **Tailwind CSS**: スタイリング
- **i18next**: 多言語対応
- **next-themes**: テーマ管理

#### 認証実装

- **状態管理**: React Context API
- **永続化**: localStorage
- **型定義**:

  ```typescript
  interface User {
    id: string;
    email: string;
    name: string | null;
  }

  interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
  }
  ```

#### ページ構成

- **/** - トップ画面（認証状態による動的表示）
- **/login** - ログイン画面
- **/register** - ユーザー登録画面
- **/settings** - 設定画面

#### 多言語対応

**対応言語**: 日本語（ja）、英語（en）

**翻訳キー例**:

```json
{
  "auth": {
    "login": "ログイン",
    "register": "ユーザー登録",
    "logout": "ログアウト",
    "email": "メールアドレス",
    "password": "パスワード",
    "confirmPassword": "パスワード確認"
  }
}
```

#### テーマ仕様

- **システム**: デバイス設定に従う
- **ライト**: 明るいテーマ
- **ダーク**: 暗いテーマ
- **実装**: next-themes + Tailwind CSS

### Native（iOS/Android）技術仕様

#### フレームワーク・ライブラリ

- **React Native**: Expo
- **NativeWind**: Tailwind CSS ライクなスタイリング
- **Expo Router**: ナビゲーション
- **AsyncStorage**: 設定の永続化
- **expo-localization**: デバイス言語の検出

#### 現在の状況

- **実装完了**: ユーザー登録・ログイン機能を実装
- **機能**: AuthContext、APIサービス、ログイン/登録画面、認証状態による画面切り替え
- **スタイル**: React Native StyleSheetを使用（NativeWindからの移行）
- **ビルド**: 正常にビルド可能
- **APIベースURL**: 環境変数（EXPO_PUBLIC_API_URL）による設定

## 共同編集機能

### 概要

Lightlistの共同編集機能は、websocketを使用せずにHTTP RESTベースのポーリング方式で実装します。
CRDT（Conflict-free Replicated Data Type）ライブラリのYjsを使用することで、複数ユーザーの同時編集時の競合を自動的に解決します。

### 技術仕様

#### アーキテクチャ

- **CRDT実装**: Yjs（https://docs.yjs.dev/）
- **同期方式**: HTTPポーリング（5秒間隔）
- **データ形式**: Yjsバイナリフォーマット（Base64エンコード）
- **状態管理**: サーバー側でYjsドキュメントを保持

#### データモデル

##### タスクリストの構造

```javascript
// Y.Docルート構造
{
  tasks: Y.Array<Y.Map> // タスクの配列
  metadata: Y.Map      // タスクリストのメタデータ
}

// タスク（Y.Map）の構造
{
  id: string          // 一意のタスクID（clientID-timestamp-random）
  content: string     // タスク内容
  completed: boolean  // 完了状態
  dueDate: number?    // 期限（Unixタイムスタンプ）
  order: number       // 表示順序
  createdAt: number   // 作成日時
  updatedAt: number   // 更新日時
}
```

#### 同期フロー

1. **初回ロード**
   - クライアントがタスクリストを開く
   - `/api/task-lists/:id/collaborative/full-state`から完全な状態を取得
   - ローカルY.Docに適用

2. **定期同期（5秒ごと）**
   - クライアントが現在のstateVectorを送信
   - サーバーが差分のみを返却
   - クライアントが差分を適用

3. **ローカル変更時**
   - 変更を即座にローカルY.Docに適用
   - 次回のポーリングで自動的にサーバーに送信

#### 競合解決

YjsのCRDT特性により、以下の競合は自動的に解決されます：

- **同一タスクの同時編集**: 最後の編集が優先（Last Write Wins）
- **タスクの同時追加**: 両方のタスクが保持される
- **タスクの順序変更**: 操作の順序に関わらず一貫した結果
- **タスクの削除と編集**: 削除が優先される

### APIエンドポイント

#### GET /api/task-lists/:taskListId/collaborative/full-state

**説明**: タスクリストの完全な共同編集状態を取得

**レスポンス（成功）**:

```json
{
  "message": "Collaborative state retrieved successfully",
  "data": {
    "state": "base64EncodedYjsState",
    "stateVector": "base64EncodedStateVector"
  }
}
```

#### POST /api/task-lists/:taskListId/collaborative/sync

**説明**: 共同編集の差分同期

**リクエスト**:

```json
{
  "stateVector": "base64EncodedStateVector",
  "update": "base64EncodedUpdate" // ローカルの変更がある場合
}
```

**レスポンス（成功）**:

```json
{
  "message": "Sync successful",
  "data": {
    "update": "base64EncodedDiff", // 他のクライアントからの変更
    "stateVector": "base64EncodedNewStateVector"
  }
}
```

### クライアント実装

#### 共同編集Context

```typescript
interface CollaborativeContextType {
  doc: Y.Doc | null;
  isLoading: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  error: string | null;
}
```

#### 使用例

```typescript
// タスクの追加
const addTask = (content: string) => {
  const tasks = doc.getArray('tasks');
  const task = new Y.Map();
  
  doc.transact(() => {
    task.set('id', generateTaskId());
    task.set('content', content);
    task.set('completed', false);
    task.set('createdAt', Date.now());
    tasks.push([task]);
  });
};

// タスクの更新
const updateTask = (taskId: string, updates: Partial<Task>) => {
  const tasks = doc.getArray('tasks');
  const task = tasks.toArray().find(t => t.get('id') === taskId);
  
  if (task) {
    doc.transact(() => {
      Object.entries(updates).forEach(([key, value]) => {
        task.set(key, value);
      });
      task.set('updatedAt', Date.now());
    });
  }
};
```

### パフォーマンス最適化

- **差分同期**: stateVectorを使用して必要な更新のみを送受信
- **バッチ処理**: 複数の変更を1つのトランザクションにまとめる
- **圧縮**: Yjsの効率的なバイナリエンコーディング
- **キャッシュ**: 最新の状態をメモリに保持

### エラーハンドリング

- **ネットワークエラー**: 自動リトライ（最大3回）
- **同期の失敗**: ローカル変更を保持し、次回の同期で再試行
- **不整合の検出**: 完全な状態の再取得

### セキュリティ

- **アクセス制御**: タスクリストの所有者と共有ユーザーのみアクセス可能
- **入力検証**: 悪意のある更新データの拒否
- **レート制限**: 同期APIへの過度なリクエストを制限

### 制限事項

- **リアルタイム性**: 最大5秒の遅延が発生する可能性があります
- **大規模編集**: 非常に大きな変更は同期に時間がかかる場合があります
- **オフライン編集**: オフライン時の編集は、オンライン復帰時に自動的にマージされます

## データベーススキーマ

### Userテーブル

```sql
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  taskLists      TaskList[]
  sharedTaskLists SharedTaskList[]
  userSettings    UserSettings?
}
```

### TaskListテーブル

```sql
model TaskList {
  id        String   @id @default(cuid())
  name      String
  userId    String
  order     Int      @default(0)
  color     String?  @default("#FFFFFF")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  tasks  Task[]
  shares SharedTaskList[]

  @@index([userId])
}
```

### Taskテーブル

```sql
model Task {
  id         String    @id @default(cuid())
  content    String
  completed  Boolean   @default(false)
  dueDate    DateTime?
  order      Int       @default(0)
  taskListId String
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt

  taskList TaskList @relation(fields: [taskListId], references: [id], onDelete: Cascade)

  @@index([taskListId])
}
```

### UserSettingsテーブル

```sql
model UserSettings {
  id               String   @id @default(cuid())
  userId           String   @unique
  theme            String   @default("system")
  language         String   @default("ja")
  taskInsertPosition String @default("top")
  autoSort         Boolean  @default(false)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### SharedTaskListテーブル

```sql
model SharedTaskList {
  id         String   @id @default(cuid())
  taskListId String
  userId     String?
  shareToken String   @unique
  permission String   @default("view")
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  taskList TaskList @relation(fields: [taskListId], references: [id], onDelete: Cascade)
  user     User?    @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([taskListId])
  @@index([userId])
  @@index([shareToken])
}
```

### TaskListDocumentテーブル

```sql
model TaskListDocument {
  id            String   @id @default(cuid())
  taskListId    String   @unique
  stateVector   Bytes    // Yjsの状態ベクター
  documentState Bytes    // Yjsドキュメントの完全な状態
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  taskList TaskList @relation(fields: [taskListId], references: [id], onDelete: Cascade)

  @@index([taskListId])
}
```

### TaskListUpdateテーブル（オプション - 履歴保存用）

```sql
model TaskListUpdate {
  id         String   @id @default(cuid())
  taskListId String
  update     Bytes    // Yjsの更新データ
  userId     String?  // 更新を行ったユーザー
  createdAt  DateTime @default(now())

  taskList TaskList @relation(fields: [taskListId], references: [id], onDelete: Cascade)
  user     User?    @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([taskListId])
  @@index([createdAt])
}
```

## 今後の実装予定

1. ~~**apps/native**へのユーザー登録・ログイン機能実装~~ ✅ **完了**
2. ~~NativeWindビルドエラーの修正~~ ✅ **完了**（StyleSheetに移行）
3. ~~ユーザー設定の永続化（APIとの連携）~~ ✅ **完了**
4. ~~プロフィール編集機能~~ ✅ **完了**
5. タスクリスト管理機能（CRUD API）
6. タスク管理機能（CRUD API）
7. 共有機能の実装
8. パスワードリセット機能

## 実装状況

### ✅ 完了済み

- API認証機能（登録・ログイン・ログアウト）
- Web認証機能（認証Context、画面実装）
- Native認証機能（認証Context、ログイン/登録画面、認証状態による画面切り替え）
- **プロフィール編集機能**（API、Web、Native全てで名前編集機能を実装）
- **APIベースURL設定の統一**（Native環境変数対応とAuthService統合）
- **リフレッシュトークンの実装**（自動更新機能、適切な有効期限設定）
- **エラーハンドリングとローディング状態の改善**（トークン管理の最適化）
- **🆕 プロアクティブ自動リフレッシュ機能**（期限の5分前にバックグラウンドで自動更新）
- **🆕 同時リクエスト制御**（重複リフレッシュ防止とリクエストキューイング）
- **🆕 トークン有効期限情報の追加**（クライアント側でのタイミング最適化）
- **🆕 サーバーサイドデバイス識別**（クライアントサイドからサーバーサイドへの移行完了）

### 🚧 問題・課題

- ~~**NativeWindビルドエラー**: PostCSSの非同期プラグイン問題により、Nativeアプリのビルドが失敗~~ ✅ **解決済み**

### 📝 技術的決定

- **Native UI**: NativeWindからReact Native StyleSheetに移行
  - NativeWind v2のPostCSS非同期プラグイン問題を回避
  - ネイティブなパフォーマンスとプラットフォーム一貫性を確保
