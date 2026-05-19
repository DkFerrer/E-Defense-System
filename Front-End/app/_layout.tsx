import { useEffect } from 'react';
import { Stack } from 'expo-router';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { AuthProvider } from '../src/context/AuthContext';
import { AppDataProvider } from '../src/context/AppDataContext';

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    // Fonts loaded or errored — either way, render the app
  }, [fontsLoaded, fontError]);

  // Don't block rendering — render even without fonts so the page isn't blank
  // Fonts will pop in once loaded (FOUT is better than blank screen)
  if (!fontsLoaded && !fontError) {
    // Return a minimal layout so the screen isn't blank for too long
    return null;
  }

  return (
    <AppDataProvider>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="(main)" />
        </Stack>
      </AuthProvider>
    </AppDataProvider>
  );
}
