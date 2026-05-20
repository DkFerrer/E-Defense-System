import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AppProvider, useApp } from '../src/context/AppContext';

function AuthGuard() {
  const { token } = useApp();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const isMainGroup = segments[0] === 'agreement' || segments[0] === 'main' || segments[0] === 'evaluation';
    const isAuthGroup = segments.length === 0 || segments[0] === 'index';
    
    if (!token && isMainGroup) {
      router.replace('/');
    } else if (token && isAuthGroup) {
      router.replace('/agreement');
    }
  }, [token, segments]);

  return <Slot />;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <AuthGuard />
        <StatusBar style="light" />
      </AppProvider>
    </SafeAreaProvider>
  );
}
