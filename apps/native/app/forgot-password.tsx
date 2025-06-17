import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { authStyles } from '../src/styles/auth';

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
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/auth/request-password-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
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