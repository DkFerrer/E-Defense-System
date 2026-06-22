import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { HeaderBar } from '../components/dashboard/HeaderBar';
import { Sidebar } from '../components/dashboard/Sidebar';
import { DefenseDetailModal } from '../components/dashboard/DefenseDetailModal';
import { useAuth } from '../context/AuthContext';
import { useSchedules, type DefenseSchedule } from '../context/ScheduleContext';
import { colors } from '../theme/colors';
import { minTouchTarget } from '../theme/layout';
import { webViewportHeight } from '../theme/webLayout';
import { isPressableFocused } from '../utils/pressableFocus';
import {
  getMonthGrid,
  getWeekContaining,
  isPastDate,
  sameCalendarDay,
  type MonthCell,
} from '../utils/calendarGrid';

const WEEKDAY_LABELS = [
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
] as const;

const SLOTS_PER_DAY = 5;

type ViewMode = 'month' | 'week';

type SlotInfo = {
  used: number;
  total: number;
  showSlots: boolean;
  eventLabel?: string;
};

function slotInfoForDate(date: Date, inCurrentMonth: boolean, today: Date, scheduledCount: number): SlotInfo {
  // Past dates — no slots available
  if (isPastDate(date, today)) {
    return { used: scheduledCount, total: SLOTS_PER_DAY, showSlots: scheduledCount > 0 };
  }
  // Today and future dates in the current month show available slots
  if (inCurrentMonth) {
    return { used: scheduledCount, total: SLOTS_PER_DAY, showSlots: true };
  }
  return { used: 0, total: SLOTS_PER_DAY, showSlots: false };
}

function formatMonthYear(year: number, monthIndex: number): string {
  return new Date(year, monthIndex, 1).toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

function longDateLabel(d: Date): string {
  return d.toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

type Props = {
  onNavPress: (key: string) => void;
};

/** Returns a Date set to midnight today. */
function getToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function DefenseCalendarScreen({ onNavPress }: Props) {
  const { logout } = useAuth();
  const { getSchedulesForDate } = useSchedules();
  const [today, setToday] = useState(getToday);
  const [viewYear, setViewYear] = useState(() => today.getFullYear());
  const [viewMonthIndex, setViewMonthIndex] = useState(() => today.getMonth());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedDate, setSelectedDate] = useState(() => new Date(today));
  const [detailSchedules, setDetailSchedules] = useState<DefenseSchedule[]>([]);
  const [showDetail, setShowDetail] = useState(false);

  // Auto-update 'today' at midnight so the calendar stays current
  useEffect(() => {
    const now = new Date();
    const msUntilMidnight =
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - now.getTime();
    const timer = setTimeout(() => {
      setToday(getToday());
    }, msUntilMidnight);
    return () => clearTimeout(timer);
  }, [today]);

  const monthCells = useMemo(
    () => getMonthGrid(viewYear, viewMonthIndex),
    [viewYear, viewMonthIndex],
  );

  const weekCells = useMemo(
    () =>
      getWeekContaining(selectedDate).map((date) => ({
        date,
        inCurrentMonth:
          date.getMonth() === viewMonthIndex && date.getFullYear() === viewYear,
      })),
    [selectedDate, viewMonthIndex, viewYear],
  );

  const displayCells: MonthCell[] = viewMode === 'month' ? monthCells : weekCells;

  const goPrev = () => {
    if (viewMode === 'week') {
      const n = new Date(selectedDate);
      n.setDate(n.getDate() - 7);
      setSelectedDate(n);
      setViewYear(n.getFullYear());
      setViewMonthIndex(n.getMonth());
      return;
    }
    const m = viewMonthIndex === 0 ? 11 : viewMonthIndex - 1;
    const y = viewMonthIndex === 0 ? viewYear - 1 : viewYear;
    setViewMonthIndex(m);
    setViewYear(y);
    setSelectedDate(new Date(y, m, 1));
  };

  const goNext = () => {
    if (viewMode === 'week') {
      const n = new Date(selectedDate);
      n.setDate(n.getDate() + 7);
      setSelectedDate(n);
      setViewYear(n.getFullYear());
      setViewMonthIndex(n.getMonth());
      return;
    }
    const m = viewMonthIndex === 11 ? 0 : viewMonthIndex + 1;
    const y = viewMonthIndex === 11 ? viewYear + 1 : viewYear;
    setViewMonthIndex(m);
    setViewYear(y);
    setSelectedDate(new Date(y, m, 1));
  };

  const goToday = () => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    setViewYear(t.getFullYear());
    setViewMonthIndex(t.getMonth());
    setSelectedDate(t);
  };

  const monthTitle = formatMonthYear(viewYear, viewMonthIndex);

  const weekRangeLabel = useMemo(() => {
    const week = getWeekContaining(selectedDate);
    const a = week[0];
    const b = week[6];
    const sameMonth =
      a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
    if (sameMonth) {
      return `${a.toLocaleString('en-US', { month: 'long' })} ${a.getDate()}–${b.getDate()}, ${a.getFullYear()}`;
    }
    return `${a.toLocaleString('en-US', { month: 'short', day: 'numeric' })} – ${b.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  }, [selectedDate]);

  return (
    <View style={[styles.root, webViewportHeight()]}>
      <Sidebar activeKey="calendar" onNavPress={onNavPress} />

      <View style={styles.mainColumn}>
        <HeaderBar onLogoutPress={logout} />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          accessibilityLabel="Defense calendar content"
        >
          <View style={styles.titleRow}>
            <View style={styles.titleBlock}>
              <Text style={styles.pageTitle} accessibilityRole="header">
                Defense Calendar
              </Text>
              <Text style={styles.pageSubtitle}>
                Manage and view defense schedules • {SLOTS_PER_DAY} slots per day
              </Text>
            </View>

            <View style={styles.segment} accessibilityLabel="Calendar view mode">
              {(['month', 'week'] as const).map((mode) => {
                const selected = viewMode === mode;
                return (
                  <Pressable
                    key={mode}
                    onPress={() => setViewMode(mode)}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    accessibilityLabel={
                      mode === 'month'
                        ? selected
                          ? 'Month view, selected'
                          : 'Month view'
                        : selected
                          ? 'Week view, selected'
                          : 'Week view'
                    }
                    style={(state) => [
                      styles.segmentBtn,
                      selected && styles.segmentBtnSelected,
                      { minHeight: minTouchTarget },
                      isPressableFocused(state) && styles.segmentBtnFocused,
                    ]}
                  >
                    <Text style={[styles.segmentText, selected && styles.segmentTextSelected]}>
                      {mode === 'month' ? 'Month' : 'Week'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.navCard}>
            <View style={styles.navInner}>
              <Pressable
                onPress={goPrev}
                accessibilityRole="button"
                accessibilityLabel={
                  viewMode === 'month' ? 'Previous month' : 'Previous week'
                }
                style={(state) => [
                  styles.iconHit,
                  { minHeight: minTouchTarget, minWidth: minTouchTarget },
                  isPressableFocused(state) && styles.iconHitFocused,
                ]}
              >
                <Ionicons
                  name="chevron-back"
                  size={22}
                  color={colors.textPrimary}
                  accessibilityElementsHidden
                  importantForAccessibility="no-hide-descendants"
                />
              </Pressable>
              <Text style={styles.navMonthText} accessibilityRole="header">
                {viewMode === 'week' ? weekRangeLabel : monthTitle}
              </Text>
              <Pressable
                onPress={goNext}
                accessibilityRole="button"
                accessibilityLabel={viewMode === 'month' ? 'Next month' : 'Next week'}
                style={(state) => [
                  styles.iconHit,
                  { minHeight: minTouchTarget, minWidth: minTouchTarget },
                  isPressableFocused(state) && styles.iconHitFocused,
                ]}
              >
                <Ionicons
                  name="chevron-forward"
                  size={22}
                  color={colors.textPrimary}
                  accessibilityElementsHidden
                  importantForAccessibility="no-hide-descendants"
                />
              </Pressable>
            </View>
            <Pressable
              onPress={goToday}
              accessibilityRole="button"
              accessibilityLabel="Jump to today on the calendar"
              style={(state) => [
                styles.todayBtn,
                { minHeight: minTouchTarget },
                isPressableFocused(state) && styles.todayBtnFocused,
              ]}
            >
              <Ionicons
                name="calendar"
                size={18}
                color={colors.white}
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
              />
              <Text style={styles.todayBtnText}>Today</Text>
            </Pressable>
          </View>

          <View
            style={styles.gridCard}
            accessibilityLabel={`Defense schedule calendar, ${viewMode} view, ${monthTitle}`}
          >
            <View style={styles.weekHeaderRow}>
              {WEEKDAY_LABELS.map((label) => (
                <View key={label} style={styles.weekHeaderCell}>
                  <Text style={styles.weekHeaderText}>{label}</Text>
                </View>
              ))}
            </View>

            <View style={styles.grid}>
              {displayCells.map((cell, index) => {
                const cellSchedules = getSchedulesForDate(cell.date);
                return (
                  <DayCell
                    key={`${cell.date.getFullYear()}-${cell.date.getMonth()}-${cell.date.getDate()}-${viewMode}-${index}`}
                    cell={cell}
                    viewYear={viewYear}
                    viewMonthIndex={viewMonthIndex}
                    selectedDate={selectedDate}
                    today={today}
                    viewMode={viewMode}
                    scheduledCount={cellSchedules.length}
                    firstEventLabel={
                      cellSchedules.length > 0
                        ? `${cellSchedules[0].startTime} - ${cellSchedules[0].title}`
                        : undefined
                    }
                    onSelect={() => {
                      setSelectedDate(new Date(cell.date));
                      if (cellSchedules.length > 0) {
                        setDetailSchedules(cellSchedules);
                        setShowDetail(true);
                      }
                    }}
                  />
                );
              })}
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Defense detail modal */}
      <DefenseDetailModal
        visible={showDetail}
        schedules={detailSchedules}
        onClose={() => setShowDetail(false)}
      />
    </View>
  );
}

type DayCellProps = {
  cell: MonthCell;
  viewYear: number;
  viewMonthIndex: number;
  selectedDate: Date;
  today: Date;
  viewMode: ViewMode;
  scheduledCount: number;
  firstEventLabel?: string;
  onSelect: () => void;
};

function DayCell({
  cell,
  viewYear,
  viewMonthIndex,
  selectedDate,
  today,
  viewMode,
  scheduledCount,
  firstEventLabel,
  onSelect,
}: DayCellProps) {
  const { date, inCurrentMonth } = cell;
  const dow = date.getDay();
  const isSunday = dow === 0;
  const isSelected = sameCalendarDay(date, selectedDate);
  const isToday = sameCalendarDay(date, today);
  const past = isPastDate(date, today);

  const inMonthForSlots =
    viewMode === 'month'
      ? inCurrentMonth
      : date.getMonth() === viewMonthIndex && date.getFullYear() === viewYear;

  const slotDisplay = slotInfoForDate(date, inMonthForSlots, today, scheduledCount);
  const eventLabel = firstEventLabel;

  const dateNumStyle = [
    styles.dayNum,
    !inCurrentMonth && styles.dayNumMuted,
    isSunday && inCurrentMonth && !past && styles.dayNumSunday,
    past && styles.dayNumPast,
  ];

  const a11yLabel = [
    longDateLabel(date),
    isToday ? "Today." : '',
    past ? 'Past date, scheduling unavailable.' : '',
    inCurrentMonth || viewMode === 'week' ? 'Shown in current view' : 'Outside current month',
    isSunday && !past ? 'Unavailable for scheduling on Sundays.' : '',
    slotDisplay.showSlots
      ? `${slotDisplay.used} of ${slotDisplay.total} defense slots used`
      : '',
    slotDisplay.eventLabel ? `Scheduled: ${slotDisplay.eventLabel}` : '',
    eventLabel ? `Scheduled: ${eventLabel}` : '',
    isSelected ? 'Selected.' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Pressable
      onPress={past ? undefined : onSelect}
      disabled={past}
      accessibilityRole="button"
      accessibilityLabel={a11yLabel}
      accessibilityState={{ selected: isSelected, disabled: past }}
      style={(state) => [
        styles.cell,
        past && styles.cellPast,
        isSelected && !past && styles.cellSelected,
        isToday && styles.cellToday,
        isPressableFocused(state) && !past && styles.cellFocused,
      ]}
    >
      <View style={styles.cellTop}>
        <View style={isToday ? styles.todayBadge : undefined}>
          <Text style={[
            ...dateNumStyle,
            isToday && styles.dayNumToday,
          ]}>
            {date.getDate()}
          </Text>
        </View>
        {slotDisplay.showSlots ? (
          <Text
            style={[
              styles.slotBadge,
              slotDisplay.used > 0 ? styles.slotBadgeUsed : styles.slotBadgeEmpty,
            ]}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            {slotDisplay.used}/{slotDisplay.total}
          </Text>
        ) : (
          <View style={styles.slotBadgePlaceholder} />
        )}
      </View>

      {isSunday && inCurrentMonth && !past ? (
        <Text style={styles.unavailable}>UNAVAILABLE</Text>
      ) : (
        <View style={styles.cellGap} />
      )}

      <View style={styles.cellFill} />

      {eventLabel ? (
        <View style={styles.eventBar}>
          <Text
            style={styles.eventBarText}
            numberOfLines={1}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            {eventLabel}
          </Text>
        </View>
      ) : (
        <View style={styles.eventSpacer} />
      )}
    </Pressable>
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
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 16,
  },
  titleBlock: {
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
    maxWidth: 560,
    lineHeight: 22,
  },
  segment: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    overflow: 'hidden',
    backgroundColor: colors.card,
  },
  segmentBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 88,
  },
  segmentBtnSelected: {
    borderBottomWidth: 2,
    borderBottomColor: colors.accentBlue,
    backgroundColor: colors.accentBlueLight,
  },
  segmentBtnFocused: {
    outlineStyle: 'solid',
    outlineWidth: 2,
    outlineColor: colors.focusRing,
    outlineOffset: 2,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  segmentTextSelected: {
    color: colors.accentBlue,
  },
  navCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    flexWrap: 'wrap',
    gap: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  navInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    minWidth: 200,
  },
  navMonthText: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  iconHit: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  iconHitFocused: {
    outlineStyle: 'solid',
    outlineWidth: 2,
    outlineColor: colors.focusRing,
    outlineOffset: 2,
  },
  todayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.accentBlue,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  todayBtnFocused: {
    outlineStyle: 'solid',
    outlineWidth: 2,
    outlineColor: colors.focusRing,
    outlineOffset: 2,
  },
  todayBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  gridCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.calendarGridLine,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  weekHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.calendarGridLine,
  },
  weekHeaderCell: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: colors.calendarGridLine,
  },
  weekHeaderText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: '14.28%',
    minHeight: 112,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.calendarGridLine,
    padding: 6,
    backgroundColor: colors.card,
    flexDirection: 'column',
  },
  cellPast: {
    backgroundColor: '#F3F3F3',
    opacity: 0.65,
  },
  cellToday: {
    borderColor: colors.accentBlue,
    borderWidth: 2,
  },
  cellSelected: {
    backgroundColor: colors.calendarSelectedDay,
  },
  cellFocused: {
    outlineStyle: 'solid',
    outlineWidth: 2,
    outlineColor: colors.focusRing,
    outlineOffset: -2,
    zIndex: 1,
  },
  cellTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  dayNum: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  dayNumToday: {
    color: colors.white,
    fontWeight: '800',
  },
  dayNumPast: {
    color: '#BABABA',
    fontWeight: '500',
  },
  dayNumMuted: {
    color: colors.textMuted,
    fontWeight: '600',
  },
  dayNumSunday: {
    color: colors.sundayRed,
  },
  todayBadge: {
    backgroundColor: colors.accentBlue,
    borderRadius: 14,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotBadge: {
    fontSize: 11,
    fontWeight: '700',
  },
  slotBadgeEmpty: {
    color: colors.textMuted,
  },
  slotBadgeUsed: {
    color: colors.accentGreen,
  },
  slotBadgePlaceholder: {
    minWidth: 28,
  },
  cellGap: {
    height: 4,
  },
  cellFill: {
    flex: 1,
    minHeight: 8,
  },
  unavailable: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.sundayRed,
    textAlign: 'center',
    letterSpacing: 0.3,
    marginTop: 4,
  },
  eventBar: {
    backgroundColor: colors.calendarEventBar,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  eventBarText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '600',
  },
  eventSpacer: {
    height: 22,
  },
});