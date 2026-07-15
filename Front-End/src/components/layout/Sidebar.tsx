// E-Defense — Sidebar Navigation Component
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSizes, FontWeights, Spacing, BorderRadius, SIDEBAR_WIDTH } from '../../styles/theme';
import { useAuth } from '../../contexts/AuthContext';

// @ts-ignore
import UNCLogo from '../../assets/unc-logo.png';

interface NavItem {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
}

const NAV_ITEMS: NavItem[] = [
  { key: 'Dashboard', label: 'Dashboard', icon: 'grid-outline', iconActive: 'grid' },
  { key: 'ResearchGroups', label: 'Research Groups', icon: 'people-outline', iconActive: 'people' },
  { key: 'Monitor', label: 'Defense Monitor', icon: 'eye-outline', iconActive: 'eye' },
  { key: 'Notifications', label: 'Notifications', icon: 'notifications-outline', iconActive: 'notifications' },
  { key: 'Reports', label: 'Consolidated Reports', icon: 'document-text-outline', iconActive: 'document-text' },
  { key: 'History', label: 'History', icon: 'time-outline', iconActive: 'time' },
  { key: 'Settings', label: 'Settings', icon: 'settings-outline', iconActive: 'settings' },
];

interface SidebarProps {
  activeScreen: string;
  onNavigate: (screen: string) => void;
  unreadCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeScreen, onNavigate, unreadCount = 0 }) => {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      {/* Logo Section */}
      <View style={styles.logoSection}>
        <View style={styles.logoCircle}>
          <Image source={UNCLogo} style={styles.logoImage} resizeMode="contain" />
        </View>
        <View style={styles.sidebarBrandContainer}>
          <Text style={styles.appName}>UNC Research</Text>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Navigation Items */}
      <ScrollView style={styles.navList} showsVerticalScrollIndicator={false}>
        {NAV_ITEMS.map((item) => {
          const isActive = activeScreen === item.key;
          return (
            <TouchableOpacity
              key={item.key}
              style={[styles.navItem, isActive && styles.navItemActive]}
              onPress={() => onNavigate(item.key)}
              activeOpacity={0.7}
            >
              <View style={[styles.activeBar, isActive && styles.activeBarVisible]} />
              <Ionicons
                name={isActive ? item.iconActive : item.icon}
                size={20}
                color={isActive ? '#FFF' : '#9CA3AF'}
              />
              <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                {item.label}
              </Text>
              {item.key === 'Notifications' && unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Bottom section */}
      <View style={styles.bottomSection}>
        <View style={styles.divider} />
        <View style={styles.userInfo}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </Text>
          </View>
          <View style={styles.userMeta}>
            <Text style={styles.userName} numberOfLines={1}>
              {user?.first_name} {user?.last_name}
            </Text>
            <Text style={styles.userRole} numberOfLines={1}>
              {user?.role?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'User'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SIDEBAR_WIDTH,
    backgroundColor: '#151515',
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    height: '100%',
  },

  // Logo Section
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
  },
  logoCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 30,
    height: 30,
  },
  sidebarBrandContainer: {
    marginLeft: 12,
    justifyContent: 'center',
  },
  appName: {
    fontSize: 14,
    fontWeight: FontWeights.bold,
    color: '#FFF',
    letterSpacing: 0.5,
  },
  appSubtitle: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 1,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: Colors.sidebar.border,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.sm,
  },

  // Navigation
  navList: {
    flex: 1,
    paddingHorizontal: Spacing.sm,
    paddingTop: Spacing.xs,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: 2,
    position: 'relative',
  },
  navItemActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  activeBar: {
    position: 'absolute',
    left: 0,
    top: 6,
    bottom: 6,
    width: 3,
    borderRadius: 2,
    backgroundColor: 'transparent',
  },
  activeBarVisible: {
    backgroundColor: 'transparent',
  },
  navLabel: {
    fontSize: FontSizes.sm,
    color: '#9CA3AF',
    marginLeft: Spacing.sm + 2,
    fontWeight: FontWeights.medium,
    flex: 1,
  },
  navLabelActive: {
    color: '#FFF',
    fontWeight: FontWeights.bold,
  },
  badge: {
    backgroundColor: Colors.danger,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  badgeText: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: FontWeights.bold,
  },

  // Bottom user section
  bottomSection: {
    paddingHorizontal: Spacing.sm,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    color: '#FFF',
  },
  userMeta: {
    flex: 1,
  },
  userName: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.sidebar.textActive,
  },
  userRole: {
    fontSize: FontSizes.xs,
    color: Colors.sidebar.text,
    marginTop: 1,
  },
});
