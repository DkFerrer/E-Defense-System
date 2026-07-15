// E-Defense — Register Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

// @ts-ignore
import UNCLogo from '../../assets/unc-logo.png';

import { useAuth } from '../../contexts/AuthContext';

export const RegisterScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    middle_name: '',
    suffix: '',
    email: '',
    password: '',
    confirm_password: '',
    student_number: '',
    phone_number: '',
  });

  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedGradeLevel, setSelectedGradeLevel] = useState('');


  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const departmentsData: { [key: string]: string[] } = {
    "School of Social and Natural Sciences": ["AB Psychology", "AB Political Science", "BS Biology"],
    "School of Business and Accountancy": ["BS Accountancy", "BS Tourism Management", "BS Financial Management", "BS Hospitality Management", "BS Entrepreneurship", "BS Business Administration"],
    "School of Computer and Information Sciences": ["BS Computer Science", "BS Information Technology", "BLIS", "ACT"],
    "School of Teacher Education": ["BEED", "BSED", "BPED"],
    "School of Nursing and Allied Health Sciences": ["BS Nursing"],
    "College of Engineering and Architecture": ["BS Civil Engineering", "BS Mechanical Engineering", "BS Computer Engineering", "BS Electrical Engineering", "BS Electronics and Communication Engineering", "BS Interior Design", "BS Architecture"],
    "College of Criminal Justice": ["BS Criminology", "BS Forensic Science"]
  };

  const gradeLevels = [
    "3rd Year - 2nd Sem",
    "4th Year - 1st Sem",
    "4th Year - 2nd Sem"
  ];

  const handleRegister = async () => {
    try {
      setLoading(true);

      // Basic validation
      if (formData.password !== formData.confirm_password) {
        alert("Passwords do not match");
        return;
      }

      await register({
        first_name: formData.first_name,
        last_name: formData.last_name,
        middle_name: formData.middle_name,
        suffix: formData.suffix,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.confirm_password,
        student_number: formData.student_number,
        department: selectedDepartment,
        course: selectedCourse,
        grade_level: selectedGradeLevel,
        phone_number: formData.phone_number,
        role: 'student_researcher',
        college: selectedDepartment,
      });

      // Navigation will be handled by AuthContext state change automatically
    } catch (error: any) {
      console.error('Registration error:', error);
      alert(error.response?.data?.message || 'Registration failed. Please check your inputs.');
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
            <Image source={UNCLogo} style={styles.logoImage as any} resizeMode="contain" />
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
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.formWrapper}>
            <Text style={styles.formHeading}>
              Create your account to get started.
            </Text>

            <View style={styles.row}>
              <View style={[styles.fieldGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.fieldLabel}>Last Name: <Text style={styles.asterisk}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  placeholder="Last Name"
                  placeholderTextColor="#A0AEC0"
                  value={formData.last_name}
                  onChangeText={(val) => setFormData({ ...formData, last_name: val })}
                />
              </View>
              <View style={[styles.fieldGroup, { flex: 1, marginLeft: 10 }]}>
                <Text style={styles.fieldLabel}>First Name: <Text style={styles.asterisk}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  placeholder="First Name"
                  placeholderTextColor="#A0AEC0"
                  value={formData.first_name}
                  onChangeText={(val) => setFormData({ ...formData, first_name: val })}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.fieldGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.fieldLabel}>Middle Name:</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Middle Name (Optional)"
                  placeholderTextColor="#A0AEC0"
                  value={formData.middle_name}
                  onChangeText={(val) => setFormData({ ...formData, middle_name: val })}
                />
              </View>
              <View style={[styles.fieldGroup, { flex: 1, marginLeft: 10 }]}>
                <Text style={styles.fieldLabel}>Suffix:</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Jr., Sr., III (Optional)"
                  placeholderTextColor="#A0AEC0"
                  value={formData.suffix}
                  onChangeText={(val) => setFormData({ ...formData, suffix: val })}
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Department: <Text style={styles.asterisk}>*</Text></Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedDepartment}
                  onValueChange={(itemValue) => {
                    setSelectedDepartment(itemValue);
                    setSelectedCourse(''); // Reset course when department changes
                  }}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Department" value="" color="#A0AEC0" />
                  {Object.keys(departmentsData).map((dept) => (
                    <Picker.Item key={dept} label={dept} value={dept} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Course: <Text style={styles.asterisk}>*</Text></Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedCourse}
                  onValueChange={(itemValue) => setSelectedCourse(itemValue)}
                  style={styles.picker}
                  enabled={!!selectedDepartment}
                >
                  <Picker.Item label="Select Course" value="" color="#A0AEC0" />
                  {selectedDepartment && departmentsData[selectedDepartment].map((course) => (
                    <Picker.Item key={course} label={course} value={course} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Grade Year Level: <Text style={styles.asterisk}>*</Text></Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedGradeLevel}
                  onValueChange={(itemValue) => setSelectedGradeLevel(itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Grade Level" value="" color="#A0AEC0" />
                  {gradeLevels.map((level) => (
                    <Picker.Item key={level} label={level} value={level} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Email Address: <Text style={styles.asterisk}>*</Text></Text>
              <TextInput
                style={styles.input}
                placeholder="youremail@example.com"
                placeholderTextColor="#A0AEC0"
                value={formData.email}
                onChangeText={(val) => setFormData({ ...formData, email: val })}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Student Number: <Text style={styles.asterisk}>*</Text></Text>
              <TextInput
                style={styles.input}
                placeholder="23-181818"
                placeholderTextColor="#A0AEC0"
                value={formData.student_number}
                onChangeText={(val) => setFormData({ ...formData, student_number: val })}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Phone Number: <Text style={styles.asterisk}>*</Text></Text>
              <TextInput
                style={styles.input}
                placeholder="+63 912 345 6789"
                placeholderTextColor="#A0AEC0"
                value={formData.phone_number}
                onChangeText={(val) => setFormData({ ...formData, phone_number: val })}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Password: <Text style={styles.asterisk}>*</Text></Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="*********"
                  placeholderTextColor="#A0AEC0"
                  secureTextEntry={!showPassword}
                  value={formData.password}
                  onChangeText={(val) => setFormData({ ...formData, password: val })}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#718096" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Confirm Password: <Text style={styles.asterisk}>*</Text></Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="*********"
                  placeholderTextColor="#A0AEC0"
                  secureTextEntry={!showConfirmPassword}
                  value={formData.confirm_password}
                  onChangeText={(val) => setFormData({ ...formData, confirm_password: val })}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Ionicons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#718096" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.registerBtn, loading && { opacity: 0.7 }]}
              activeOpacity={0.8}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.registerBtnText}>{loading ? 'Creating Account...' : 'Create Account'}</Text>
              {!loading && <Ionicons name="arrow-forward-outline" size={18} color="#2D3748" style={{ marginLeft: 8 }} />}
            </TouchableOpacity>

            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Already have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
            <View style={{ height: 50 }} />
          </View>
        </ScrollView>
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
    position: 'fixed' as any,
    height: '100%',
    left: 0,
    top: 0,
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
    marginLeft: '45%',
    backgroundColor: '#F4F5F7',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 50,
  },
  formWrapper: {
    width: 500,
  },
  formHeading: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2D3748',
    marginBottom: 30,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fieldGroup: {
    marginBottom: 15,
  },
  fieldLabel: {
    fontSize: 12,
    color: '#4A5568',
    marginBottom: 8,
  },
  asterisk: {
    color: '#E74C3C',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 15,
    height: 40,
    fontSize: 13,
    color: '#2D3748',
    outlineStyle: 'none' as any,
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    height: 40,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  picker: {
    height: 40,
    width: '100%',
    backgroundColor: 'transparent',
    borderWidth: 0,
    fontSize: 13,
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
    height: 40,
  },
  passwordInput: {
    flex: 1,
    fontSize: 13,
    color: '#2D3748',
    height: '100%',
    outlineStyle: 'none' as any,
  },
  registerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E1E7FB',
    borderRadius: 8,
    height: 45,
    marginTop: 10,
    marginBottom: 20,
  },
  registerBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginText: {
    fontSize: 13,
    color: '#718096',
    marginRight: 5,
  },
  loginLink: {
    fontSize: 13,
    color: '#1C64F2',
    fontWeight: '500',
  },
});
