import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/tokens';

export default function StatCard({ label, value, accessibilityLabel }) {
  return (
    <View
      accessibilityRole="summary"
      accessibilityLabel={accessibilityLabel ?? `${label}: ${value}`}
      style={styles.card}
    >
      <Text style={styles.label}>{label}</Text>
      <Text accessibilityRole="text" style={styles.value}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 140,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: { color: colors.gray600, fontSize: 14, fontWeight: '600', marginBottom: 8 },
  value: { color: colors.gray900, fontSize: 28, fontWeight: '800' },
});
