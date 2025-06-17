import React from 'react';
import { View, ActivityIndicator, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface LoadingProps {
  size?: 'small' | 'large';
  color?: string;
}

export function Loading({ size = 'small', color }: LoadingProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  
  const defaultColor = color || (isDark ? '#FFFFFF' : '#005AAF');

  return <ActivityIndicator size={size} color={defaultColor} />;
}

interface LoadingButtonProps {
  loading: boolean;
  children: React.ReactNode;
  disabled?: boolean;
  onPress?: () => void;
  style?: any;
  textStyle?: any;
}

export function LoadingButton({ 
  loading, 
  children, 
  disabled, 
  onPress, 
  style,
  textStyle 
}: LoadingButtonProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading || disabled}
      style={[
        styles.button,
        (loading || disabled) && styles.buttonDisabled,
        style
      ]}
    >
      <View style={styles.buttonContent}>
        {loading && <Loading size="small" color="#FFFFFF" />}
        <Text style={[styles.buttonText, textStyle]}>
          {children}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

interface LoadingOverlayProps {
  loading: boolean;
  children: React.ReactNode;
  style?: any;
}

export function LoadingOverlay({ loading, children, style }: LoadingOverlayProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <View style={[styles.container, style]}>
      {children}
      {loading && (
        <View style={[
          styles.overlay,
          { backgroundColor: isDark ? 'rgba(17, 24, 39, 0.5)' : 'rgba(255, 255, 255, 0.5)' }
        ]}>
          <Loading size="large" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#005AAF',
    borderRadius: 6,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '500',
  },
  container: {
    position: 'relative',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});