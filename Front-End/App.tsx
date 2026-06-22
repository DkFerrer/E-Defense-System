import { useEffect, useState } from 'react';
import Constants from 'expo-constants';
import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, View } from 'react-native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ScheduleProvider } from './src/context/ScheduleContext';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { DefenseCalendarScreen } from './src/screens/DefenseCalendarScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { PendingRequestsScreen } from './src/screens/PendingRequestsScreen';
import { ScheduleListScreen } from './src/screens/ScheduleListScreen';
import { webViewportHeight } from './src/theme/webLayout';

type MainScreen = 'home' | 'calendar' | 'schedule' | 'pending';

function AppContent() {
  const { isLoggedIn } = useAuth();
  const [screen, setScreen] = useState<MainScreen>('home');

  // Reset to home screen whenever the user logs out
  useEffect(() => {
    if (!isLoggedIn) setScreen('home');
  }, [isLoggedIn]);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const title = Constants.expoConfig?.name ?? Constants.manifest?.name;
    if (title) document.title = title;
  }, []);

  const onNavPress = (key: string) => {
    if (key === 'home') setScreen('home');
    else if (key === 'calendar') setScreen('calendar');
    else if (key === 'schedule') setScreen('schedule');
    else if (key === 'pending') setScreen('pending');
  };

  if (!isLoggedIn) {
    return (
      <View style={[styles.appRoot, webViewportHeight()]}>
        <LoginScreen />
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <View style={[styles.appRoot, webViewportHeight()]}>
      {screen === 'home' ? (
        <DashboardScreen onNavPress={onNavPress} />
      ) : screen === 'calendar' ? (
        <DefenseCalendarScreen onNavPress={onNavPress} />
      ) : screen === 'schedule' ? (
        <ScheduleListScreen onNavPress={onNavPress} />
      ) : (
        <PendingRequestsScreen onNavPress={onNavPress} />
      )}
      <StatusBar style="light" />
    </View>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ScheduleProvider>
        <AppContent />
      </ScheduleProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  appRoot: {
    flex: 1,
  },
});
