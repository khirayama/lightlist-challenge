import { StyleSheet } from 'react-native';

// Tailwindベースの共通カラーパレット
export const colors = {
  primary: '#005AAF',
  secondary: '#0078D4',
  accent: '#00B8A9',
  border: '#D1D5DB',
  background: '#F9FAFB',
  surface: '#FFFFFF',
  success: '#34D399',
  warning: '#FBBF24',
  error: '#EF4444',
  'text-primary': '#111827',
  'text-secondary': '#6B7280',
  'text-disabled': '#9CA3AF',
  
  // ダークモード用カラー
  dark: {
    background: '#111827',
    surface: '#1F2937',
    border: '#374151',
    'text-primary': '#FFFFFF',
    'text-secondary': '#D1D5DB',
    'text-disabled': '#9CA3AF',
  },
  
  // 追加のグレー系統
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  
  // ブルー系統（プライマリカラー）
  blue: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E3A8A',
  },
  
  // グリーン系統（成功・作成ボタン）
  green: {
    500: '#10B981',
    600: '#059669',
  },
  
  // レッド系統（エラー・削除）
  red: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
    800: '#7F1D1D',
  },
};

// フォントサイズ（Tailwindベース）
export const fontSize = {
  xs: 10,    // text-xs
  sm: 12,    // text-sm
  base: 14,  // text-base (Native調整)
  lg: 16,    // text-lg
  xl: 18,    // text-xl
  '2xl': 20, // text-2xl
  '3xl': 24, // text-3xl
};

// 余白・パディング（Tailwindベース - 4pxグリッド）
export const spacing = {
  1: 4,    // p-1
  2: 8,    // p-2
  3: 12,   // p-3
  4: 16,   // p-4
  5: 20,   // p-5
  6: 24,   // p-6
  8: 32,   // p-8
  10: 40,  // p-10
  12: 48,  // p-12
  16: 64,  // p-16
  20: 80,  // p-20
  24: 96,  // p-24
};

// ボーダー半径（Tailwindベース）
export const borderRadius = {
  none: 0,
  sm: 2,     // rounded-sm
  default: 4, // rounded
  md: 6,     // rounded-md
  lg: 8,     // rounded-lg
  xl: 12,    // rounded-xl
  '2xl': 16, // rounded-2xl
  full: 9999, // rounded-full
};

// フォントウェイト
export const fontWeight = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

// シャドウ（Tailwindベース）
export const shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },
};

// レスポンシブブレークポイント（Tailwindベース）
export const breakpoints = {
  sm: 640,   // モバイル-タブレット境界
  md: 768,   // タブレット-デスクトップ境界
  lg: 1024,  // デスクトップ
  xl: 1280,  // 大画面デスクトップ
};

// 共通スタイルヘルパー
export const createThemeStyles = (isDark: boolean) => ({
  colors: {
    background: isDark ? colors.dark.background : colors.background,
    surface: isDark ? colors.dark.surface : colors.surface,
    border: isDark ? colors.dark.border : colors.border,
    primary: colors.primary,
    secondary: colors.secondary,
    accent: colors.accent,
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    textPrimary: isDark ? colors.dark['text-primary'] : colors['text-primary'],
    textSecondary: isDark ? colors.dark['text-secondary'] : colors['text-secondary'],
    textDisabled: isDark ? colors.dark['text-disabled'] : colors['text-disabled'],
  },
});

// 共通コンポーネントスタイル
export const commonStyles = StyleSheet.create({
  // フレックス関連
  flex1: { flex: 1 },
  flexRow: { flexDirection: 'row' },
  flexColumn: { flexDirection: 'column' },
  justifyCenter: { justifyContent: 'center' },
  justifyBetween: { justifyContent: 'space-between' },
  alignCenter: { alignItems: 'center' },
  
  // 位置関連
  absolute: { position: 'absolute' },
  relative: { position: 'relative' },
  
  // テキスト関連
  textCenter: { textAlign: 'center' },
  textBold: { fontWeight: fontWeight.bold },
  textSemibold: { fontWeight: fontWeight.semibold },
  textMedium: { fontWeight: fontWeight.medium },
  
  // ボーダー関連
  borderRadius: { borderRadius: borderRadius.default },
  borderRadiusMd: { borderRadius: borderRadius.md },
  borderRadiusLg: { borderRadius: borderRadius.lg },
  
  // シャドウ関連
  shadowSm: shadow.sm,
  shadowMd: shadow.md,
  shadowLg: shadow.lg,
});