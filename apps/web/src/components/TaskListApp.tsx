'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { TaskListProvider, useTaskList } from '@/contexts/TaskListContext';
import { useToast } from '@/contexts/ToastContext';
import { useSwipeGesture } from '@/hooks/useSwipeGesture';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { ColorPicker } from '@/components/ColorPicker';
import { DatePicker } from '@/components/DatePicker';

// サイドバーコンポーネント
const Sidebar: React.FC<{
  onClose?: () => void;
  isMobile?: boolean;
}> = ({ onClose, isMobile = false }) => {
  const { t } = useTranslation('common');
  const { taskLists, currentTaskListId, selectTaskList, createTaskList, updateTaskList, deleteTaskList, isLoading, error } = useTaskList();
  const { user } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTaskListName, setNewTaskListName] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingTaskListId, setEditingTaskListId] = useState<string | null>(null);
  const [editingTaskListName, setEditingTaskListName] = useState('');
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState<{
    isOpen: boolean;
    taskListId: string;
    taskListName: string;
  }>({
    isOpen: false,
    taskListId: '',
    taskListName: '',
  });
  const [colorPicker, setColorPicker] = useState<{
    isOpen: boolean;
    taskListId: string;
  }>({
    isOpen: false,
    taskListId: '',
  });
  const colorButtonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const [draggedTaskListId, setDraggedTaskListId] = useState<string | null>(null);
  const [dragOverTaskListId, setDragOverTaskListId] = useState<string | null>(null);

  // タスクリスト選択時にモバイルメニューを閉じる
  const handleSelectTaskList = (taskListId: string) => {
    selectTaskList(taskListId);
    if (isMobile && onClose) {
      onClose();
    }
  };

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

  const handleDeleteTaskList = (taskListId: string, taskListName: string) => {
    setDeleteConfirmDialog({
      isOpen: true,
      taskListId,
      taskListName,
    });
  };

  const confirmDeleteTaskList = async () => {
    try {
      await deleteTaskList(deleteConfirmDialog.taskListId);
      showSuccess(t('taskList.deleteSuccess', { name: deleteConfirmDialog.taskListName }));
      setDeleteConfirmDialog({ isOpen: false, taskListId: '', taskListName: '' });
    } catch (err) {
      showError(err instanceof Error ? err.message : t('taskList.deleteFailed'));
    }
  };

  const cancelDeleteTaskList = () => {
    setDeleteConfirmDialog({ isOpen: false, taskListId: '', taskListName: '' });
  };

  const handleColorButtonClick = (taskListId: string) => {
    setColorPicker({
      isOpen: true,
      taskListId,
    });
  };

  const handleColorChange = async (color: string) => {
    try {
      await updateTaskList(colorPicker.taskListId, { color });
      showSuccess(t('taskList.colorUpdated'));
      setColorPicker({ isOpen: false, taskListId: '' });
    } catch (err) {
      showError(err instanceof Error ? err.message : t('taskList.colorUpdateFailed'));
    }
  };

  const closeColorPicker = () => {
    setColorPicker({ isOpen: false, taskListId: '' });
  };

  const handleEditTaskListName = (taskListId: string, currentName: string) => {
    setEditingTaskListId(taskListId);
    setEditingTaskListName(currentName);
  };

  const handleSaveTaskListName = async () => {
    if (!editingTaskListId) return;
    
    const trimmedName = editingTaskListName.trim();
    if (!trimmedName) {
      setEditingTaskListId(null);
      setEditingTaskListName('');
      return;
    }

    // 重複チェック
    const existingTaskList = taskLists.find(list => list.name === trimmedName && list.id !== editingTaskListId);
    if (existingTaskList) {
      showError(t('taskList.duplicateName'));
      return;
    }

    try {
      await updateTaskList(editingTaskListId, { name: trimmedName });
      showSuccess(t('taskList.nameUpdated'));
      setEditingTaskListId(null);
      setEditingTaskListName('');
    } catch (err) {
      showError(err instanceof Error ? err.message : t('taskList.nameUpdateFailed'));
    }
  };

  const handleCancelEditTaskListName = () => {
    setEditingTaskListId(null);
    setEditingTaskListName('');
  };

  // ドラッグ&ドロップ関連のハンドラー
  const handleDragStart = (e: React.DragEvent, taskListId: string) => {
    setDraggedTaskListId(taskListId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', taskListId);
  };

  const handleDragEnd = () => {
    setDraggedTaskListId(null);
    setDragOverTaskListId(null);
  };

  const handleDragOver = (e: React.DragEvent, taskListId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverTaskListId(taskListId);
  };

  const handleDragLeave = () => {
    setDragOverTaskListId(null);
  };

  const handleDrop = async (e: React.DragEvent, targetTaskListId: string) => {
    e.preventDefault();
    
    const sourceTaskListId = e.dataTransfer.getData('text/plain');
    if (!sourceTaskListId || sourceTaskListId === targetTaskListId) {
      setDraggedTaskListId(null);
      setDragOverTaskListId(null);
      return;
    }

    try {
      // 並び替え処理
      const sourceIndex = taskLists.findIndex(list => list.id === sourceTaskListId);
      const targetIndex = taskLists.findIndex(list => list.id === targetTaskListId);
      
      if (sourceIndex === -1 || targetIndex === -1) return;

      // 新しい順序を計算
      const newTaskLists = [...taskLists];
      const [movedItem] = newTaskLists.splice(sourceIndex, 1);
      newTaskLists.splice(targetIndex, 0, movedItem);

      // 順序を更新
      const updatePromises = newTaskLists.map((list, index) => 
        updateTaskList(list.id, { order: index })
      );

      await Promise.all(updatePromises);
      showSuccess(t('taskList.sortSuccess'));
    } catch (err) {
      showError(err instanceof Error ? err.message : t('taskList.sortFailed'));
    } finally {
      setDraggedTaskListId(null);
      setDragOverTaskListId(null);
    }
  };

  // キーボードでの並び替え
  const handleKeyboardSort = async (taskListId: string, direction: 'up' | 'down') => {
    const currentIndex = taskLists.findIndex(list => list.id === taskListId);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= taskLists.length) return;

    try {
      // 隣接するアイテムと位置を交換
      const newTaskLists = [...taskLists];
      [newTaskLists[currentIndex], newTaskLists[targetIndex]] = [newTaskLists[targetIndex], newTaskLists[currentIndex]];

      // 順序を更新
      const updatePromises = [
        updateTaskList(newTaskLists[currentIndex].id, { order: currentIndex }),
        updateTaskList(newTaskLists[targetIndex].id, { order: targetIndex })
      ];

      await Promise.all(updatePromises);
      showSuccess(t('taskList.sortSuccess'));
    } catch (err) {
      showError(err instanceof Error ? err.message : t('taskList.sortFailed'));
    }
  };


  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* ヘッダー */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Lightlist</h1>
          {/* モバイル用クローズボタン */}
          {isMobile && onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="メニューを閉じる"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {user?.name || user?.email}
          </div>
          <div className="flex gap-2">
            <a 
              href="/settings"
              className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
              title={t('settings.title')}
            >
              {t('settings.title')}
            </a>
          </div>
        </div>
      </div>

      {/* タスクリスト一覧 */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('taskList.title')}</h2>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            title={t('taskList.add')}
          >
            {t('taskList.add')}
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
                placeholder={t('taskList.namePlaceholder')}
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
                    {t('common.creating')}
                  </>
                ) : (
                  t('common.create')
                )}
              </button>
              <button
                type="button"
                onClick={handleCancelCreate}
                disabled={isCreating}
                className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
              >
                {t('common.cancel')}
              </button>
            </div>
          </form>
        )}

        {/* タスクリスト一覧 */}
        <div className="space-y-2">
          {taskLists.map((taskList) => (
            <div
              key={taskList.id}
              draggable={editingTaskListId !== taskList.id}
              onDragStart={(e) => handleDragStart(e, taskList.id)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, taskList.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, taskList.id)}
              className={`p-3 rounded transition-all group ${
                currentTaskListId === taskList.id
                  ? 'bg-blue-100 dark:bg-blue-900 border-l-4 border-blue-500'
                  : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
              } ${
                draggedTaskListId === taskList.id 
                  ? 'opacity-50 scale-95 shadow-lg' 
                  : ''
              } ${
                dragOverTaskListId === taskList.id && draggedTaskListId !== taskList.id
                  ? 'border-2 border-blue-400 border-dashed bg-blue-50 dark:bg-blue-900/20'
                  : ''
              }`}
            >
              <div 
                onClick={() => {
                  if (editingTaskListId !== taskList.id) {
                    handleSelectTaskList(taskList.id);
                  }
                }}
                className={editingTaskListId === taskList.id ? '' : 'cursor-pointer'}
              >
                <div className="flex items-center justify-between">
                  {/* ドラッグハンドル */}
                  {editingTaskListId !== taskList.id && (
                    <div className="flex items-center gap-2">
                      <div 
                        className="drag-handle cursor-move p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
                        title={t('taskList.dragToReorder')}
                        aria-label={t('taskList.dragToReorder')}
                        onKeyDown={(e) => {
                          if (e.key === 'ArrowUp' && (e.altKey || e.metaKey)) {
                            e.preventDefault();
                            handleKeyboardSort(taskList.id, 'up');
                          } else if (e.key === 'ArrowDown' && (e.altKey || e.metaKey)) {
                            e.preventDefault();
                            handleKeyboardSort(taskList.id, 'down');
                          }
                        }}
                        tabIndex={0}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                        </svg>
                      </div>
                    </div>
                  )}

                  {editingTaskListId === taskList.id ? (
                    <div className="flex-1 mr-2">
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleSaveTaskListName();
                        }}
                        className="flex items-center gap-1"
                      >
                        <input
                          type="text"
                          value={editingTaskListName}
                          onChange={(e) => setEditingTaskListName(e.target.value)}
                          onBlur={handleSaveTaskListName}
                          onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                              handleCancelEditTaskListName();
                            }
                          }}
                          className="flex-1 px-2 py-1 text-sm border border-blue-500 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          maxLength={50}
                          autoFocus
                        />
                      </form>
                    </div>
                  ) : (
                    <h3 
                      className="flex-1 font-medium text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      onDoubleClick={() => handleEditTaskListName(taskList.id, taskList.name)}
                      title={t('taskList.doubleClickToEdit')}
                    >
                      {taskList.name}
                    </h3>
                  )}
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {taskList.completedCount}/{taskList.taskCount}
                    </div>
                    {/* 編集中でない場合のみボタンを表示 */}
                    {editingTaskListId !== taskList.id && (
                      <>
                        {/* 背景色設定ボタン */}
                        <button
                          ref={(el) => {
                            colorButtonRefs.current[taskList.id] = el;
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleColorButtonClick(taskList.id);
                          }}
                          className="p-1 rounded text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 opacity-0 group-hover:opacity-100 transition-opacity"
                          title={t('taskList.setColor')}
                          aria-label={t('taskList.setColor')}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM7 3H5a2 2 0 00-2 2v12a4 4 0 004 4h2a2 2 0 002-2V5a2 2 0 00-2-2z"
                            />
                          </svg>
                        </button>
                        {/* 削除ボタン */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTaskList(taskList.id, taskList.name);
                          }}
                          className="p-1 rounded text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-opacity"
                          title={t('taskList.delete')}
                          aria-label={t('taskList.delete')}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {taskList.color !== '#FFFFFF' && (
                  <div 
                    className="w-4 h-2 rounded mt-2" 
                    style={{ backgroundColor: taskList.color }}
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        {isLoading && (
          <div className="text-center py-4">
            <div className="text-gray-500 dark:text-gray-400">{t('common.loading')}</div>
          </div>
        )}
      </div>

      {/* 削除確認ダイアログ */}
      <ConfirmDialog
        isOpen={deleteConfirmDialog.isOpen}
        title={t('taskList.confirmDeleteTitle')}
        message={t('taskList.confirmDeleteMessage', { name: deleteConfirmDialog.taskListName })}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        onConfirm={confirmDeleteTaskList}
        onCancel={cancelDeleteTaskList}
        isDestructive={true}
      />

      {/* カラーピッカー */}
      <ColorPicker
        isOpen={colorPicker.isOpen}
        value={taskLists.find(list => list.id === colorPicker.taskListId)?.color || '#FFFFFF'}
        onChange={handleColorChange}
        onClose={closeColorPicker}
        triggerRef={{
          current: colorButtonRefs.current[colorPicker.taskListId] || null
        }}
      />
    </div>
  );
};

// メインコンテンツコンポーネント
const MainContent: React.FC = () => {
  const { t } = useTranslation('common');
  const { currentTasks, currentTaskListId, taskLists, createTask, toggleTask, deleteTask, updateTask, sortTasks, deleteCompletedTasks, error } = useTaskList();
  const { showSuccess, showError, showInfo } = useToast();
  const [newTaskContent, setNewTaskContent] = useState('');
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [isEditingTaskListName, setIsEditingTaskListName] = useState(false);
  const [editingTaskListName, setEditingTaskListName] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskContent, setEditingTaskContent] = useState('');
  const [datePicker, setDatePicker] = useState<{
    isOpen: boolean;
    taskId: string;
  }>({
    isOpen: false,
    taskId: '',
  });
  const dateButtonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  const currentTaskList = taskLists.find(list => list.id === currentTaskListId);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskContent.trim()) return;
    
    await createTask(newTaskContent.trim());
    setNewTaskContent('');
  };

  // タスク編集関連のハンドラー
  const handleEditTask = (taskId: string, currentContent: string) => {
    setEditingTaskId(taskId);
    setEditingTaskContent(currentContent);
  };

  const handleSaveTask = async () => {
    if (!editingTaskId) return;
    
    const trimmedContent = editingTaskContent.trim();
    if (!trimmedContent) {
      setEditingTaskId(null);
      setEditingTaskContent('');
      return;
    }

    try {
      await updateTask(editingTaskId, { content: trimmedContent });
      showSuccess(t('task.nameUpdated'));
      setEditingTaskId(null);
      setEditingTaskContent('');
    } catch (err) {
      showError(err instanceof Error ? err.message : t('task.nameUpdateFailed'));
    }
  };

  const handleCancelEditTask = () => {
    setEditingTaskId(null);
    setEditingTaskContent('');
  };

  // 日付ピッカー関連のハンドラー
  const handleDateButtonClick = (taskId: string) => {
    setDatePicker({
      isOpen: true,
      taskId,
    });
  };

  const handleDateChange = async (date: Date | null) => {
    try {
      await updateTask(datePicker.taskId, { dueDate: date });
      showSuccess(date ? t('task.dueDateSet') : t('task.dueDateRemoved'));
      setDatePicker({ isOpen: false, taskId: '' });
    } catch (err) {
      showError(err instanceof Error ? err.message : t('task.dueDateUpdateFailed'));
    }
  };

  const closeDatePicker = () => {
    setDatePicker({ isOpen: false, taskId: '' });
  };

  if (!currentTaskListId) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <p>{t('taskList.selectPrompt')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* ヘッダー */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {isEditingTaskListName ? (
              <form onSubmit={(e) => {
                e.preventDefault();
                // TODO: タスクリスト名の更新処理
                setIsEditingTaskListName(false);
                showSuccess(t('taskList.nameUpdated'));
              }}>
                <input
                  type="text"
                  value={editingTaskListName}
                  onChange={(e) => setEditingTaskListName(e.target.value)}
                  onBlur={() => setIsEditingTaskListName(false)}
                  className="text-2xl font-bold bg-transparent border-b-2 border-blue-500 text-gray-900 dark:text-white focus:outline-none"
                  autoFocus
                />
              </form>
            ) : (
              <h1 
                className="text-2xl font-bold text-gray-900 dark:text-white cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
                onDoubleClick={() => {
                  setEditingTaskListName(currentTaskList?.name || '');
                  setIsEditingTaskListName(true);
                }}
                title={t('taskList.doubleClickToEdit')}
              >
                {currentTaskList?.name}
              </h1>
            )}
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {currentTasks.length > 0 
                ? t('taskList.taskCount', { completed: currentTasks.filter(t => t.completed).length, total: currentTasks.length })
                : t('taskList.noTasks')
              }
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                // TODO: 共有リンク生成処理
                setShareUrl(`${window.location.origin}/share/dummy-token`);
                setShowShareDialog(true);
              }}
              className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800"
              title={t('taskList.share')}
            >
              {t('taskList.share')}
            </button>
            <button
              onClick={() => {
                sortTasks();
                showSuccess(t('taskList.sortSuccess'));
              }}
              className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
              title={t('taskList.sort')}
            >
              {t('taskList.sort')}
            </button>
            <button
              onClick={async () => {
                const completedCount = currentTasks.filter(task => task.completed).length;
                if (completedCount === 0) {
                  showInfo(t('taskList.noCompletedTasks'));
                  return;
                }
                
                if (window.confirm(t('taskList.confirmDeleteCompleted'))) {
                  try {
                    await deleteCompletedTasks();
                    showSuccess(t('taskList.completedDeleted'));
                  } catch (err) {
                    showError(err instanceof Error ? err.message : t('taskList.deleteCompletedFailed'));
                  }
                }
              }}
              className="px-3 py-1 text-sm bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-800"
              title={t('taskList.deleteCompleted')}
            >
              {t('taskList.deleteCompleted')}
            </button>
          </div>
        </div>
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
            placeholder={t('task.inputPlaceholder')}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!newTaskContent.trim()}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('task.add')}
          </button>
        </form>
      </div>

      {/* タスク一覧 */}
      <div className="flex-1 px-6 pb-6">
        <div className="space-y-2">
          {currentTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 group"
            >
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTask(task.id)}
                className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              
              {editingTaskId === task.id ? (
                <div className="flex-1">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSaveTask();
                    }}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={editingTaskContent}
                      onChange={(e) => setEditingTaskContent(e.target.value)}
                      onBlur={handleSaveTask}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          handleCancelEditTask();
                        }
                      }}
                      className="flex-1 px-2 py-1 text-sm border border-blue-500 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                  </form>
                </div>
              ) : (
                <span 
                  className={`flex-1 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${
                    task.completed 
                      ? 'line-through text-gray-500 dark:text-gray-400' 
                      : 'text-gray-900 dark:text-white'
                  }`}
                  onDoubleClick={() => handleEditTask(task.id, task.content)}
                  title={t('task.doubleClickToEdit')}
                >
                  {task.content}
                </span>
              )}
              
              {task.dueDate && (
                <span className={`text-sm px-2 py-1 rounded ${
                  new Date(task.dueDate) < new Date() && !task.completed
                    ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}>
                  {new Date(task.dueDate).toLocaleDateString()}
                </span>
              )}
              
              {editingTaskId !== task.id && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {/* 日付設定ボタン */}
                  <button
                    ref={(el) => {
                      dateButtonRefs.current[task.id] = el;
                    }}
                    onClick={() => handleDateButtonClick(task.id)}
                    className="p-1 rounded text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    title={t('datePicker.setDueDate')}
                    aria-label={t('datePicker.setDueDate')}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </button>
                  
                  {/* 削除ボタン */}
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-1 rounded text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    title={t('common.delete')}
                    aria-label={t('common.delete')}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {currentTasks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              {t('task.emptyMessage')}
            </p>
          </div>
        )}
      </div>

      {/* 共有ダイアログ */}
      {showShareDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {t('share.dialogTitle')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {t('share.dialogDescription')}
            </p>
            <div className="bg-gray-100 dark:bg-gray-700 rounded p-3 mb-4">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="w-full bg-transparent text-gray-900 dark:text-white text-sm"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl);
                  showSuccess(t('share.linkCopied'));
                }}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                {t('share.copyLink')}
              </button>
              <button
                onClick={() => setShowShareDialog(false)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 日付ピッカー */}
      <DatePicker
        isOpen={datePicker.isOpen}
        value={currentTasks.find(task => task.id === datePicker.taskId)?.dueDate ? new Date(currentTasks.find(task => task.id === datePicker.taskId)!.dueDate!) : null}
        onChange={handleDateChange}
        onClose={closeDatePicker}
        triggerRef={{
          current: dateButtonRefs.current[datePicker.taskId] || null
        }}
      />
    </div>
  );
};

// メインアプリコンポーネント
const TaskListApp: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const mainContentRef = useRef<HTMLDivElement>(null);

  // 画面サイズの監視
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024); // lg以下をモバイル扱い
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // モバイルメニューを閉じる
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // モバイルメニューを開く
  const openMobileMenu = () => {
    setIsMobileMenuOpen(true);
  };

  // スワイプジェスチャーの設定
  useSwipeGesture(mainContentRef, {
    onSwipeRight: () => {
      if (isMobile && !isMobileMenuOpen) {
        openMobileMenu();
      }
    },
    onSwipeLeft: () => {
      if (isMobile && isMobileMenuOpen) {
        closeMobileMenu();
      }
    },
    minSwipeDistance: 100, // より確実なスワイプを要求
    maxVerticalDistance: 150,
  });

  return (
    <TaskListProvider>
      <div className="flex h-screen relative">
        {/* デスクトップ用サイドバー */}
        <div className={`${isMobile ? 'hidden' : 'block'}`}>
          <Sidebar isMobile={false} />
        </div>

        {/* モバイル用オーバーレイ */}
        {isMobile && isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={closeMobileMenu}
          />
        )}

        {/* モバイル用ドロワー */}
        {isMobile && (
          <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}>
            <Sidebar onClose={closeMobileMenu} isMobile={true} />
          </div>
        )}

        {/* メインコンテンツ */}
        <div ref={mainContentRef} className="flex-1 flex flex-col">
          {/* モバイル用ヘッダー */}
          {isMobile && (
            <div className="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
              <div className="flex items-center justify-between">
                <button
                  onClick={openMobileMenu}
                  className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                  aria-label="メニューを開く"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Lightlist</h1>
                <div className="w-10" /> {/* スペーサー */}
              </div>
            </div>
          )}
          
          <MainContent />
        </div>
      </div>
    </TaskListProvider>
  );
};

export default TaskListApp;