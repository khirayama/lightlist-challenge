import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { Link, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../src/lib/i18n/useLanguage';
import { useTheme } from '../src/contexts/ThemeContext';
import { useAuth } from '../src/contexts/AuthContext';
import { authService } from '../src/lib/auth';
import { useEffect, useState } from 'react';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage } = useLanguage();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { user, isAuthenticated, refreshAuth } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  
  const isDark = resolvedTheme === 'dark';

  // ログイン時に設定とプロフィールを取得
  useEffect(() => {
    if (isAuthenticated && user) {
      loadSettings();
      loadProfile();
    }
  }, [isAuthenticated, user]);

  const loadSettings = async () => {
    if (!user) return;
    
    try {
      const response = await authService.getSettings(user.id);
      setTheme(response.settings.theme);
      changeLanguage(response.settings.language);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const loadProfile = async () => {
    if (!user) return;
    
    try {
      const profile = await authService.getProfile(user.id);
      setName(profile.name || '');
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const handleThemeChange = async (newTheme: 'system' | 'light' | 'dark') => {
    setTheme(newTheme);
    
    if (isAuthenticated && user) {
      try {
        setIsLoading(true);
        await authService.updateSettings(user.id, { theme: newTheme });
      } catch (error) {
        console.error('Failed to update theme:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleLanguageChange = async (lang: 'ja' | 'en') => {
    changeLanguage(lang);
    
    if (isAuthenticated && user) {
      try {
        setIsLoading(true);
        await authService.updateSettings(user.id, { language: lang });
      } catch (error) {
        console.error('Failed to update language:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleNameUpdate = async () => {
    if (!user || !name.trim()) {
      Alert.alert(t('common.error'), t('settings.profile.nameRequired'));
      return;
    }
    
    try {
      setIsProfileLoading(true);
      const updatedUser = await authService.updateProfile(user.id, { name: name.trim() });
      
      // AsyncStorageとAuthContextのユーザー情報を更新
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        const updatedCurrentUser = { ...currentUser, name: updatedUser.name };
        await authService.setCurrentUser(updatedCurrentUser);
        await refreshAuth();
      }
      
      Alert.alert(t('common.success'), t('settings.profile.updateSuccess'));
    } catch (error) {
      console.error('Failed to update profile:', error);
      Alert.alert(t('common.error'), t('settings.profile.updateError'));
    } finally {
      setIsProfileLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: t('settings.title'),
          headerStyle: {
            backgroundColor: isDark ? '#111827' : '#ffffff',
          },
          headerTintColor: isDark ? '#ffffff' : '#111827',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }} 
      />
      <View style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
      <Text style={[styles.title, isDark ? styles.titleDark : styles.titleLight]}>
        {t('settings.title')}
      </Text>
      
      {/* プロフィール設定 */}
      {isAuthenticated && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark ? styles.titleDark : styles.titleLight]}>
            {t('settings.profile.title')}
          </Text>
          
          <View style={styles.profileContainer}>
            <Text style={[styles.inputLabel, isDark ? styles.titleDark : styles.titleLight]}>
              {t('settings.profile.name')}
            </Text>
            <View style={styles.profileInputContainer}>
              <TextInput
                style={[
                  styles.profileInput,
                  isDark ? styles.profileInputDark : styles.profileInputLight
                ]}
                value={name}
                onChangeText={setName}
                placeholder={t('settings.profile.namePlaceholder')}
                placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                editable={!isProfileLoading}
              />
              <TouchableOpacity
                style={[
                  styles.updateButton,
                  (!name.trim() || isProfileLoading) ? styles.updateButtonDisabled : null
                ]}
                onPress={handleNameUpdate}
                disabled={!name.trim() || isProfileLoading}
              >
                <Text style={styles.updateButtonText}>
                  {isProfileLoading ? t('common.updating') : t('common.update')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDark ? styles.titleDark : styles.titleLight]}>
          {t('settings.theme.title')}
        </Text>
        
        <TouchableOpacity
          style={[
            styles.radioItem,
            theme === 'system' ? (isDark ? styles.radioItemSelectedDark : styles.radioItemSelected) : (isDark ? styles.radioItemDark : styles.radioItemLight)
          ]}
          onPress={() => handleThemeChange('system')}
          disabled={isLoading}
        >
          <View style={[styles.radio, theme === 'system' ? styles.radioSelected : (isDark ? styles.radioDark : styles.radioLight)]} />
          <Text style={[styles.radioText, isDark ? styles.titleDark : styles.titleLight]}>
            {t('settings.theme.system')}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.radioItem,
            theme === 'light' ? (isDark ? styles.radioItemSelectedDark : styles.radioItemSelected) : (isDark ? styles.radioItemDark : styles.radioItemLight)
          ]}
          onPress={() => handleThemeChange('light')}
          disabled={isLoading}
        >
          <View style={[styles.radio, theme === 'light' ? styles.radioSelected : (isDark ? styles.radioDark : styles.radioLight)]} />
          <Text style={[styles.radioText, isDark ? styles.titleDark : styles.titleLight]}>
            {t('settings.theme.light')}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.radioItem,
            theme === 'dark' ? (isDark ? styles.radioItemSelectedDark : styles.radioItemSelected) : (isDark ? styles.radioItemDark : styles.radioItemLight)
          ]}
          onPress={() => handleThemeChange('dark')}
          disabled={isLoading}
        >
          <View style={[styles.radio, theme === 'dark' ? styles.radioSelected : (isDark ? styles.radioDark : styles.radioLight)]} />
          <Text style={[styles.radioText, isDark ? styles.titleDark : styles.titleLight]}>
            {t('settings.theme.dark')}
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDark ? styles.titleDark : styles.titleLight]}>
          {t('settings.language.title')}
        </Text>
        
        <TouchableOpacity
          style={[
            styles.radioItem,
            currentLanguage === 'ja' ? (isDark ? styles.radioItemSelectedDark : styles.radioItemSelected) : (isDark ? styles.radioItemDark : styles.radioItemLight)
          ]}
          onPress={() => handleLanguageChange('ja')}
          disabled={isLoading}
        >
          <View style={[styles.radio, currentLanguage === 'ja' ? styles.radioSelected : (isDark ? styles.radioDark : styles.radioLight)]} />
          <Text style={[styles.radioText, isDark ? styles.titleDark : styles.titleLight]}>
            {t('settings.language.japanese')}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.radioItem,
            currentLanguage === 'en' ? (isDark ? styles.radioItemSelectedDark : styles.radioItemSelected) : (isDark ? styles.radioItemDark : styles.radioItemLight)
          ]}
          onPress={() => handleLanguageChange('en')}
          disabled={isLoading}
        >
          <View style={[styles.radio, currentLanguage === 'en' ? styles.radioSelected : (isDark ? styles.radioDark : styles.radioLight)]} />
          <Text style={[styles.radioText, isDark ? styles.titleDark : styles.titleLight]}>
            {t('settings.language.english')}
          </Text>
        </TouchableOpacity>
      </View>
      
      <Link href="/" style={styles.link}>
        <Text style={styles.linkText}>{t('settings.backToHome')}</Text>
      </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  containerLight: {
    backgroundColor: '#ffffff',
  },
  containerDark: {
    backgroundColor: '#111827',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  titleLight: {
    color: '#111827',
  },
  titleDark: {
    color: '#ffffff',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 8,
  },
  radioItemLight: {
    borderColor: '#D1D5DB',
  },
  radioItemDark: {
    borderColor: '#4B5563',
  },
  radioItemSelected: {
    borderColor: '#005AAF',
    backgroundColor: '#F0F8FF',
  },
  radioItemSelectedDark: {
    borderColor: '#005AAF',
    backgroundColor: '#1E40AF',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    marginRight: 12,
  },
  radioLight: {
    borderColor: '#D1D5DB',
  },
  radioDark: {
    borderColor: '#4B5563',
  },
  radioSelected: {
    borderColor: '#005AAF',
    backgroundColor: '#005AAF',
  },
  radioText: {
    fontSize: 16,
    fontWeight: '500',
  },
  link: {
    padding: 12,
    backgroundColor: '#005AAF',
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  linkText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  profileContainer: {
    marginTop: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  profileInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
  },
  profileInputLight: {
    borderColor: '#D1D5DB',
    backgroundColor: '#ffffff',
    color: '#111827',
  },
  profileInputDark: {
    borderColor: '#4B5563',
    backgroundColor: '#374151',
    color: '#ffffff',
  },
  updateButton: {
    backgroundColor: '#005AAF',
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  updateButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  updateButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});