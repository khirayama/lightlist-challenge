import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { initI18n } from '../src/lib/i18n';
import { useTheme } from '../src/contexts/ThemeContext';
import { Providers } from '../src/components/providers/Providers';
import { ToastContainer } from '../src/components/ToastContainer';

function RootLayoutContent() {
  const { resolvedTheme } = useTheme();
  
  const isDark = resolvedTheme === 'dark';
  
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack />
      <ToastContainer />
    </>
  );
}

export default function RootLayout() {
  const [isI18nInitialized, setIsI18nInitialized] = useState(false);

  useEffect(() => {
    initI18n().then(() => {
      setIsI18nInitialized(true);
    });
  }, []);

  if (!isI18nInitialized) {
    return null;
  }

  return (
    <Providers>
      <RootLayoutContent />
    </Providers>
  );
}