# プロダクト仕様

## 概要

Hobby Baselineは、マルチプラットフォーム対応のアプリケーションです。Web、iOS、Androidで動作し、ユーザーの好みに応じたテーマと言語の設定、そして認証機能を備えています。

## 画面仕様および機能仕様

### トップ画面（/）

#### レイアウト
- **ヘッダー**: 「Hello World」メッセージを中央に大きく表示
- **サブタイトル**: アプリケーションの説明文
- **メインコンテンツ**: 認証状態に応じて動的に変化するアクションエリア

#### 表示内容（認証状態別）

**未認証時**:
- 「ログイン」ボタン（プライマリカラー）
- 「ユーザー登録」ボタン（セカンダリカラー）
- 「設定ページへ」ボタン（グレー）

**認証済み時**:
- ウェルカムメッセージ: 「ようこそ、{メールアドレス}さん」
- 「設定ページへ」ボタン（プライマリカラー）
- 「ログアウト」ボタン（赤色）

#### UI仕様
- レスポンシブデザイン（モバイル: 縦並び、デスクトップ: 横並び）
- ダークモード対応
- 多言語対応（日本語/英語）

### ユーザー登録画面（/register）

#### フォーム項目
1. **メールアドレス** (必須)
   - type: email
   - バリデーション: RFC準拠のメール形式
   - プレースホルダー: 「メールアドレスを入力」

2. **パスワード** (必須)
   - type: password
   - プレースホルダー: 「パスワードを入力」
   - 要件: 大文字・小文字・数字を含む

3. **パスワード確認** (必須)
   - type: password
   - プレースホルダー: 「パスワードを再入力」
   - バリデーション: パスワードとの一致確認

#### 機能
- **フォームバリデーション**
  - リアルタイムでの入力検証
  - パスワード不一致時のエラー表示
  - APIエラー時の詳細メッセージ表示

- **登録処理**
  - フォーム送信時にAPIへPOSTリクエスト
  - 成功時: 自動ログイン → トップ画面へリダイレクト
  - 失敗時: エラーメッセージ表示

- **UI状態管理**
  - 送信中のローディング状態表示
  - ボタンの無効化
  - 「登録中...」テキスト表示

#### ナビゲーション
- 「既にアカウントをお持ちの方は ログイン」リンク

### ログイン画面（/login）

#### フォーム項目
1. **メールアドレス** (必須)
   - type: email
   - プレースホルダー: 「メールアドレスを入力」

2. **パスワード** (必須)
   - type: password
   - プレースホルダー: 「パスワードを入力」

#### 機能
- **認証処理**
  - フォーム送信時にAPIへPOSTリクエスト
  - 成功時: JWTトークン保存 → トップ画面へリダイレクト
  - 失敗時: エラーメッセージ表示

- **UI状態管理**
  - 送信中のローディング状態表示
  - ボタンの無効化
  - 「ログイン中...」テキスト表示

#### ナビゲーション
- 「アカウントをお持ちでない方は ユーザー登録」リンク

### 設定ページ（/settings）

#### プロフィール設定セクション（認証済みユーザーのみ）
- **名前編集機能**
  - テキスト入力フィールド
  - 「更新」ボタン
  - 更新処理中のローディング状態表示
  - APIとの連携により即座にデータベースに保存
  - 成功時は認証状態の更新も実行

#### テーマ設定セクション
- **選択肢**
  - システム（デバイスの設定に従う）
  - ライト（明るいテーマ）
  - ダーク（暗いテーマ）
- **UI**: カスタムラジオボタン
- **動作**: 選択と同時に即座に反映

#### 言語設定セクション
- **選択肢**
  - 日本語
  - English
- **UI**: カスタムラジオボタン
- **動作**: 選択と同時にアプリケーション全体の言語が切り替わり

#### ナビゲーション
- 「ホームに戻る」ボタン

## 認証機能仕様

### ユーザー登録機能
- **入力データ**: メールアドレス、パスワード
- **バリデーション**
  - メールアドレス: RFC準拠の形式チェック
  - パスワード: 大文字・小文字・数字を含む強度チェック
  - パスワード確認: 入力パスワードとの一致確認
- **処理フロー**
  1. フロントエンドでバリデーション
  2. APIへ登録リクエスト送信
  3. 成功時: JWTトークンとユーザー情報を受信
  4. localStorageに認証情報を保存
  5. 認証状態を更新
  6. トップ画面へリダイレクト

### ログイン機能
- **入力データ**: メールアドレス、パスワード
- **処理フロー**
  1. APIへ認証リクエスト送信
  2. 成功時: JWTトークンとユーザー情報を受信
  3. localStorageに認証情報を保存
  4. 認証状態を更新
  5. トップ画面へリダイレクト

### ログアウト機能
- **処理フロー**
  1. APIへログアウトリクエスト送信
  2. localStorageから認証情報を削除
  3. 認証状態をクリア
  4. トップ画面を再表示（未認証状態）

### 認証状態管理
- **永続化**: localStorage使用
- **保存データ**
  - JWTトークン
  - ユーザー情報（ID、メールアドレス）
- **セッション復元**: ページロード時にlocalStorageから認証状態を復元

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
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
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
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
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
}
```

## 今後の実装予定

1. ~~**apps/native**へのユーザー登録・ログイン機能実装~~ ✅ **完了**
2. ~~NativeWindビルドエラーの修正~~ ✅ **完了**（StyleSheetに移行）
3. ~~ユーザー設定の永続化（APIとの連携）~~ ✅ **完了**
4. ~~プロフィール編集機能~~ ✅ **完了**
5. パスワードリセット機能

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