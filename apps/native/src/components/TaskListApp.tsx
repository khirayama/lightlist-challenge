import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { TaskListProvider, useTaskList } from '../contexts/TaskListContext';

// サイドバーコンポーネント（タブレット・デスクトップ用）
const Sidebar: React.FC = () => {
  const { taskLists, currentTaskListId, selectTaskList, createTaskList, isLoading } = useTaskList();
  const { logout } = useAuth();
  const { resolvedTheme } = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTaskListName, setNewTaskListName] = useState('');

  const isDark = resolvedTheme === 'dark';

  const handleCreateTaskList = async () => {
    if (!newTaskListName.trim()) return;
    
    await createTaskList({ name: newTaskListName.trim() });
    setNewTaskListName('');
    setShowCreateForm(false);
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

  return (
    <View style={[styles.sidebar, isDark ? styles.sidebarDark : styles.sidebarLight]}>
      {/* ヘッダー */}
      <View style={[styles.sidebarHeader, isDark ? styles.sidebarHeaderDark : styles.sidebarHeaderLight]}>
        <View style={styles.headerRow}>
          <Text style={[styles.appTitle, isDark ? styles.textWhite : styles.textBlack]}>
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
            <TextInput
              value={newTaskListName}
              onChangeText={setNewTaskListName}
              placeholder={t('taskList.enterName')}
              placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
              style={[styles.createInput, isDark ? styles.createInputDark : styles.createInputLight]}
              autoFocus
            />
            <View style={styles.createButtons}>
              <TouchableOpacity
                onPress={handleCreateTaskList}
                disabled={isLoading || !newTaskListName.trim()}
                style={[styles.createButton, styles.createButtonPrimary]}
              >
                <Text style={styles.createButtonText}>{t('common.create')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setShowCreateForm(false);
                  setNewTaskListName('');
                }}
                style={[styles.createButton, styles.createButtonSecondary]}
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
              onPress={() => selectTaskList(taskList.id)}
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
};

// メインコンテンツコンポーネント
const MainContent: React.FC = () => {
  const { currentTasks, currentTaskListId, taskLists, createTask, toggleTask, deleteTask, error } = useTaskList();
  const { resolvedTheme } = useTheme();
  const { t } = useTranslation();
  const [newTaskContent, setNewTaskContent] = useState('');

  const isDark = resolvedTheme === 'dark';
  const currentTaskList = taskLists.find(list => list.id === currentTaskListId);

  const handleCreateTask = async () => {
    if (!newTaskContent.trim()) return;
    
    await createTask(newTaskContent.trim());
    setNewTaskContent('');
  };

  if (!currentTaskListId) {
    return (
      <View style={[styles.mainContent, styles.centered, isDark ? styles.mainContentDark : styles.mainContentLight]}>
        <Text style={[styles.emptyStateText, isDark ? styles.textGray400 : styles.textGray500]}>
          {t('taskList.selectPrompt')}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.mainContent, isDark ? styles.mainContentDark : styles.mainContentLight]}>
      {/* ヘッダー */}
      <View style={[styles.mainHeader, isDark ? styles.mainHeaderDark : styles.mainHeaderLight]}>
        <Text style={[styles.mainTitle, isDark ? styles.textWhite : styles.textBlack]}>
          {currentTaskList?.name}
        </Text>
        <Text style={[styles.mainSubtitle, isDark ? styles.textGray400 : styles.textGray500]}>
          {currentTasks.length > 0 
            ? t('task.completedStats', { 
                completed: currentTasks.filter(t => t.completed).length,
                total: currentTasks.length
              })
            : t('task.noTasks')
          }
        </Text>
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
            style={[styles.addTaskInput, isDark ? styles.addTaskInputDark : styles.addTaskInputLight]}
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
          {currentTasks.map((task) => (
            <View
              key={task.id}
              style={[styles.taskItem, isDark ? styles.taskItemDark : styles.taskItemLight]}
            >
              <TouchableOpacity
                onPress={() => toggleTask(task.id)}
                style={styles.taskCheckbox}
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
              <Text style={[
                styles.taskContent,
                task.completed && styles.taskContentCompleted,
                isDark ? styles.textWhite : styles.textBlack,
                task.completed && (isDark ? styles.textGray400 : styles.textGray500),
              ]}>
                {task.content}
              </Text>
              {task.dueDate && (
                <Text style={[styles.taskDueDate, isDark ? styles.textGray400 : styles.textGray500]}>
                  {new Date(task.dueDate).toLocaleDateString()}
                </Text>
              )}
              <TouchableOpacity
                onPress={() => deleteTask(task.id)}
                style={styles.deleteButton}
              >
                <Text style={styles.deleteButtonText}>{t('common.delete')}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {currentTasks.length === 0 && (
          <View style={styles.emptyTasksContainer}>
            <Text style={[styles.emptyTasksText, isDark ? styles.textGray400 : styles.textGray500]}>
              {t('task.emptyMessage')}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

// メインアプリコンポーネント
const TaskListApp: React.FC = () => {
  return (
    <TaskListProvider>
      <View style={styles.container}>
        <Sidebar />
        <MainContent />
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
  createInput: {
    borderWidth: 1,
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
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
  taskContent: {
    flex: 1,
    fontSize: 16,
  },
  taskContentCompleted: {
    textDecorationLine: 'line-through',
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
});

export default TaskListApp;