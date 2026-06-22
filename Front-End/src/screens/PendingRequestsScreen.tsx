import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { HeaderBar } from '../components/dashboard/HeaderBar';
import { Sidebar } from '../components/dashboard/Sidebar';
import { ReviewRequestModal } from '../components/dashboard/ReviewRequestModal';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { webViewportHeight } from '../theme/webLayout';

import { useSchedules, type PendingRequest } from '../context/ScheduleContext';

type Props = {
  onNavPress: (key: string) => void;
};

export function PendingRequestsScreen({ onNavPress }: Props) {
  const { logout } = useAuth();
  const { pendingRequests, removePendingRequest } = useSchedules();
  const [selectedRequest, setSelectedRequest] = useState<PendingRequest | null>(null);

  const handleApprove = (id: string) => {
    removePendingRequest(id);
  };

  const renderStageBadge = (stage: string) => {
    let bg = '#F3E8FF';
    let text = '#9333EA';
    if (stage === 'Review Defense') {
      bg = '#FFEDD5';
      text = '#EA580C';
    } else if (stage === 'Final Defense') {
      bg = '#DBEAFE';
      text = '#2563EB';
    }
    return (
      <View style={[styles.badge, { backgroundColor: bg }]}>
        <Text style={[styles.badgeText, { color: text }]}>{stage || 'Defense'}</Text>
      </View>
    );
  };

  return (
    <View style={[styles.root, webViewportHeight()]}>
      <Sidebar activeKey="pending" onNavPress={onNavPress} />

      <View style={styles.mainColumn}>
        <HeaderBar onLogoutPress={logout} />

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <View style={styles.titleRow}>
            <View>
              <Text style={styles.title}>Pending Requests</Text>
              <Text style={styles.subtitle}>Review and assign panelists for student defense requests</Text>
            </View>
          </View>

          <View style={styles.tableContainer}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.th, { flex: 2 }]}>Requested Date & Time</Text>
              <Text style={[styles.th, { flex: 3 }]}>Research Group & Title</Text>
              <Text style={[styles.th, { flex: 2 }]}>Requested Room</Text>
              <Text style={[styles.th, { flex: 1.5 }]}>Defense Type</Text>
              <Text style={[styles.th, { width: 120, textAlign: 'center' }]}>Action</Text>
            </View>

            {/* Table Body */}
            {pendingRequests.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="checkmark-circle-outline" size={48} color={colors.accentGreen} style={{ marginBottom: 12 }} />
                <Text style={styles.emptyText}>All caught up! No pending requests.</Text>
              </View>
            ) : (
              pendingRequests.map((r, index) => (
                <View key={r.id} style={[styles.tableRow, index === pendingRequests.length - 1 && styles.tableRowLast]}>
                  <View style={{ flex: 2, paddingRight: 16 }}>
                    <Text style={styles.tdTitle}>{r.date}</Text>
                    <Text style={styles.tdSub}>{r.startTime} - {r.endTime}</Text>
                  </View>
                  <View style={{ flex: 3, paddingRight: 16 }}>
                    <Text style={styles.tdTitle}>{r.title}</Text>
                    <Text style={styles.tdSub}>{r.researchers.join(', ')}</Text>
                  </View>
                  <View style={{ flex: 2, paddingRight: 16 }}>
                    <Text style={styles.tdText}>{r.venue}</Text>
                  </View>
                  <View style={{ flex: 1.5, paddingRight: 16, alignItems: 'flex-start' }}>
                    {renderStageBadge(r.stage)}
                  </View>
                  <View style={[styles.actionsCell, { width: 120 }]}>
                    <TouchableOpacity onPress={() => setSelectedRequest(r)} style={styles.reviewBtn}>
                      <Text style={styles.reviewBtnText}>Review</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </View>

      {selectedRequest && (
        <ReviewRequestModal
          visible={true}
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onApprove={() => handleApprove(selectedRequest.id)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.mainBg,
  },
  mainColumn: {
    flex: 1,
    minWidth: 0,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 48,
  },
  titleRow: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  tableContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  th: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  tableRowLast: {
    borderBottomWidth: 0,
  },
  tdTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  tdSub: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
  tdText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  actionsCell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewBtn: {
    backgroundColor: colors.accentBlueLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  reviewBtnText: {
    color: colors.accentBlue,
    fontWeight: '700',
    fontSize: 13,
  },
  emptyState: {
    padding: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textMuted,
    fontWeight: '500',
  },
});
