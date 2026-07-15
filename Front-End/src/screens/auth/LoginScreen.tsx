// E-Defense — Login Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

// @ts-ignore
import UNCLogo from '../../assets/unc-logo.png';

export const LoginScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      alert('Please fill in both email and password.');
      return;
    }
    try {
      setLoading(true);
      await login({ email: username.trim(), password: password });
      // Navigation is automatically handled by AuthContext state changes
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'Login failed. Please verify your credentials.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Left Panel */}
      <View style={styles.leftPanel}>
        <View style={styles.leftContent}>
          <View style={styles.logoCircle}>
             <Image source={UNCLogo} style={styles.logoImage} resizeMode="contain" />
          </View>
          <Text style={styles.brandTitle}>Research Defense Scheduler</Text>
          <Text style={styles.brandSubtitle}>
            Welcome to the Defense Appointment Scheduling!{'\n'}
            Your all-in-one platform for managing academic{'\n'}
            schedules efficiently.
          </Text>
          <Text style={styles.bottomLabel}>UNC Research Defense Scheduler</Text>
        </View>
      </View>

      {/* Right Panel */}
      <View style={styles.rightPanel}>
        <View style={styles.formWrapper}>
          <Text style={styles.formHeading}>
            Sign in with your registered email and password.
          </Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Email Address:</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email address"
              placeholderTextColor="#A0AEC0"
              value={username}
              onChangeText={setUsername}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Password:</Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="*********"
                placeholderTextColor="#A0AEC0"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#718096" />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.forgotLink}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.signInBtn, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            activeOpacity={0.8}
            disabled={loading}
          >
            <Text style={styles.signInText}>{loading ? 'Signing In...' : 'Sign In'}</Text>
            {!loading && <Ionicons name="arrow-forward-outline" size={18} color="#FFF" style={{ marginLeft: 8 }} />}
          </TouchableOpacity>

          <View style={styles.registerRow}>
            <Text style={styles.registerText}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Create Account</Text>
            </TouchableOpacity>
          </View>

          {/* ── Demo Accounts Panel ── */}
          <View style={styles.demoPanel}>
            <Text style={styles.demoPanelTitle}>🔑 Demo Accounts</Text>
            <Text style={styles.demoPanelHint}>Tap a card to auto-fill credentials</Text>

            <TouchableOpacity
              style={styles.demoCard}
              activeOpacity={0.75}
              onPress={() => {
                setUsername('dean.demo@unc.edu.ph');
                setPassword('demo1234');
              }}
            >
              <View style={[styles.demoRoleBadge, { backgroundColor: '#7C3AED' }]}>
                <Text style={styles.demoRoleText}>DEAN</Text>
              </View>
              <View style={styles.demoCardInfo}>
                <Text style={styles.demoEmail}>dean.demo@unc.edu.ph</Text>
                <Text style={styles.demoPassword}>Password: demo1234</Text>
              </View>
              <Ionicons name="arrow-forward-circle-outline" size={20} color="#7C3AED" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.demoCard}
              activeOpacity={0.75}
              onPress={() => {
                setUsername('adviser.demo@unc.edu.ph');
                setPassword('demo1234');
              }}
            >
              <View style={[styles.demoRoleBadge, { backgroundColor: '#0891B2' }]}>
                <Text style={styles.demoRoleText}>ADVISER</Text>
              </View>
              <View style={styles.demoCardInfo}>
                <Text style={styles.demoEmail}>adviser.demo@unc.edu.ph</Text>
                <Text style={styles.demoPassword}>Password: demo1234</Text>
              </View>
              <Ionicons name="arrow-forward-circle-outline" size={20} color="#0891B2" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F4F5F7',
  },
  leftPanel: {
    width: '45%',
    backgroundColor: '#303030',
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftContent: {
    alignItems: 'center',
    width: '80%',
  },
  logoCircle: {
    marginBottom: 30,
    backgroundColor: '#fff',
    borderRadius: 100,
    padding: 10,
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: 130,
    height: 130,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  brandSubtitle: {
    fontSize: 14,
    color: '#A0AEC0',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
  },
  bottomLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E74C3C',
    marginTop: 40,
  },
  rightPanel: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F5F7',
  },
  formWrapper: {
    width: 400,
  },
  formHeading: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2D3748',
    marginBottom: 30,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 12,
    color: '#4A5568',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 15,
    height: 45,
    fontSize: 14,
    color: '#2D3748',
    outlineStyle: 'none' as any,
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    height: 45,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  picker: {
    height: 45,
    width: '100%',
    backgroundColor: 'transparent',
    borderWidth: 0,
    fontSize: 14,
    color: '#2D3748',
    paddingHorizontal: 10,
    outlineStyle: 'none' as any,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 15,
    height: 45,
  },
  passwordInput: {
    flex: 1,
    fontSize: 14,
    color: '#2D3748',
    height: '100%',
    outlineStyle: 'none' as any,
  },
  forgotLink: {
    alignSelf: 'flex-end',
    marginBottom: 30,
  },
  forgotText: {
    fontSize: 13,
    color: '#1C64F2',
  },
  signInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1C64F2',
    borderRadius: 8,
    height: 45,
    marginBottom: 20,
  },
  signInText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  registerText: {
    fontSize: 14,
    color: '#718096',
    marginRight: 5,
  },
  registerLink: {
    fontSize: 14,
    color: '#1C64F2',
    fontWeight: '500',
  },
  // ── Demo Accounts Panel ──────────────────────────────────────
  demoPanel: {
    marginTop: 28,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 20,
  },
  demoPanelTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 2,
  },
  demoPanelHint: {
    fontSize: 11,
    color: '#A0AEC0',
    marginBottom: 12,
  },
  demoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  demoRoleBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 12,
    minWidth: 64,
    alignItems: 'center',
  },
  demoRoleText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  demoCardInfo: {
    flex: 1,
  },
  demoEmail: {
    fontSize: 13,
    color: '#2D3748',
    fontWeight: '500',
  },
  demoPassword: {
    fontSize: 11,
    color: '#718096',
    marginTop: 2,
  },
});
