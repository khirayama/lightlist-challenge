import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useToast, Toast, ToastType } from '../contexts/ToastContext';
import { useTheme } from '../contexts/ThemeContext';

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
  isDark: boolean;
}

function ToastItem({ toast, onRemove, isDark }: ToastItemProps) {
  const getToastStyles = (type: ToastType) => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: isDark ? 'rgba(34, 197, 94, 0.1)' : '#F0FDF4',
          borderColor: isDark ? '#16A34A' : '#BBF7D0',
          textColor: isDark ? '#4ADE80' : '#15803D',
        };
      case 'error':
        return {
          backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#FEF2F2',
          borderColor: isDark ? '#DC2626' : '#FECACA',
          textColor: isDark ? '#F87171' : '#DC2626',
        };
      case 'warning':
        return {
          backgroundColor: isDark ? 'rgba(245, 158, 11, 0.1)' : '#FFFBEB',
          borderColor: isDark ? '#D97706' : '#FED7AA',
          textColor: isDark ? '#FACC15' : '#D97706',
        };
      case 'info':
        return {
          backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#EFF6FF',
          borderColor: isDark ? '#3B82F6' : '#BFDBFE',
          textColor: isDark ? '#60A5FA' : '#1D4ED8',
        };
      default:
        return {
          backgroundColor: isDark ? 'rgba(107, 114, 128, 0.1)' : '#F9FAFB',
          borderColor: isDark ? '#6B7280' : '#D1D5DB',
          textColor: isDark ? '#9CA3AF' : '#374151',
        };
    }
  };

  const toastStyles = getToastStyles(toast.type);

  return (
    <View style={[
      styles.toastItem,
      {
        backgroundColor: toastStyles.backgroundColor,
        borderColor: toastStyles.borderColor,
      }
    ]}>
      <View style={styles.toastContent}>
        <Text style={[styles.toastMessage, { color: toastStyles.textColor }]}>
          {toast.message}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => onRemove(toast.id)}
        style={styles.closeButton}
      >
        <Text style={[styles.closeButtonText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
          ×
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export function ToastContainer() {
  const { toasts, removeToast } = useToast();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  if (toasts.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={removeToast}
          isDark={isDark}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    right: 16,
    left: 16,
    zIndex: 9999,
    gap: 8,
  },
  toastItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  toastContent: {
    flex: 1,
    marginRight: 12,
  },
  toastMessage: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 18,
  },
});