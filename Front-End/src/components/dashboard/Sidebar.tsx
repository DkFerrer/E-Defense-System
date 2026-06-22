import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { minTouchTarget } from '../../theme/layout';
import { isPressableFocused } from '../../utils/pressableFocus';

const NAV_ITEMS = [
  { key: 'home', label: 'Home', icon: 'home-outline' as const },
  { key: 'calendar', label: 'Calendar', icon: 'calendar-outline' as const },
  { key: 'schedule', label: 'Schedule List', icon: 'list-outline' as const },
  { key: 'assignments', label: 'My Assignments', icon: 'clipboard-outline' as const },
  { key: 'reports', label: 'Reports', icon: 'bar-chart-outline' as const },
  { key: 'pending', label: 'Pending Requests', icon: 'time-outline' as const },
];

type Props = {
  activeKey?: string;
  /** Called when a nav item is pressed (e.g. switch Home / Calendar). */
  onNavPress?: (key: string) => void;
};

export function Sidebar({ activeKey = 'home', onNavPress }: Props) {
  return (
    <View style={styles.sidebar} accessibilityLabel="Main navigation">
      <View style={styles.brandBlock}>
        
        <Image
          source={require('../../../assets/URC_logo.png')}
          style={styles.logoImage}
          resizeMode="contain"
          accessibilityLabel="University of Nueva Caceres Research logo"
          accessibilityRole="image"
        />
        <Text style={styles.brandTitle} accessibilityRole="header">
          E-Defense
        </Text>
        <Text style={styles.brandSubtitle}>Scheduling System</Text>
      </View>

      <View style={styles.navList}>
        {NAV_ITEMS.map((item) => {
          const selected = item.key === activeKey;
          return (
            <Pressable
              key={item.key}
              onPress={() => onNavPress?.(item.key)}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              accessibilityState={{ selected, disabled: false }}
              android_ripple={{ color: 'rgba(255,255,255,0.12)' }}
              style={(state) => [
                styles.navItem,
                selected && styles.navItemActive,
                { minHeight: minTouchTarget },
                isPressableFocused(state) && styles.navItemFocused,
                state.pressed && styles.navItemPressed,
              ]}
            >
              <Ionicons
                name={item.icon}
                size={20}
                color={colors.white}
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
              />
              <Text style={styles.navLabel}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 248,
    backgroundColor: colors.sidebarBg,
    paddingTop: 28,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  brandBlock: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginBottom: 12,
    backgroundColor: colors.white,
  },
  brandTitle: {
    color: colors.brandRed,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  brandSubtitle: {
    color: colors.white,
    fontSize: 13,
    marginTop: 4,
    fontWeight: '500',
    opacity: 0.95,
  },
  navList: {
    gap: 4,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  navItemActive: {
    backgroundColor: colors.navActiveBg,
  },
  navItemFocused: {
    outlineStyle: 'solid',
    outlineWidth: 2,
    outlineColor: colors.focusRing,
    outlineOffset: 2,
  },
  navItemPressed: {
    opacity: 0.88,
  },
  navLabel: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '500',
  },
});
