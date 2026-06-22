import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { DefenseCharts } from '../components/dashboard/DefenseCharts';
import { HeaderBar } from '../components/dashboard/HeaderBar';
import { QuickActions } from '../components/dashboard/QuickActions';
import { ScheduleDefenseModal } from '../components/dashboard/ScheduleDefenseModal';
import { Sidebar } from '../components/dashboard/Sidebar';
import { SummaryStatCards } from '../components/dashboard/SummaryStatCards';
import { UpcomingDefenses } from '../components/dashboard/UpcomingDefenses';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { webViewportHeight } from '../theme/webLayout';

const DATE_LABEL = new Date().toLocaleDateString('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
});

export function DashboardScreen({
  onNavPress,
}: {
  onNavPress?: (key: string) => void;
}) {
  const { logout } = useAuth();
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const handleQuickAction = (key: string) => {
    if (key === 'calendar') {
      onNavPress?.('calendar');
    } else if (key === 'schedule') {
      setShowScheduleModal(true);
    }
  };

  return (
    <View style={[styles.root, webViewportHeight()]}>
      <Sidebar activeKey="home" onNavPress={onNavPress} />

      <View style={styles.mainColumn}>
        <HeaderBar onLogoutPress={logout} />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          accessibilityLabel="Dashboard overview content"
        >
          <View style={styles.heroRow}>
            <View style={styles.heroText}>
              <Text style={styles.pageTitle} accessibilityRole="header">
                Dashboard Overview
              </Text>
              <Text style={styles.pageSubtitle}>
                Comprehensive view of all defense schedules
              </Text>
            </View>
            <View
              style={styles.dateCard}
              accessibilityRole="text"
              accessibilityLabel={`Today's date: ${DATE_LABEL}`}
            >
              <Ionicons
                name="calendar-outline"
                size={22}
                color={colors.accentBlue}
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
              />
              <Text style={styles.dateText}>{DATE_LABEL}</Text>
            </View>
          </View>

          <SummaryStatCards />

          <QuickActions onAction={handleQuickAction} />

          <UpcomingDefenses />

          <DefenseCharts />
        </ScrollView>
      </View>

      <ScheduleDefenseModal
        visible={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.mainBg,
  },
  mainColumn: {
    flex: 1,
    minWidth: 0,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 48,
  },
  heroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    flexWrap: 'wrap',
    gap: 16,
  },
  heroText: {
    flexShrink: 1,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  pageSubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    maxWidth: 520,
    lineHeight: 22,
  },
  dateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 1,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});
