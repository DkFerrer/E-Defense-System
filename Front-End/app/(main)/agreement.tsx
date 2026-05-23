import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../src/theme/colors';
import { Typography } from '../../src/theme/typography';

// Custom lightweight client-storage wrapper for web and native
const storageKey = 'has_signed_agreement';

const getSignedStatus = (): boolean => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(storageKey) === 'true';
    }
  }
  return false;
};

const setSignedStatus = (val: boolean) => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, String(val));
    }
  }
};

export default function AgreementScreen() {
  const router = useRouter();
  const [signed, setSigned] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hasSigned = getSignedStatus();
    if (hasSigned) {
      router.replace('/(main)/schedule');
    } else {
      setLoading(false);
    }
  }, []);

  const handleSign = () => {
    setSigned(true);
    setSignedStatus(true);
    setTimeout(() => {
      router.replace('/(main)/schedule');
    }, 1000);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ea580c" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Non-Disclosure Agreement</Text>
        <ScrollView style={styles.scroll}>
          <Text style={styles.text}>
            As a panel member for the research defense, you agree to keep all intellectual property, data, and discussions confidential. You must evaluate fairly and provide objective feedback. Your electronic signature below constitutes your agreement to these terms.
          </Text>
        </ScrollView>
        {!signed ? (
          <Pressable style={styles.btn} onPress={handleSign} accessibilityRole="button" accessibilityLabel="Sign and agree">
            <Ionicons name="create-outline" color="#fff" size={20} style={{ marginRight: 8 }} />
            <Text style={styles.btnText}>Sign & Agree</Text>
          </Pressable>
        ) : (
          <View style={styles.success}>
            <Ionicons name="checkmark-circle" color="#10b981" size={24} style={{ marginRight: 8 }} />
            <Text style={styles.successText}>Successfully Signed</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.pageBg, alignItems: 'center', justifyContent: 'center', padding: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 32,
    width: '100%',
    maxWidth: 500,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 24,
    color: '#0f172a',
    marginBottom: 20,
    textAlign: 'center',
  },
  scroll: { maxHeight: 200, marginBottom: 24 },
  text: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 16,
    color: '#475569',
    lineHeight: 24,
  },
  btn: {
    backgroundColor: '#ea580c',
    height: 56,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    fontFamily: Typography.fontFamily.bold,
    color: '#ffffff',
    fontSize: 16,
  },
  success: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ecfdf5',
    borderRadius: 12,
  },
  successText: {
    fontFamily: Typography.fontFamily.bold,
    color: '#10b981',
    fontSize: 16,
  },
});
