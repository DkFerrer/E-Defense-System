import React from 'react';
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
} from 'react-native';
import {
  User,
  Mail,
  Shield,
  Building,
  Briefcase,
  Settings,
  LogOut,
  ChevronRight,
  Edit,
} from 'lucide-react-native';
import { colors } from '../theme/tokens';
import { useApp } from '../context/AppContext';
import { Alert } from 'react-native';

const MOCK_AVATAR_URL = 'https://i.pravatar.cc/150?img=11';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const { user, logout } = useApp();
  
  const [avatarUri, setAvatarUri] = React.useState(null);
  const [showPasswordModal, setShowPasswordModal] = React.useState(false);
  const [showForgotModal, setShowForgotModal] = React.useState(false);
  
  const [currentPass, setCurrentPass] = React.useState('');
  const [newPass, setNewPass] = React.useState('');
  const [confirmPass, setConfirmPass] = React.useState('');
  const [forgotEmail, setForgotEmail] = React.useState('');

  const handleUploadProfile = () => {
    // Simulate image picker delay
    Alert.alert('Upload Profile Picture', 'Choose an option', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Choose from Gallery', onPress: () => setAvatarUri(MOCK_AVATAR_URL) },
      { text: 'Take a Photo', onPress: () => setAvatarUri(MOCK_AVATAR_URL) }
    ]);
  };

  const handleChangePassword = () => {
    if (!currentPass || !newPass || !confirmPass) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    if (newPass !== confirmPass) {
      Alert.alert('Error', 'New password and confirm password do not match.');
      return;
    }
    Alert.alert('Success', 'Password changed successfully!');
    setShowPasswordModal(false);
    setCurrentPass(''); setNewPass(''); setConfirmPass('');
  };

  const handleForgotPassword = () => {
    if (!forgotEmail) {
      Alert.alert('Error', 'Please enter your email.');
      return;
    }
    Alert.alert('Success', 'A password reset link has been sent to your email.');
    setShowForgotModal(false);
    setForgotEmail('');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.title}>My Profile</Text>
        <Pressable style={styles.editBtn} onPress={() => Alert.alert('Edit Profile', 'Profile editing is coming soon!')}>
          <Edit size={18} color="#4b5563" />
          <Text style={styles.editBtnText}>Edit Profile</Text>
        </Pressable>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <Pressable style={styles.avatar} onPress={handleUploadProfile}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={{ width: '100%', height: '100%', borderRadius: 48 }} />
            ) : (
              <Text style={styles.avatarText}>{(user?.name || '?').charAt(0)}</Text>
            )}
            <View style={styles.editAvatarBadge}>
              <Edit size={12} color="#ffffff" />
            </View>
          </Pressable>
          <View style={styles.onlineBadge} />
        </View>
        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.userRole}>{user?.roleLabel || 'Panel Member'}</Text>
        
        <View style={styles.tagRow}>
          <View style={styles.tag}><Text style={styles.tagText}>{user?.department || 'SCIS'}</Text></View>
          <View style={styles.tag}><Text style={styles.tagText}>{user?.position || 'Faculty'}</Text></View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Information</Text>
        <View style={styles.infoList}>
          <InfoItem icon={<Mail size={18} color="#6b7280" />} label="Email" value={user?.email || 'panelist@unc.edu.ph'} />
          <InfoItem icon={<Shield size={18} color="#6b7280" />} label="Account ID" value={user?.id || 'P-12903'} isMono />
          <InfoItem icon={<Building size={18} color="#6b7280" />} label="Department" value={user?.department || 'School of Computer Studies'} />
          <InfoItem icon={<Briefcase size={18} color="#6b7280" />} label="Position" value={user?.position || 'Associate Professor'} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings & Privacy</Text>
        <View style={styles.actionList}>
          <ActionItem 
            icon={<Shield size={18} color="#4b5563" />} 
            label="Change Password" 
            onPress={() => setShowPasswordModal(true)} 
          />
          <ActionItem 
            icon={<Mail size={18} color="#4b5563" />} 
            label="Forgot Password" 
            onPress={() => setShowForgotModal(true)} 
          />
          <Pressable style={styles.logoutBtn} onPress={logout}>
            <LogOut size={18} color="#ef4444" />
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
              <TextInput style={styles.textInput} secureTextEntry value={currentPass} onChangeText={setCurrentPass} placeholder="••••••••" />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>New Password</Text>
              <TextInput style={styles.textInput} secureTextEntry value={newPass} onChangeText={setNewPass} placeholder="••••••••" />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm New Password</Text>
              <TextInput style={styles.textInput} secureTextEntry value={confirmPass} onChangeText={setConfirmPass} placeholder="••••••••" />
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
              <TextInput style={styles.textInput} keyboardType="email-address" autoCapitalize="none" value={forgotEmail} onChangeText={setForgotEmail} placeholder="your@email.com" />
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

function InfoItem({ icon, label, value, isMono }) {
  return (
    <View style={styles.infoItem}>
      <View style={styles.infoIcon}>{icon}</View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={[styles.infoVal, isMono && styles.mono]}>{value}</Text>
      </View>
    </View>
  );
}

function ActionItem({ icon, label, onPress }) {
  return (
    <Pressable style={styles.actionItem} onPress={onPress}>
      <View style={styles.actionLeft}>
        {icon}
        <Text style={styles.actionLabel}>{label}</Text>
      </View>
      <ChevronRight size={18} color="#9ca3af" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  scrollContent: { paddingBottom: 40 },
  header: { padding: 24, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 26, fontWeight: '900', color: '#111827' },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f3f4f6', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  editBtnText: { fontSize: 13, fontWeight: '700', color: '#4b5563' },
  profileCard: { backgroundColor: '#ffffff', margin: 16, padding: 32, borderRadius: 24, alignItems: 'center', elevation: 2 },
  avatarContainer: { position: 'relative', marginBottom: 16 },
  avatar: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#111827', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#ffffff', fontSize: 36, fontWeight: '900' },
  onlineBadge: { position: 'absolute', right: 4, bottom: 4, width: 20, height: 20, borderRadius: 10, backgroundColor: '#16a34a', borderLineWidth: 3, borderColor: '#ffffff' },
  userName: { fontSize: 22, fontWeight: '900', color: '#111827' },
  userRole: { fontSize: 14, color: '#6b7280', fontWeight: '600', marginTop: 4 },
  tagRow: { flexDirection: 'row', gap: 8, marginTop: 16 },
  tag: { backgroundColor: '#eff6ff', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
  tagText: { color: '#2563eb', fontSize: 12, fontWeight: '800' },
  section: { marginHorizontal: 16, marginTop: 16 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: '#9ca3af', textTransform: 'uppercase', marginBottom: 12, marginLeft: 8 },
  infoList: { backgroundColor: '#ffffff', borderRadius: 20, padding: 8 },
  infoItem: { flexDirection: 'row', padding: 12, alignItems: 'center', gap: 12 },
  infoIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#f9fafb', alignItems: 'center', justifyContent: 'center' },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 11, color: '#9ca3af', fontWeight: '700', textTransform: 'uppercase' },
  infoVal: { fontSize: 14, color: '#111827', fontWeight: '700', marginTop: 2 },
  mono: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  actionList: { backgroundColor: '#ffffff', borderRadius: 20, padding: 8 },
  actionItem: { flexDirection: 'row', padding: 16, alignItems: 'center', justifyContent: 'space-between' },
  actionLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  actionLabel: { fontSize: 15, fontWeight: '700', color: '#111827' },
  logoutBtn: { flexDirection: 'row', padding: 16, alignItems: 'center', gap: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6', marginTop: 8 },
  logoutText: { fontSize: 15, fontWeight: '800', color: '#ef4444' },
  
  // Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalBox: { width: '100%', maxWidth: 400, backgroundColor: '#ffffff', borderRadius: 24, padding: 32 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 16, textAlign: 'center' },
  modalSub: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 13, fontWeight: '700', color: '#4b5563', marginBottom: 8 },
  textInput: { height: 48, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, paddingHorizontal: 16, fontSize: 15, color: '#111827' },
  saveBtn: { backgroundColor: '#1e3a8a', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  saveBtnText: { color: '#ffffff', fontSize: 15, fontWeight: '800' },
  cancelBtn: { paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  cancelBtnText: { color: '#6b7280', fontSize: 15, fontWeight: '700' },
  editAvatarBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#1e3a8a', width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#ffffff' }
});
