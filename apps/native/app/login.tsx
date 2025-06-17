import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../src/contexts/AuthContext';
import { useTheme } from '../src/contexts/ThemeContext';

export default function LoginPage() {
  const { t } = useTranslation('common');
  const { login, isLoading } = useAuth();
  const { resolvedTheme } = useTheme();
  const router = useRouter();
  
  const isDark = resolvedTheme === 'dark';

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleSubmit = async () => {
    setError('');

    try {
      await login(formData.email, formData.password);
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.loginError'));
    }
  };

  return (
    <ScrollView style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
      <View style={styles.content}>
        <View style={styles.card}>
          <View style={[styles.cardInner, isDark ? styles.cardDark : styles.cardLight]}>
            <Text style={[styles.title, isDark ? styles.titleDark : styles.titleLight]}>
              {t('auth.login')}
            </Text>
            
            <View style={styles.form}>
              <View style={styles.field}>
                <Text style={[styles.label, isDark ? styles.labelDark : styles.labelLight]}>
                  {t('auth.email')} <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  value={formData.email}
                  onChangeText={(value) => handleChange('email', value)}
                  placeholder={t('auth.emailPlaceholder')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={[styles.input, isDark ? styles.inputDark : styles.inputLight]}
                  placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                />
              </View>

              <View style={styles.field}>
                <View style={styles.labelRow}>
                  <Text style={[styles.label, isDark ? styles.labelDark : styles.labelLight]}>
                    {t('auth.password')} <Text style={styles.required}>*</Text>
                  </Text>
                  <TouchableOpacity onPress={() => router.push('/forgot-password')}>
                    <Text style={styles.link}>{t('auth.forgotPassword')}</Text>
                  </TouchableOpacity>
                </View>
                <TextInput
                  value={formData.password}
                  onChangeText={(value) => handleChange('password', value)}
                  placeholder={t('auth.passwordPlaceholder')}
                  secureTextEntry
                  style={[styles.input, isDark ? styles.inputDark : styles.inputLight]}
                  placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                />
              </View>

              {error ? (
                <View style={[styles.error, isDark ? styles.errorDark : styles.errorLight]}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isLoading}
                style={[styles.button, isLoading && styles.buttonDisabled]}
              >
                <Text style={styles.buttonText}>
                  {isLoading ? t('auth.loggingIn') : t('auth.login')}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={[styles.footerText, isDark ? styles.footerTextDark : styles.footerTextLight]}>
                {t('auth.noAccount')}{' '}
                <Text 
                  style={styles.link}
                  onPress={() => router.push('/register')}
                >
                  {t('auth.register')}
                </Text>
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerLight: {
    backgroundColor: '#F9FAFB',
  },
  containerDark: {
    backgroundColor: '#111827',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    minHeight: '100%',
  },
  card: {
    width: '100%',
    maxWidth: 400,
  },
  cardInner: {
    borderRadius: 8,
    padding: 32,
  },
  cardLight: {
    backgroundColor: '#FFFFFF',
  },
  cardDark: {
    backgroundColor: '#1F2937',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  titleLight: {
    color: '#111827',
  },
  titleDark: {
    color: '#FFFFFF',
  },
  form: {
    gap: 16,
  },
  field: {
    gap: 4,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  labelLight: {
    color: '#111827',
  },
  labelDark: {
    color: '#D1D5DB',
  },
  required: {
    color: '#EF4444',
  },
  input: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 6,
    fontSize: 16,
  },
  inputLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D1D5DB',
    color: '#111827',
  },
  inputDark: {
    backgroundColor: '#374151',
    borderColor: '#4B5563',
    color: '#FFFFFF',
  },
  error: {
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
  },
  errorLight: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  errorDark: {
    backgroundColor: '#7F1D1D',
    borderColor: '#DC2626',
  },
  errorText: {
    fontSize: 14,
    color: '#DC2626',
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#005AAF',
    borderRadius: 6,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '500',
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
  },
  footerTextLight: {
    color: '#6B7280',
  },
  footerTextDark: {
    color: '#9CA3AF',
  },
  link: {
    color: '#005AAF',
    fontWeight: '500',
  },
});