import React, { useState, useEffect } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { Slot, Redirect, usePathname } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import Sidebar from '../../src/components/Sidebar';
import Header from '../../src/components/Header';
import { Colors } from '../../src/theme/colors';
import { useAppData } from '../../src/context/AppDataContext';

const PAGE_META: Record<string, { title: string; subtitle: string; icon?: string; color?: string }> = {
  'research-groups': {
    title: 'Research Groups',
    subtitle: 'View and manage research defense evaluations',
  },
  'research-group-detail': {
    title: 'Group Details',
    subtitle: 'View research group evaluation details',
  },
  'consolidated-reports-generation': {
    title: 'Compiled Report',
    subtitle: 'Consolidated evaluation report for this research group',
    icon: 'document-text-outline',
    color: '#7C3AED',
  },
  'consolidated-reports': {
    title: 'Consolidated Reports',
    subtitle: 'View consolidated evaluation reports',
    icon: 'albums-outline',
    color: '#0F766E',
  },
  history: {
    title: 'History',
    subtitle: 'Browse past defense evaluations',
    icon: 'time-outline',
    color: '#374151',
  },
};

function getPageMeta(pathname: string) {
  const segment = pathname.split('/').filter(Boolean).pop() ?? '';
  return PAGE_META[segment] ?? { title: 'Research Groups', subtitle: 'View and manage research defense evaluations', icon: 'people-outline', color: '#2563EB' };
}

export default function MainLayout() {
  const { isAuthenticated } = useAuth();
  const { width } = useWindowDimensions();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { logActivity } = useAppData();

  const isSidebarPermanent = width >= 768;
  const { title, subtitle, icon, color } = getPageMeta(pathname);

  // Log every navigation change to activity history
  useEffect(() => {
    if (!isAuthenticated) return;
    const segment = pathname.split('/').filter(Boolean).pop() ?? '';
    const meta = PAGE_META[segment];
    if (meta) {
      logActivity(
        `Navigated to ${meta.title}`,
        meta.subtitle,
        meta.icon ?? 'navigate-outline',
        meta.color ?? '#374151',
      );
    }
  }, [pathname, isAuthenticated]);

  // Guard — redirect after all hooks
  if (!isAuthenticated) return <Redirect href="/login" />;

  return (
    <View style={styles.root}>
      {/* Permanent sidebar on wide screens */}
      {isSidebarPermanent && <Sidebar />}

      {/* Slide-over drawer on mobile */}
      {!isSidebarPermanent && (
        <Sidebar
          isDrawer
          drawerOpen={drawerOpen}
          onDrawerClose={() => setDrawerOpen(false)}
        />
      )}

      {/* Main content */}
      <View style={styles.main}>
        <Header
          title={title}
          subtitle={subtitle}
          showMenuButton={!isSidebarPermanent}
          onMenuPress={() => setDrawerOpen(true)}
        />
        <View style={styles.content}>
          <Slot />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: 'row', backgroundColor: Colors.pageBg },
  main: { flex: 1, flexDirection: 'column' },
  content: { flex: 1, backgroundColor: Colors.pageBg },
});
