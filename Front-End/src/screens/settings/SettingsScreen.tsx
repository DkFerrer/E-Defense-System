// E-Defense — Settings Screen (Light Theme)
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { Colors, FontSizes, FontWeights, Spacing, BorderRadius, Shadows } from '../../styles/theme';
import { RoleLabels } from '../../types';

export const SettingsScreen: React.FC = () => {
  const { user } = useAuth();

  interface MenuItem {
    icon: any;
    label: string;
    onPress?: () => void;
    toggle?: boolean;
  }

  interface MenuSection {
    section: string;
    items: MenuItem[];
  }

  const menuItems: MenuSection[] = [
    { section: 'Account', items: [
      { icon: 'person-outline', label: 'Edit Profile', onPress: () => {} },
      { icon: 'key-outline', label: 'Change Password', onPress: () => {} },
    ]},
    { section: 'Notifications', items: [
      { icon: 'notifications-outline', label: 'Notification Preferences', onPress: () => {} },
      { icon: 'mail-outline', label: 'Email Notifications', toggle: true },
      { icon: 'phone-portrait-outline', label: 'Push Notifications', toggle: true },
    ]},
    { section: 'About', items: [
      { icon: 'information-circle-outline', label: 'About E-Defense', onPress: () => {} },
      { icon: 'help-circle-outline', label: 'Help & Support', onPress: () => {} },
      { icon: 'document-text-outline', label: 'Terms & Privacy', onPress: () => {} },
    ]},
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.first_name?.[0]}{user?.last_name?.[0]}
          </Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{user?.first_name} {user?.last_name}</Text>
          <Text style={styles.profileEmail}>{user?.email}</Text>
          <View style={styles.rolePill}>
            <Text style={styles.roleText}>{user?.role ? RoleLabels[user.role] : 'User'}</Text>
          </View>
        </View>
      </View>

      {/* Menu Sections */}
      {menuItems.map((section) => (
        <View key={section.section} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.section}</Text>
          <View style={styles.sectionCard}>
            {section.items.map((item, idx) => (
              <TouchableOpacity key={item.label} style={[styles.menuItem, idx < section.items.length - 1 && styles.menuBorder]} onPress={item.onPress} disabled={item.toggle}>
                <Ionicons name={item.icon} size={20} color={Colors.light.textSecondary} />
                <Text style={styles.menuLabel}>{item.label}</Text>
                {item.toggle ? <Switch value={true} trackColor={{ true: Colors.accent, false: Colors.light.border }} thumbColor="#FFF" /> : <Ionicons name="chevron-forward" size={18} color={Colors.light.textMuted} />}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      <Text style={styles.version}>E-Defense v1.0.0 · University of Nueva Caceres</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  scroll: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  profileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: BorderRadius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.light.border, marginBottom: Spacing.lg, gap: Spacing.md, ...Shadows.sm },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: FontSizes.xl, fontWeight: FontWeights.bold, color: Colors.white },
  profileInfo: { flex: 1 },
  profileName: { fontSize: FontSizes.lg, fontWeight: FontWeights.bold, color: Colors.light.textPrimary },
  profileEmail: { fontSize: FontSizes.sm, color: Colors.light.textSecondary, marginTop: 2 },
  rolePill: { backgroundColor: Colors.infoBg, paddingHorizontal: 10, paddingVertical: 3, borderRadius: BorderRadius.full, alignSelf: 'flex-start', marginTop: Spacing.xs },
  roleText: { fontSize: FontSizes.xs, color: Colors.accent, fontWeight: FontWeights.semibold },
  section: { marginBottom: Spacing.lg },
  sectionTitle: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold, color: Colors.light.textMuted, marginBottom: Spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionCard: { backgroundColor: Colors.white, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: Colors.light.border, overflow: 'hidden', ...Shadows.sm },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: Spacing.sm },
  menuBorder: { borderBottomWidth: 1, borderBottomColor: Colors.light.border },
  menuLabel: { flex: 1, fontSize: FontSizes.md, color: Colors.light.textPrimary },
  version: { textAlign: 'center', fontSize: FontSizes.xs, color: Colors.light.textMuted, marginTop: Spacing.md },
});
