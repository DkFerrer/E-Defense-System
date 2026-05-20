import React, { useState, useEffect } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import {
  Search,
  Users,
  Building2,
  Calendar as CalendarIcon,
  Clock,
  ChevronRight,
  GraduationCap,
  Grid,
  List,
  Filter,
  Star,
  User,
} from 'lucide-react-native';
import { getBookings } from '../services/api';
import { useApp } from '../context/AppContext';

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

export default function DashboardScreen() {
  const router = useRouter();
  const { user: currentUser } = useApp();
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');
  const [programFilter, setProgramFilter] = useState('All Programs');
  const [stageFilter, setStageFilter] = useState('All Stages');
  const [dateFilter, setDateFilter] = useState('');
  
  // Mobile Modal State for unified custom select
  const [selectModalVisible, setSelectModalVisible] = useState(false);
  const [selectModalConfig, setSelectModalConfig] = useState({ title: '', options: [], onSelect: null, currentValue: '' });
  
  // View Toggle (Grid/List) - Default to Grid
  const [viewMode, setViewMode] = useState('grid');

  // Format YYYY-MM-DD into "Dec 20, 2024"
  const formatDate = (dateStr) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const year = parts[0];
        const monthIdx = parseInt(parts[1]) - 1;
        const day = parseInt(parts[2]);
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return `${monthNames[monthIdx]} ${day}, ${year}`;
      }
      return dateStr;
    } catch (e) {
      return dateStr;
    }
  };

  const loadEvaluations = async () => {
    setLoading(true);
    try {
      const data = await getBookings();
      
      const formatted = [];
      
      for (const b of data) {
        // Check if accepted in ScheduleScreen
        const isAccepted = await AsyncStorage.getItem(`accepted_${b.id}`);
        // For ID=1 (the e-defense mock) and others, we only show it if accepted
        if (isAccepted === 'true') {
          const isSCIS = b.department?.toLowerCase().includes('computer') || b.department?.toLowerCase().includes('scis');
          const program = isSCIS ? 'BSIT' : 'BSCE';

          let statusText = 'Pending';
          if (b.status === 'completed') statusText = 'Completed';
          else if (b.status === 'approved') statusText = 'Scheduled';

          formatted.push({
            ...b,
            id: b.id,
            title: b.research_title,
            members: Array.isArray(b.members) ? b.members.join(', ') : b.members,
            adviser: b.adviser_name || 'N/A',
            venue: b.venue || 'N/A',
            date: formatDate(b.requested_date),
            rawDate: b.requested_date,
            startTime: b.requested_time,
            status: statusText,
            department: b.department || 'School of Computer and Information Sciences',
            program: b.program || (b.department?.toLowerCase().includes('computer') ? 'BS Information Technology' : 'BS Civil Engineering'),
            stage: b.defense_type || 'Title Defense',
            role: b.role || 'Member',
            evaluation: b.evaluation || { id: b.id, max_score: 100 }
          });
        }
      }

      setEvaluations(formatted);
    } catch (e) {
      console.error('Failed to load evaluations:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvaluations();
  }, []);

  useEffect(() => {
    if (departmentFilter !== 'All Departments') {
      const validPrograms = DEPARTMENTS[departmentFilter] || [];
      if (!validPrograms.includes(programFilter)) {
        setProgramFilter('All Programs');
      }
    }
  }, [departmentFilter]);

  // Filter evaluations based on selection
  const filteredEvals = evaluations.filter(e => {
    // 1. Search Query
    const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.members.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.adviser.toLowerCase().includes(searchQuery.toLowerCase());
      
    // 2. Department
    const matchesDept = departmentFilter === 'All Departments' || 
      (e.department && e.department.toLowerCase() === departmentFilter.toLowerCase());
      
    // 3. Program
    const matchesProg = programFilter === 'All Programs' ||
      (e.program && e.program.toLowerCase() === programFilter.toLowerCase());
      
    // 4. Stage
    const matchesStage = stageFilter === 'All Stages' ||
      (e.stage && e.stage.toLowerCase() === stageFilter.toLowerCase());
      
    // 5. Date
    const matchesDate = !dateFilter || (e.rawDate && e.rawDate === dateFilter) || (e.date && e.date.toLowerCase().includes(dateFilter.toLowerCase()));
    
    return matchesSearch && matchesDept && matchesProg && matchesStage && matchesDate;
  });

  const availableStages = ['All Stages', ...new Set(evaluations.map(e => e.stage).filter(Boolean))];

  const openMobileSelect = (title, options, currentValue, onSelect) => {
    setSelectModalConfig({ title, options, currentValue, onSelect });
    setSelectModalVisible(true);
  };

  const handleCardPress = (ev) => {
    router.push({ pathname: '/evaluation', params: { group: JSON.stringify(ev) } });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading evaluations...</Text>
      </View>
    );
  }

  // Large screen check for responsive design
  const isLargeScreen = width >= 768;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Evaluation</Text>
        <Text style={styles.subTitle}>Evaluate research group defenses</Text>
      </View>

      {/* Filter Card Section */}
      <View style={styles.filterCard}>
        {/* Search Bar */}
        <View style={styles.searchBox}>
          <Search size={20} color="#9ca3af" />
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
                style={styles.webSelect}
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
                style={styles.webSelect}
              >
                <option value="All Programs">
                  {departmentFilter === 'All Departments' ? 'All Programs' : `All Programs in Dept`}
                </option>
                {(departmentFilter === 'All Departments' 
                  ? Object.values(DEPARTMENTS).flat() 
                  : DEPARTMENTS[departmentFilter] || []).map(prog => (
                  <option key={prog} value={prog}>{prog}</option>
                ))}
              </select>
            ) : (
              <Pressable style={styles.mobileSelectMock} onPress={() => {
                const programOptions = departmentFilter === 'All Departments' 
                  ? Object.values(DEPARTMENTS).flat() 
                  : DEPARTMENTS[departmentFilter] || [];
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
                style={styles.webSelect}
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
                <CalendarIcon size={16} color="#94a3b8" style={styles.calendarIconInline} />
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
                  }}
                />
              </View>
            ) : (
              <View style={styles.dateInputWrapper}>
                <CalendarIcon size={16} color="#94a3b8" style={styles.calendarIconInline} />
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
        <Text style={styles.resultsCount}>Showing {filteredEvals.length} of {evaluations.length} groups</Text>
        <View style={styles.viewToggleGroup}>
          <Pressable 
            style={[styles.toggleBtn, viewMode === 'grid' && styles.toggleBtnActive]} 
            onPress={() => setViewMode('grid')}
          >
            <Grid size={16} color={viewMode === 'grid' ? '#2563eb' : '#94a3b8'} />
          </Pressable>
          <Pressable 
            style={[styles.toggleBtn, viewMode === 'list' && styles.toggleBtnActive]} 
            onPress={() => setViewMode('list')}
          >
            <List size={16} color={viewMode === 'list' ? '#2563eb' : '#94a3b8'} />
          </Pressable>
        </View>
      </View>

      {/* Cards List / Grid */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {filteredEvals.length === 0 ? (
          <View style={styles.emptyState}>
            <Users size={48} color="#cbd5e1" />
            <Text style={styles.emptyStateText}>No evaluation groups found.</Text>
          </View>
        ) : (
          viewMode === 'list' ? (
            /* LIST TABLE VIEW - Matches Screenshot 1 */
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
                const isChair = ev.role === 'Chairman';
                return (
                  <Pressable key={ev.id} style={styles.tableRow} onPress={() => handleCardPress(ev)}>
                    {/* Research Title & Authors */}
                    <View style={{ flex: 3.5, paddingRight: 10 }}>
                      <Text style={styles.tableTitle}>{ev.title}</Text>
                      <Text style={styles.tableMembers}>{ev.members}</Text>
                    </View>

                    {/* Department */}
                    <Text style={[styles.tableText, { flex: 3 }]}>{ev.department}</Text>

                    {/* Stage */}
                    <Text style={[styles.tableText, { flex: 1.5 }]}>{ev.stage}</Text>

                    {/* Date */}
                    <Text style={[styles.tableText, { flex: 1.5 }]}>{ev.date}</Text>

                    {/* Status Badge */}
                    <View style={{ flex: 1.5, alignItems: 'flex-start' }}>
                      <View style={[
                        styles.statusBadge, 
                        { 
                          backgroundColor: ev.status === 'Completed' ? '#f0fdf4' : 
                                          ev.status === 'Scheduled' ? '#eff6ff' : '#fff7ed' 
                        }
                      ]}>
                        <Text style={[
                          styles.statusText, 
                          { 
                            color: ev.status === 'Completed' ? '#16a34a' : 
                                   ev.status === 'Scheduled' ? '#2563eb' : '#ea580c' 
                          }
                        ]}>
                          {ev.status}
                        </Text>
                      </View>
                    </View>

                    {/* Action Button */}
                    <View style={{ flex: 1.5, alignItems: 'center' }}>
                      <Pressable 
                        style={styles.evaluateBtn}
                        onPress={() => handleCardPress(ev)}
                      >
                        <Text style={styles.evaluateBtnText}>Evaluate</Text>
                      </Pressable>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ) : (
            /* GRID VIEW - Matches Screenshot 2 */
            <View style={viewMode === 'grid' && isLargeScreen ? styles.gridContainer : styles.listContainer}>
              {filteredEvals.map((ev) => (
                <Pressable 
                  key={ev.id} 
                  style={[
                    styles.evalCard, 
                    viewMode === 'grid' && isLargeScreen ? styles.gridCard : styles.listCard
                  ]}
                  onPress={() => handleCardPress(ev)}
                >
                  {/* Logo and Status Badge Header */}
                  {(!ev.title.toLowerCase().includes('urban') && !ev.title.toLowerCase().includes('smart city')) ? (
                    <View style={styles.cardHeader}>
                      <View style={styles.emblemCircle}>
                        <GraduationCap size={16} color="#d97706" />
                      </View>
                      <View style={[
                        styles.statusBadge, 
                        { 
                          backgroundColor: ev.status === 'Completed' ? '#f0fdf4' : 
                                          ev.status === 'Scheduled' ? '#eff6ff' : '#fff7ed' 
                        }
                      ]}>
                        <Text style={[
                          styles.statusText, 
                          { 
                            color: ev.status === 'Completed' ? '#16a34a' : 
                                   ev.status === 'Scheduled' ? '#2563eb' : '#ea580c' 
                          }
                        ]}>
                          {ev.status}
                        </Text>
                      </View>
                    </View>
                  ) : (
                    <View style={[styles.cardHeader, { justifyContent: 'flex-start' }]}>
                      <View style={[
                        styles.statusBadge, 
                        { 
                          backgroundColor: ev.status === 'Completed' ? '#f0fdf4' : 
                                          ev.status === 'Scheduled' ? '#eff6ff' : '#fff7ed' 
                        }
                      ]}>
                        <Text style={[
                          styles.statusText, 
                          { 
                            color: ev.status === 'Completed' ? '#16a34a' : 
                                   ev.status === 'Scheduled' ? '#2563eb' : '#ea580c' 
                          }
                        ]}>
                          {ev.status}
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Research Title */}
                  <Text style={styles.groupTitle} numberOfLines={2}>{ev.title}</Text>
                  
                  {/* Meta Information */}
                  <View style={styles.metaContainer}>
                    <View style={styles.metaRow}>
                      <CalendarIcon size={14} color="#94a3b8" />
                      <Text style={styles.metaText}>{ev.date}</Text>
                    </View>
                    <View style={styles.metaRow}>
                      <Clock size={14} color="#94a3b8" />
                      <Text style={styles.metaText}>{ev.startTime}</Text>
                    </View>
                    <View style={styles.metaRow}>
                      <Building2 size={14} color="#94a3b8" />
                      <Text style={styles.metaText}>{ev.stage}</Text>
                    </View>
                  </View>

                  {/* Footer Section */}
                  <View style={[styles.cardFooter, { justifyContent: 'flex-end' }]}>
                    <ChevronRight size={18} color="#94a3b8" />
                  </View>
                </Pressable>
              ))}
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
  container: { flex: 1, backgroundColor: '#f8fafc' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#64748b', fontWeight: '600' },
  
  // Header
  header: { paddingHorizontal: 24, paddingVertical: 20, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  title: { fontSize: 32, fontWeight: '900', color: '#0f172a', letterSpacing: -0.5 },
  subTitle: { fontSize: 14, color: '#64748b', marginTop: 4, fontWeight: '500' },
  
  // Filters Card
  filterCard: { margin: 20, padding: 20, backgroundColor: '#ffffff', borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 8, elevation: 1 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 10, paddingHorizontal: 12, height: 44, borderWidth: 1, borderColor: '#cbd5e1', marginBottom: 16 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 15, color: '#1e293b' },
  selectGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  filterGroup: { flex: 1, minWidth: 160 },
  filterLabel: { fontSize: 12, fontWeight: '700', color: '#64748b', marginBottom: 6 },
  
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
    outlineStyle: 'none',
    cursor: 'pointer',
  },
  mobileSelectMock: { width: '100%', height: 40, justifyContent: 'center', paddingHorizontal: 10, borderRadius: 10, borderWidth: 1, borderColor: '#cbd5e1', backgroundColor: '#ffffff' },
  selectText: { fontSize: 14, color: '#1e293b' },
  
  // Date Input
  dateInputWrapper: { flexDirection: 'row', alignItems: 'center', height: 40, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, backgroundColor: '#ffffff', paddingHorizontal: 10 },
  calendarIconInline: { marginRight: 6 },
  dateInput: { flex: 1, fontSize: 14, color: '#1e293b', padding: 0 },

  // Results bar
  resultsBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginBottom: 10 },
  resultsCount: { fontSize: 15, fontWeight: '700', color: '#475569' },
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
  tableH: { fontSize: 13, fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: 0.5 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingVertical: 16, alignItems: 'center' },
  tableTitle: { fontSize: 15, fontWeight: '800', color: '#1e293b' },
  tableMembers: { fontSize: 12, color: '#64748b', marginTop: 4, fontWeight: '500' },
  tableText: { fontSize: 14, color: '#475569', fontWeight: '600' },
  evaluateBtn: { backgroundColor: '#2563eb', paddingHorizontal: 18, paddingVertical: 8, borderRadius: 8, justifyContent: 'center', alignItems: 'center', ...Platform.select({ web: { cursor: 'pointer', transition: 'all 0.2s' } }) },
  evaluateBtnText: { color: '#ffffff', fontSize: 13, fontWeight: '800' },
  
  // Card base (GRID VIEW)
  evalCard: { backgroundColor: '#ffffff', borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', padding: 18, shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 6, elevation: 1 },
  gridCard: { width: '31.5%', minWidth: 260 },
  listCard: { width: '100%' },
  
  // Card internals
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  emblemCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#fef3c7', borderWidth: 1, borderColor: '#f59e0b', justifyContent: 'center', alignItems: 'center' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: '800' },
  groupTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a', lineHeight: 22, height: 44, marginBottom: 12 },
  metaContainer: { gap: 8, marginBottom: 16 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metaText: { fontSize: 13, color: '#475569', fontWeight: '600' },
  
  // Badges (Grid and Table Shared)
  roleBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eff6ff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  roleText: { fontSize: 11, fontWeight: '800' },
  
  // Card Footer
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  
  emptyState: { padding: 48, alignItems: 'center', justifyContent: 'center' },
  emptyStateText: { marginTop: 12, color: '#64748b', fontWeight: '600' },
  
  // Mobile Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#ffffff', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '70%', paddingBottom: 20 },
  modalHeader: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  modalScroll: { padding: 10 },
  modalOption: { paddingVertical: 16, paddingHorizontal: 20, borderRadius: 12 },
  modalOptionActive: { backgroundColor: '#eff6ff' },
  modalOptionText: { fontSize: 16, color: '#1e293b', fontWeight: '500' },
  modalOptionTextActive: { color: '#2563eb', fontWeight: '700' },
});
