import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, useWindowDimensions, Platform, KeyboardAvoidingView,
  StatusBar, Image,
} from 'react-native';

const UNC_LOGO = require('../../assets/URC_logo.png');
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';

const ROLES = ['Research Coordinator', 'Dean', 'Panelist', 'Adviser', 'Student'];
const SYSTEMS = ['Scheduling System', 'Post Evaluation System'];

const VALID_USERS: Record<string, { username: string; password: string }[]> = {
  'Research Coordinator': [
    { username: 'coordinator1', password: 'coord123' },
    { username: 'rc.admin', password: 'admin2024' },
  ],
  Dean: [
    { username: 'dean.andrey', password: 'dean123' },
    { username: 'andrey.quintela', password: 'unc2024' },
  ],
  Panelist: [
    { username: 'panelist1', password: 'panel123' },
    { username: 'dr.santos', password: 'santos2024' },
  ],
  Adviser: [
    { username: 'adviser1', password: 'adv123' },
    { username: 'prof.reyes', password: 'reyes2024' },
  ],
  Student: [
    { username: 'student1', password: 'stud123' },
    { username: 'juan.delacruz', password: 'juan2024' },
  ],
};

const validateCredentials = (role: string, user: string, pass: string): boolean =>
  (VALID_USERS[role] ?? []).some((u) => u.username === user && u.password === pass);

// Simple web-compatible select / native touchable
function RoleSelect({
  value, onChange, options, placeholder, id, ariaLabel,
}: {
  value: string; onChange: (v: string) => void; options: string[];
  placeholder: string; id: string; ariaLabel: string;
}) {
  if (Platform.OS === 'web') {
    // Use a raw HTML <select> for proper web accessibility
    const selectElement = React.createElement('select', {
      id,
      value,
      onChange: (e: { target: { value: string } }) => onChange(e.target.value),
      'aria-label': ariaLabel,
      style: {
        width: '100%',
        padding: '14px 16px',
        border: `2px solid ${Colors.inputBorder}`,
        borderRadius: 14,
        fontSize: 16,
        fontFamily: Typography.fontFamily.regular,
        color: value ? Colors.inputText : Colors.inputPlaceholder,
        backgroundColor: Colors.inputBg,
        cursor: 'pointer',
        boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
        appearance: 'auto' as const,
      },
    },
      React.createElement('option', { key: '__placeholder', value: '' }, placeholder),
      ...options.map((o) =>
        React.createElement('option', { key: o, value: o, style: { color: Colors.inputText } }, o)
      ),
    );
    return selectElement;
  }

  // Native fallback — cycle through options on press
  return (
    <TouchableOpacity
      style={styles.select}
      onPress={() => {
        const idx = options.indexOf(value);
        onChange(options[(idx + 1) % options.length] || options[0]);
      }}
      accessibilityRole="combobox"
      accessibilityLabel={ariaLabel}
      accessibilityValue={{ text: value || placeholder }}
    >
      <Text style={[styles.selectText, !value && { color: Colors.inputPlaceholder }]}>
        {value || placeholder}
      </Text>
      <Ionicons name="chevron-down" size={20} color={Colors.textSecondary} />
    </TouchableOpacity>
  );
}

export function LoginScreen() {
  const { login } = useAuth();
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  const [loginAs, setLoginAs] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (role: string, system?: string) => {
    login(role, system);
  };

  const handleSubmit = () => {
    setError('');
    if (!loginAs) { setError('Please select a role.'); return; }
    if (!username) { setError('Please enter your username.'); return; }
    if (!password) { setError('Please enter your password.'); return; }
    if (loginAs === 'Research Coordinator' && !selectedSystem) {
      setError('Please select a system (Scheduling or Post Evaluation).'); return;
    }
    if (!validateCredentials(loginAs, username, password)) {
      setError(`Invalid credentials for ${loginAs}. Please check and try again.`); return;
    }
    handleLogin(loginAs, selectedSystem || undefined);
  };

  const FormPanel = (
    <ScrollView
      contentContainerStyle={[styles.formPanel, !isWide && styles.formPanelMobile]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.formInner}>
        {/* Mobile logo header */}
        {!isWide && (
          <View style={styles.mobileHeader}>
            <Image source={UNC_LOGO} style={styles.mobileLogoImg} accessibilityLabel="UNC Research Center logo" />
            <Text style={styles.mobileTitle}>Post Evaluation</Text>
          </View>
        )}

        <Text style={styles.formHeading}>
          Enter your username and password to continue.
        </Text>

        {/* Login As */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel} nativeID="role-label">Login As:</Text>
          <RoleSelect
            id="role-select"
            value={loginAs}
            onChange={(v) => { setLoginAs(v); setSelectedSystem(''); setError(''); }}
            options={ROLES}
            placeholder="Select Role"
            ariaLabel="Select your role"
          />
        </View>

        {/* System Selection */}
        {loginAs === 'Research Coordinator' && (
          <View style={styles.field}>
            <Text style={styles.fieldLabel} nativeID="system-label">Select System:</Text>
            <RoleSelect
              id="system-select"
              value={selectedSystem}
              onChange={(v) => { setSelectedSystem(v); setError(''); }}
              options={SYSTEMS}
              placeholder="Select System"
              ariaLabel="Select system to access"
            />
          </View>
        )}

        {/* Username */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel} nativeID="username-label">Username:</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={(v) => { setUsername(v); setError(''); }}
            placeholder="e.g. dean.andrey"
            placeholderTextColor={Colors.inputPlaceholder}
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel="Username"
            returnKeyType="next"
          />
        </View>

        {/* Password */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel} nativeID="password-label">Password:</Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={styles.passwordInput}
              value={password}
              onChangeText={(v) => { setPassword(v); setError(''); }}
              placeholder="••••••••••"
              placeholderTextColor={Colors.inputPlaceholder}
              secureTextEntry={!showPassword}
              accessibilityLabel="Password"
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => setShowPassword((p) => !p)}
              accessibilityRole="button"
              accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
            >
              <Ionicons
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={22}
                color={Colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Error */}
        {!!error && (
          <View style={styles.errorBox} accessibilityRole="alert" accessible>
            <Ionicons name="alert-circle" size={16} color={Colors.errorText} style={{ marginRight: 8 }} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Forgot Password */}
        <TouchableOpacity
          style={styles.forgotBtn}
          accessibilityRole="link"
          accessibilityLabel="Forgot Password"
        >
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>

        {/* Sign In */}
        <TouchableOpacity
          style={styles.signInBtn}
          onPress={handleSubmit}
          accessibilityRole="button"
          accessibilityLabel="Sign in to your account"
          activeOpacity={0.85}
        >
          <Text style={styles.signInText}>Sign In</Text>
          <Ionicons name="arrow-forward" size={20} color={Colors.loginBtnText} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  if (!isWide) {
    return (
      <KeyboardAvoidingView style={styles.screenMobile} behavior="padding">
        <StatusBar barStyle="dark-content" />
        {FormPanel}
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" />
      {/* Left dark panel */}
      <View style={styles.leftPanel}>
        <View style={styles.leftLogoWrap}>
          <Image source={UNC_LOGO} style={styles.leftLogoImg} accessibilityLabel="UNC Research Center logo" />
        </View>
        <Text style={styles.leftTitle}>Research Defense{'\n'}Scheduler</Text>
        <Text style={styles.leftSubtitle}>
          Welcome to the Defense Appointment Scheduling!{'\n'}
          Your all-in-one platform for managing academic{'\n'}
          schedules efficiently.
        </Text>
        <Text style={styles.leftBrand}>UNC Research Defense{'\n'}Scheduler</Text>
      </View>

      {/* Right white panel */}
      {FormPanel}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: Colors.loginRightBg,
  },
  screenMobile: { flex: 1, backgroundColor: Colors.loginRightBg },

  // Left panel
  leftPanel: {
    flex: 0.45,
    backgroundColor: Colors.loginLeftBg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  leftLogoWrap: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  leftLogoImg: {
    width: 130,
    height: 130,
    borderRadius: 65,
  },
  leftTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize['4xl'],
    color: Colors.loginTitleWhite,
    textAlign: 'center',
    lineHeight: 44,
    marginBottom: 24,
  },
  leftSubtitle: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.md,
    color: Colors.loginSubtitleWhite,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 40,
  },
  leftBrand: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize['2xl'],
    color: Colors.loginAccentRed,
    textAlign: 'center',
    lineHeight: 32,
  },

  // Form panel
  formPanel: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 48,
  },
  formPanelMobile: { padding: 24 },
  formInner: { maxWidth: 480, width: '100%', alignSelf: 'center' },

  mobileHeader: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 20,
  },
  mobileLogoImg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  mobileTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.xl,
    color: Colors.textPrimary,
  },

  formHeading: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.lg,
    color: Colors.textPrimary,
    marginBottom: 28,
    lineHeight: 26,
  },
  field: { marginBottom: 20 },
  fieldLabel: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.base,
    color: Colors.inputLabel,
    marginBottom: 8,
  },
  select: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: Colors.inputBorder,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.inputBg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  selectText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.md,
    color: Colors.inputText,
    flex: 1,
  },
  input: {
    borderWidth: 2,
    borderColor: Colors.inputBorder,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.md,
    color: Colors.inputText,
    backgroundColor: Colors.inputBg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.md,
    color: Colors.inputText,
    backgroundColor: 'transparent',
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.inputBorder,
    borderRadius: 14,
    backgroundColor: Colors.inputBg,
    paddingHorizontal: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  eyeBtn: {
    padding: 10,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.errorBg,
    borderWidth: 1,
    borderColor: Colors.errorBorder,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  errorText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.sm,
    color: Colors.errorText,
    flex: 1,
  },
  forgotBtn: {
    alignSelf: 'center',
    marginBottom: 20,
    minHeight: 44,
    justifyContent: 'center',
  },
  forgotText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
    textDecorationLine: 'underline',
  },
  signInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.loginBtnBg,
    borderRadius: 14,
    paddingVertical: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  signInText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.lg,
    color: Colors.loginBtnText,
  },
  demoBox: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 12,
    padding: 16,
  },
  demoTitle: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.sm,
    color: '#1E3A8A',
    marginBottom: 10,
  },
  demoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  demoBtn: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 44,
    justifyContent: 'center',
  },
  demoBtnText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.xs,
    color: '#fff',
  },
});
