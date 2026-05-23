import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Dimensions,
  Platform,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { Colors } from '../../src/theme/colors';
import { Typography } from '../../src/theme/typography';

const { width } = Dimensions.get('window');

const showNativeAlert = (title: string, message: string) => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') window.alert(`${title}: ${message}`);
  } else {
    Alert.alert(title, message);
  }
};

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');

  const handleChangePassword = () => {
    if (!currentPass || !newPass || !confirmPass) {
      showNativeAlert('Error', 'Please fill in all fields.');
      return;
    }
    if (newPass !== confirmPass) {
      showNativeAlert('Error', 'New password and confirm password do not match.');
      return;
    }
    showNativeAlert('Success', 'Password changed successfully!');
    setShowPasswordModal(false);
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
  };

  const handleForgotPassword = () => {
    if (!forgotEmail) {
      showNativeAlert('Error', 'Please enter your email.');
      return;
    }
    showNativeAlert('Success', 'A password reset link has been sent to your email.');
    setShowForgotModal(false);
    setForgotEmail('');
  };

  const email = user?.role === 'Panel Chairman' ? 'dr.chair@unc.edu.ph' : `${user?.name.toLowerCase().replace(/\s/g, '') || 'user'}@unc.edu.ph`;
  const accountId = user?.role === 'Panel Chairman' ? 'C-10294' : 'P-12903';
  const department = 'School of Computer and Information Sciences';
  const position = user?.role || 'Faculty';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(user?.name || '?').charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.onlineBadge} />
        </View>
        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.userRole}>{user?.title || 'Panel Member'}</Text>

        <View style={styles.tagRow}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>SCIS</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{position}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Information</Text>
        <View style={styles.infoList}>
          <InfoItem icon="mail-outline" label="Email" value={email} />
          <InfoItem icon="shield-checkmark-outline" label="Account ID" value={accountId} isMono />
          <InfoItem icon="business-outline" label="Department" value={department} />
          <InfoItem icon="briefcase-outline" label="Position" value={position} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings & Privacy</Text>
        <View style={styles.actionList}>
          <ActionItem
            icon="shield-outline"
            label="Change Password"
            onPress={() => setShowPasswordModal(true)}
          />
          <ActionItem
            icon="mail-outline"
            label="Forgot Password"
            onPress={() => setShowForgotModal(true)}
          />
          <Pressable style={styles.logoutBtn} onPress={logout} accessibilityRole="button" accessibilityLabel="Log out">
            <Ionicons name="log-out-outline" size={18} color="#ef4444" />
            <Text style={styles.logoutText}>Log Out</Text>
          </Pressable>
        </View>
      </View>

      {/* Change Password Modal */}
      <Modal visible={showPasswordModal} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setShowPasswordModal(false)}>
          <View style={styles.modalBox} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>Change Password</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Current Password</Text>
              <TextInput style={styles.textInput} secureTextEntry value={currentPass} onChangeText={setCurrentPass} placeholder="••••••••" placeholderTextColor="#9ca3af" />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>New Password</Text>
              <TextInput style={styles.textInput} secureTextEntry value={newPass} onChangeText={setNewPass} placeholder="••••••••" placeholderTextColor="#9ca3af" />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm New Password</Text>
              <TextInput style={styles.textInput} secureTextEntry value={confirmPass} onChangeText={setConfirmPass} placeholder="••••••••" placeholderTextColor="#9ca3af" />
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleChangePassword}>
              <Text style={styles.saveBtnText}>Save Password</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowPasswordModal(false)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Forgot Password Modal */}
      <Modal visible={showForgotModal} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowForgotModal(false)}>
          <View style={styles.modalBox} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>Forgot Password</Text>
            <Text style={styles.modalSub}>Enter your email address to receive a password reset link.</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput style={styles.textInput} keyboardType="email-address" autoCapitalize="none" value={forgotEmail} onChangeText={setForgotEmail} placeholder="your@email.com" placeholderTextColor="#9ca3af" />
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleForgotPassword}>
              <Text style={styles.saveBtnText}>Send Reset Link</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowForgotModal(false)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

function InfoItem({ icon, label, value, isMono }: { icon: string; label: string; value: string; isMono?: boolean }) {
  return (
    <View style={styles.infoItem}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon as any} size={18} color="#6b7280" />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={[styles.infoVal, isMono && styles.mono]}>{value}</Text>
      </View>
    </View>
  );
}

function ActionItem({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.actionItem} onPress={onPress}>
      <View style={styles.actionLeft}>
        <Ionicons name={icon as any} size={18} color="#4b5563" />
        <Text style={styles.actionLabel}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward-outline" size={18} color="#9ca3af" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.pageBg },
  scrollContent: { paddingBottom: 40 },
  profileCard: { backgroundColor: '#ffffff', margin: 16, padding: 32, borderRadius: 24, alignItems: 'center', elevation: 2 },
  avatarContainer: { position: 'relative', marginBottom: 16 },
  avatar: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#ea580c', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#ffffff', fontSize: 36, fontFamily: Typography.fontFamily.bold },
  onlineBadge: { position: 'absolute', right: 4, bottom: 4, width: 20, height: 20, borderRadius: 10, backgroundColor: '#16a34a', borderWidth: 3, borderColor: '#ffffff' },
  userName: { fontSize: 22, fontFamily: Typography.fontFamily.bold, color: '#111827' },
  userRole: { fontSize: 14, color: '#6b7280', fontFamily: Typography.fontFamily.semiBold, marginTop: 4 },
  tagRow: { flexDirection: 'row', gap: 8, marginTop: 16 },
  tag: { backgroundColor: '#fff7ed', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
  tagText: { color: '#ea580c', fontSize: 12, fontFamily: Typography.fontFamily.bold },
  section: { marginHorizontal: 16, marginTop: 16 },
  sectionTitle: { fontSize: 12, fontFamily: Typography.fontFamily.bold, color: '#9ca3af', textTransform: 'uppercase', marginBottom: 12, marginLeft: 8 },
  infoList: { backgroundColor: '#ffffff', borderRadius: 20, padding: 8 },
  infoItem: { flexDirection: 'row', padding: 12, alignItems: 'center', gap: 12 },
  infoIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#f9fafb', alignItems: 'center', justifyContent: 'center' },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 11, color: '#9ca3af', fontFamily: Typography.fontFamily.bold, textTransform: 'uppercase' },
  infoVal: { fontSize: 14, color: '#111827', fontFamily: Typography.fontFamily.bold, marginTop: 2 },
  mono: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  actionList: { backgroundColor: '#ffffff', borderRadius: 20, padding: 8 },
  actionItem: { flexDirection: 'row', padding: 16, alignItems: 'center', justifyContent: 'space-between' },
  actionLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  actionLabel: { fontSize: 15, fontFamily: Typography.fontFamily.bold, color: '#111827' },
  logoutBtn: { flexDirection: 'row', padding: 16, alignItems: 'center', gap: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6', marginTop: 8 },
  logoutText: { fontSize: 15, fontFamily: Typography.fontFamily.bold, color: '#ef4444' },

  // Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalBox: { width: '100%', maxWidth: 400, backgroundColor: '#ffffff', borderRadius: 24, padding: 32 },
  modalTitle: { fontSize: 20, fontFamily: Typography.fontFamily.bold, color: '#111827', marginBottom: 16, textAlign: 'center' },
  modalSub: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 24, lineHeight: 20, fontFamily: Typography.fontFamily.regular },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 13, fontFamily: Typography.fontFamily.bold, color: '#4b5563', marginBottom: 8 },
  textInput: { height: 48, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, paddingHorizontal: 16, fontSize: 15, color: '#111827', fontFamily: Typography.fontFamily.medium },
  saveBtn: { backgroundColor: '#ea580c', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  saveBtnText: { color: '#ffffff', fontSize: 15, fontFamily: Typography.fontFamily.bold },
  cancelBtn: { paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  cancelBtnText: { color: '#6b7280', fontSize: 15, fontFamily: Typography.fontFamily.bold },
});
