import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Modal,
  SafeAreaView, Platform, Image,
} from 'react-native';

const UNC_LOGO = require('../../assets/unc-logo.png.png');
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';

import { useAuth } from '../context/AuthContext';

interface NavItem {
  label: string;
  icon: any;
  iconActive: any;
  route: string;
  accessibilityLabel: string;
}

const DEFAULT_NAV_ITEMS: NavItem[] = [
  {
    label: 'Research Groups',
    icon: 'home-outline',
    iconActive: 'home',
    route: '/(main)/research-groups',
    accessibilityLabel: 'Navigate to Research Groups',
  },
  {
    label: 'Consolidated\nReports',
    icon: 'calendar-outline',
    iconActive: 'calendar',
    route: '/(main)/consolidated-reports',
    accessibilityLabel: 'Navigate to Consolidated Reports',
  },
  {
    label: 'History',
    icon: 'document-text-outline',
    iconActive: 'document-text',
    route: '/(main)/history',
    accessibilityLabel: 'Navigate to History',
  },
];

const CHAIRMAN_NAV_ITEMS: NavItem[] = [
  {
    label: 'Schedule',
    icon: 'calendar-outline',
    iconActive: 'calendar',
    route: '/(main)/schedule',
    accessibilityLabel: 'Navigate to Schedule',
  },
  {
    label: 'Evaluation',
    icon: 'clipboard-outline',
    iconActive: 'clipboard',
    route: '/(main)/research-groups',
    accessibilityLabel: 'Navigate to Research Groups Evaluation',
  },
  {
    label: 'Rubrics',
    icon: 'book-outline',
    iconActive: 'book',
    route: '/(main)/rubrics',
    accessibilityLabel: 'Navigate to Rubrics',
  },
  {
    label: 'Results',
    icon: 'analytics-outline',
    iconActive: 'analytics',
    route: '/(main)/results',
    accessibilityLabel: 'Navigate to Results',
  },
  {
    label: 'Profile',
    icon: 'person-outline',
    iconActive: 'person',
    route: '/(main)/profile',
    accessibilityLabel: 'Navigate to Profile',
  },
];

interface SidebarProps {
  /** When false, renders as a slide-over modal drawer */
  isDrawer?: boolean;
  drawerOpen?: boolean;
  onDrawerClose?: () => void;
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  const isChairman = user?.role === 'Panel Chairman';
  const navItems = isChairman ? CHAIRMAN_NAV_ITEMS : DEFAULT_NAV_ITEMS;

  const navigate = (route: string) => {
    router.push(route as any);
    onClose?.();
  };

  return (
    <View style={styles.sidebar} accessible accessibilityLabel="Main navigation">
      {/* Brand */}
      <View style={styles.brand}>
        <Image
          source={UNC_LOGO}
          style={styles.logoImage}
          accessibilityLabel="UNC Research Center logo"
        />
        <View style={styles.brandText}>
          <Text style={styles.brandName}>UNC Research</Text>
          <Text style={styles.brandSub}>Post Evaluation</Text>
        </View>
        {onClose && (
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close navigation menu"
          >
            <Ionicons name="close" size={22} color={Colors.sidebarInactiveText} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.divider} />

      {/* Nav items */}
      <View style={styles.nav}>
        {navItems.map((item) => {
          const isActive = pathname === item.route || pathname.startsWith(item.route);
          return (
            <TouchableOpacity
              key={item.route}
              style={[styles.navItem, isActive && styles.navItemActive]}
              onPress={() => navigate(item.route)}
              accessibilityRole="button"
              accessibilityLabel={item.accessibilityLabel}
              accessibilityState={{ selected: isActive }}
              activeOpacity={0.75}
            >
              <Ionicons
                name={isActive ? item.iconActive : item.icon}
                size={22}
                color={isActive ? Colors.sidebarActiveText : Colors.sidebarInactiveText}
                style={styles.navIcon}
              />
              <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function Sidebar({ isDrawer, drawerOpen, onDrawerClose }: SidebarProps) {
  if (isDrawer) {
    return (
      <Modal
        visible={drawerOpen}
        transparent
        animationType="slide"
        onRequestClose={onDrawerClose}
        accessibilityViewIsModal
      >
        <View style={styles.drawerOverlay}>
          <TouchableOpacity style={styles.drawerBackdrop} onPress={onDrawerClose} activeOpacity={1} accessibilityLabel="Close menu" />
          <SafeAreaView>
            <SidebarContent onClose={onDrawerClose} />
          </SafeAreaView>
        </View>
      </Modal>
    );
  }

  return <SidebarContent />;
}

const styles = StyleSheet.create({
  sidebar: {
    width: 220,
    backgroundColor: Colors.sidebarBg,
    height: '100%',
    paddingTop: Platform.OS === 'web' ? 0 : 40,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 12,
  },
  logoImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  brandText: { flex: 1 },
  brandName: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.base,
    color: Colors.sidebarInactiveText,
  },
  brandSub: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.xs,
    color: Colors.sidebarSubtitle,
    marginTop: 1,
  },
  closeBtn: {
    padding: 4,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#333',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  nav: {
    paddingHorizontal: 12,
    gap: 4,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: 10,
    gap: 14,
    minHeight: 44,
  },
  navItemActive: {
    backgroundColor: Colors.sidebarActiveBg,
  },
  navIcon: {},
  navLabel: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.base,
    color: Colors.sidebarInactiveText,
    flex: 1,
  },
  navLabelActive: {
    color: Colors.sidebarActiveText,
  },
  // Drawer
  drawerOverlay: {
    flex: 1,
    flexDirection: 'row',
  },
  drawerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
});
