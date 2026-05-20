import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PenTool, CheckCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function AgreementScreen() {
  const router = useRouter();
  const [signed, setSigned] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSignature();
  }, []);

  const checkSignature = async () => {
    try {
      const hasSigned = await AsyncStorage.getItem('has_signed_agreement');
      if (hasSigned === 'true') {
        router.replace({ pathname: '/main', params: { activeNavId: 'schedule' } });
      } else {
        setLoading(false);
      }
    } catch (e) {
      setLoading(false);
    }
  };

  const handleSign = async () => {
    setSigned(true);
    await AsyncStorage.setItem('has_signed_agreement', 'true');
    setTimeout(() => {
      router.replace({ pathname: '/main', params: { activeNavId: 'schedule' } });
    }, 1000);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
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
          <Pressable style={styles.btn} onPress={handleSign}>
            <PenTool color="#fff" size={20} style={{ marginRight: 8 }} />
            <Text style={styles.btnText}>Sign & Agree</Text>
          </Pressable>
        ) : (
          <View style={styles.success}>
            <CheckCircle color="#10b981" size={24} style={{ marginRight: 8 }} />
            <Text style={styles.successText}>Successfully Signed</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center', padding: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: '#ffffff', borderRadius: 16, padding: 32, width: '100%', maxWidth: 500, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 },
  title: { fontSize: 24, fontWeight: '900', color: '#0f172a', marginBottom: 20, textAlign: 'center' },
  scroll: { maxHeight: 200, marginBottom: 24 },
  text: { fontSize: 16, color: '#475569', lineHeight: 24 },
  btn: { backgroundColor: '#2563eb', height: 56, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  btnText: { color: '#ffffff', fontSize: 16, fontWeight: '800' },
  success: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ecfdf5', borderRadius: 12 },
  successText: { color: '#10b981', fontSize: 16, fontWeight: '800' }
});
