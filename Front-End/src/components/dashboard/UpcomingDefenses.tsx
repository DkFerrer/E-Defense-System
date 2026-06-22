import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { minTouchTarget } from '../../theme/layout';
import { isPressableFocused } from '../../utils/pressableFocus';
import { useSchedules, type DefenseSchedule } from '../../context/ScheduleContext';

type Props = {
  onViewAll?: () => void;
  onViewDetails?: () => void;
};

function DefenseCard({
  schedule,
  onViewDetails,
}: {
  schedule: DefenseSchedule;
  onViewDetails?: () => void;
}) {
  const d = schedule.dateObj;
  const monthLabel = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  const dayNum = d.getDate();

  return (
    <View
      style={styles.card}
      accessibilityRole="none"
      accessibilityLabel={`${schedule.title}. ${schedule.stage}. ${schedule.date}. Upcoming.`}
    >
      <View style={styles.dateBadge}>
        <Text style={styles.dateMonth}>{monthLabel}</Text>
        <Text style={styles.dateDay}>{dayNum}</Text>
      </View>

      <View style={styles.main}>
        <Text style={styles.projectTitle} numberOfLines={2}>
          {schedule.title || 'Untitled Defense'}
        </Text>
        <Text style={styles.dept}>
          School of Computer and Information Sciences · BS Information Technology
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={16} color={colors.textSecondary}
              accessibilityElementsHidden importantForAccessibility="no-hide-descendants" />
            <Text style={styles.metaText}>{schedule.startTime}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={16} color={colors.textSecondary}
              accessibilityElementsHidden importantForAccessibility="no-hide-descendants" />
            <Text style={styles.metaText}>{schedule.venue}</Text>
          </View>
        </View>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="people-outline" size={16} color={colors.textSecondary}
              accessibilityElementsHidden importantForAccessibility="no-hide-descendants" />
            <Text style={styles.metaText}>{schedule.panelists.length} Panelists</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="school-outline" size={16} color={colors.textSecondary}
              accessibilityElementsHidden importantForAccessibility="no-hide-descendants" />
            <Text style={styles.metaText}>{schedule.researchers.length} Students</Text>
          </View>
        </View>
      </View>

      <View style={styles.side}>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>Upcoming</Text>
        </View>
        <Text style={styles.defenseType}>{schedule.stage}</Text>
        <Pressable
          onPress={onViewDetails}
          accessibilityRole="button"
          accessibilityLabel="View details for this defense"
          style={(state) => [
            styles.outlineBtn,
            { minHeight: minTouchTarget },
            isPressableFocused(state) && styles.outlineBtnFocused,
          ]}
        >
          <Text style={styles.outlineBtnText}>View Details</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function UpcomingDefenses({ onViewAll, onViewDetails }: Props) {
  const { schedules } = useSchedules();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Filter to upcoming (today or future) and sort by date
  const upcoming = schedules
    .filter((s) => s.dateObj.getTime() >= today.getTime())
    .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Text style={styles.sectionTitle} accessibilityRole="header">
            Upcoming Defenses
          </Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {upcoming.length} Upcoming
            </Text>
          </View>
        </View>
        <Pressable
          onPress={onViewAll}
          accessibilityRole="button"
          accessibilityLabel="View all upcoming defenses"
          style={(state) => [
            styles.linkBtn,
            { minHeight: minTouchTarget },
            isPressableFocused(state) && styles.linkFocused,
          ]}
        >
          <Text style={styles.linkText}>View All</Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={colors.accentBlue}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          />
        </Pressable>
      </View>

      {upcoming.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="calendar-outline" size={32} color={colors.textMuted} />
          <Text style={styles.emptyText}>No upcoming defenses scheduled</Text>
          <Text style={styles.emptySubtext}>
            Use "Schedule Defense" to add one
          </Text>
        </View>
      ) : (
        upcoming.map((s) => (
          <DefenseCard key={s.id} schedule={s} onViewDetails={onViewDetails} />
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    flexWrap: 'wrap',
    gap: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  badge: {
    backgroundColor: colors.accentBlueLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#BBDEFB',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accentBlue,
  },
  linkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 8,
  },
  linkFocused: {
    outlineStyle: 'solid',
    outlineWidth: 2,
    outlineColor: colors.focusRing,
    outlineOffset: 2,
  },
  linkText: {
    color: colors.accentBlue,
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 12,
  },
  emptyCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 32,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  emptySubtext: {
    fontSize: 13,
    color: colors.textMuted,
  },
  dateBadge: {
    backgroundColor: colors.accentBlue,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 64,
    alignSelf: 'flex-start',
  },
  dateMonth: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  dateDay: {
    color: colors.white,
    fontSize: 22,
    fontWeight: '700',
    marginTop: 2,
  },
  main: {
    flex: 1,
    minWidth: 200,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
    lineHeight: 22,
  },
  dept: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  side: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    gap: 10,
    minWidth: 140,
  },
  statusBadge: {
    backgroundColor: colors.accentBlueLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BBDEFB',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#0D47A1',
  },
  defenseType: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  outlineBtn: {
    borderWidth: 2,
    borderColor: colors.accentBlue,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
  },
  outlineBtnFocused: {
    outlineStyle: 'solid',
    outlineWidth: 2,
    outlineColor: colors.focusRing,
    outlineOffset: 2,
  },
  outlineBtnText: {
    color: colors.accentBlue,
    fontSize: 14,
    fontWeight: '700',
  },
});
