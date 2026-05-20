import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  TextInput,
  Dimensions,
  Platform,
  Modal,
} from 'react-native';
import {
  Search,
  Download,
  Filter,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  X,
  UserCheck,
  Building2,
  Users,
} from 'lucide-react-native';
import { format } from 'date-fns';
import { getEvaluationResults } from '../services/api';
import { colors } from '../theme/tokens';

const { width } = Dimensions.get('window');
const isLargeScreen = width >= 768;

export default function ResultsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [activeStage, setActiveStage] = useState('All');

  // Dynamically generate stages based on available results
  const STAGES = ['All', ...new Set(results.map(r => r.stage).filter(Boolean))];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getEvaluationResults();
      // Map backend evaluations to UI results
      const formatted = data.map(ev => {
        // Calculate average score from panelist submissions
        const submissions = ev.panelist_submissions || [];
        const totalSubScore = submissions.reduce((sum, s) => sum + (parseFloat(s.total_score) || 0), 0);
        const avgScore = submissions.length > 0 ? totalSubScore / submissions.length : 0;
        
        return {
          id: ev.id,
          title: ev.target,
          authors: Array.isArray(ev.authors) ? ev.authors.join(', ') : (ev.authors || 'N/A'),
          score: Math.round(avgScore),
          pct: `${Math.round(avgScore)}%`,
          date: ev.result_date ? format(new Date(ev.result_date), 'MMM dd, yyyy') : format(new Date(ev.created_at), 'MMM dd, yyyy'),
          stage: ev.type,
          status: avgScore >= 75 ? 'Passed' : (submissions.length > 0 ? 'Conditional' : 'Pending'),
          status_tone: avgScore >= 75 ? 'green' : (submissions.length > 0 ? 'orange' : 'teal'),
          submissions: submissions
        };
      });
      
      setResults(formatted);
    } catch (e) {
      console.error('Failed to load results:', e);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (tone) => {
    const tones = {
      teal: { bg: '#f0fdfa', text: '#0d9488', border: '#99f6e4' },
      orange: { bg: '#fff7ed', text: '#ea580c', border: '#fed7aa' },
      green: { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' },
      red: { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
    };
    return tones[tone] || tones.teal;
  };

  const filteredResults = results.filter(r => 
    (activeStage === 'All' || r.stage === activeStage) &&
    (r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.authors.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const stats = {
    avgScore: results.length > 0 ? (results.reduce((sum, r) => sum + r.score, 0) / results.length).toFixed(1) : '0.0',
    passed: results.filter(r => r.score >= 75).length,
    pending: results.filter(r => r.status === 'Pending').length
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Defense Results</Text>
          <Text style={styles.subTitle}>Track and analyze student research performance</Text>
        </View>
        <Pressable style={styles.exportBtn}>
          <Download size={20} color="#ffffff" />
          <Text style={styles.exportBtnText}>Export Report</Text>
        </Pressable>
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, { borderLeftColor: '#3b82f6' }]}>
          <Text style={styles.statLabel}>Avg Score</Text>
          <Text style={styles.statVal}>{stats.avgScore}%</Text>
          <Text style={styles.statSub}>Overall Average</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: '#16a34a' }]}>
          <Text style={styles.statLabel}>Passed</Text>
          <Text style={styles.statVal}>{stats.passed}</Text>
          <Text style={styles.statSub}>Groups this term</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: '#f59e0b' }]}>
          <Text style={styles.statLabel}>Pending</Text>
          <Text style={styles.statVal}>{stats.pending}</Text>
          <Text style={styles.statSub}>Upcoming defenses</Text>
        </View>
      </View>

      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          {STAGES.map(stage => (
            <Pressable 
              key={stage} 
              style={[styles.tabBtn, activeStage === stage && styles.tabBtnActive]}
              onPress={() => setActiveStage(stage)}
            >
              <Text style={[styles.tabText, activeStage === stage && styles.tabTextActive]}>{stage}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <View style={styles.filterBar}>
        <View style={styles.searchBox}>
          <Search size={20} color="#9ca3af" />
          <TextInput
            placeholder="Search groups or authors..."
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <Pressable style={styles.filterBtn}>
          <Filter size={20} color="#4b5563" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {filteredResults.map((row) => {
          const status = getStatusColor(row.status_tone);
          return (
            <View key={row.id} style={styles.resultCard}>
              <View style={styles.cardTop}>
                <View style={styles.titleGroup}>
                  <Text style={styles.resultTitle}>{row.title}</Text>
                  <Text style={styles.resultAuthors}>{row.authors}</Text>
                </View>
                <View style={styles.scoreGroup}>
                  <Text style={styles.scoreVal}>{row.score}</Text>
                  <Text style={styles.scorePct}>{row.pct}</Text>
                </View>
              </View>
              
              <View style={styles.cardDivider} />
              
              <View style={styles.cardBottom}>
                <View style={styles.metaInfo}>
                  <View style={styles.metaItem}><Clock size={14} color="#6b7280" /><Text style={styles.metaText}>{row.date}</Text></View>
                  <View style={styles.metaItem}><FileText size={14} color="#6b7280" /><Text style={styles.metaText}>{row.stage}</Text></View>
                </View>
                
                <View style={[styles.statusBadge, { backgroundColor: status.bg, borderColor: status.border }]}>
                  <Text style={[styles.statusText, { color: status.text }]}>{row.status}</Text>
                </View>
              </View>

              <Pressable 
                style={styles.viewLink}
                onPress={() => setSelectedResult(row)}
              >
                <Text style={styles.viewLinkText}>View Full Report</Text>
                <ChevronRight size={16} color="#2563eb" />
              </Pressable>
            </View>
          );
        })}
      </ScrollView>

      {/* Report Modal */}
      <Modal visible={!!selectedResult} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.reportBox}>
            <View style={styles.reportHeader}>
              <Text style={styles.reportTitle}>Evaluation Summary</Text>
              <Pressable onPress={() => setSelectedResult(null)}>
                <X size={24} color="#6b7280" />
              </Pressable>
            </View>
            
            <ScrollView contentContainerStyle={styles.reportScroll}>
              {selectedResult && (
                <>
                  <View style={styles.reportMainInfo}>
                    <Text style={styles.reportGroupTitle}>{selectedResult.title}</Text>
                    <Text style={styles.reportAuthors}>{selectedResult.authors}</Text>
                  </View>

                    <View style={styles.reportStats}>
                    <View style={styles.reportStatItem}>
                      <Text style={styles.reportStatLabel}>Final Grade</Text>
                      <Text style={styles.reportStatVal}>{selectedResult.score}%</Text>
                    </View>
                    <View style={styles.reportStatItem}>
                      <Text style={styles.reportStatLabel}>Status</Text>
                      <View style={[styles.statusBadgeModal, { backgroundColor: getStatusColor(selectedResult.status_tone).bg, borderColor: getStatusColor(selectedResult.status_tone).border }]}>
                        <Text style={[styles.statusTextModal, { color: getStatusColor(selectedResult.status_tone).text }]}>{selectedResult.status}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.reportSection}>
                    <Text style={styles.reportSectionTitle}>Score Breakdown</Text>
                    {selectedResult.submissions && selectedResult.submissions.length > 0 ? (
                      selectedResult.submissions.map((sub, i) => (
                        <View key={i} style={styles.breakdownCard}>
                          <Text style={styles.breakdownLabel}>Panelist {i + 1} Score: <Text style={{fontWeight: '900', color: '#2563eb'}}>{sub.total_score}</Text></Text>
                          {(() => {
                            let parsedScores = sub.scores || {};
                            if (typeof parsedScores === 'string') {
                              try { parsedScores = JSON.parse(parsedScores); } catch (e) { parsedScores = {}; }
                            }
                            
                            const docScores = Object.entries(parsedScores).filter(([key]) => key !== 'studentPresentations');
                            const studentScores = parsedScores.studentPresentations || [];

                            return (
                              <View>
                                {docScores.map(([crit, val]) => (
                                  <View key={crit} style={styles.breakdownRow}>
                                    <Text style={styles.breakdownSub}>{crit}</Text>
                                    <Text style={styles.breakdownVal}>{String(val)}</Text>
                                  </View>
                                ))}
                                {Array.isArray(studentScores) && studentScores.map((student, idx) => (
                                  <View key={`student-${idx}`} style={{ marginTop: 8, paddingLeft: 8, borderLeftWidth: 2, borderLeftColor: '#cbd5e1' }}>
                                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#475569', marginBottom: 4 }}>
                                      {student.studentName} (Oral Defense)
                                    </Text>
                                    {Object.entries(student.scores || {}).map(([sCrit, sVal]) => (
                                      <View key={sCrit} style={styles.breakdownRow}>
                                        <Text style={styles.breakdownSub}>{sCrit}</Text>
                                        <Text style={styles.breakdownVal}>{String(sVal)}</Text>
                                      </View>
                                    ))}
                                  </View>
                                ))}
                              </View>
                            );
                          })()}
                        </View>
                      ))
                    ) : (
                      <Text style={styles.reportDetailText}>No submissions yet.</Text>
                    )}
                  </View>

                  <View style={styles.reportSection}>
                    <Text style={styles.reportSectionTitle}>Panel Recommendations</Text>
                    {selectedResult.submissions && selectedResult.submissions.length > 0 ? (
                      selectedResult.submissions.map((sub, i) => (
                        <View key={i} style={[styles.recommendationCard, { marginBottom: 8 }]}>
                          <CheckCircle2 size={16} color="#16a34a" />
                          <Text style={styles.recommendationText}>
                            {sub.general_comments || 'No general comments provided.'}
                          </Text>
                        </View>
                      ))
                    ) : (
                      <View style={styles.recommendationCard}>
                        <AlertCircle size={16} color="#ea580c" />
                        <Text style={[styles.recommendationText, { color: '#ea580c' }]}>Pending Evaluation</Text>
                      </View>
                    )}
                  </View>
                </>
              )}
            </ScrollView>

            <Pressable style={styles.closeBtn} onPress={() => setSelectedResult(null)}>
              <Text style={styles.closeBtnText}>Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  header: { padding: 24, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 26, fontWeight: '900', color: '#111827' },
  subTitle: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  exportBtn: { backgroundColor: '#16a34a', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, gap: 8 },
  exportBtnText: { color: '#ffffff', fontWeight: '700', fontSize: 14 },
  statsRow: { flexDirection: 'row', padding: 16, gap: 12 },
  statCard: { flex: 1, backgroundColor: '#ffffff', borderRadius: 16, padding: 16, borderLeftWidth: 4, elevation: 2 },
  statLabel: { fontSize: 12, fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' },
  statVal: { fontSize: 22, fontWeight: '900', color: '#111827', marginVertical: 4 },
  statSub: { fontSize: 11, color: '#9ca3af', fontWeight: '600' },
  statTrend: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  trendText: { fontSize: 12, fontWeight: '700', color: '#16a34a' },
  filterBar: { paddingHorizontal: 16, marginBottom: 16, flexDirection: 'row', gap: 12 },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 12, paddingHorizontal: 12, height: 48, borderWidth: 1, borderColor: '#e5e7eb' },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: '#1f2937' },
  filterBtn: { width: 48, height: 48, backgroundColor: '#ffffff', borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e5e7eb' },
  scrollContent: { padding: 16, gap: 16 },
  resultCard: { backgroundColor: '#ffffff', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#e5e7eb', elevation: 2 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  titleGroup: { flex: 1, marginRight: 16 },
  resultTitle: { fontSize: 17, fontWeight: '800', color: '#111827', lineHeight: 24 },
  resultAuthors: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  scoreGroup: { alignItems: 'flex-end' },
  scoreVal: { fontSize: 20, fontWeight: '900', color: '#111827' },
  scorePct: { fontSize: 12, color: '#2563eb', fontWeight: '700', marginTop: 2 },
  cardDivider: { height: 1, backgroundColor: '#f3f4f6', marginVertical: 16 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metaInfo: { flexDirection: 'row', gap: 16 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 12, color: '#6b7280', fontWeight: '600' },
  statusText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  statusBadgeModal: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1, marginTop: 4 },
  statusTextModal: { fontSize: 13, fontWeight: '900', textTransform: 'uppercase' },
  viewLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  viewLinkText: { fontSize: 14, fontWeight: '700', color: '#2563eb' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  reportBox: { backgroundColor: '#ffffff', borderTopLeftRadius: 32, borderTopRightRadius: 32, height: '85%', padding: 24 },
  reportHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  reportTitle: { fontSize: 20, fontWeight: '900', color: '#111827' },
  reportScroll: { paddingBottom: 40 },
  reportMainInfo: { marginBottom: 24 },
  reportGroupTitle: { fontSize: 24, fontWeight: '900', color: '#111827', marginBottom: 8 },
  reportAuthors: { fontSize: 14, color: '#6b7280', fontWeight: '500' },
  reportStats: { flexDirection: 'row', gap: 16, marginBottom: 32 },
  reportStatItem: { flex: 1, backgroundColor: '#f8fafc', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center' },
  reportStatLabel: { fontSize: 11, fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: 4 },
  reportStatVal: { fontSize: 24, fontWeight: '900', color: '#2563eb' },
  reportSection: { marginBottom: 24 },
  reportSectionTitle: { fontSize: 14, fontWeight: '800', color: '#111827', textTransform: 'uppercase', marginBottom: 12 },
  reportDetailRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  reportDetailText: { fontSize: 14, color: '#4b5563', fontWeight: '600' },
  reportConsensus: { fontSize: 14, color: '#4b5563', lineHeight: 22 },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 },
  breakdownInfo: { flex: 1 },
  breakdownLabel: { fontSize: 14, fontWeight: '700', color: '#111827' },
  breakdownSub: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  breakdownVal: { fontSize: 14, fontWeight: '900', color: '#111827' },
  progressBarBg: { height: 8, backgroundColor: '#f1f5f9', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 4 },
  recommendationCard: { flexDirection: 'row', gap: 12, backgroundColor: '#f0fdf4', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#bbf7d0' },
  recommendationText: { flex: 1, fontSize: 13, color: '#166534', fontWeight: '600', lineHeight: 20 },
  closeBtn: { backgroundColor: '#111827', height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 16 },
  closeBtnText: { color: '#ffffff', fontWeight: '800', fontSize: 16 },
  tabsContainer: { paddingHorizontal: 16, marginBottom: 16 },
  tabsScroll: { gap: 8 },
  tabBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#e5e7eb' },
  tabBtnActive: { backgroundColor: '#2563eb' },
  tabText: { fontSize: 13, fontWeight: '700', color: '#4b5563' },
  tabTextActive: { color: '#ffffff' },
  breakdownCard: { backgroundColor: '#f8fafc', padding: 12, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
});
