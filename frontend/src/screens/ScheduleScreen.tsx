import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Modal, Platform, Dimensions, ActivityIndicator } from 'react-native';
import { Mail, Calendar as CalendarIcon, X, CheckCircle, Clock, MapPin, XCircle, Users, Check, AlertCircle } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getBookings } from '../services/api';

const { width } = Dimensions.get('window');

export default function ScheduleScreen({ onNavigate }) {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('invitations');
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    loadInvitations();
  }, []);

  const loadInvitations = async () => {
    setLoading(true);
    try {
      const data = await getBookings();
      const mapped = [];
      for (const b of data) {
        const isAccepted = await AsyncStorage.getItem(`accepted_${b.id}`);
        const isDeclined = await AsyncStorage.getItem(`declined_${b.id}`);
        
        let status = 'pending';
        if (isAccepted === 'true') status = 'accepted';
        if (isDeclined === 'true') status = 'declined';

        let formattedDate = b.requested_date;
        let parsedMonth = 'TBA';
        let parsedDay = '-';
        try {
          const d = new Date(b.requested_date);
          if (!isNaN(d.getTime())) {
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            parsedMonth = monthNames[d.getMonth()];
            parsedDay = d.getDate().toString();
            formattedDate = `${parsedMonth} ${parsedDay}, ${d.getFullYear()}`;
          }
        } catch (e) {}

        let createdStr = 'Unknown';
        if (b.created_at) {
          try {
            const cd = new Date(b.created_at);
            if (!isNaN(cd.getTime())) {
              const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
              createdStr = `${monthNames[cd.getMonth()]} ${cd.getDate()}, ${cd.getFullYear()}`;
            }
          } catch(e) {}
        }

        mapped.push({
          id: b.id,
          title: b.research_title,
          students: Array.isArray(b.members) ? b.members.join(', ') : b.members,
          department: b.department || 'N/A',
          program: b.program || 'N/A',
          yearLevel: b.year_level || 'N/A',
          semester: b.semester || 'N/A',
          academicYear: b.academic_year || 'N/A',
          adviser: b.adviser_name || b.adviser || 'N/A',
          panelChair: b.panel_chair || 'N/A',
          panelMembers: Array.isArray(b.assigned_panelists) ? b.assigned_panelists.map(p => p.name).join(', ') : 'N/A',
          secretary: b.secretary || 'N/A',
          defenseType: b.defense_type || 'N/A',
          createdAt: createdStr,
          date: formattedDate,
          parsedMonth,
          parsedDay,
          time: b.requested_time,
          room: b.venue || 'TBA',
          status,
        });
      }
      setInvitations(mapped);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const [confirmModal, setConfirmModal] = useState({ visible: false, action: null, eventId: null });

  const pendingInvs = invitations.filter(i => i.status === 'pending');
  const acceptedInvs = invitations.filter(i => i.status === 'accepted');
  const declinedInvs = invitations.filter(i => i.status === 'declined');

  const confirmAction = (action, eventId) => {
    setConfirmModal({ visible: true, action, eventId });
  };

  const executeConfirmAction = async () => {
    const { action, eventId } = confirmModal;
    if (action === 'accept') {
      await AsyncStorage.setItem(`accepted_${eventId}`, 'true');
      await AsyncStorage.removeItem(`declined_${eventId}`);
      setInvitations(prev => prev.map(inv => inv.id === eventId ? { ...inv, status: 'accepted' } : inv));
      setConfirmModal({ visible: false, action: null, eventId: null });
      if (onNavigate) {
        setTimeout(() => {
          onNavigate('evaluation');
        }, 300);
      }
    } else if (action === 'decline') {
      await AsyncStorage.setItem(`declined_${eventId}`, 'true');
      await AsyncStorage.removeItem(`accepted_${eventId}`);
      setInvitations(prev => prev.map(inv => inv.id === eventId ? { ...inv, status: 'declined' } : inv));
      setConfirmModal({ visible: false, action: null, eventId: null });
    }
  };
  
  const handleUndo = async (id) => {
    await AsyncStorage.removeItem(`accepted_${id}`);
    await AsyncStorage.removeItem(`declined_${id}`);
    setInvitations(prev => prev.map(inv => inv.id === id ? { ...inv, status: 'pending' } : inv));
  };

  const TabButton = ({ id, label, icon: Icon, badge }) => {
    const isActive = activeTab === id;
    return (
      <Pressable 
        style={[styles.tabBtn, isActive && styles.tabBtnActive]} 
        onPress={() => setActiveTab(id)}
      >
        <Icon size={18} color={isActive ? '#2563eb' : '#64748b'} />
        <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{label}</Text>
        {badge > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
      </Pressable>
    );
  };

  const renderCalendarGrid = () => {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const daysInMonth = 31;
    // October 2026 starts on Thursday (index 4)
    const startingDayIndex = 4;
    
    const calendarCells = [];
    
    // Empty cells for days before the 1st
    for (let i = 0; i < startingDayIndex; i++) {
      calendarCells.push(<View key={`empty-${i}`} style={styles.calGridCellEmpty} />);
    }

    // Cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = acceptedInvs.filter(inv => parseInt(inv.parsedDay) === day);
      const isToday = day === 24; // Mock today

      calendarCells.push(
        <Pressable 
          key={day} 
          style={[styles.calGridCell, isToday && styles.calGridCellToday, dayEvents.length > 0 && styles.calGridCellActive]}
          onPress={() => dayEvents.length > 0 && setSelectedEvent(dayEvents[0])}
        >
          <Text style={[styles.calGridDayText, isToday && styles.calGridDayTextToday, dayEvents.length > 0 && styles.calGridDayTextActive]}>
            {day}
          </Text>
          {dayEvents.length > 0 && (
            <View style={styles.calGridEventIndicators}>
              {dayEvents.map((e, idx) => <View key={idx} style={styles.calGridDot} />)}
            </View>
          )}
        </Pressable>
      );
    }

    return (
      <View style={styles.calendarWidget}>
        <View style={styles.calendarWidgetHeader}>
          <Text style={styles.calendarWidgetMonth}>October 2026</Text>
        </View>
        <View style={styles.calendarDaysRow}>
          {daysOfWeek.map(d => <Text key={d} style={styles.calendarDayHeader}>{d}</Text>)}
        </View>
        <View style={styles.calendarGrid}>
          {calendarCells}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Defense Schedule</Text>
        <Text style={styles.subtitle}>Manage defense invitations and coordinate availability</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TabButton id="invitations" label="Invitations" icon={Mail} badge={pendingInvs.length} />
        <TabButton id="calendar" label="My Calendar" icon={CalendarIcon} badge={0} />
        <TabButton id="declined" label="Declined" icon={XCircle} badge={0} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* TAB A: INVITATIONS */}
        {activeTab === 'invitations' && (
          <View style={styles.tabContent}>
            {pendingInvs.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconCircle}>
                  <CheckCircle size={48} color="#10b981" />
                </View>
                <Text style={styles.emptyStateTitle}>You're all caught up!</Text>
                <Text style={styles.emptyStateDesc}>No new defense invitations at the moment.</Text>
                
                <Pressable 
                  style={{ marginTop: 24, backgroundColor: '#f1f5f9', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#cbd5e1' }}
                  onPress={async () => {
                    await AsyncStorage.clear();
                    loadInvitations();
                  }}
                >
                  <Text style={{ color: '#64748b', fontWeight: '700' }}>Developer: Reset Storage & Reload</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.grid}>
                {pendingInvs.map(inv => (
                  <View key={inv.id} style={styles.card}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardTitle}>{inv.title}</Text>
                      <View style={styles.tag}><Text style={styles.tagText}>New Request</Text></View>
                    </View>
                    
                    <View style={styles.cardMeta}>
                      <View style={styles.metaRow}><Text style={styles.metaLabel}>Proponents:</Text><Text style={styles.metaText}>{inv.students}</Text></View>
                      <View style={styles.metaRow}><Text style={styles.metaLabel}>Program:</Text><Text style={styles.metaText}>{inv.program}</Text></View>
                      <View style={styles.metaRow}><Text style={styles.metaLabel}>Year Level:</Text><Text style={styles.metaText}>{inv.yearLevel} Year</Text></View>
                      <View style={styles.metaRow}><Text style={styles.metaLabel}>Semester:</Text><Text style={styles.metaText}>{inv.semester}</Text></View>
                      <View style={styles.metaRow}><Text style={styles.metaLabel}>Academic Year:</Text><Text style={styles.metaText}>{inv.academicYear}</Text></View>
                      <View style={styles.metaRow}><Text style={styles.metaLabel}>Research Adviser:</Text><Text style={styles.metaText}>{inv.adviser}</Text></View>
                      <View style={styles.metaRow}><Text style={styles.metaLabel}>Panel Members:</Text><Text style={styles.metaText}>{inv.panelMembers}</Text></View>
                      <View style={styles.metaRow}><Text style={styles.metaLabel}>Panel Chair:</Text><Text style={styles.metaText}>{inv.panelChair}</Text></View>
                      <View style={styles.metaRow}><Text style={styles.metaLabel}>Secretary:</Text><Text style={styles.metaText}>{inv.secretary}</Text></View>
                      <View style={styles.metaRow}><Text style={styles.metaLabel}>Stage:</Text><Text style={styles.metaText}>{inv.defenseType}</Text></View>
                      <View style={styles.metaRow}><Text style={styles.metaLabel}>Schedule:</Text><Text style={styles.metaText}>{inv.date} at {inv.time}</Text></View>
                      <View style={styles.metaRow}><Text style={styles.metaLabel}>Location:</Text><Text style={styles.metaText}>{inv.room}</Text></View>
                      <View style={styles.metaRow}><Text style={styles.metaLabel}>Requested on:</Text><Text style={styles.metaText}>{inv.createdAt}</Text></View>
                    </View>

                    <View style={styles.actionRow}>
                      <Pressable style={[styles.btn, styles.btnDecline]} onPress={() => confirmAction('decline', inv.id)}>
                        <Text style={styles.btnDeclineText}>Decline</Text>
                      </Pressable>
                      <Pressable style={[styles.btn, styles.btnAccept]} onPress={() => confirmAction('accept', inv.id)}>
                        <Check size={16} color="#ffffff" />
                        <Text style={styles.btnAcceptText}>Accept</Text>
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* TAB B: MY CALENDAR */}
        {activeTab === 'calendar' && (
          <View style={styles.tabContent}>
            {acceptedInvs.length === 0 ? (
              <View style={styles.emptyState}>
                <CalendarIcon size={48} color="#cbd5e1" />
                <Text style={styles.emptyStateTitle}>No scheduled defenses</Text>
                <Text style={styles.emptyStateDesc}>Accept invitations to populate your calendar.</Text>
              </View>
            ) : (
              <View>
                {renderCalendarGrid()}
                
                <View style={[styles.calendarContainer, { marginTop: 24 }]}>
                  <Text style={styles.calendarHeader}>Upcoming Accepted Defenses</Text>
                  {acceptedInvs.map(inv => (
                    <Pressable key={inv.id} style={styles.calEventBlock} onPress={() => setSelectedEvent(inv)}>
                      <View style={styles.calEventDateBar}>
                        <Text style={styles.calEventDay}>{inv.parsedDay}</Text>
                        <Text style={styles.calEventMonth}>{inv.parsedMonth}</Text>
                      </View>
                      <View style={styles.calEventInfo}>
                        <Text style={styles.calEventTime}>{inv.time}</Text>
                        <Text style={styles.calEventTitle}>{inv.title}</Text>
                        <Text style={styles.calEventRoom}><MapPin size={12} color="#64748b" style={{ marginRight: 4 }}/> {inv.room}</Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {/* TAB C: DECLINED */}
        {activeTab === 'declined' && (
          <View style={styles.tabContent}>
            {declinedInvs.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateDesc}>No declined invitations.</Text>
              </View>
            ) : (
              <View style={styles.grid}>
                {declinedInvs.map(inv => (
                  <View key={inv.id} style={[styles.card, styles.cardDeclined]}>
                    <View style={styles.cardHeader}>
                      <Text style={[styles.cardTitle, { color: '#64748b' }]}>{inv.title}</Text>
                    </View>
                    <View style={styles.cardMeta}>
                      <View style={styles.metaRow}><Clock size={16} color="#94a3b8" /><Text style={[styles.metaText, { color: '#94a3b8' }]}>{inv.date} • {inv.time}</Text></View>
                    </View>
                    <View style={styles.actionRow}>
                      <Pressable style={[styles.btn, styles.btnUndo]} onPress={() => handleUndo(inv.id)}>
                        <Text style={styles.btnUndoText}>Undo / Reconsider</Text>
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Calendar Event Modal */}
      <Modal visible={!!selectedEvent} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Defense Details</Text>
              <Pressable onPress={() => setSelectedEvent(null)}>
                <X size={24} color="#64748b" />
              </Pressable>
            </View>
            {selectedEvent && (
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <Text style={styles.modalProjectTitle}>{selectedEvent.title}</Text>
                
                <View style={styles.modalDetailGroup}>
                  <Text style={styles.modalDetailLabel}>Proponents</Text>
                  <Text style={styles.modalDetailValue}>{selectedEvent.students}</Text>
                </View>

                <View style={styles.modalDetailGroup}>
                  <Text style={styles.modalDetailLabel}>Program</Text>
                  <Text style={styles.modalDetailValue}>{selectedEvent.program} ({selectedEvent.yearLevel} Year)</Text>
                </View>
                
                <View style={styles.modalDetailGroup}>
                  <Text style={styles.modalDetailLabel}>Term</Text>
                  <Text style={styles.modalDetailValue}>{selectedEvent.semester}, {selectedEvent.academicYear}</Text>
                </View>

                <View style={styles.modalDetailGroup}>
                  <Text style={styles.modalDetailLabel}>Research Adviser</Text>
                  <Text style={styles.modalDetailValue}>{selectedEvent.adviser}</Text>
                </View>

                <View style={styles.modalDetailGroup}>
                  <Text style={styles.modalDetailLabel}>Panel Chair</Text>
                  <Text style={styles.modalDetailValue}>{selectedEvent.panelChair}</Text>
                </View>
                
                <View style={styles.modalDetailGroup}>
                  <Text style={styles.modalDetailLabel}>Panel Members</Text>
                  <Text style={styles.modalDetailValue}>{selectedEvent.panelMembers}</Text>
                </View>
                
                <View style={styles.modalDetailGroup}>
                  <Text style={styles.modalDetailLabel}>Secretary</Text>
                  <Text style={styles.modalDetailValue}>{selectedEvent.secretary}</Text>
                </View>

                <View style={styles.modalDetailGroup}>
                  <Text style={styles.modalDetailLabel}>Stage of Defense</Text>
                  <Text style={styles.modalDetailValue}>{selectedEvent.defenseType}</Text>
                </View>

                <View style={styles.modalDetailGroup}>
                  <Text style={styles.modalDetailLabel}>Schedule</Text>
                  <Text style={styles.modalDetailValue}>{selectedEvent.date} at {selectedEvent.time}</Text>
                </View>

                <View style={styles.modalDetailGroup}>
                  <Text style={styles.modalDetailLabel}>Location / Link</Text>
                  <Text style={styles.modalDetailValue}>{selectedEvent.room}</Text>
                </View>
              </ScrollView>
            )}
            <Pressable style={styles.modalCloseBtn} onPress={() => setSelectedEvent(null)}>
              <Text style={styles.modalCloseBtnText}>Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Action Confirmation Modal */}
      <Modal visible={confirmModal.visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModalBox}>
            <View style={styles.confirmModalHeader}>
              <AlertCircle size={28} color={confirmModal.action === 'accept' ? '#10b981' : '#ef4444'} />
              <Text style={styles.confirmModalTitle}>
                {confirmModal.action === 'accept' ? 'Accept Invitation' : 'Decline Invitation'}
              </Text>
            </View>
            <Text style={styles.confirmModalMessage}>
              Are you sure you want to {confirmModal.action} this defense invitation?
            </Text>
            <View style={styles.confirmModalActionRow}>
              <Pressable style={styles.confirmModalCancelBtn} onPress={() => setConfirmModal({ visible: false, action: null, eventId: null })}>
                <Text style={styles.confirmModalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable 
                style={[styles.confirmModalConfirmBtn, confirmModal.action === 'accept' ? { backgroundColor: '#10b981' } : { backgroundColor: '#ef4444' }]} 
                onPress={executeConfirmAction}
              >
                <Text style={styles.confirmModalConfirmText}>Yes, {confirmModal.action === 'accept' ? 'Accept' : 'Decline'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 24, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  title: { fontSize: 28, fontWeight: '900', color: '#0f172a' },
  subtitle: { fontSize: 14, color: '#64748b', marginTop: 4 },
  tabsContainer: { flexDirection: 'row', backgroundColor: '#ffffff', paddingHorizontal: 24, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  tabBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16, borderBottomWidth: 2, borderBottomColor: 'transparent', gap: 8 },
  tabBtnActive: { borderBottomColor: '#2563eb' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#64748b' },
  tabTextActive: { color: '#2563eb' },
  badge: { backgroundColor: '#ef4444', borderRadius: 12, paddingHorizontal: 6, paddingVertical: 2, minWidth: 20, alignItems: 'center' },
  badgeText: { color: '#ffffff', fontSize: 11, fontWeight: '800' },
  
  scrollContent: { padding: 24 },
  tabContent: { flex: 1 },
  
  grid: { flexDirection: width > 768 ? 'row' : 'column', flexWrap: 'wrap', gap: 16 },
  card: { backgroundColor: '#ffffff', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#e2e8f0', width: width > 768 ? '48%' : '100%', shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 8, elevation: 1 },
  cardDeclined: { backgroundColor: '#f8fafc', opacity: 0.8 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  cardTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a', flex: 1, marginRight: 12 },
  tag: { backgroundColor: '#dbeafe', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 16 },
  tagText: { color: '#1d4ed8', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  
  cardMeta: { marginBottom: 24, padding: 12, backgroundColor: '#f8fafc', borderRadius: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
  metaLabel: { fontSize: 13, color: '#64748b', fontWeight: '700', width: 125, marginRight: 8 },
  metaText: { fontSize: 13, color: '#1e293b', fontWeight: '500', flex: 1 },
  
  actionRow: { flexDirection: 'row', gap: 12 },
  btn: { flex: 1, height: 44, borderRadius: 8, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 8, ...Platform.select({ web: { cursor: 'pointer' } }) },
  btnAccept: { backgroundColor: '#10b981' },
  btnAcceptText: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
  btnDecline: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0' },
  btnDeclineText: { color: '#64748b', fontSize: 14, fontWeight: '700' },
  btnUndo: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#cbd5e1' },
  btnUndoText: { color: '#475569', fontSize: 14, fontWeight: '700' },

  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 64 },
  emptyIconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#d1fae5', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  emptyStateTitle: { fontSize: 20, fontWeight: '800', color: '#0f172a', marginBottom: 8 },
  emptyStateDesc: { fontSize: 15, color: '#64748b', textAlign: 'center' },

  // Calendar List Styles
  calendarContainer: { backgroundColor: '#ffffff', borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', overflow: 'hidden' },
  calendarHeader: { padding: 20, fontSize: 16, fontWeight: '800', color: '#0f172a', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  calEventBlock: { flexDirection: 'row', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', ...Platform.select({ web: { cursor: 'pointer' } }) },
  calEventDateBar: { width: 60, alignItems: 'center', justifyContent: 'center', borderRightWidth: 1, borderRightColor: '#f1f5f9', paddingRight: 16 },
  calEventDay: { fontSize: 24, fontWeight: '900', color: '#2563eb' },
  calEventMonth: { fontSize: 12, fontWeight: '700', color: '#64748b', textTransform: 'uppercase' },
  calEventInfo: { paddingLeft: 16, flex: 1, justifyContent: 'center' },
  calEventTime: { fontSize: 13, fontWeight: '700', color: '#10b981', marginBottom: 4 },
  calEventTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a', marginBottom: 6 },
  calEventRoom: { fontSize: 13, color: '#64748b', fontWeight: '500' },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#ffffff', borderRadius: 20, width: '100%', maxWidth: 500, padding: 24, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 20, elevation: 10 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  modalBody: { marginBottom: 24, maxHeight: width > 768 ? 500 : 400 },
  modalProjectTitle: { fontSize: 22, fontWeight: '900', color: '#0f172a', marginBottom: 20 },
  modalDetailGroup: { marginBottom: 16, backgroundColor: '#f8fafc', padding: 12, borderRadius: 8 },
  modalDetailLabel: { fontSize: 12, fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: 4 },
  modalDetailValue: { fontSize: 15, fontWeight: '600', color: '#1e293b' },
  modalCloseBtn: { backgroundColor: '#2563eb', height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  modalCloseBtnText: { color: '#ffffff', fontSize: 15, fontWeight: '700' },

  // Confirmation Modal
  confirmModalBox: { backgroundColor: '#ffffff', borderRadius: 16, width: '90%', maxWidth: 400, padding: 24, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 20, elevation: 10 },
  confirmModalHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  confirmModalTitle: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  confirmModalMessage: { fontSize: 15, color: '#475569', lineHeight: 22, marginBottom: 24 },
  confirmModalActionRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  confirmModalCancelBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, backgroundColor: '#f1f5f9' },
  confirmModalCancelText: { color: '#475569', fontWeight: '700' },
  confirmModalConfirmBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  confirmModalConfirmText: { color: '#ffffff', fontWeight: '700' },

  // Visual Calendar Grid
  calendarWidget: { backgroundColor: '#ffffff', borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', padding: 20 },
  calendarWidgetHeader: { marginBottom: 16, alignItems: 'center' },
  calendarWidgetMonth: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  calendarDaysRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 8, marginBottom: 8 },
  calendarDayHeader: { flex: 1, textAlign: 'center', fontSize: 12, fontWeight: '700', color: '#64748b' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calGridCell: { width: '14.28%', height: 48, justifyContent: 'center', alignItems: 'center', marginVertical: 4 },
  calGridCellEmpty: { width: '14.28%', height: 48 },
  calGridCellToday: { backgroundColor: '#eff6ff', borderRadius: 24 },
  calGridCellActive: { backgroundColor: '#f0fdf4', borderRadius: 24 },
  calGridDayText: { fontSize: 14, fontWeight: '600', color: '#475569' },
  calGridDayTextToday: { color: '#2563eb', fontWeight: '800' },
  calGridDayTextActive: { color: '#10b981', fontWeight: '800' },
  calGridEventIndicators: { flexDirection: 'row', gap: 2, marginTop: 4 },
  calGridDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#10b981' }
});
