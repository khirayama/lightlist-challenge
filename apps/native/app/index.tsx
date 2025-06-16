import { View, Text, StyleSheet } from 'react-native';
import { Link, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../src/contexts/ThemeContext';

export default function HomeScreen() {
  const { t } = useTranslation();
  const { resolvedTheme } = useTheme();

  const isDark = resolvedTheme === 'dark';

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: t('app.title'),
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
          {t('home.title')}
        </Text>
        <Link href="/settings" style={styles.link}>
          <Text style={styles.linkText}>{t('home.goToSettings')}</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  containerLight: {
    backgroundColor: '#ffffff',
  },
  containerDark: {
    backgroundColor: '#111827',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 32,
  },
  titleLight: {
    color: '#111827',
  },
  titleDark: {
    color: '#ffffff',
  },
  link: {
    padding: 12,
    backgroundColor: '#005AAF',
    borderRadius: 6,
  },
  linkText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});