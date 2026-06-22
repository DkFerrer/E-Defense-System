import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { minTouchTarget } from '../../theme/layout';
import { isPressableFocused } from '../../utils/pressableFocus';

const ACTIONS = [
  {
    key: 'schedule',
    title: 'Schedule Defense',
    description: 'Set up a new defense session',
    icon: 'add-circle-outline' as const,
    color: colors.accentBlue,
    bg: '#E3F2FD',
  },
  {
    key: 'calendar',
    title: 'Defense Calendar',
    description: 'View all scheduled defenses',
    icon: 'calendar-outline' as const,
    color: colors.accentGreen,
    bg: colors.accentGreenLight,
  },
  {
    key: 'report',
    title: 'Generate Report',
    description: 'Create scheduling reports',
    icon: 'document-text-outline' as const,
    color: colors.accentPurple,
    bg: colors.accentPurpleLight,
  },
];

type Props = {
  onAction?: (key: string) => void;
};

export function QuickActions({ onAction }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.sectionTitle} accessibilityRole="header">
        Quick Actions
      </Text>
      <View style={styles.row}>
        {ACTIONS.map((a) => (
          <Pressable
            key={a.key}
            onPress={() => onAction?.(a.key)}
            accessibilityRole="button"
            accessibilityLabel={`${a.title}. ${a.description}`}
            style={(state) => [
              styles.card,
              { minHeight: minTouchTarget + 80 },
              isPressableFocused(state) && styles.cardFocused,
              state.pressed && styles.cardPressed,
            ]}
          >
            <View style={[styles.iconCircle, { backgroundColor: a.bg }]}>
              <Ionicons
                name={a.icon}
                size={36}
                color={a.color}
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
              />
            </View>
            <Text style={styles.cardTitle}>{a.title}</Text>
            <Text style={styles.cardDesc}>{a.description}</Text>
          </Pressable>
        ))}
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
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  card: {
    flexGrow: 1,
    flexBasis: '30%',
    minWidth: 200,
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  cardFocused: {
    outlineStyle: 'solid',
    outlineWidth: 2,
    outlineColor: colors.focusRing,
    outlineOffset: 2,
  },
  cardPressed: {
    opacity: 0.92,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  cardDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 220,
  },
});
