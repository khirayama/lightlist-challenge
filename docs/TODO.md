# TODO

## 次のタスク

現在のloginでは、deviceIdとdeviceNameをクライアントサイドで行なっているが、サーバサイドで行う様に変更する。

### 実装計画

1. **現状の調査**
   - クライアントサイド（Web/Native）でのdeviceId/deviceName生成ロジックの確認
   - APIエンドポイント（/api/auth/login, /api/auth/register）の現在の実装確認
   - デバイス情報の保存先（Deviceテーブル）の構造確認

2. **サーバーサイドでのデバイス情報生成**
   - User-Agentヘッダーからデバイス情報を解析するユーティリティ関数の作成
   - IPアドレスとUser-Agentを組み合わせたデバイスID生成ロジックの実装
   - デバイス名をUser-Agentから適切に抽出する処理の実装

3. **APIエンドポイントの修正**
   - /api/auth/loginとregisterからdeviceId/deviceNameパラメータを削除
   - リクエストヘッダーからデバイス情報を自動取得する処理を追加
   - 既存のデバイス管理ロジックとの整合性確認

4. **クライアントサイドの修正**
   - Web（apps/web）からdeviceId/deviceName生成・送信ロジックを削除
   - Native（apps/native）からdeviceId/deviceName生成・送信ロジックを削除
   - APIリクエストの簡素化

5. **テストとドキュメント更新**
   - APIテストの更新（deviceId/deviceNameパラメータを削除）
   - API仕様書（SPEC.md）の更新
   - 開発ガイド（DEV.md）の更新

## 次以降のタスク
