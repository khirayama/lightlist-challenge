'use client';

import React from 'react';
import { CollaborativeProvider } from '../../contexts/CollaborativeContext';
import CollaborativeTaskList from '../../components/CollaborativeTaskList';

export default function CollaborativeTestPage() {
  // テスト用のタスクリストID（実際の実装では認証状態から取得）
  const testTaskListId = 'test-task-list-001';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold text-center mb-8">
          共同編集機能テスト
        </h1>
        
        <CollaborativeProvider taskListId={testTaskListId}>
          <CollaborativeTaskList taskListId={testTaskListId} />
        </CollaborativeProvider>

        <div className="mt-8 p-4 bg-yellow-100 border border-yellow-400 rounded-md max-w-md mx-auto">
          <h3 className="font-semibold mb-2">テスト方法:</h3>
          <ol className="text-sm space-y-1">
            <li>1. APIサーバーが起動していることを確認</li>
            <li>2. 共同編集APIエンドポイントが実装されていることを確認</li>
            <li>3. 複数のブラウザタブでこのページを開いて同期をテスト</li>
            <li>4. タスクの追加・更新・削除が他のタブに反映されることを確認</li>
          </ol>
        </div>
      </div>
    </div>
  );
}