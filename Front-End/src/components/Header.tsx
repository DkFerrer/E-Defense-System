import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';

interface HeaderProps {
  title: string;
  subtitle: string;
  onMenuPress?: () => void;
  showMenuButton?: boolean;
}

export default function Header({ title, subtitle, onMenuPress, showMenuButton }: HeaderProps) {
  const { user, logout } = useAuth();
  const { width } = useWindowDimensions();

  return (
    <View style={styles.header} accessible accessibilityLabel="Page header">
      <View style={styles.left}>
        {showMenuButton && (
          <TouchableOpacity
            style={styles.menuBtn}
            onPress={onMenuPress}
            accessibilityRole="button"
            accessibilityLabel="Open navigation menu"
          >
            <Ionicons name="menu" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        )}
        <View>
          <Text style={styles.title} accessibilityRole="header">{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </View>

      <View style={styles.right}>
        {width >= 480 && user && (
          <View style={styles.userInfo} accessible accessibilityLabel={`Logged in as ${user.name}, ${user.title}`}>
            <View style={styles.avatar} accessibilityElementsHidden>
              <Text style={styles.avatarText}>
                {user.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userRole}>{user.title}</Text>
            </View>
          </View>
        )}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={logout}
          accessibilityRole="button"
          accessibilityLabel="Log out of the application"
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={16} color="#fff" />
          {width >= 480 && <Text style={styles.logoutText}>Logout</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.headerBg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.headerBorder,
    paddingHorizontal: 24,
    paddingVertical: 16,
    minHeight: 72,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  menuBtn: {
    padding: 6,
    borderRadius: 6,
    marginRight: 4,
  },
  title: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.xl,
    color: Colors.headerTitle,
  },
  subtitle: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.sm,
    color: Colors.headerSubtitle,
    marginTop: 2,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.btnPrimaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.md,
    color: '#fff',
  },
  userName: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.sm,
    color: Colors.textPrimary,
  },
  userRole: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.headerLogoutBg,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
  },
  logoutText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.sm,
    color: Colors.headerLogoutText,
  },
});
