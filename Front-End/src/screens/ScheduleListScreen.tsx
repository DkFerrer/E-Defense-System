import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { HeaderBar } from '../components/dashboard/HeaderBar';
import { Sidebar } from '../components/dashboard/Sidebar';
import { DefenseDetailModal } from '../components/dashboard/DefenseDetailModal';
import { ScheduleDefenseModal } from '../components/dashboard/ScheduleDefenseModal';
import { useAuth } from '../context/AuthContext';
import { useSchedules, type DefenseSchedule } from '../context/ScheduleContext';
import { colors } from '../theme/colors';
import { webViewportHeight } from '../theme/webLayout';

type Props = {
  onNavPress: (key: string) => void;
};

export function ScheduleListScreen({ onNavPress }: Props) {
  const { logout } = useAuth();
  const { schedules, deleteSchedule } = useSchedules();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  
  const [detailSchedule, setDetailSchedule] = useState<DefenseSchedule | null>(null);
  const [editSchedule, setEditSchedule] = useState<DefenseSchedule | null>(null);
  
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Filter schedules based on search query
  const filteredSchedules = useMemo(() => {
    if (!searchQuery.trim()) return schedules;
    const lowerQ = searchQuery.toLowerCase();
    return schedules.filter(
      (s) =>
        s.title.toLowerCase().includes(lowerQ) ||
        s.venue.toLowerCase().includes(lowerQ) ||
        s.researchers.some((r) => r.toLowerCase().includes(lowerQ))
    );
  }, [schedules, searchQuery]);

  const confirmDelete = () => {
    if (deleteId) {
      deleteSchedule(deleteId);
      setDeleteId(null);
    }
  };

  // Helper to render stage badges with right colors
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

  // Helper to render status badges
  const renderStatusBadge = (s: DefenseSchedule) => {
    // If not approved concept or no payment receipt, show pending.
    // Otherwise show Scheduled.
    const isPending = !s.approvedConcept || !s.paymentReceipt;
    const bg = isPending ? '#FEF3C7' : '#DCFCE7';
    const text = isPending ? '#D97706' : '#16A34A';
    
    return (
      <View style={[styles.badge, { backgroundColor: bg }]}>
        <Text style={[styles.badgeText, { color: text }]}>{isPending ? 'Pending' : 'Scheduled'}</Text>
      </View>
    );
  };

  return (
    <View style={[styles.root, webViewportHeight()]}>
      <Sidebar activeKey="schedule" onNavPress={onNavPress} />

      <View style={styles.mainColumn}>
        <HeaderBar onLogoutPress={logout} />

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <View style={styles.titleRow}>
            <View>
              <Text style={styles.title}>Schedule List</Text>
              <Text style={styles.subtitle}>View and manage all defense schedules</Text>
            </View>
          </View>

          {/* Search & Actions Bar */}
          <View style={styles.toolbar}>
            <View style={styles.searchBox}>
              <Ionicons name="search" size={20} color={colors.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by group name or room..."
                placeholderTextColor={colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <TouchableOpacity style={styles.filterBtn}>
              <Ionicons name="filter-outline" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddModal(true)}>
              <Text style={styles.addBtnText}>+ Add Schedule</Text>
            </TouchableOpacity>
          </View>

          {/* Table */}
          <View style={styles.tableContainer}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.th, { flex: 2 }]}>Date & Time</Text>
              <Text style={[styles.th, { flex: 3 }]}>Research Group</Text>
              <Text style={[styles.th, { flex: 2 }]}>Room</Text>
              <Text style={[styles.th, { flex: 2 }]}>Defense Type</Text>
              <Text style={[styles.th, { flex: 1.5 }]}>Panelists</Text>
              <Text style={[styles.th, { flex: 1.5 }]}>Status</Text>
              <Text style={[styles.th, { width: 100, textAlign: 'center' }]}>Actions</Text>
            </View>

            {/* Table Body */}
            {filteredSchedules.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No schedules found.</Text>
              </View>
            ) : (
              filteredSchedules.map((s, index) => (
                <View key={s.id} style={[styles.tableRow, index === filteredSchedules.length - 1 && styles.tableRowLast]}>
                  <View style={{ flex: 2, paddingRight: 16 }}>
                    <Text style={styles.tdTitle}>{s.date}</Text>
                    <Text style={styles.tdSub}>{s.startTime} - {s.endTime}</Text>
                  </View>
                  <View style={{ flex: 3, paddingRight: 16 }}>
                    <Text style={styles.tdTitle}>{s.title}</Text>
                  </View>
                  <View style={{ flex: 2, paddingRight: 16 }}>
                    <Text style={styles.tdText}>{s.venue}</Text>
                  </View>
                  <View style={{ flex: 2, paddingRight: 16, alignItems: 'flex-start' }}>
                    {renderStageBadge(s.stage)}
                  </View>
                  <View style={{ flex: 1.5, paddingRight: 16 }}>
                    <Text style={styles.tdText}>{s.panelists.length} members</Text>
                  </View>
                  <View style={{ flex: 1.5, paddingRight: 16, alignItems: 'flex-start' }}>
                    {renderStatusBadge(s)}
                  </View>
                  <View style={[styles.actionsCell, { width: 100 }]}>
                    <TouchableOpacity onPress={() => setDetailSchedule(s)} style={styles.actionBtn}>
                      <Ionicons name="eye-outline" size={18} color={colors.accentBlue} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setEditSchedule(s)} style={styles.actionBtn}>
                      <Ionicons name="create-outline" size={18} color={colors.accentGreen} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setDeleteId(s.id)} style={styles.actionBtn}>
                      <Ionicons name="trash-outline" size={18} color={colors.sundayRed} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </View>

      {/* View Detail Modal */}
      <DefenseDetailModal
        visible={!!detailSchedule}
        schedules={detailSchedule ? [detailSchedule] : []}
        onClose={() => setDetailSchedule(null)}
      />

      {/* Add / Edit Modal */}
      <ScheduleDefenseModal
        visible={showAddModal || !!editSchedule}
        editSchedule={editSchedule}
        onClose={() => {
          setShowAddModal(false);
          setEditSchedule(null);
        }}
      />

      {/* Delete Confirmation Modal */}
      <Modal visible={!!deleteId} transparent animationType="fade" onRequestClose={() => setDeleteId(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.confirmDialog}>
            <View style={styles.confirmIconContainer}>
              <Ionicons name="warning" size={32} color={colors.sundayRed} />
            </View>
            <Text style={styles.confirmTitle}>Delete Schedule</Text>
            <Text style={styles.confirmText}>
              Are you sure you want to delete this defense schedule? This action cannot be undone.
            </Text>
            <View style={styles.confirmBtnRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setDeleteId(null)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={confirmDelete}>
                <Text style={styles.deleteBtnText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    ...(Platform.OS === 'web' && { outlineStyle: 'none' as any }),
  },
  filterBtn: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFAFA',
  },
  addBtn: {
    backgroundColor: colors.accentBlue,
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  confirmDialog: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  confirmIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  confirmText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  confirmBtnRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  cancelBtnText: {
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 14,
  },
  deleteBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.sundayRed,
    alignItems: 'center',
  },
  deleteBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
