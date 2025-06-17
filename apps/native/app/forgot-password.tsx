import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { authStyles } from '../src/styles/auth';
import { authService } from '../src/lib/auth';

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      Alert.alert(t('auth.error'), t('auth.emailRequired'));
      return;
    }

    setIsLoading(true);

    try {
      await authService.requestPasswordReset(email);
      Alert.alert(
        t('auth.checkEmail'),
        t('auth.passwordResetEmailSent'),
        [
          {
            text: 'OK',
            onPress: () => router.replace('/login'),
          },
        ]
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('auth.unknownError');
      Alert.alert(t('auth.error'), errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={authStyles.container} contentContainerStyle={authStyles.content}>
      <View style={authStyles.card}>
        <Text style={authStyles.title}>{t('auth.forgotPassword')}</Text>
        <Text style={authStyles.description}>{t('auth.forgotPasswordDescription')}</Text>

        <View style={authStyles.form}>
          <View style={authStyles.inputGroup}>
            <Text style={authStyles.label}>{t('auth.email')}</Text>
            <TextInput
              style={authStyles.input}
              value={email}
              onChangeText={setEmail}
              placeholder={t('auth.emailPlaceholder')}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <TouchableOpacity
            style={[authStyles.button, isLoading && authStyles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <Text style={authStyles.buttonText}>
              {isLoading ? t('auth.sending') : t('auth.sendResetLink')}
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