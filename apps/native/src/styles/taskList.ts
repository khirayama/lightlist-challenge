import { StyleSheet } from 'react-native';
import { colors, fontSize, spacing, borderRadius, fontWeight, shadow, createThemeStyles } from './constants';

export const createTaskListStyles = (isDark: boolean) => {
  const theme = createThemeStyles(isDark);
  
  return StyleSheet.create({
    // コンテナ
    container: {
      flex: 1,
      flexDirection: 'row',
    },
    
    // サイドバー
    sidebar: {
      width: 320,
      borderRightWidth: 1,
      backgroundColor: theme.colors.surface,
      borderRightColor: theme.colors.border,
    },
    sidebarHeader: {
      padding: spacing[4],
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing[4],
    },
    appTitle: {
      fontSize: fontSize.xl,
      fontWeight: fontWeight.bold,
      color: theme.colors.textPrimary,
    },
    headerButtons: {
      flexDirection: 'row',
      gap: spacing[2],
    },
    headerButton: {
      paddingVertical: spacing[1],
      paddingHorizontal: spacing[3],
      borderRadius: borderRadius.default,
      backgroundColor: isDark ? colors.gray[700] : colors.gray[100],
    },
    headerButtonDanger: {
      backgroundColor: colors.red[50],
    },
    headerButtonText: {
      fontSize: fontSize.xs,
      color: theme.colors.textSecondary,
    },
    headerButtonTextDanger: {
      fontSize: fontSize.xs,
      color: colors.red[600],
    },
    sidebarContent: {
      flex: 1,
      padding: spacing[4],
    },
    
    // セクションヘッダー
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing[4],
    },
    sectionTitle: {
      fontSize: fontSize.xl,
      fontWeight: fontWeight.semibold,
      color: theme.colors.textPrimary,
    },
    addButton: {
      backgroundColor: colors.blue[500],
      paddingVertical: spacing[1],
      paddingHorizontal: spacing[3],
      borderRadius: borderRadius.default,
    },
    addButtonText: {
      color: colors.surface,
      fontSize: fontSize.xs,
    },
    
    // 作成フォーム
    createForm: {
      padding: spacing[3],
      borderRadius: borderRadius.lg,
      marginBottom: spacing[4],
      backgroundColor: isDark ? colors.gray[700] : colors.gray[50],
    },
    createInputContainer: {
      marginBottom: spacing[3],
    },
    createInput: {
      borderWidth: 1,
      borderRadius: borderRadius.default,
      paddingVertical: spacing[2],
      paddingHorizontal: spacing[3],
      marginBottom: spacing[1],
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      color: theme.colors.textPrimary,
    },
    createInputError: {
      borderColor: colors.error,
    },
    createInputMeta: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    characterCount: {
      fontSize: fontSize.xs,
      color: theme.colors.textSecondary,
    },
    errorText: {
      fontSize: fontSize.xs,
      color: isDark ? colors.red[400] : colors.red[600],
    },
    createButtons: {
      flexDirection: 'row',
      gap: spacing[2],
    },
    createButton: {
      paddingVertical: spacing[1],
      paddingHorizontal: spacing[3],
      borderRadius: borderRadius.default,
    },
    createButtonPrimary: {
      backgroundColor: colors.green[500],
    },
    createButtonSecondary: {
      backgroundColor: colors.gray[500],
    },
    createButtonDisabled: {
      opacity: 0.5,
    },
    createButtonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[1],
    },
    loadingSpinner: {
      marginRight: spacing[1],
    },
    createButtonText: {
      color: colors.surface,
      fontSize: fontSize.xs,
    },
    
    // タスクリスト一覧
    taskListContainer: {
      gap: spacing[2],
    },
    taskListItem: {
      padding: spacing[3],
      borderRadius: borderRadius.lg,
      borderLeftWidth: 4,
      borderLeftColor: 'transparent',
      backgroundColor: isDark ? colors.gray[700] : colors.gray[50],
    },
    taskListItemActive: {
      backgroundColor: isDark ? colors.blue[800] : colors.blue[100],
      borderLeftColor: colors.blue[500],
    },
    taskListItemContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    taskListName: {
      fontSize: fontSize.base,
      fontWeight: fontWeight.medium,
      color: theme.colors.textPrimary,
    },
    taskListStats: {
      fontSize: fontSize.xs,
      color: theme.colors.textSecondary,
    },
    taskListColorBar: {
      height: spacing[2],
      borderRadius: borderRadius.sm,
      marginTop: spacing[2],
    },
    loadingContainer: {
      alignItems: 'center',
      paddingVertical: spacing[4],
    },
    loadingText: {
      fontSize: fontSize.xs,
      marginTop: spacing[2],
      color: theme.colors.textSecondary,
    },
    
    // メインコンテンツ
    mainContent: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    centered: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    mainHeader: {
      paddingHorizontal: spacing[6],
      paddingVertical: spacing[6],
      borderBottomWidth: 1,
      backgroundColor: theme.colors.surface,
      borderBottomColor: theme.colors.border,
    },
    mainHeaderContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    mainTitleContainer: {
      flex: 1,
    },
    mainTitle: {
      fontSize: fontSize['3xl'],
      fontWeight: fontWeight.bold,
      color: theme.colors.textPrimary,
    },
    mainSubtitle: {
      fontSize: fontSize.base,
      marginTop: spacing[1],
      color: theme.colors.textSecondary,
    },
    
    // ドロワーボタン
    drawerButton: {
      width: 40,
      height: 40,
      borderRadius: borderRadius.lg,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing[3],
      backgroundColor: isDark ? colors.gray[700] : colors.gray[100],
    },
    drawerButtonText: {
      fontSize: fontSize.xl,
      fontWeight: fontWeight.bold,
      color: theme.colors.textPrimary,
    },
    
    // ソートボタン
    sortButton: {
      width: 36,
      height: 36,
      borderRadius: borderRadius.md,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: spacing[2],
      backgroundColor: isDark ? colors.gray[700] : colors.gray[100],
    },
    sortButtonText: {
      fontSize: fontSize.lg,
      color: theme.colors.textPrimary,
    },
    
    // エラー表示
    errorContainer: {
      marginHorizontal: spacing[6],
      marginTop: spacing[4],
      padding: spacing[3],
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      backgroundColor: isDark ? colors.red[800] : colors.red[50],
      borderColor: isDark ? colors.red[700] : colors.red[200],
    },
    errorText: {
      fontSize: fontSize.base,
      color: isDark ? colors.red[400] : colors.red[600],
    },
    
    // タスク追加フォーム
    addTaskContainer: {
      padding: spacing[6],
    },
    addTaskForm: {
      flexDirection: 'row',
      gap: spacing[3],
    },
    addTaskInput: {
      flex: 1,
      borderWidth: 1,
      borderRadius: borderRadius.lg,
      paddingVertical: spacing[2],
      paddingHorizontal: spacing[4],
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      color: theme.colors.textPrimary,
    },
    addTaskButton: {
      backgroundColor: colors.blue[500],
      paddingVertical: spacing[2],
      paddingHorizontal: spacing[6],
      borderRadius: borderRadius.lg,
    },
    addTaskButtonDisabled: {
      opacity: 0.5,
    },
    addTaskButtonText: {
      color: colors.surface,
      fontWeight: fontWeight.semibold,
    },
    
    // タスク一覧
    taskListScroll: {
      flex: 1,
      paddingHorizontal: spacing[6],
      paddingBottom: spacing[6],
    },
    taskContainer: {
      gap: spacing[2],
    },
    taskItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing[4],
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      gap: spacing[3],
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
    },
    
    // チェックボックス
    taskCheckbox: {
      width: 20,
      height: 20,
    },
    checkbox: {
      width: 20,
      height: 20,
      borderRadius: borderRadius.default,
      borderWidth: 2,
      justifyContent: 'center',
      alignItems: 'center',
      borderColor: theme.colors.border,
    },
    checkboxChecked: {
      backgroundColor: colors.blue[500],
      borderColor: colors.blue[500],
    },
    checkboxText: {
      color: colors.surface,
      fontSize: fontSize.xs,
      fontWeight: fontWeight.bold,
    },
    
    // タスク内容
    taskContentContainer: {
      flex: 1,
    },
    taskContent: {
      fontSize: fontSize.lg,
      color: theme.colors.textPrimary,
    },
    taskContentCompleted: {
      textDecorationLine: 'line-through',
      color: theme.colors.textSecondary,
    },
    taskEditInput: {
      flex: 1,
      fontSize: fontSize.lg,
      borderWidth: 1,
      borderRadius: borderRadius.default,
      paddingVertical: spacing[1],
      paddingHorizontal: spacing[2],
      backgroundColor: theme.colors.surface,
      borderColor: colors.blue[500],
      color: theme.colors.textPrimary,
    },
    
    // 日付・削除ボタン
    dueDateContainer: {
      paddingVertical: 2,
      paddingHorizontal: spacing[1],
      borderRadius: borderRadius.sm,
    },
    taskDueDate: {
      fontSize: fontSize.xs,
      color: theme.colors.textSecondary,
    },
    deleteButton: {
      paddingVertical: spacing[1],
      paddingHorizontal: spacing[2],
    },
    deleteButtonText: {
      color: colors.error,
      fontSize: fontSize.xs,
    },
    
    // 空状態
    emptyTasksContainer: {
      alignItems: 'center',
      paddingVertical: spacing[12],
    },
    emptyTasksText: {
      fontSize: fontSize.base,
      textAlign: 'center',
      color: theme.colors.textSecondary,
    },
    emptyStateText: {
      fontSize: fontSize.lg,
      color: theme.colors.textSecondary,
    },
    
    // 削除取り消しバー
    undoBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing[3],
      paddingHorizontal: spacing[4],
      borderTopWidth: 1,
      backgroundColor: isDark ? colors.gray[700] : colors.gray[100],
      borderTopColor: theme.colors.border,
    },
    undoText: {
      flex: 1,
      fontSize: fontSize.base,
      marginRight: spacing[3],
      color: theme.colors.textPrimary,
    },
    undoButton: {
      backgroundColor: colors.blue[500],
      paddingVertical: 6,
      paddingHorizontal: spacing[3],
      borderRadius: borderRadius.default,
    },
    undoButtonText: {
      color: colors.surface,
      fontSize: fontSize.xs,
      fontWeight: fontWeight.semibold,
    },
    
    // ドロワー関連
    drawerSidebar: {
      flex: 1,
      borderRightWidth: 0,
    },
    drawerCloseButton: {
      position: 'absolute',
      bottom: 50,
      right: 20,
      paddingVertical: spacing[3],
      paddingHorizontal: spacing[6],
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
    },
    drawerCloseButtonText: {
      fontSize: fontSize.lg,
      fontWeight: fontWeight.semibold,
      color: theme.colors.textPrimary,
    },
  });
};

// 共通のテキストスタイル（引き続き使用）
export const textStyles = StyleSheet.create({
  textBlack: { color: colors['text-primary'] },
  textWhite: { color: colors.surface },
  textGray300: { color: colors.gray[300] },
  textGray400: { color: colors.gray[400] },
  textGray500: { color: colors.gray[500] },
  textGray700: { color: colors.gray[700] },
});