import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../src/contexts/ThemeContext';
import { useAuth } from '../src/contexts/AuthContext';
import TaskListApp from '../src/components/TaskListApp';

export default function HomeScreen() {
  const { t } = useTranslation();
  const { resolvedTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const isDark = resolvedTheme === 'dark';

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (isAuthenticated) {
    return (
      <>
        <Stack.Screen 
          options={{ 
            title: t('app.title'),
            headerShown: false, // TaskListAppで独自のヘッダーを表示
          }} 
        />
        <TaskListApp />
      </>
    );
  }

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
      <ScrollView style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
        <View style={styles.content}>
          <View style={styles.maxWidth}>
            <Text style={[styles.title, isDark ? styles.titleDark : styles.titleLight]}>
              {t('home.title')}
            </Text>
            <View style={styles.textCenter}>
              <Text style={[styles.subtitle, isDark ? styles.subtitleDark : styles.subtitleLight]}>
                {t('home.subtitle')}
              </Text>
              
              <View style={styles.buttonGroup}>
                <TouchableOpacity 
                  onPress={() => router.push('/login')}
                  style={[styles.button, styles.primaryButton]}
                >
                  <Text style={styles.buttonText}>
                    {t('auth.login')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => router.push('/register')}
                  style={[styles.button, styles.secondaryButton]}
                >
                  <Text style={styles.buttonText}>
                    {t('auth.register')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => router.push('/settings')}
                  style={[styles.button, styles.grayButton]}
                >
                  <Text style={styles.buttonText}>
                    {t('home.goToSettings')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </>
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
  maxWidth: {
    width: '100%',
    maxWidth: 600,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 32,
  },
  titleLight: {
    color: '#111827',
  },
  titleDark: {
    color: '#FFFFFF',
  },
  textCenter: {
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 24,
  },
  subtitleLight: {
    color: '#6B7280',
  },
  subtitleDark: {
    color: '#D1D5DB',
  },
  authSection: {
    alignItems: 'center',
    gap: 16,
  },
  welcome: {
    fontSize: 16,
  },
  welcomeLight: {
    color: '#111827',
  },
  welcomeDark: {
    color: '#FFFFFF',
  },
  buttonGroup: {
    gap: 16,
    alignItems: 'center',
    width: '100%',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
    minWidth: 200,
  },
  primaryButton: {
    backgroundColor: '#005AAF',
  },
  secondaryButton: {
    backgroundColor: '#0078D4',
  },
  grayButton: {
    backgroundColor: '#6B7280',
  },
  dangerButton: {
    backgroundColor: '#DC2626',
  },
  buttonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
});