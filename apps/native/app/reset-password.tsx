import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { authStyles } from '../src/styles/auth';

export default function ResetPasswordScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token: string }>();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      Alert.alert(t('auth.error'), 'Invalid reset link', [
        { text: 'OK', onPress: () => router.replace('/login') },
      ]);
    }
  }, [token, router, t]);

  const handleSubmit = async () => {
    if (!password.trim() || !confirmPassword.trim()) {
      Alert.alert(t('auth.error'), t('auth.passwordRequired'));
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(t('auth.error'), t('auth.passwordMismatch'));
      return;
    }

    if (!token) {
      Alert.alert(t('auth.error'), 'Invalid token');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      if (response.ok) {
        Alert.alert(
          t('auth.passwordResetSuccess'),
          t('auth.passwordResetSuccessDescription'),
          [
            {
              text: 'OK',
              onPress: () => router.replace('/login'),
            },
          ]
        );
      } else {
        const data = await response.json();
        Alert.alert(t('auth.error'), data.error || t('auth.unknownError'));
      }
    } catch (error) {
      Alert.alert(t('auth.error'), t('auth.networkError'));
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <View style={authStyles.container}>
        <View style={authStyles.content}>
          <Text style={authStyles.title}>{t('auth.error')}</Text>
          <Text style={authStyles.description}>Invalid reset link</Text>
          <TouchableOpacity
            style={authStyles.button}
            onPress={() => router.replace('/login')}
          >
            <Text style={authStyles.buttonText}>{t('auth.backToLogin')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={authStyles.container} contentContainerStyle={authStyles.content}>
      <View style={authStyles.card}>
        <Text style={authStyles.title}>{t('auth.resetPassword')}</Text>
        <Text style={authStyles.description}>{t('auth.enterNewPassword')}</Text>

        <View style={authStyles.form}>
          <View style={authStyles.inputGroup}>
            <Text style={authStyles.label}>{t('auth.password')}</Text>
            <TextInput
              style={authStyles.input}
              value={password}
              onChangeText={setPassword}
              placeholder={t('auth.newPasswordPlaceholder')}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="new-password"
            />
          </View>

          <View style={authStyles.inputGroup}>
            <Text style={authStyles.label}>{t('auth.confirmPassword')}</Text>
            <TextInput
              style={authStyles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder={t('auth.confirmPasswordPlaceholder')}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="new-password"
            />
          </View>

          <TouchableOpacity
            style={[authStyles.button, isLoading && authStyles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <Text style={authStyles.buttonText}>
              {isLoading ? t('auth.resetting') : t('auth.resetPassword')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={authStyles.linkButton}
            onPress={() => router.replace('/login')}
          >
            <Text style={authStyles.linkText}>{t('auth.backToLogin')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}