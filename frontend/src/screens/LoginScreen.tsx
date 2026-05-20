import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  Platform,
  KeyboardAvoidingView,
  StatusBar,
  Image,
  Dimensions,
  Pressable,
  Modal,
  Alert,
} from 'react-native';
import { 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ChevronDown,
  UserCheck,
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const LOGO = require('../assets/urc-e-defense-logo.png');

export default function LoginScreen() {
  const { login } = useAuth();
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  const [loginAs, setLoginAs] = useState('Panelist');
  const [username, setUsername] = useState('23-181818');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showRolePicker, setShowRolePicker] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const ROLES = ['Panelist', 'Dean', 'Research Coordinator', 'Adviser', 'Student', 'Admin'];

  const handleSubmit = async () => {
    setError('');
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }

    setBusy(true);
    try {
      await login({
        username,
        password,
        role: loginAs,
      });
    } catch (e) {
      setError(e.message || 'Login failed. Please check your credentials.');
    } finally {
      setBusy(false);
    }
  };
  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={[styles.mainLayout, !isWide && styles.mainLayoutMobile]}>
          <LeftPanel isWide={isWide} />
          <RightPanel 
            isWide={isWide}
            loginAs={loginAs}
            setLoginAs={setLoginAs}
            username={username}
            setUsername={setUsername}
            password={password}
            setPassword={setPassword}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            error={error}
            busy={busy}
            handleSubmit={handleSubmit}
            showRolePicker={showRolePicker}
            setShowRolePicker={setShowRolePicker}
            setShowForgotPassword={setShowForgotPassword}
            ROLES={ROLES}
          />
        </View>
      </ScrollView>

      <Modal visible={showForgotPassword} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setShowForgotPassword(false)}>
          <View style={styles.forgotBox}>
            <Text style={styles.pickerTitle}>Forgot Password?</Text>
            <Text style={styles.forgotSub}>Enter your email address and we'll send you a link to reset your password.</Text>
            
            <TextInput
              style={styles.textInputForgot}
              value={forgotEmail}
              onChangeText={setForgotEmail}
              placeholder="your@email.com"
              placeholderTextColor="#9ca3af"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TouchableOpacity 
              style={styles.resetBtn} 
              onPress={() => {
                if (!forgotEmail) {
                  Alert.alert('Error', 'Please enter your email.');
                  return;
                }
                Alert.alert('Success', 'Password reset link sent to your email!');
                setShowForgotPassword(false);
                setForgotEmail('');
              }}
            >
              <Text style={styles.resetBtnText}>Send Reset Link</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelForgot} onPress={() => setShowForgotPassword(false)}>
              <Text style={styles.cancelForgotText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const LeftPanel = ({ isWide }) => (
  <View style={[styles.leftPanel, !isWide && styles.leftPanelMobile]}>
    <View style={styles.logoOuterWrapper}>
       <Image source={LOGO} style={styles.logoImage} resizeMode="contain" />
    </View>

    <Text style={styles.leftTitle}>Research Defense Scheduler</Text>
    <Text style={styles.leftSubtitle}>
      Welcome to the Defense Appointment Scheduling!{'\n'}
      Your all-in-one platform for managing academic schedules efficiently.
    </Text>
    
    <Text style={styles.brandTextRed}>UNC Research Defense Scheduler</Text>
  </View>
);

const RightPanel = ({ 
  isWide, 
  loginAs, 
  setLoginAs, 
  username, 
  setUsername, 
  password, 
  setPassword, 
  showPassword, 
  setShowPassword, 
  error, 
  busy, 
  handleSubmit, 
  showRolePicker, 
  setShowRolePicker, 
  setShowForgotPassword,
  ROLES 
}) => (
  <View style={[styles.rightPanel, !isWide && styles.rightPanelMobile]}>
    <View style={styles.formContainer}>
      <Text style={styles.formHeading}>Enter your username and password to continue.</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Login As:</Text>
        <TouchableOpacity 
          style={styles.dropdownWrapper} 
          onPress={() => setShowRolePicker(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.dropdownValue}>{loginAs}</Text>
          <ChevronDown size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Username:</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            value={username}
            onChangeText={setUsername}
            placeholder="e.g. 23-181818"
            placeholderTextColor="#9ca3af"
            autoCapitalize="none"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Password:</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••••"
            placeholderTextColor="#9ca3af"
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIconBtn}>
            {showPassword ? <EyeOff size={20} color="#6b7280" /> : <Eye size={20} color="#6b7280" />}
          </TouchableOpacity>
        </View>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity style={styles.forgotLink} onPress={() => setShowForgotPassword(true)}>
        <Text style={styles.forgotLinkText}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.signInBtn, busy && { opacity: 0.7 }]} 
        onPress={handleSubmit}
        disabled={busy}
      >
        <Text style={styles.signInBtnText}>{busy ? 'Signing In...' : 'Sign In'}</Text>
        <ArrowRight size={20} color="#1e3a8a" />
      </TouchableOpacity>
    </View>

    <Modal visible={showRolePicker} transparent animationType="fade">
      <Pressable style={styles.modalOverlay} onPress={() => setShowRolePicker(false)}>
        <View style={styles.pickerBox}>
          <Text style={styles.pickerTitle}>Select Role</Text>
          <ScrollView>
            {ROLES.map((role) => (
              <TouchableOpacity
                key={role}
                style={[styles.pickerItem, loginAs === role && styles.pickerItemActive]}
                onPress={() => {
                  setLoginAs(role);
                  setShowRolePicker(false);
                }}
              >
                <Text style={[styles.pickerItemText, loginAs === role && styles.pickerItemTextActive]}>
                  {role}
                </Text>
                {loginAs === role && <UserCheck size={18} color="#2563eb" />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Pressable>
    </Modal>
  </View>
);




const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  mainLayout: { flex: 1, flexDirection: 'row' },
  mainLayoutMobile: { flexDirection: 'column' },

  // Left Panel Styles
  leftPanel: {
    flex: 0.45,
    backgroundColor: '#262626', // Dark charcoal
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    minHeight: SCREEN_WIDTH > 768 ? '100%' : 400,
  },
  leftPanelMobile: { flex: 0, paddingVertical: 60 },
  logoOuterWrapper: {
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#ffffff',
    padding: 10,
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: { boxShadow: '0 10px 25px rgba(0,0,0,0.3)' },
      default: { elevation: 10 }
    })
  },
  logoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 110,
  },
  leftTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5
  },
  leftSubtitle: {
    fontSize: 14,
    color: '#d1d5db',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 48,
    paddingHorizontal: 20
  },
  brandTextRed: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ef4444',
    textAlign: 'center',
    letterSpacing: 1
  },

  // Right Panel Styles
  rightPanel: {
    flex: 0.55,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  rightPanelMobile: { flex: 1, paddingVertical: 60 },
  formContainer: {
    width: '100%',
    maxWidth: 440,
  },
  formHeading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 32,
    lineHeight: 28
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 8
  },
  dropdownWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    ...Platform.select({ web: { boxShadow: '0 2px 4px rgba(0,0,0,0.05)' } })
  },
  dropdownValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500'
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    ...Platform.select({ web: { boxShadow: '0 2px 4px rgba(0,0,0,0.05)' } })
  },
  textInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#111827',
    fontWeight: '500'
  },
  eyeIconBtn: {
    padding: 8
  },
  forgotLink: {
    alignSelf: 'center',
    marginBottom: 32
  },
  forgotLinkText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    textDecorationLine: 'underline'
  },
  signInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dbeafe', // Light blue
    paddingVertical: 16,
    borderRadius: 14,
    gap: 12,
    ...Platform.select({
      web: { boxShadow: '0 4px 12px rgba(37, 99, 235, 0.15)' },
      default: { elevation: 4 }
    })
  },
  signInBtnText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e3a8a', // Dark blue
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  pickerBox: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    maxHeight: '60%',
    ...Platform.select({
      web: { boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)' },
      default: { elevation: 10 }
    })
  },
  pickerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 20,
    textAlign: 'center'
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 4
  },
  pickerItemActive: {
    backgroundColor: '#eff6ff',
  },
  pickerItemText: {
    fontSize: 16,
    color: '#4b5563',
    fontWeight: '500'
  },
  pickerItemTextActive: {
    color: '#2563eb',
    fontWeight: '700'
  },
  forgotBox: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center'
  },
  forgotSub: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20
  },
  textInputForgot: {
    width: '100%',
    height: 56,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#111827',
    marginBottom: 24
  },
  resetBtn: {
    width: '100%',
    backgroundColor: '#1e3a8a',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16
  },
  resetBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800'
  },
  cancelForgot: {
    padding: 8
  },
  cancelForgotText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '600'
  }
});
