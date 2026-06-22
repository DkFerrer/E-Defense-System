import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DefenseSchedule } from '../../context/ScheduleContext';
import { colors } from '../../theme/colors';
import { minTouchTarget } from '../../theme/layout';

type Props = {
  visible: boolean;
  schedules: DefenseSchedule[];
  onClose: () => void;
};

export function DefenseDetailModal({ visible, schedules, onClose }: Props) {
  if (schedules.length === 0) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.detailOverlay} onPress={onClose}>
        <Pressable style={styles.detailDialog} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.detailHeader}>
            <Text style={styles.detailHeaderTitle}>Defense Details</Text>
            <TouchableOpacity onPress={onClose} accessibilityLabel="Close" style={styles.detailCloseBtn}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.detailBody} contentContainerStyle={styles.detailBodyContent}>
            {schedules.map((s, idx) => (
              <View key={s.id} style={[styles.detailCard, idx > 0 && { marginTop: 16 }]}>
                {/* Stage badge */}
                <View style={styles.detailStageBadge}>
                  <Text style={styles.detailStageText}>{s.stage}</Text>
                </View>

                {/* Title */}
                <Text style={styles.detailTitle}>{s.title}</Text>

                {/* Date & time */}
                <View style={styles.detailRow}>
                  <Ionicons name="calendar-outline" size={16} color={colors.accentBlue} />
                  <Text style={styles.detailValue}>{s.date}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="time-outline" size={16} color={colors.accentBlue} />
                  <Text style={styles.detailValue}>{s.startTime} – {s.endTime}</Text>
                </View>

                {/* Venue */}
                <View style={styles.detailRow}>
                  <Ionicons name="location" size={16} color={colors.accentGreen} />
                  <Text style={styles.detailValue}>{s.venue}</Text>
                </View>

                {/* Researchers */}
                <Text style={styles.detailSectionLabel}>Researchers</Text>
                {s.researchers.map((r) => (
                  <View key={r} style={styles.detailPersonRow}>
                    <View style={[styles.detailDot, { backgroundColor: colors.accentGreen }]} />
                    <Text style={styles.detailPersonName}>{r}</Text>
                  </View>
                ))}

                {/* Panelists */}
                <Text style={styles.detailSectionLabel}>Panelists</Text>
                {s.panelists.map((p) => (
                  <View key={p} style={styles.detailPersonRow}>
                    <View style={[styles.detailDot, { backgroundColor: colors.accentBlue }]} />
                    <Text style={styles.detailPersonName}>{p}</Text>
                  </View>
                ))}

                {/* Requirements */}
                <Text style={styles.detailSectionLabel}>Requirements</Text>
                <View style={styles.detailReqRow}>
                  <Ionicons
                    name={s.approvedConcept ? 'checkmark-circle' : 'ellipse-outline'}
                    size={16}
                    color={s.approvedConcept ? colors.accentGreen : colors.textMuted}
                  />
                  <Text style={styles.detailValue}>Approved Concept Note</Text>
                </View>
                <View style={styles.detailReqRow}>
                  <Ionicons
                    name={s.paymentReceipt ? 'checkmark-circle' : 'ellipse-outline'}
                    size={16}
                    color={s.paymentReceipt ? colors.accentGreen : colors.textMuted}
                  />
                  <Text style={styles.detailValue}>Payment Receipt</Text>
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.detailFooter}>
            <TouchableOpacity style={styles.detailCloseButton} onPress={onClose}>
              <Text style={styles.detailCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  detailOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  detailDialog: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 560,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  detailHeaderTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  detailCloseBtn: {
    minWidth: minTouchTarget,
    minHeight: minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailBody: {
    flexShrink: 1,
  },
  detailBodyContent: {
    padding: 24,
  },
  detailCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  detailStageBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accentBlue,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 12,
  },
  detailStageText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 14,
    lineHeight: 22,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  detailValue: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  detailSectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    marginTop: 14,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailPersonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  detailDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  detailPersonName: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  detailReqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  detailFooter: {
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  detailCloseButton: {
    backgroundColor: colors.accentBlue,
    borderRadius: 8,
    paddingHorizontal: 32,
    paddingVertical: 10,
  },
  detailCloseButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});
