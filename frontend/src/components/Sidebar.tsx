import React from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Image } from 'react-native';
import {
  ClipboardCheck,
  Calendar,
  BookOpen,
  BarChart3,
  User,
} from 'lucide-react-native';

const BG = '#212121';
const ACTIVE_BG = '#505050';
const TEXT = '#FFFFFF';
const DIVIDER = '#2D2D2D';
const BRAND_RED = '#E7000B';

/** @type {{ id: string, label: string, Icon: typeof ClipboardCheck }[]} */
const NAV_ITEMS = [
  { id: 'schedule', label: 'Schedule', Icon: Calendar },
  { id: 'evaluation', label: 'Evaluation', Icon: ClipboardCheck },
  { id: 'rubrics', label: 'Rubrics', Icon: BookOpen },
  { id: 'results', label: 'Results', Icon: BarChart3 },
  { id: 'profile', label: 'Profile', Icon: User },
];

const LOGO = require('../assets/urc-e-defense-logo.png');

/**
 * @param {{
 *   active: string;
 *   onNavigate: (id: string) => void;
 *   isMobile?: boolean;
 * }} props
 */
export default function Sidebar({ active, onNavigate, isMobile = false }) {
  return (
    <View
      style={[styles.wrap, isMobile ? styles.wrapMobile : styles.wrapDesktop]}
      accessibilityRole="navigation"
      accessibilityLabel="E-Defense main navigation"
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.logoOuter} accessibilityLabel="University Research Center logo">
            <Image source={LOGO} style={styles.logoImage} resizeMode="contain" />
          </View>
          <Text style={styles.brand} accessibilityRole="header">
            E-Defense
          </Text>
        </View>

        <View style={styles.headerDivider} />

        <View style={styles.navBlock}>
          {NAV_ITEMS.map((item) => {
            const Icon = item.Icon;
            const isActive = active === item.id;
            return (
              <Pressable
                key={item.id}
                onPress={() => onNavigate(item.id)}
                style={({ pressed }) => [
                  styles.navItem,
                  isActive && styles.navItemActive,
                  pressed && !isActive && styles.navItemPressed,
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
                accessibilityLabel={item.label}
              >
                <Icon size={22} color={TEXT} strokeWidth={2} />
                <Text style={styles.navLabel}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: BG,
    height: '100%',
  },
  wrapDesktop: {
    width: 248,
    borderRightWidth: 1,
    borderRightColor: '#181818',
  },
  wrapMobile: {
    flex: 1,
    maxWidth: 280,
  },
  scrollContent: { paddingBottom: 32 },
  header: {
    alignItems: 'center',
    paddingTop: 24,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  logoOuter: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  logoImage: {
    width: 112,
    height: 112,
    borderRadius: 56,
  },
  brand: {
    fontSize: 26,
    fontWeight: '900',
    color: BRAND_RED,
    letterSpacing: 0.5,
  },
  headerDivider: {
    height: 1,
    backgroundColor: DIVIDER,
    marginHorizontal: 12,
    marginBottom: 8,
  },
  navBlock: {
    paddingHorizontal: 12,
    paddingTop: 8,
    gap: 6,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  navItemActive: {
    backgroundColor: ACTIVE_BG,
  },
  navItemPressed: {
    backgroundColor: '#383838',
  },
  navLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT,
    flex: 1,
  },
});
