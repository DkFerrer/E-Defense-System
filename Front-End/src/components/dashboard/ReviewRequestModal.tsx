import { Ionicons } from '@expo/vector-icons';
import React, { useState, useCallback, useEffect } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors } from '../../theme/colors';
import { minTouchTarget } from '../../theme/layout';
import { useSchedules, type PendingRequest } from '../../context/ScheduleContext';

const AVAILABLE_PANELISTS = [
  { id: 'p1', name: 'Dr. Jane Doe', expertise: 'MIT - Artificial Intelligence' },
  { id: 'p2', name: 'Prof. John Smith', expertise: 'MIS - Cybersecurity' },
  { id: 'p3', name: 'Dr. Emily Chen', expertise: 'MIT - Data Science' },
  { id: 'p4', name: 'Prof. Alan Turing', expertise: 'MIS - Software Engineering' },
  { id: 'p5', name: 'Dr. Grace Hopper', expertise: 'MIT - Algorithms' },
];

type Props = {
  visible: boolean;
  request: PendingRequest;
  onClose: () => void;
  onApprove: () => void;
};

import { checkConflicts } from '../../utils/conflictChecker';

export function ReviewRequestModal({ visible, request, onClose, onApprove }: Props) {
  const { addSchedule, schedules } = useSchedules();

  // Selected panelists state (we need exactly 3)
  const [selectedPanelists, setSelectedPanelists] = useState<string[]>([]);

  // Start with an empty venue, forcing the coordinator to assign one
  const [venue, setVenue] = useState('');
  
  const [messageHtml, setMessageHtml] = useState(
    `Dear Panelists,\n\nYou are invited to join the ${request.stage} for the research titled "${request.title}".\n\nDate: ${request.date}\nTime: ${request.startTime} - ${request.endTime}\nVenue: [TBD]\n\nLINK: https://meet.google.com/\n\nPlease review the attached documents prior to the defense.\n\nWe look forward to your participation!`
  );

  const [conflictError, setConflictError] = useState<string | null>(null);

  useEffect(() => {
    setMessageHtml(prev => prev.replace(/Venue: .*/, `Venue: ${venue || '[TBD]'}`));
    // Clear conflict error when venue changes
    setConflictError(null);
  }, [venue]);

  const togglePanelist = (name: string) => {
    setSelectedPanelists((prev) => {
      if (prev.includes(name)) return prev.filter((p) => p !== name);
      if (prev.length < 3) return [...prev, name];
      return prev;
    });
    setConflictError(null); // Clear conflict error when panelists change
  };

  const handleApprove = () => {
    if (selectedPanelists.length !== 3) return;
    if (!venue.trim()) {
      setConflictError('Venue is strictly required.');
      return;
    }

    // Check for conflicts
    const conflictResult = checkConflicts(
      {
        date: request.date,
        startTime: request.startTime,
        endTime: request.endTime,
        venue,
        panelists: selectedPanelists,
      },
      schedules
    );

    if (conflictResult.hasConflict) {
      setConflictError(conflictResult.message || 'A scheduling conflict was detected.');
      return;
    }

    // Convert requested date string to a Date object (rough approximation for dummy data)
    const dateObj = new Date(request.date);

    addSchedule({
      id: `sch-${Date.now()}`,
      title: request.title,
      stage: request.stage,
      date: request.date,
      dateObj: isNaN(dateObj.getTime()) ? new Date() : dateObj,
      startTime: request.startTime,
      endTime: request.endTime,
      venue: venue,
      researchers: request.researchers,
      panelists: selectedPanelists,
      approvedConcept: true,
      paymentReceipt: true,
      messageHtml: messageHtml.replace(/\n/g, '<br/>'),
    });

    onApprove();
    onClose();
  };

  const canApprove = selectedPanelists.length === 3 && venue.trim() !== '' && messageHtml.trim() !== '';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.dialog} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Review Request</Text>
              <Text style={styles.headerSubtitle}>{request.stage}</Text>
            </View>
            <TouchableOpacity onPress={onClose} accessibilityLabel="Close dialog" style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
            {/* Request Details */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Request Details</Text>
              <View style={styles.detailCard}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Title</Text>
                  <Text style={styles.detailValue}>{request.title}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Researchers</Text>
                  <Text style={styles.detailValue}>{request.researchers.join(', ')}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Requested Slot</Text>
                  <Text style={styles.detailValue}>{request.date} • {request.startTime} - {request.endTime}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>
                    Set Venue <Text style={{ color: colors.brandRed }}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={venue}
                    onChangeText={setVenue}
                    placeholder="e.g. JH 33"
                  />
                </View>
              </View>
            </View>

            {/* Assign Panelists */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Assign Panelists <Text style={{ color: colors.brandRed, fontSize: 16 }}>*</Text></Text>
                <Text style={styles.counterText}>{selectedPanelists.length}/3 Selected</Text>
              </View>
              <Text style={styles.helperText}>Select exactly 3 panelists based on their expertise.</Text>
              
              <View style={styles.panelistsContainer}>
                {AVAILABLE_PANELISTS.map((p) => {
                  const isSelected = selectedPanelists.includes(p.name);
                  const isDisabled = !isSelected && selectedPanelists.length >= 3;
                  
                  return (
                    <TouchableOpacity
                      key={p.id}
                      style={[
                        styles.panelistCard,
                        isSelected && styles.panelistCardSelected,
                        isDisabled && styles.panelistCardDisabled
                      ]}
                      onPress={() => togglePanelist(p.name)}
                      disabled={isDisabled}
                    >
                      <View style={styles.checkbox}>
                        {isSelected && <Ionicons name="checkmark" size={14} color="#fff" />}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.panelistName, isSelected && { color: colors.accentBlue }]}>{p.name}</Text>
                        <Text style={styles.panelistExpertise}>{p.expertise}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Compose Email */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Send Invitation Email</Text>
              <Text style={styles.helperText}>This email will be sent automatically to the selected panelists upon approval.</Text>
              <TextInput
                style={styles.emailEditor}
                multiline
                value={messageHtml}
                onChangeText={setMessageHtml}
                textAlignVertical="top"
              />
            </View>
            
            {conflictError && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={20} color={colors.brandRed} />
                <Text style={styles.errorText}>{conflictError}</Text>
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.approveBtn, !canApprove && styles.approveBtnDisabled]}
              onPress={handleApprove}
              disabled={!canApprove}
            >
              <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
              <Text style={styles.approveBtnText}>Approve & Schedule</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialog: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 700,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.accentBlue,
    fontWeight: '700',
    marginTop: 2,
  },
  closeBtn: {
    minWidth: minTouchTarget,
    minHeight: minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flexShrink: 1,
  },
  bodyContent: {
    padding: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  helperText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  counterText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.accentBlue,
  },
  detailCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  detailLabel: {
    width: 120,
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 14,
    color: colors.textPrimary,
  },
  panelistsContainer: {
    gap: 8,
  },
  panelistCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 8,
  },
  panelistCardSelected: {
    borderColor: colors.accentBlue,
    backgroundColor: '#F0F7FF',
  },
  panelistCardDisabled: {
    opacity: 0.5,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.borderSubtle,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  panelistName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  panelistExpertise: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  emailEditor: {
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 8,
    padding: 16,
    height: 200,
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    backgroundColor: '#FAFAFA',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    gap: 12,
  },
  cancelBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
  },
  cancelBtnText: {
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 14,
  },
  approveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accentGreen,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  approveBtnDisabled: {
    opacity: 0.5,
  },
  approveBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 8,
    padding: 12,
    marginTop: -16,
    marginBottom: 32,
    gap: 8,
  },
  errorText: {
    color: colors.brandRed,
    fontWeight: '600',
    fontSize: 13,
    flex: 1,
  },
});
