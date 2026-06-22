import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';

/** Demo counts — aligned with dashboard mockup scale (y-axis 0–24). */
const MONTHLY = [
  { m: 'Jan', n: 9 },
  { m: 'Feb', n: 14 },
  { m: 'Mar', n: 7 },
  { m: 'Apr', n: 11 },
  { m: 'May', n: 16 },
  { m: 'Jun', n: 20 },
  { m: 'Jul', n: 10 },
  { m: 'Aug', n: 8 },
  { m: 'Sep', n: 12 },
  { m: 'Oct', n: 15 },
  { m: 'Nov', n: 18 },
  { m: 'Dec', n: 10 },
];

const PROGRAMS = [
  { name: 'Computer Science', pct: 100 },
  { name: 'Information Technology', pct: 78 },
  { name: 'Associate in Computer Technology', pct: 62 },
  { name: 'Library and Information Science', pct: 45 },
];

const Y_MAX = 24;

export function DefenseCharts() {
  const monthlySummary = MONTHLY.map((x) => `${x.m} ${x.n}`).join(', ');
  const programSummary = PROGRAMS.map((p) => `${p.name} ${Math.round((p.pct / 100) * 24)}`).join(', ');

  return (
    <View style={styles.wrap}>
      <Text style={styles.sectionTitle} accessibilityRole="header">
        Defense Schedule Overview
      </Text>

      <View style={styles.chartsRow}>
        <View
          style={styles.chartCard}
          accessibilityRole="none"
          accessibilityLabel={`Defense distribution. Values by month: ${monthlySummary}. Vertical axis from 0 to ${Y_MAX}.`}
        >
          <Text style={styles.chartTitle}>Defense Distribution</Text>
          <View style={styles.yAxis}>
            <Text style={styles.yTick}>24</Text>
            <Text style={styles.yTick}>18</Text>
            <Text style={styles.yTick}>12</Text>
            <Text style={styles.yTick}>6</Text>
            <Text style={styles.yTick}>0</Text>
          </View>
          <View style={styles.chartInner}>
            <View style={styles.barsRow}>
              {MONTHLY.map((item) => {
                const barHeight = Math.max(4, Math.round((item.n / Y_MAX) * 120));
                return (
                  <View key={item.m} style={styles.barCol}>
                    <View style={styles.barTrack}>
                      <View
                        style={[styles.barFill, { height: barHeight }]}
                        accessibilityLabel={`${item.m}: ${item.n} defenses`}
                      />
                    </View>
                    <Text style={styles.xLabel}>{item.m}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        <View
          style={styles.chartCard}
          accessibilityRole="none"
          accessibilityLabel={`Defenses by academic program. Relative counts: ${programSummary}.`}
        >
          <Text style={styles.chartTitle}>Defenses by Academic Program</Text>
          <View style={styles.hBars}>
            {PROGRAMS.map((p) => (
              <View key={p.name} style={styles.hRow}>
                <Text style={styles.progLabel} numberOfLines={1}>
                  {p.name}
                </Text>
                <View style={styles.hTrack}>
                  <View
                    style={[styles.hFill, { width: `${p.pct}%` }]}
                    accessibilityLabel={`${p.name}: relative amount ${p.pct} percent`}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 14,
  },
  chartsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  chartCard: {
    flexGrow: 1,
    flexBasis: '45%',
    minWidth: 280,
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
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  yAxis: {
    position: 'absolute',
    left: 8,
    top: 52,
    bottom: 36,
    justifyContent: 'space-between',
    width: 28,
  },
  yTick: {
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'right',
  },
  chartInner: {
    marginLeft: 36,
    paddingBottom: 4,
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 140,
    gap: 4,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    maxWidth: 40,
  },
  barTrack: {
    width: '100%',
    height: 120,
    backgroundColor: '#F0F4F8',
    borderRadius: 6,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    backgroundColor: colors.chartBar,
    borderRadius: 6,
    minHeight: 4,
  },
  xLabel: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 8,
    fontWeight: '600',
  },
  hBars: {
    gap: 12,
  },
  hRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progLabel: {
    width: 140,
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  hTrack: {
    flex: 1,
    height: 14,
    backgroundColor: '#F0F4F8',
    borderRadius: 7,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  hFill: {
    height: '100%',
    backgroundColor: colors.chartBarH,
    borderRadius: 7,
    minWidth: 4,
  },
});
