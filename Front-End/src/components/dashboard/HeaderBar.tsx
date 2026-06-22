import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { minTouchTarget } from '../../theme/layout';
import { isPressableFocused } from '../../utils/pressableFocus';

type Props = {
  userName?: string;
  onLogoutPress?: () => void;
};

export function HeaderBar({
  userName = 'Dr. Research Coordinator',
  onLogoutPress,
}: Props) {
  return (
    <View style={styles.bar}>
      <View style={styles.spacer} />
      <View style={styles.right}>
        <Text
          style={styles.greeting}
          accessibilityRole="text"
        >
          Hi, {userName}
        </Text>
        <View
          style={styles.avatar}
          accessibilityLabel="Profile"
          accessibilityRole="image"
        >
          <Ionicons
            name="person"
            size={22}
            color={colors.textSecondary}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          />
        </View>
        <Pressable
          onPress={onLogoutPress}
          accessibilityRole="button"
          accessibilityLabel="Log out of the application"
          style={(state) => [
            styles.logoutBtn,
            { minHeight: minTouchTarget, minWidth: minTouchTarget },
            isPressableFocused(state) && styles.logoutFocused,
            state.pressed && styles.logoutPressed,
          ]}
        >
          <Ionicons
            name="log-out-outline"
            size={18}
            color={colors.white}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          />
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.headerBg,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    minHeight: 56,
  },
  spacer: {
    flex: 1,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  greeting: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '500',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8E8E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.brandRed,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  logoutFocused: {
    outlineStyle: 'solid',
    outlineWidth: 2,
    outlineColor: colors.focusRing,
    outlineOffset: 2,
  },
  logoutPressed: {
    backgroundColor: colors.brandRedPressed,
  },
  logoutText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
});
