'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { TaskListProvider, useTaskList } from '@/contexts/TaskListContext';

// サイドバーコンポーネント
const Sidebar: React.FC = () => {
  const { taskLists, currentTaskListId, selectTaskList, createTaskList, isLoading, error } = useTaskList();
  const { logout } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTaskListName, setNewTaskListName] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateTaskList = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedName = newTaskListName.trim();
    if (!trimmedName) {
      setCreateError('タスクリスト名を入力してください');
      return;
    }

    if (trimmedName.length > 50) {
      setCreateError('タスクリスト名は50文字以下で入力してください');
      return;
    }

    // 重複チェック
    if (taskLists.some(list => list.name === trimmedName)) {
      setCreateError('同じ名前のタスクリストが既に存在します');
      return;
    }

    try {
      setIsCreating(true);
      setCreateError(null);
      
      await createTaskList({ name: trimmedName });
      setNewTaskListName('');
      setShowCreateForm(false);
      setCreateError(null);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'タスクリストの作成に失敗しました');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancelCreate = () => {
    setShowCreateForm(false);
    setNewTaskListName('');
    setCreateError(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* ヘッダー */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Lightlist</h1>
          <div className="flex gap-2">
            <a 
              href="/settings"
              className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              設定
            </a>
            <button
              onClick={handleLogout}
              className="px-3 py-1 text-sm bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-800"
            >
              ログアウト
            </button>
          </div>
        </div>
      </div>

      {/* タスクリスト一覧 */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">タスクリスト</h2>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            追加
          </button>
        </div>

        {/* 作成フォーム */}
        {showCreateForm && (
          <form onSubmit={handleCreateTaskList} className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded">
            <div className="mb-3">
              <input
                type="text"
                value={newTaskListName}
                onChange={(e) => {
                  setNewTaskListName(e.target.value);
                  setCreateError(null); // 入力時にエラーをクリア
                }}
                placeholder="タスクリスト名を入力..."
                className={`w-full px-3 py-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                  createError 
                    ? 'border-red-500 dark:border-red-400' 
                    : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400'
                } focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-opacity-50`}
                maxLength={50}
                autoFocus
              />
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {newTaskListName.length}/50
                </span>
                {createError && (
                  <span className="text-xs text-red-600 dark:text-red-400">
                    {createError}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isCreating || !newTaskListName.trim()}
                className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                {isCreating ? (
                  <>
                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                    作成中...
                  </>
                ) : (
                  '作成'
                )}
              </button>
              <button
                type="button"
                onClick={handleCancelCreate}
                disabled={isCreating}
                className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
              >
                キャンセル
              </button>
            </div>
          </form>
        )}

        {/* タスクリスト一覧 */}
        <div className="space-y-2">
          {taskLists.map((taskList) => (
            <div
              key={taskList.id}
              onClick={() => selectTaskList(taskList.id)}
              className={`p-3 rounded cursor-pointer transition-colors ${
                currentTaskListId === taskList.id
                  ? 'bg-blue-100 dark:bg-blue-900 border-l-4 border-blue-500'
                  : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900 dark:text-white">{taskList.name}</h3>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {taskList.completedCount}/{taskList.taskCount}
                </div>
              </div>
              {taskList.color !== '#FFFFFF' && (
                <div 
                  className="w-4 h-2 rounded mt-2" 
                  style={{ backgroundColor: taskList.color }}
                />
              )}
            </div>
          ))}
        </div>

        {isLoading && (
          <div className="text-center py-4">
            <div className="text-gray-500 dark:text-gray-400">読み込み中...</div>
          </div>
        )}
      </div>
    </div>
  );
};

// メインコンテンツコンポーネント
const MainContent: React.FC = () => {
  const { currentTasks, currentTaskListId, taskLists, createTask, toggleTask, deleteTask, error } = useTaskList();
  const [newTaskContent, setNewTaskContent] = useState('');

  const currentTaskList = taskLists.find(list => list.id === currentTaskListId);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskContent.trim()) return;
    
    await createTask(newTaskContent.trim());
    setNewTaskContent('');
  };

  if (!currentTaskListId) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <p>タスクリストを選択してください</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* ヘッダー */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {currentTaskList?.name}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {currentTasks.length > 0 
            ? `${currentTasks.filter(t => t.completed).length}/${currentTasks.length} 完了`
            : 'タスクがありません'
          }
        </p>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="mx-6 mt-4 p-3 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded">
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* タスク追加フォーム */}
      <div className="p-6">
        <form onSubmit={handleCreateTask} className="flex gap-3">
          <input
            type="text"
            value={newTaskContent}
            onChange={(e) => setNewTaskContent(e.target.value)}
            placeholder="新しいタスクを入力..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!newTaskContent.trim()}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            追加
          </button>
        </form>
      </div>

      {/* タスク一覧 */}
      <div className="flex-1 px-6 pb-6">
        <div className="space-y-2">
          {currentTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTask(task.id)}
                className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className={`flex-1 ${
                task.completed 
                  ? 'line-through text-gray-500 dark:text-gray-400' 
                  : 'text-gray-900 dark:text-white'
              }`}>
                {task.content}
              </span>
              {task.dueDate && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(task.dueDate).toLocaleDateString()}
                </span>
              )}
              <button
                onClick={() => deleteTask(task.id)}
                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                削除
              </button>
            </div>
          ))}
        </div>

        {currentTasks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              まだタスクがありません。<br />
              上記のフォームから新しいタスクを追加してください。
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// メインアプリコンポーネント
const TaskListApp: React.FC = () => {
  return (
    <TaskListProvider>
      <div className="flex h-screen">
        <Sidebar />
        <MainContent />
      </div>
    </TaskListProvider>
  );
};

export default TaskListApp;