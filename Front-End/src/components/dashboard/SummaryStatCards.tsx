import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';

import { useSchedules } from '../../context/ScheduleContext';
import { useMemo } from 'react';

export function SummaryStatCards() {
  const { schedules, pendingRequests } = useSchedules();

  const stats = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const nextWeek = new Date(now);
    nextWeek.setDate(now.getDate() + 7);

    let upcomingCount = 0;
    let completedCount = 0;

    for (const s of schedules) {
      const d = new Date(s.dateObj);
      d.setHours(0, 0, 0, 0);
      
      if (d < now) {
        completedCount++;
      } else if (d >= now && d <= nextWeek) {
        upcomingCount++;
      }
    }

    return [
      {
        key: 'total',
        value: schedules.length.toString(),
        title: 'Total Scheduled',
        subtitle: 'This Academic Year',
        icon: 'calendar-outline' as const,
        iconBg: '#E3F2FD',
        iconColor: colors.accentBlue,
        valueColor: colors.accentBlue,
      },
      {
        key: 'week',
        value: upcomingCount.toString(),
        title: 'Upcoming This Week',
        subtitle: 'Next 7 Days',
        icon: 'time-outline' as const,
        iconBg: colors.accentGreenLight,
        iconColor: colors.accentGreen,
        valueColor: colors.accentGreen,
      },
      {
        key: 'pending',
        value: pendingRequests.length.toString(),
        title: 'Pending Approvals',
        subtitle: 'Awaiting Action',
        icon: 'alert-circle-outline' as const,
        iconBg: colors.accentOrangeLight,
        iconColor: colors.accentOrange,
        valueColor: colors.accentOrange,
      },
      {
        key: 'done',
        value: completedCount.toString(),
        title: 'Completed Defenses',
        subtitle: 'This Semester',
        icon: 'checkmark-circle-outline' as const,
        iconBg: colors.accentPurpleLight,
        iconColor: colors.accentPurple,
        valueColor: colors.accentPurple,
      },
    ];
  }, [schedules, pendingRequests]);

  return (
    <View style={styles.row}>
      {stats.map((s) => (
        <View
          key={s.key}
          style={styles.card}
          accessibilityLabel={`${s.title}: ${s.value}. ${s.subtitle}`}
        >
          <View style={styles.cardTop}>
            <View>
              <Text style={styles.cardTitle}>{s.title}</Text>
              <Text
                style={[styles.bigValue, { color: s.valueColor }]}
                accessibilityRole="text"
              >
                {s.value}
              </Text>
              <Text style={styles.cardSubtitle}>{s.subtitle}</Text>
            </View>
            <View style={[styles.iconWrap, { backgroundColor: s.iconBg }]}>
              <Ionicons
                name={s.icon}
                size={26}
                color={s.iconColor}
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
              />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  card: {
    flexGrow: 1,
    flexBasis: '22%',
    minWidth: 160,
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 18,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  bigValue: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 38,
  },
  cardSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
