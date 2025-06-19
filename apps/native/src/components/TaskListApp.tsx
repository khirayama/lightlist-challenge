import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Dimensions,
  Modal,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { TaskListProvider, useTaskList } from '../contexts/TaskListContext';
import { formatDueDate, parseDateFromText } from '../lib/dateParser';
import { createTaskListStyles } from '../styles/taskList';

// サイドバーコンポーネント
interface SidebarProps {
  isDrawer?: boolean;
  isVisible?: boolean;
  onClose?: () => void;
  width?: number;
  responsiveStyles?: any;
}

const Sidebar: React.FC<SidebarProps> = ({ isDrawer = false, isVisible = true, onClose, width = 320, responsiveStyles }) => {
  const { taskLists, currentTaskListId, selectTaskList, createTaskList, isLoading, error } = useTaskList();
  const { resolvedTheme } = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTaskListName, setNewTaskListName] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const isDark = resolvedTheme === 'dark';
  const styles = createTaskListStyles(isDark);

  const handleCreateTaskList = async () => {
    const trimmedName = newTaskListName.trim();
    if (!trimmedName) {
      setCreateError(t('taskList.nameRequired'));
      return;
    }

    if (trimmedName.length > 50) {
      setCreateError(t('taskList.nameTooLong'));
      return;
    }

    // 重複チェック
    if (taskLists.some(list => list.name === trimmedName)) {
      setCreateError(t('taskList.nameExists'));
      return;
    }

    try {
      setIsCreating(true);
      setCreateError(null);
      
      await createTaskList({ name: trimmedName });
      setNewTaskListName('');
      setShowCreateForm(false);
      setCreateError(null);
      
      // createTaskListが自動的に新しいタスクリストを選択するため、
      // 手動での選択処理は不要
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : t('taskList.createFailed'));
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancelCreate = () => {
    setShowCreateForm(false);
    setNewTaskListName('');
    setCreateError(null);
  };


  const handleSelectTaskList = (taskListId: string) => {
    selectTaskList(taskListId);
    if (isDrawer && onClose) {
      onClose();
    }
  };

  const sidebarContent = (
    <View style={[
      isDrawer ? styles.drawerSidebar : [styles.sidebar, { width }]
    ]}>
      {/* ヘッダー */}
      <View style={[
        styles.sidebarHeader,
        responsiveStyles && { padding: responsiveStyles.headerPadding }
      ]}>
        <View style={styles.headerRow}>
          <Text style={[
            styles.appTitle,
            responsiveStyles && { fontSize: responsiveStyles.fontSize.title }
          ]}>
            Lightlist
          </Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              onPress={() => router.push('/settings')}
              style={[styles.headerButton]}
            >
              <Text style={[styles.headerButtonText]}>
                {t('settings.title')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* タスクリスト一覧 */}
      <ScrollView style={styles.sidebarContent}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle]}>
            {t('taskList.title')}
          </Text>
          <TouchableOpacity
            onPress={() => setShowCreateForm(true)}
            style={styles.addButton}
          >
            <Text style={styles.addButtonText}>{t('taskList.add')}</Text>
          </TouchableOpacity>
        </View>

        {/* 作成フォーム */}
        {showCreateForm && (
          <View style={[styles.createForm]}>
            <View style={styles.createInputContainer}>
              <TextInput
                value={newTaskListName}
                onChangeText={(text) => {
                  setNewTaskListName(text);
                  setCreateError(null); // 入力時にエラーをクリア
                }}
                placeholder={t('taskList.enterName')}
                placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                style={[
                  styles.createInput,
                  createError ? styles.createInputError : null
                ]}
                maxLength={50}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleCreateTaskList}
                blurOnSubmit={false}
              />
              <View style={styles.createInputMeta}>
                <Text style={[styles.characterCount]}>
                  {newTaskListName.length}/50
                </Text>
                {createError && (
                  <Text style={[styles.errorText]}>
                    {createError}
                  </Text>
                )}
              </View>
            </View>
            <View style={styles.createButtons}>
              <TouchableOpacity
                onPress={handleCreateTaskList}
                disabled={isCreating || !newTaskListName.trim()}
                style={[
                  styles.createButton, 
                  styles.createButtonPrimary,
                  (isCreating || !newTaskListName.trim()) && styles.createButtonDisabled
                ]}
              >
                {isCreating ? (
                  <View style={styles.createButtonContent}>
                    <ActivityIndicator size="small" color="#FFFFFF" style={styles.loadingSpinner} />
                    <Text style={styles.createButtonText}>{t('taskList.creating')}</Text>
                  </View>
                ) : (
                  <Text style={styles.createButtonText}>{t('common.create')}</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCancelCreate}
                disabled={isCreating}
                style={[
                  styles.createButton, 
                  styles.createButtonSecondary,
                  isCreating && styles.createButtonDisabled
                ]}
              >
                <Text style={styles.createButtonText}>{t('common.cancel')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* タスクリスト一覧 */}
        <View style={styles.taskListContainer}>
          {taskLists.map((taskList) => (
            <TouchableOpacity
              key={taskList.id}
              onPress={() => handleSelectTaskList(taskList.id)}
              style={[
                styles.taskListItem,
                currentTaskListId === taskList.id && styles.taskListItemActive,
              ]}
            >
              <View style={styles.taskListItemContent}>
                <Text style={[styles.taskListName]}>
                  {taskList.name}
                </Text>
                <Text style={[styles.taskListStats]}>
                  {taskList.completedCount}/{taskList.taskCount}
                </Text>
              </View>
              {taskList.color !== '#FFFFFF' && (
                <View
                  style={[styles.taskListColorBar, { backgroundColor: taskList.color }]}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={isDark ? '#FFFFFF' : '#000000'} />
            <Text style={[styles.loadingText]}>
              {t('common.loading')}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );

  if (isDrawer) {
    return (
      <Modal
        visible={isVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={onClose}
      >
        {sidebarContent}
        {/* ドロワー用のクローズボタン */}
        <TouchableOpacity
          style={[styles.drawerCloseButton]}
          onPress={onClose}
        >
          <Text style={[styles.drawerCloseButtonText]}>
            {t('common.close')}
          </Text>
        </TouchableOpacity>
      </Modal>
    );
  }

  return sidebarContent;
};

// メインコンテンツコンポーネント
interface MainContentProps {
  showDrawerButton?: boolean;
  onOpenDrawer?: () => void;
  responsiveStyles?: any;
}

const MainContent: React.FC<MainContentProps> = ({ showDrawerButton = false, onOpenDrawer, responsiveStyles }) => {
  const { currentTasks, currentTaskListId, taskLists, createTask, toggleTask, updateTask, deleteTask, error } = useTaskList();
  const { resolvedTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const [newTaskContent, setNewTaskContent] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [sortMode, setSortMode] = useState<'auto' | 'manual'>('auto');
  const [deletedTask, setDeletedTask] = useState<{task: any, timeoutId: NodeJS.Timeout} | null>(null);

  const isDark = resolvedTheme === 'dark';
  const styles = createTaskListStyles(isDark);
  const currentTaskList = taskLists.find(list => list.id === currentTaskListId);

  // タスクを表示順序でソート
  const sortedTasks = sortMode === 'auto' 
    ? [...currentTasks].sort((a, b) => {
        // 1. 完了状態で並び替え（未完了が上）
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }
        // 2. 同じ完了状態の場合は作成日時で並び替え（新しいものが上）
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      })
    : [...currentTasks]; // 手動モードではオリジナル順序を保持

  const handleCreateTask = async () => {
    if (!newTaskContent.trim()) return;
    
    await createTask(newTaskContent.trim());
    setNewTaskContent('');
  };

  const handleStartEdit = (task: any) => {
    setEditingTaskId(task.id);
    setEditingContent(task.content);
  };

  const handleSaveEdit = async () => {
    if (!editingTaskId || !editingContent.trim()) {
      handleCancelEdit();
      return;
    }

    try {
      // 編集時にも日付解析を実行
      const { content: parsedContent, dueDate } = parseDateFromText(editingContent.trim(), i18n.language);
      
      const updateData: any = {
        content: parsedContent || editingContent.trim(),
      };
      
      // 日付が解析された場合は追加（既存の日付を上書き）
      if (dueDate) {
        updateData.dueDate = dueDate.toISOString();
      }
      
      await updateTask(editingTaskId, updateData);
      setEditingTaskId(null);
      setEditingContent('');
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setEditingContent('');
  };

  const handleDeleteTask = (task: any) => {
    Alert.alert(
      t('task.deleteConfirmTitle'),
      t('task.deleteConfirmMessage', { taskContent: task.content }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            // 即座にUIから削除（楽観的更新）
            const timeoutId = setTimeout(async () => {
              try {
                await deleteTask(task.id);
                setDeletedTask(null);
              } catch (error) {
                console.error('Failed to delete task:', error);
                // エラー時は復元処理が必要だが、deleteTaskが既にエラーハンドリングを持つ
              }
            }, 5000); // 5秒後に実際に削除

            setDeletedTask({ task, timeoutId });
          },
        },
      ]
    );
  };

  const handleUndoDelete = () => {
    if (deletedTask) {
      clearTimeout(deletedTask.timeoutId);
      setDeletedTask(null);
    }
  };

  if (!currentTaskListId) {
    return (
      <View style={[styles.mainContent]}>
        {showDrawerButton && (
          <View style={[styles.mainHeader]}>
            <TouchableOpacity
              style={[styles.drawerButton]}
              onPress={onOpenDrawer}
            >
              <Text style={[styles.drawerButtonText]}>
                ☰
              </Text>
            </TouchableOpacity>
            <Text style={[styles.mainTitle]}>
              Lightlist
            </Text>
          </View>
        )}
        <View style={styles.centered}>
          <Text style={[styles.emptyStateText]}>
            {t('taskList.selectPrompt')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.mainContent]}>
      {/* ヘッダー */}
      <View style={[styles.mainHeader]}>
        <View style={styles.mainHeaderContent}>
          {showDrawerButton && (
            <TouchableOpacity
              style={[styles.drawerButton]}
              onPress={onOpenDrawer}
            >
              <Text style={[styles.drawerButtonText]}>
                ☰
              </Text>
            </TouchableOpacity>
          )}
          <View style={styles.mainTitleContainer}>
            <Text style={[
              styles.mainTitle,
              responsiveStyles && { fontSize: responsiveStyles.fontSize.title }
            ]}>
              {currentTaskList?.name}
            </Text>
            <Text style={[
              styles.mainSubtitle,
              responsiveStyles && { fontSize: responsiveStyles.fontSize.subtitle }
            ]}>
              {sortedTasks.length > 0 
                ? t('task.completedStats', { 
                    completed: sortedTasks.filter(t => t.completed).length,
                    total: sortedTasks.length
                  })
                : t('task.noTasks')
              }
            </Text>
          </View>
          {/* ソート切り替えボタン */}
          {sortedTasks.length > 1 && (
            <TouchableOpacity
              onPress={() => setSortMode(prev => prev === 'auto' ? 'manual' : 'auto')}
              style={[styles.sortButton]}
              accessibilityLabel={sortMode === 'auto' ? t('task.switchToManualSort') : t('task.switchToAutoSort')}
            >
              <Text style={[styles.sortButtonText]}>
                {sortMode === 'auto' ? '📶' : '🔀'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* エラー表示 */}
      {error && (
        <View style={[styles.errorContainer]}>
          <Text style={[styles.errorText]}>
            {error}
          </Text>
        </View>
      )}

      {/* タスク追加フォーム */}
      <View style={styles.addTaskContainer}>
        <View style={styles.addTaskForm}>
          <TextInput
            value={newTaskContent}
            onChangeText={setNewTaskContent}
            placeholder={t('task.enterNew')}
            placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
            style={[
              styles.addTaskInput,
              responsiveStyles && { fontSize: responsiveStyles.fontSize.button }
            ]}
            returnKeyType="done"
            onSubmitEditing={handleCreateTask}
            blurOnSubmit={false}
          />
          <TouchableOpacity
            onPress={handleCreateTask}
            disabled={!newTaskContent.trim()}
            style={[styles.addTaskButton, !newTaskContent.trim() && styles.addTaskButtonDisabled]}
          >
            <Text style={styles.addTaskButtonText}>{t('common.add')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* タスク一覧 */}
      <ScrollView style={styles.taskListScroll}>
        <View style={styles.taskContainer}>
          {sortedTasks.map((task) => (
            <View
              key={task.id}
              style={[styles.taskItem]}
            >
              <TouchableOpacity
                onPress={() => toggleTask(task.id)}
                style={styles.taskCheckbox}
                activeOpacity={0.7}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: task.completed }}
                accessibilityLabel={task.completed ? t('task.markIncomplete') : t('task.markComplete')}
              >
                <View style={[
                  styles.checkbox,
                  task.completed && styles.checkboxChecked,
                ]}>
                  {task.completed && (
                    <Text style={styles.checkboxText}>✓</Text>
                  )}
                </View>
              </TouchableOpacity>
              {editingTaskId === task.id ? (
                <TextInput
                  value={editingContent}
                  onChangeText={setEditingContent}
                  style={[
                    styles.taskEditInput,
                  ]}
                  onBlur={handleSaveEdit}
                  onSubmitEditing={handleSaveEdit}
                  autoFocus
                />
              ) : (
                <TouchableOpacity onLongPress={() => handleStartEdit(task)} style={styles.taskContentContainer}>
                  <Text style={[
                    styles.taskContent,
                    task.completed && styles.taskContentCompleted,
                  ]}>
                    {task.content}
                  </Text>
                </TouchableOpacity>
              )}
              {task.dueDate && (
                <TouchableOpacity 
                  onLongPress={async () => {
                    // 長押しで日付をクリア
                    try {
                      await updateTask(task.id, { dueDate: null });
                    } catch (error) {
                      console.error('Failed to clear due date:', error);
                    }
                  }}
                  style={styles.dueDateContainer}
                  accessibilityLabel={t('task.clearDueDate')}
                >
                  <Text style={[styles.taskDueDate]}>
                    {formatDueDate(new Date(task.dueDate), i18n.language)}
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => handleDeleteTask(task)}
                style={styles.deleteButton}
                accessibilityLabel={t('task.deleteTask')}
              >
                <Text style={styles.deleteButtonText}>{t('common.delete')}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {sortedTasks.length === 0 && (
          <View style={styles.emptyTasksContainer}>
            <Text style={[styles.emptyTasksText]}>
              {t('task.emptyMessage')}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* 削除取り消しバー */}
      {deletedTask && (
        <View style={[styles.undoBar]}>
          <Text style={[styles.undoText]}>
            {t('task.deletedMessage', { taskContent: deletedTask.task.content })}
          </Text>
          <TouchableOpacity onPress={handleUndoDelete} style={styles.undoButton}>
            <Text style={styles.undoButtonText}>{t('common.undo')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

// メインアプリコンポーネント
const TaskListApp: React.FC = () => {
  const [screenData, setScreenData] = useState(Dimensions.get('window'));
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { resolvedTheme } = useTheme();
  
  const isDark = resolvedTheme === 'dark';
  const styles = createTaskListStyles(isDark);

  // 画面サイズ変更の監視
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenData(window);
    });

    return () => subscription?.remove();
  }, []);

  // レスポンシブブレークポイント（Tailwind基準に統一）
  const isSmall = screenData.width < 640;     // < sm: モバイル
  const isMedium = screenData.width >= 640 && screenData.width < 768;  // sm-md: 大きなモバイル
  const isTablet = screenData.width >= 768 && screenData.width < 1024; // md-lg: タブレット
  const isDesktop = screenData.width >= 1024; // lg+: デスクトップ

  // タブレット以上（768px以上）でサイドバー表示
  const isTabletOrLarger = screenData.width >= 768;
  const showDrawerButton = !isTabletOrLarger;
  
  // サイドバー幅の動的調整
  const sidebarWidth = isDesktop ? 320 : isTablet ? 280 : 320;
  
  // レスポンシブスタイル設定
  const responsiveStyles = {
    headerPadding: isSmall ? 12 : isMedium ? 16 : isTablet ? 16 : 20,
    contentPadding: isSmall ? 16 : isMedium ? 20 : isTablet ? 20 : 24,
    fontSize: {
      title: isSmall ? 18 : isMedium ? 20 : isTablet ? 22 : 24,
      subtitle: isSmall ? 12 : isMedium ? 13 : isTablet ? 14 : 14,
      button: isSmall ? 12 : isMedium ? 13 : isTablet ? 14 : 14,
    }
  };

  const handleOpenDrawer = () => {
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  return (
    <TaskListProvider>
      <View style={styles.container}>
        {isTabletOrLarger ? (
          // タブレット・デスクトップ：サイドバー表示
          <>
            <Sidebar width={sidebarWidth} responsiveStyles={responsiveStyles} />
            <MainContent responsiveStyles={responsiveStyles} />
          </>
        ) : (
          // モバイル：ドロワー表示
          <>
            <MainContent 
              showDrawerButton={showDrawerButton}
              onOpenDrawer={handleOpenDrawer}
              responsiveStyles={responsiveStyles}
            />
            <Sidebar 
              isDrawer={true}
              isVisible={isDrawerOpen}
              onClose={handleCloseDrawer}
              width={sidebarWidth}
              responsiveStyles={responsiveStyles}
            />
          </>
        )}
      </View>
    </TaskListProvider>
  );
};

export default TaskListApp;