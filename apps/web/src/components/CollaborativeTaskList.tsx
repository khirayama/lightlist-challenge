'use client';

import React, { useState } from 'react';
import { useCollaborative, useCollaborativeTasks } from '../contexts/CollaborativeContext';

interface CollaborativeTaskListProps {
  taskListId: string;
}

export default function CollaborativeTaskList({ taskListId }: CollaborativeTaskListProps) {
  const { isLoading, isSyncing, lastSyncTime, error } = useCollaborative();
  const { tasks, addTask, updateTask, deleteTask } = useCollaborativeTasks();
  const [newTaskContent, setNewTaskContent] = useState('');

  const handleAddTask = () => {
    if (newTaskContent.trim()) {
      addTask(newTaskContent.trim());
      setNewTaskContent('');
    }
  };

  const handleToggleTask = (taskId: string, completed: boolean) => {
    updateTask(taskId, { completed: !completed });
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTask();
    }
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <p className="text-gray-600">共同編集機能を初期化中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <p className="text-red-600">エラー: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">共同編集タスクリスト</h2>
        
        {/* 同期状態表示 */}
        <div className="text-sm text-gray-500 mb-4">
          {isSyncing && <span className="text-blue-600">同期中...</span>}
          {lastSyncTime && !isSyncing && (
            <span>最終同期: {lastSyncTime.toLocaleTimeString()}</span>
          )}
        </div>

        {/* タスク追加フォーム */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newTaskContent}
            onChange={(e) => setNewTaskContent(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="新しいタスクを入力..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleAddTask}
            disabled={!newTaskContent.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            追加
          </button>
        </div>
      </div>

      {/* タスクリスト */}
      <div className="space-y-2">
        {tasks.length === 0 ? (
          <p className="text-gray-500 text-center py-4">タスクはありません</p>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-md hover:bg-gray-50"
            >
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => handleToggleTask(task.id, task.completed)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span
                className={`flex-1 ${
                  task.completed
                    ? 'line-through text-gray-500'
                    : 'text-gray-900'
                }`}
              >
                {task.content}
              </span>
              <button
                onClick={() => handleDeleteTask(task.id)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                削除
              </button>
            </div>
          ))
        )}
      </div>

      {/* デバッグ情報 */}
      <div className="mt-6 p-3 bg-gray-100 rounded-md text-xs">
        <p><strong>タスクリストID:</strong> {taskListId}</p>
        <p><strong>タスク数:</strong> {tasks.length}</p>
        <p><strong>同期状態:</strong> {isSyncing ? '同期中' : '待機中'}</p>
      </div>
    </div>
  );
}