import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
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
import { formatDueDate } from '../lib/dateParser';

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
  const { logout } = useAuth();
  const { resolvedTheme } = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTaskListName, setNewTaskListName] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const isDark = resolvedTheme === 'dark';

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

  const handleLogout = async () => {
    Alert.alert(
      t('auth.logout'),
      t('auth.logoutConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('auth.logout'),
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
        },
      ]
    );
  };

  const handleSelectTaskList = (taskListId: string) => {
    selectTaskList(taskListId);
    if (isDrawer && onClose) {
      onClose();
    }
  };

  const sidebarContent = (
    <View style={[
      isDrawer ? styles.drawerSidebar : [styles.sidebar, { width }], 
      isDark ? styles.sidebarDark : styles.sidebarLight
    ]}>
      {/* ヘッダー */}
      <View style={[
        styles.sidebarHeader, 
        isDark ? styles.sidebarHeaderDark : styles.sidebarHeaderLight,
        responsiveStyles && { padding: responsiveStyles.headerPadding }
      ]}>
        <View style={styles.headerRow}>
          <Text style={[
            styles.appTitle, 
            isDark ? styles.textWhite : styles.textBlack,
            responsiveStyles && { fontSize: responsiveStyles.fontSize.title }
          ]}>
            Lightlist
          </Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              onPress={() => router.push('/settings')}
              style={[styles.headerButton, isDark ? styles.headerButtonDark : styles.headerButtonLight]}
            >
              <Text style={[styles.headerButtonText, isDark ? styles.textGray300 : styles.textGray700]}>
                {t('settings.title')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleLogout}
              style={[styles.headerButton, styles.headerButtonDanger]}
            >
              <Text style={styles.headerButtonTextDanger}>
                {t('auth.logout')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* タスクリスト一覧 */}
      <ScrollView style={styles.sidebarContent}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, isDark ? styles.textWhite : styles.textBlack]}>
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
          <View style={[styles.createForm, isDark ? styles.createFormDark : styles.createFormLight]}>
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
                  isDark ? styles.createInputDark : styles.createInputLight,
                  createError ? styles.createInputError : null
                ]}
                maxLength={50}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleCreateTaskList}
                blurOnSubmit={false}
              />
              <View style={styles.createInputMeta}>
                <Text style={[styles.characterCount, isDark ? styles.textGray400 : styles.textGray500]}>
                  {newTaskListName.length}/50
                </Text>
                {createError && (
                  <Text style={[styles.errorText, isDark ? styles.errorTextDark : styles.errorTextLight]}>
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
                currentTaskListId === taskList.id
                  ? isDark ? styles.taskListItemActiveDark : styles.taskListItemActiveLight
                  : isDark ? styles.taskListItemDark : styles.taskListItemLight,
                currentTaskListId === taskList.id && styles.taskListItemBorder,
              ]}
            >
              <View style={styles.taskListItemContent}>
                <Text style={[styles.taskListName, isDark ? styles.textWhite : styles.textBlack]}>
                  {taskList.name}
                </Text>
                <Text style={[styles.taskListStats, isDark ? styles.textGray400 : styles.textGray500]}>
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
            <Text style={[styles.loadingText, isDark ? styles.textGray400 : styles.textGray500]}>
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
          style={[styles.drawerCloseButton, isDark ? styles.drawerCloseButtonDark : styles.drawerCloseButtonLight]}
          onPress={onClose}
        >
          <Text style={[styles.drawerCloseButtonText, isDark ? styles.textWhite : styles.textBlack]}>
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
      <View style={[styles.mainContent, isDark ? styles.mainContentDark : styles.mainContentLight]}>
        {showDrawerButton && (
          <View style={[styles.mainHeader, isDark ? styles.mainHeaderDark : styles.mainHeaderLight]}>
            <TouchableOpacity
              style={[styles.drawerButton, isDark ? styles.drawerButtonDark : styles.drawerButtonLight]}
              onPress={onOpenDrawer}
            >
              <Text style={[styles.drawerButtonText, isDark ? styles.textWhite : styles.textBlack]}>
                ☰
              </Text>
            </TouchableOpacity>
            <Text style={[styles.mainTitle, isDark ? styles.textWhite : styles.textBlack]}>
              Lightlist
            </Text>
          </View>
        )}
        <View style={styles.centered}>
          <Text style={[styles.emptyStateText, isDark ? styles.textGray400 : styles.textGray500]}>
            {t('taskList.selectPrompt')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.mainContent, isDark ? styles.mainContentDark : styles.mainContentLight]}>
      {/* ヘッダー */}
      <View style={[styles.mainHeader, isDark ? styles.mainHeaderDark : styles.mainHeaderLight]}>
        <View style={styles.mainHeaderContent}>
          {showDrawerButton && (
            <TouchableOpacity
              style={[styles.drawerButton, isDark ? styles.drawerButtonDark : styles.drawerButtonLight]}
              onPress={onOpenDrawer}
            >
              <Text style={[styles.drawerButtonText, isDark ? styles.textWhite : styles.textBlack]}>
                ☰
              </Text>
            </TouchableOpacity>
          )}
          <View style={styles.mainTitleContainer}>
            <Text style={[
              styles.mainTitle, 
              isDark ? styles.textWhite : styles.textBlack,
              responsiveStyles && { fontSize: responsiveStyles.fontSize.title }
            ]}>
              {currentTaskList?.name}
            </Text>
            <Text style={[
              styles.mainSubtitle, 
              isDark ? styles.textGray400 : styles.textGray500,
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
              style={[styles.sortButton, isDark ? styles.sortButtonDark : styles.sortButtonLight]}
              accessibilityLabel={sortMode === 'auto' ? t('task.switchToManualSort') : t('task.switchToAutoSort')}
            >
              <Text style={[styles.sortButtonText, isDark ? styles.textWhite : styles.textBlack]}>
                {sortMode === 'auto' ? '📶' : '🔀'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* エラー表示 */}
      {error && (
        <View style={[styles.errorContainer, isDark ? styles.errorContainerDark : styles.errorContainerLight]}>
          <Text style={[styles.errorText, isDark ? styles.errorTextDark : styles.errorTextLight]}>
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
              isDark ? styles.addTaskInputDark : styles.addTaskInputLight,
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
              style={[styles.taskItem, isDark ? styles.taskItemDark : styles.taskItemLight]}
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
                  isDark ? styles.checkboxDark : styles.checkboxLight,
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
                    isDark ? styles.taskEditInputDark : styles.taskEditInputLight,
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
                    isDark ? styles.textWhite : styles.textBlack,
                    task.completed && (isDark ? styles.textGray400 : styles.textGray500),
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
                  <Text style={[styles.taskDueDate, isDark ? styles.textGray400 : styles.textGray500]}>
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
            <Text style={[styles.emptyTasksText, isDark ? styles.textGray400 : styles.textGray500]}>
              {t('task.emptyMessage')}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* 削除取り消しバー */}
      {deletedTask && (
        <View style={[styles.undoBar, isDark ? styles.undoBarDark : styles.undoBarLight]}>
          <Text style={[styles.undoText, isDark ? styles.textWhite : styles.textBlack]}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 320,
    borderRightWidth: 1,
  },
  sidebarLight: {
    backgroundColor: '#FFFFFF',
    borderRightColor: '#E5E7EB',
  },
  sidebarDark: {
    backgroundColor: '#1F2937',
    borderRightColor: '#374151',
  },
  sidebarHeader: {
    padding: 16,
    borderBottomWidth: 1,
  },
  sidebarHeaderLight: {
    borderBottomColor: '#E5E7EB',
  },
  sidebarHeaderDark: {
    borderBottomColor: '#374151',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  headerButtonLight: {
    backgroundColor: '#F3F4F6',
  },
  headerButtonDark: {
    backgroundColor: '#374151',
  },
  headerButtonDanger: {
    backgroundColor: '#FEF2F2',
  },
  headerButtonText: {
    fontSize: 12,
  },
  headerButtonTextDanger: {
    fontSize: 12,
    color: '#DC2626',
  },
  sidebarContent: {
    flex: 1,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  createForm: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  createFormLight: {
    backgroundColor: '#F9FAFB',
  },
  createFormDark: {
    backgroundColor: '#374151',
  },
  createInputContainer: {
    marginBottom: 12,
  },
  createInput: {
    borderWidth: 1,
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  createInputLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D1D5DB',
    color: '#111827',
  },
  createInputDark: {
    backgroundColor: '#1F2937',
    borderColor: '#4B5563',
    color: '#FFFFFF',
  },
  createInputError: {
    borderColor: '#EF4444',
  },
  createInputMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  characterCount: {
    fontSize: 10,
  },
  errorText: {
    fontSize: 10,
  },
  errorTextLight: {
    color: '#DC2626',
  },
  errorTextDark: {
    color: '#FCA5A5',
  },
  createButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  createButton: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  createButtonPrimary: {
    backgroundColor: '#10B981',
  },
  createButtonSecondary: {
    backgroundColor: '#6B7280',
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  loadingSpinner: {
    marginRight: 4,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  taskListContainer: {
    gap: 8,
  },
  taskListItem: {
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
  },
  taskListItemLight: {
    backgroundColor: '#F9FAFB',
  },
  taskListItemDark: {
    backgroundColor: '#374151',
  },
  taskListItemActiveLight: {
    backgroundColor: '#DBEAFE',
  },
  taskListItemActiveDark: {
    backgroundColor: '#1E3A8A',
  },
  taskListItemBorder: {
    borderLeftColor: '#3B82F6',
  },
  taskListItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskListName: {
    fontSize: 14,
    fontWeight: '500',
  },
  taskListStats: {
    fontSize: 12,
  },
  taskListColorBar: {
    height: 8,
    borderRadius: 2,
    marginTop: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  loadingText: {
    fontSize: 12,
    marginTop: 8,
  },
  mainContent: {
    flex: 1,
  },
  mainContentLight: {
    backgroundColor: '#F9FAFB',
  },
  mainContentDark: {
    backgroundColor: '#111827',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainHeader: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    borderBottomWidth: 1,
  },
  mainHeaderLight: {
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#E5E7EB',
  },
  mainHeaderDark: {
    backgroundColor: '#1F2937',
    borderBottomColor: '#374151',
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  mainSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  errorContainer: {
    marginHorizontal: 24,
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  errorContainerLight: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  errorContainerDark: {
    backgroundColor: '#7F1D1D',
    borderColor: '#B91C1C',
  },
  errorText: {
    fontSize: 14,
  },
  errorTextLight: {
    color: '#B91C1C',
  },
  errorTextDark: {
    color: '#FCA5A5',
  },
  addTaskContainer: {
    padding: 24,
  },
  addTaskForm: {
    flexDirection: 'row',
    gap: 12,
  },
  addTaskInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  addTaskInputLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D1D5DB',
    color: '#111827',
  },
  addTaskInputDark: {
    backgroundColor: '#1F2937',
    borderColor: '#4B5563',
    color: '#FFFFFF',
  },
  addTaskButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  addTaskButtonDisabled: {
    opacity: 0.5,
  },
  addTaskButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  taskListScroll: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  taskContainer: {
    gap: 8,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
  },
  taskItemLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
  },
  taskItemDark: {
    backgroundColor: '#1F2937',
    borderColor: '#374151',
  },
  taskCheckbox: {
    width: 20,
    height: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxLight: {
    borderColor: '#D1D5DB',
  },
  checkboxDark: {
    borderColor: '#4B5563',
  },
  checkboxChecked: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  checkboxText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  taskContentContainer: {
    flex: 1,
  },
  taskContent: {
    fontSize: 16,
  },
  taskContentCompleted: {
    textDecorationLine: 'line-through',
  },
  taskEditInput: {
    flex: 1,
    fontSize: 16,
    borderWidth: 1,
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  taskEditInputLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#3B82F6',
    color: '#111827',
  },
  taskEditInputDark: {
    backgroundColor: '#1F2937',
    borderColor: '#3B82F6',
    color: '#FFFFFF',
  },
  taskDueDate: {
    fontSize: 12,
  },
  deleteButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  deleteButtonText: {
    color: '#EF4444',
    fontSize: 12,
  },
  emptyTasksContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTasksText: {
    fontSize: 14,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
  },
  // 共通テキストスタイル
  textBlack: {
    color: '#111827',
  },
  textWhite: {
    color: '#FFFFFF',
  },
  textGray300: {
    color: '#D1D5DB',
  },
  textGray400: {
    color: '#9CA3AF',
  },
  textGray500: {
    color: '#6B7280',
  },
  textGray700: {
    color: '#374151',
  },
  // ドロワー関連スタイル
  drawerSidebar: {
    flex: 1,
    borderRightWidth: 0,
  },
  drawerCloseButton: {
    position: 'absolute',
    bottom: 50,
    right: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
  },
  drawerCloseButtonLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D1D5DB',
  },
  drawerCloseButtonDark: {
    backgroundColor: '#374151',
    borderColor: '#4B5563',
  },
  drawerCloseButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  // ドロワーボタン関連スタイル
  drawerButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  drawerButtonLight: {
    backgroundColor: '#F3F4F6',
  },
  drawerButtonDark: {
    backgroundColor: '#374151',
  },
  drawerButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  // メインヘッダー関連スタイル
  mainHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mainTitleContainer: {
    flex: 1,
  },
  // ソートボタン関連スタイル
  sortButton: {
    width: 36,
    height: 36,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sortButtonLight: {
    backgroundColor: '#F3F4F6',
  },
  sortButtonDark: {
    backgroundColor: '#374151',
  },
  sortButtonText: {
    fontSize: 16,
  },
  // 削除取り消しバー関連スタイル
  undoBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
  },
  undoBarLight: {
    backgroundColor: '#F3F4F6',
    borderTopColor: '#E5E7EB',
  },
  undoBarDark: {
    backgroundColor: '#374151',
    borderTopColor: '#4B5563',
  },
  undoText: {
    flex: 1,
    fontSize: 14,
    marginRight: 12,
  },
  undoButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  undoButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  // 日付関連スタイル
  dueDateContainer: {
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderRadius: 3,
  },
});

export default TaskListApp;