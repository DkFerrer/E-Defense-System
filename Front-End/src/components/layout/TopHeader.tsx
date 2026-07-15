// E-Defense — Top Header Bar Component
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSizes, FontWeights, Spacing, BorderRadius, Shadows } from '../../styles/theme';
import { useAuth } from '../../contexts/AuthContext';

interface TopHeaderProps {
  title: string;
  subtitle?: string;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ title, subtitle }) => {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>

      <View style={styles.right}>
        {/* Search Icon */}
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="search-outline" size={20} color={Colors.light.textSecondary} />
        </TouchableOpacity>

        {/* Notification Bell */}
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="notifications-outline" size={20} color={Colors.light.textSecondary} />
        </TouchableOpacity>

        {/* User Info */}
        <View style={styles.userSection}>
          <View style={styles.userAvatar}>
            <Text style={styles.avatarText}>
              {(user?.first_name?.[0] || 'U').toUpperCase()}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.first_name} {user?.last_name}</Text>
            <Text style={styles.userRole}>
              {user?.role?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'User'}
            </Text>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Ionicons name="log-out-outline" size={16} color={Colors.white} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    minHeight: 70,
  },
  left: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: FontWeights.bold,
    color: '#111827',
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.md,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingLeft: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  userAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1C64F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: FontWeights.bold,
    color: '#FFF',
  },
  userInfo: {
    marginLeft: 6,
  },
  userName: {
    fontSize: 13,
    fontWeight: FontWeights.semibold,
    color: '#111827',
  },
  userRole: {
    fontSize: 11,
    color: '#6B7280',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#C0392B',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    marginLeft: Spacing.xs,
  },
  logoutText: {
    fontSize: 13,
    fontWeight: FontWeights.bold,
    color: '#FFF',
    marginLeft: 6,
  },
});
