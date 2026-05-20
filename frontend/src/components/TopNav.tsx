import React from 'react';
import { StyleSheet, Text, View, useWindowDimensions, Pressable, Platform, Image } from 'react-native';
import { Menu, LogOut, User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { isMockBackend } from '../config/backendMode';

const MD_MIN = 768;
const SM_MIN = 640;

/**
 * @param {{
 *   currentUser: Record<string, unknown> | null | undefined;
 *   onToggleSidebar: () => void;
 *   onLogout: () => void;
 * }} props
 */
export default function TopNav({ currentUser, onToggleSidebar, onLogout }) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isMdUp = width >= MD_MIN;
  const isSmUp = width >= SM_MIN;

  const userName = currentUser?.name || currentUser?.email || 'Dr. Maria Santos';

  return (
    <View
      style={[styles.bar, { paddingTop: insets.top }]}
      accessibilityRole="header"
    >
      <View style={styles.inner}>
        <View style={styles.left}>
          {!isMdUp ? (
            <Pressable
              onPress={onToggleSidebar}
              style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}
              accessibilityLabel="Toggle sidebar"
              accessibilityRole="button"
            >
              <Menu size={24} color="#FFFFFF" />
            </Pressable>
          ) : null}
          <Text style={styles.title} accessibilityRole="text">
            {isSmUp ? 'Research Management System' : 'RMS'}
          </Text>
        </View>

        <View style={styles.right}>
          {isSmUp ? (
            <Text style={styles.greeting}>
              Hi, <Text style={styles.userName}>{userName}</Text>
            </Text>
          ) : null}
          
          <View style={styles.avatarContainer}>
            <View style={styles.avatarCircle}>
              <User size={20} color="#6B7280" />
            </View>
          </View>

          <Pressable
            onPress={onLogout}
            style={({ pressed }) => [
              styles.logoutBtn,
              pressed && styles.logoutBtnPressed
            ]}
            accessibilityLabel="Logout"
            accessibilityRole="button"
          >
            <LogOut size={18} color="#FFFFFF" />
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: '#212121',
    zIndex: 40,
    ...Platform.select({
      web: { boxShadow: '0 2px 4px rgba(0,0,0,0.2)' },
      default: {
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 4,
      },
    }),
  },
  inner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    minHeight: 64,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, flexShrink: 1 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 16, flexShrink: 0 },
  iconBtn: {
    padding: 8,
    borderRadius: 8,
  },
  iconBtnPressed: { backgroundColor: 'rgba(255,255,255,0.1)' },
  title: {
    fontWeight: '800',
    fontSize: 18,
    color: '#FFFFFF',
    flexShrink: 1,
  },
  greeting: {
    color: '#E5E7EB',
    fontSize: 15,
    fontWeight: '400',
  },
  userName: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoutBtn: {
    backgroundColor: '#E7000B',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  logoutBtnPressed: {
    backgroundColor: '#C40009',
  },
  logoutText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});

