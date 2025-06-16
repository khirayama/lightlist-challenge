import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Link, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../src/lib/i18n/useLanguage';
import { useTheme } from '../src/contexts/ThemeContext';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage } = useLanguage();
  const { theme, resolvedTheme, setTheme } = useTheme();
  
  const isDark = resolvedTheme === 'dark';

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
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDark ? styles.titleDark : styles.titleLight]}>
          {t('settings.theme.title')}
        </Text>
        
        <TouchableOpacity
          style={[
            styles.radioItem,
            theme === 'system' ? (isDark ? styles.radioItemSelectedDark : styles.radioItemSelected) : (isDark ? styles.radioItemDark : styles.radioItemLight)
          ]}
          onPress={() => setTheme('system')}
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
          onPress={() => setTheme('light')}
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
          onPress={() => setTheme('dark')}
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
          onPress={() => changeLanguage('ja')}
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
          onPress={() => changeLanguage('en')}
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
});