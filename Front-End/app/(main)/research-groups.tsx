import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Dimensions,
  Platform,
  Modal,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { mockResearchGroups, ResearchGroup, mockBookings, getStorageItem } from '../../src/data/mockData';
import { Colors } from '../../src/theme/colors';
import { Typography } from '../../src/theme/typography';
import { useAuth } from '../../src/context/AuthContext';
import { useAppData } from '../../src/context/AppDataContext';

const DEPARTMENTS = {
  "School of Social and Natural Sciences": ["AB Psychology", "AB Political Science", "BS Biology"],
  "School of Business and Accountancy": ["BS Accountancy", "BS Tourism Management", "BS Financial Management", "BS Hospitality Management", "BS Entrepreneurship", "BS Business Administration"],
  "School of Computer and Information Sciences": ["BS Computer Science", "BS Information Technology", "BLIS", "ACT"],
  "School of Teacher Education": ["BEED", "BSED", "BPED"],
  "School of Nursing and Allied Health Sciences": ["BS Nursing"],
  "College of Engineering and Architecture": ["BS Civil Engineering", "BS Mechanical Engineering", "BS Computer Engineering", "BS Electrical Engineering", "BS Electronics and Communication Engineering", "BS Interior Design", "BS Architecture"],
  "College of Criminal Justice": ["BS Criminology", "BS Forensic Science"]
};

const { width } = Dimensions.get('window');

export default function ResearchGroupsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { evaluations } = useAppData();
  const isChairman = user?.role === 'Panel Chairman';

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');
  const [programFilter, setProgramFilter] = useState('All Programs');
  const [stageFilter, setStageFilter] = useState('All Stages');
  const [dateFilter, setDateFilter] = useState('');
  
  // Mobile Modal State for unified custom select
  const [selectModalVisible, setSelectModalVisible] = useState(false);
  const [selectModalConfig, setSelectModalConfig] = useState({ title: '', options: [] as string[], onSelect: null as any, currentValue: '' });
  
  // View Toggle (Grid/List) - Default to Grid
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [acceptedGroups, setAcceptedGroups] = useState<ResearchGroup[]>([]);

  const loadAcceptedGroups = () => {
    setLoading(true);
    const active = mockBookings
      .filter((b) => getStorageItem(`accepted_${b.id}`) === 'true')
      .map((b) => {
        let formattedDate = b.requested_date;
        try {
          const d = new Date(b.requested_date);
          if (!isNaN(d.getTime())) {
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            formattedDate = `${monthNames[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
          }
        } catch (e) {}

        let statusText = 'Pending';
        if (b.status === 'completed') statusText = 'Completed';
        else if (b.status === 'approved') statusText = 'Scheduled';

        return {
          id: String(b.id),
          title: b.research_title,
          members: b.members,
          adviser: b.adviser_name,
          program: b.program || (b.department?.toLowerCase().includes('computer') ? 'BS Information Technology' : 'BS Civil Engineering'),
          defenseDate: formattedDate,
          rawDate: b.requested_date,
          startTime: b.requested_time,
          stage: (b.defense_type || 'Review Defense') as any,
          score: b.status === 'completed' ? 85 : 0,
          department: b.department || 'School of Computer and Information Sciences',
          status: statusText,
          venue: b.venue || 'TBA',
        };
      });
    setAcceptedGroups(active as any);
    setLoading(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      loadAcceptedGroups();
    }, [isChairman])
  );

  useEffect(() => {
    if (departmentFilter !== 'All Departments') {
      const validPrograms = DEPARTMENTS[departmentFilter as keyof typeof DEPARTMENTS] || [];
      if (!validPrograms.includes(programFilter)) {
        setProgramFilter('All Programs');
      }
    }
  }, [departmentFilter]);

  const groupsSource: any[] = useMemo(() => {
    if (isChairman) {
      return acceptedGroups;
    } else {
      // For coordinator: show mockResearchGroups AND any acceptedGroups that are finalized by the chairman
      const finalizedAccepted = acceptedGroups
        .filter((g) => {
          const chairEval = evaluations.find((e) => e.groupId === g.id && e.panelist === 'Panel Chairman');
          return !!chairEval?.approvalDecision;
        })
        .map((g) => ({
          ...g,
          status: 'Completed',
        }));

      const allGroups = [...mockResearchGroups, ...finalizedAccepted];
      return allGroups.map((g: any) => ({
        ...g,
        status: g.score > 0 || g.status === 'Completed' ? 'Completed' : 'Scheduled',
        venue: g.venue || 'JH32',
        startTime: g.startTime || '10:00 AM',
        rawDate: g.rawDate || '2026-10-24'
      }));
    }
  }, [isChairman, acceptedGroups, evaluations]);

  // Filter evaluations based on selection
  const filteredEvals = useMemo(() => {
    return groupsSource.filter((e: any) => {
      const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.members.some((m: string) => m.toLowerCase().includes(searchQuery.toLowerCase())) ||
        e.adviser.toLowerCase().includes(searchQuery.toLowerCase());
        
      const matchesDept = departmentFilter === 'All Departments' || 
        (e.department && e.department.toLowerCase() === departmentFilter.toLowerCase());
        
      const matchesProg = programFilter === 'All Programs' ||
        (e.program && e.program.toLowerCase() === programFilter.toLowerCase());
        
      const matchesStage = stageFilter === 'All Stages' ||
        (e.stage && e.stage.toLowerCase() === stageFilter.toLowerCase());
        
      const matchesDate = !dateFilter || 
        (e.rawDate && e.rawDate === dateFilter) || 
        (e.defenseDate && e.defenseDate.toLowerCase().includes(dateFilter.toLowerCase()));
      
      return matchesSearch && matchesDept && matchesProg && matchesStage && matchesDate;
    });
  }, [groupsSource, searchQuery, departmentFilter, programFilter, stageFilter, dateFilter]);

  const availableStages = useMemo(() => {
    return ['All Stages', ...new Set(groupsSource.map(e => e.stage).filter(Boolean))];
  }, [groupsSource]);

  const openMobileSelect = (title: string, options: string[], currentValue: string, onSelect: any) => {
    setSelectModalConfig({ title, options, currentValue, onSelect });
    setSelectModalVisible(true);
  };

  const handleCardPress = (ev: any) => {
    if (isChairman) {
      router.push({
        pathname: '/(main)/chairman-evaluation',
        params: { id: ev.id },
      } as any);
    } else {
      router.push({
        pathname: '/(main)/research-group-detail',
        params: { id: ev.id },
      } as any);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ea580c" />
        <Text style={styles.loadingText}>Loading evaluations...</Text>
      </View>
    );
  }

  const isLargeScreen = width >= 768;

  return (
    <View style={styles.container}>
      {/* Filter Card Section */}
      <View style={styles.filterCard}>
        {/* Search Bar */}
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={20} color="#9ca3af" style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Search research groups..."
            placeholderTextColor="#9ca3af"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Responsive Select Grid */}
        <View style={styles.selectGrid}>
          {/* Department Filter */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Filter by Department</Text>
            {Platform.OS === 'web' ? (
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                style={styles.webSelect as any}
              >
                <option value="All Departments">All Departments</option>
                {Object.keys(DEPARTMENTS).map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            ) : (
              <Pressable style={styles.mobileSelectMock} onPress={() => {
                openMobileSelect('Select Department', ['All Departments', ...Object.keys(DEPARTMENTS)], departmentFilter, setDepartmentFilter);
              }}>
                <Text style={styles.selectText} numberOfLines={1}>{departmentFilter}</Text>
              </Pressable>
            )}
          </View>

          {/* Program Filter */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Filter by Program</Text>
            {Platform.OS === 'web' ? (
              <select
                value={programFilter}
                onChange={(e) => setProgramFilter(e.target.value)}
                style={styles.webSelect as any}
              >
                <option value="All Programs">
                  {departmentFilter === 'All Departments' ? 'All Programs' : `All Programs in Dept`}
                </option>
                {(departmentFilter === 'All Departments' 
                  ? Object.values(DEPARTMENTS).flat() 
                  : DEPARTMENTS[departmentFilter as keyof typeof DEPARTMENTS] || []).map(prog => (
                  <option key={prog} value={prog}>{prog}</option>
                ))}
              </select>
            ) : (
              <Pressable style={styles.mobileSelectMock} onPress={() => {
                const programOptions = departmentFilter === 'All Departments' 
                  ? Object.values(DEPARTMENTS).flat() 
                  : DEPARTMENTS[departmentFilter as keyof typeof DEPARTMENTS] || [];
                openMobileSelect('Select Program', ['All Programs', ...programOptions], programFilter, setProgramFilter);
              }}>
                <Text style={styles.selectText} numberOfLines={1}>
                  {programFilter === 'All Programs' && departmentFilter !== 'All Departments' ? 'All Programs in Dept' : programFilter}
                </Text>
              </Pressable>
            )}
          </View>

          {/* Stage Filter */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Filter by Stage</Text>
            {Platform.OS === 'web' ? (
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                style={styles.webSelect as any}
              >
                {availableStages.map(stage => (
                  <option key={stage} value={stage}>{stage}</option>
                ))}
              </select>
            ) : (
              <Pressable style={styles.mobileSelectMock} onPress={() => {
                openMobileSelect('Select Stage', availableStages, stageFilter, setStageFilter);
              }}>
                <Text style={styles.selectText}>{stageFilter}</Text>
              </Pressable>
            )}
          </View>

          {/* Date Filter */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Filter by Date</Text>
            {Platform.OS === 'web' ? (
              <View style={styles.dateInputWrapper}>
                <Ionicons name="calendar-outline" size={16} color="#94a3b8" style={styles.calendarIconInline} />
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  style={{
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    fontSize: 14,
                    color: '#1e293b',
                    backgroundColor: 'transparent',
                    cursor: 'pointer'
                  } as any}
                />
              </View>
            ) : (
              <View style={styles.dateInputWrapper}>
                <Ionicons name="calendar-outline" size={16} color="#94a3b8" style={styles.calendarIconInline} />
                <TextInput
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#cbd5e1"
                  style={styles.dateInput}
                  value={dateFilter}
                  onChangeText={setDateFilter}
                />
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Grid Results Bar */}
      <View style={styles.resultsBar}>
        <Text style={styles.resultsCount}>Showing {filteredEvals.length} of {groupsSource.length} groups</Text>
        <View style={styles.viewToggleGroup}>
          <Pressable 
            style={[styles.toggleBtn, viewMode === 'grid' && styles.toggleBtnActive]} 
            onPress={() => setViewMode('grid')}
            accessibilityRole="button"
            accessibilityLabel="Grid View"
          >
            <Ionicons name="grid-outline" size={16} color={viewMode === 'grid' ? '#ea580c' : '#94a3b8'} />
          </Pressable>
          <Pressable 
            style={[styles.toggleBtn, viewMode === 'list' && styles.toggleBtnActive]} 
            onPress={() => setViewMode('list')}
            accessibilityRole="button"
            accessibilityLabel="List View"
          >
            <Ionicons name="list-outline" size={16} color={viewMode === 'list' ? '#ea580c' : '#94a3b8'} />
          </Pressable>
        </View>
      </View>

      {/* Cards List / Grid */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {filteredEvals.length === 0 ? (
          <View style={styles.emptyState}>
            {isChairman ? (
              <View style={styles.emptyChairman}>
                <View style={styles.emptyIconCircle}>
                  <Ionicons name="clipboard-outline" size={48} color="#94a3b8" />
                </View>
                <Text style={styles.emptyTitle}>No defenses accepted yet</Text>
                <Text style={styles.emptyDesc}>
                  Before evaluating, please review and accept defense invitations in your Schedule.
                </Text>
                <Pressable
                  style={styles.scheduleBtn}
                  onPress={() => router.push('/(main)/schedule' as any)}
                >
                  <Text style={styles.scheduleBtnText}>View Schedule Tab</Text>
                </Pressable>
              </View>
            ) : (
              <View style={{ alignItems: 'center' }}>
                <Ionicons name="people-outline" size={48} color="#cbd5e1" />
                <Text style={styles.emptyStateText}>No evaluation groups found.</Text>
              </View>
            )}
          </View>
        ) : (
          viewMode === 'list' ? (
            /* LIST TABLE VIEW - Matches Reference */
            <View style={styles.tableContainer}>
              {/* Header Row */}
              <View style={styles.tableHeaderRow}>
                <Text style={[styles.tableH, { flex: 3.5 }]}>Research Title</Text>
                <Text style={[styles.tableH, { flex: 3 }]}>Department</Text>
                <Text style={[styles.tableH, { flex: 1.5 }]}>Stage</Text>
                <Text style={[styles.tableH, { flex: 1.5 }]}>Date</Text>
                <Text style={[styles.tableH, { flex: 1.5 }]}>Status</Text>
                <Text style={[styles.tableH, { flex: 1.5, textAlign: 'center' }]}>Action</Text>
              </View>

              {/* Data Rows */}
              {filteredEvals.map((ev) => {
                const isCompleted = ev.status === 'Completed';
                return (
                  <Pressable key={ev.id} style={styles.tableRow} onPress={() => handleCardPress(ev)}>
                    {/* Research Title & Authors */}
                    <View style={{ flex: 3.5, paddingRight: 10 }}>
                      <Text style={styles.tableTitle} numberOfLines={2}>{ev.title}</Text>
                      <Text style={styles.tableMembers}>{ev.members.join(', ')}</Text>
                    </View>

                    {/* Department */}
                    <Text style={[styles.tableText, { flex: 3 }]} numberOfLines={1}>{ev.department}</Text>

                    {/* Stage */}
                    <Text style={[styles.tableText, { flex: 1.5 }]}>{ev.stage}</Text>

                    {/* Date */}
                    <Text style={[styles.tableText, { flex: 1.5 }]}>{ev.defenseDate}</Text>

                    {/* Status Badge */}
                    <View style={{ flex: 1.5, alignItems: 'flex-start' }}>
                      <View style={[
                        styles.statusBadge, 
                        { 
                          backgroundColor: isCompleted ? '#f0fdf4' : '#eff6ff' 
                        }
                      ]}>
                        <Text style={[
                          styles.statusText, 
                          { 
                            color: isCompleted ? '#16a34a' : '#ea580c' 
                          }
                        ]}>
                          {ev.status || 'Scheduled'}
                        </Text>
                      </View>
                    </View>

                    {/* Action Button */}
                    <View style={{ flex: 1.5, alignItems: 'center' }}>
                      <Pressable 
                        style={[styles.evaluateBtn, isCompleted && { backgroundColor: '#10b981' }]}
                        onPress={() => handleCardPress(ev)}
                      >
                        <Text style={styles.evaluateBtnText}>{isChairman ? (isCompleted ? 'Re-evaluate' : 'Evaluate') : 'View'}</Text>
                      </Pressable>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ) : (
            /* GRID VIEW - Matches Reference */
            <View style={viewMode === 'grid' && isLargeScreen ? styles.gridContainer : styles.listContainer}>
              {filteredEvals.map((ev) => {
                const isCompleted = ev.status === 'Completed';
                return (
                  <Pressable 
                    key={ev.id} 
                    style={[
                      styles.evalCard, 
                      viewMode === 'grid' && isLargeScreen ? styles.gridCard : styles.listCard
                    ]}
                    onPress={() => handleCardPress(ev)}
                  >
                    {/* Logo and Status Badge Header */}
                    <View style={styles.cardHeader}>
                      <View style={styles.emblemCircle}>
                        <Ionicons name="school-outline" size={16} color="#ea580c" />
                      </View>
                      <View style={[
                        styles.statusBadge, 
                        { 
                          backgroundColor: isCompleted ? '#f0fdf4' : '#eff6ff' 
                        }
                      ]}>
                        <Text style={[
                          styles.statusText, 
                          { 
                            color: isCompleted ? '#16a34a' : '#ea580c' 
                          }
                        ]}>
                          {ev.status || 'Scheduled'}
                        </Text>
                      </View>
                    </View>

                    {/* Research Title */}
                    <Text style={styles.groupTitle} numberOfLines={2}>{ev.title}</Text>
                    
                    {/* Meta Information */}
                    <View style={styles.metaContainer}>
                      <View style={styles.metaRow}>
                        <Ionicons name="calendar-outline" size={14} color="#94a3b8" />
                        <Text style={styles.metaText}>{ev.defenseDate}</Text>
                      </View>
                      <View style={styles.metaRow}>
                        <Ionicons name="time-outline" size={14} color="#94a3b8" />
                        <Text style={styles.metaText}>{ev.startTime || '10:00 AM'}</Text>
                      </View>
                      <View style={styles.metaRow}>
                        <Ionicons name="business-outline" size={14} color="#94a3b8" />
                        <Text style={styles.metaText}>{ev.stage}</Text>
                      </View>
                    </View>

                    {/* Footer Section */}
                    <View style={styles.cardFooter}>
                      <Text style={{ fontFamily: Typography.fontFamily.semiBold, fontSize: 12, color: '#64748b' }}>
                        Adviser: {ev.adviser}
                      </Text>
                      <Ionicons name="chevron-forward-outline" size={18} color="#94a3b8" />
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )
        )}
      </ScrollView>

      {/* Mobile Select Modal */}
      {Platform.OS !== 'web' && (
        <Modal visible={selectModalVisible} transparent animationType="slide">
          <Pressable style={styles.modalOverlay} onPress={() => setSelectModalVisible(false)}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{selectModalConfig.title}</Text>
              </View>
              <ScrollView style={styles.modalScroll}>
                {selectModalConfig.options.map((opt) => (
                  <Pressable 
                    key={opt} 
                    style={[styles.modalOption, selectModalConfig.currentValue === opt && styles.modalOptionActive]}
                    onPress={() => {
                      if (selectModalConfig.onSelect) selectModalConfig.onSelect(opt);
                      setSelectModalVisible(false);
                    }}
                  >
                    <Text style={[styles.modalOptionText, selectModalConfig.currentValue === opt && styles.modalOptionTextActive]}>
                      {opt}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </Pressable>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.pageBg },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#64748b', fontFamily: Typography.fontFamily.semiBold },
  
  // Filters Card
  filterCard: { margin: 20, padding: 20, backgroundColor: '#ffffff', borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 8, elevation: 1 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 10, paddingHorizontal: 12, height: 44, borderWidth: 1, borderColor: '#cbd5e1', marginBottom: 16 },
  searchInput: { flex: 1, fontSize: 15, color: '#1e293b', fontFamily: Typography.fontFamily.regular },
  selectGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  filterGroup: { flex: 1, minWidth: 160 },
  filterLabel: { fontSize: 12, fontFamily: Typography.fontFamily.bold, color: '#64748b', marginBottom: 6 },
  
  // Dropdown style for web
  webSelect: {
    width: '100%',
    height: 40,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
    fontSize: 14,
    color: '#1e293b',
    outlineStyle: 'none' as any,
    cursor: 'pointer' as any,
    fontFamily: Typography.fontFamily.medium,
  },
  mobileSelectMock: { width: '100%', height: 40, justifyContent: 'center', paddingHorizontal: 10, borderRadius: 10, borderWidth: 1, borderColor: '#cbd5e1', backgroundColor: '#ffffff' },
  selectText: { fontSize: 14, color: '#1e293b', fontFamily: Typography.fontFamily.regular },
  
  // Date Input
  dateInputWrapper: { flexDirection: 'row', alignItems: 'center', height: 40, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, backgroundColor: '#ffffff', paddingHorizontal: 10 },
  calendarIconInline: { marginRight: 6 },
  dateInput: { flex: 1, fontSize: 14, color: '#1e293b', padding: 0, fontFamily: Typography.fontFamily.regular },

  // Results bar
  resultsBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginBottom: 10 },
  resultsCount: { fontSize: 15, fontFamily: Typography.fontFamily.bold, color: '#475569' },
  viewToggleGroup: { flexDirection: 'row', backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, padding: 3, gap: 4 },
  toggleBtn: { padding: 6, borderRadius: 6 },
  toggleBtnActive: { backgroundColor: '#f1f5f9' },

  // Scroll content and grids
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  listContainer: { gap: 16 },
  
  // LIST TABLE VIEW STYLES
  tableContainer: { backgroundColor: '#ffffff', borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', padding: 20, shadowColor: '#000', shadowOpacity: 0.01, shadowRadius: 10, elevation: 1 },
  tableHeaderRow: { flexDirection: 'row', borderBottomWidth: 1.5, borderBottomColor: '#f1f5f9', paddingBottom: 14, marginBottom: 8 },
  tableH: { fontSize: 13, fontFamily: Typography.fontFamily.bold, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.5 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingVertical: 16, alignItems: 'center' },
  tableTitle: { fontSize: 15, fontFamily: Typography.fontFamily.bold, color: '#1e293b' },
  tableMembers: { fontSize: 12, color: '#64748b', marginTop: 4, fontFamily: Typography.fontFamily.medium },
  tableText: { fontSize: 14, color: '#475569', fontFamily: Typography.fontFamily.medium },
  evaluateBtn: { backgroundColor: '#ea580c', paddingHorizontal: 18, paddingVertical: 8, borderRadius: 8, justifyContent: 'center', alignItems: 'center', cursor: 'pointer' as any },
  evaluateBtnText: { color: '#ffffff', fontSize: 13, fontFamily: Typography.fontFamily.bold },
  
  // Card base (GRID VIEW)
  evalCard: { backgroundColor: '#ffffff', borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', padding: 18, shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 6, elevation: 1 },
  gridCard: { width: '31.5%', minWidth: 260 },
  listCard: { width: '100%' },
  
  // Card internals
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  emblemCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff7ed', borderWidth: 1, borderColor: '#ffedd5', justifyContent: 'center', alignItems: 'center' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 11, fontFamily: Typography.fontFamily.bold },
  groupTitle: { fontSize: 16, fontFamily: Typography.fontFamily.bold, color: '#0f172a', lineHeight: 22, height: 44, marginBottom: 12 },
  metaContainer: { gap: 8, marginBottom: 16 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metaText: { fontSize: 13, color: '#475569', fontFamily: Typography.fontFamily.semiBold },
  
  // Badges (Grid and Table Shared)
  roleBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eff6ff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  roleText: { fontSize: 11, fontFamily: Typography.fontFamily.bold },
  
  // Card Footer
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  
  emptyState: { padding: 48, alignItems: 'center', justifyContent: 'center' },
  emptyStateText: { marginTop: 12, color: '#64748b', fontFamily: Typography.fontFamily.semiBold },

  emptyChairman: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    marginTop: 24,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff7ed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ffedd5',
  },
  emptyTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 20,
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDesc: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    maxWidth: 360,
  },
  scheduleBtn: {
    backgroundColor: '#ea580c',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    shadowColor: '#ea580c',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  scheduleBtnText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 15,
    color: '#ffffff',
  },
  
  // Mobile Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#ffffff', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '70%', paddingBottom: 20 },
  modalHeader: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  modalTitle: { fontSize: 18, fontFamily: Typography.fontFamily.bold, color: '#0f172a' },
  modalScroll: { padding: 10 },
  modalOption: { paddingVertical: 16, paddingHorizontal: 20, borderRadius: 12 },
  modalOptionActive: { backgroundColor: '#fff7ed' },
  modalOptionText: { fontSize: 16, color: '#1e293b', fontFamily: Typography.fontFamily.medium },
  modalOptionTextActive: { color: '#ea580c', fontFamily: Typography.fontFamily.bold },
});
