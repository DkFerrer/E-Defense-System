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
  Award,
  User,
  MessageSquare,
  Calendar,
} from 'lucide-react-native';
import { format } from 'date-fns';
import { getEvaluationResults } from '../services/api';
import { colors } from '../theme/tokens';
import { sections, presentationCriteria } from '../data/evaluationRubric';

const { width } = Dimensions.get('window');
const isLargeScreen = width >= 768;

const scorePercentages = {
  5: 1.0,    // 100% - Excellent
  4: 0.8,    // 80% - Good
  3: 0.6,    // 60% - Adequate
  2: 0.4,    // 40% - Needs Work
  1: 0.2     // 20% - Poor
};

const getSelectedLevel = (currentScore, maxPoints) => {
  for (const [level, percentage] of Object.entries(scorePercentages)) {
    const expectedScore = Math.round(maxPoints * percentage * 10) / 10;
    if (Math.abs((currentScore || 0) - expectedScore) < 0.1) {
      return parseInt(level);
    }
  }
  return null;
};

const fallbackSections = [
  {
    title: "PROJECT DOCUMENTATION AND MANUSCRIPT",
    subsections: [
      {
        title: "Evaluation Criteria",
        criteria: [
          { id: 'doc-context', name: 'Project Context', points: 10 },
          { id: 'doc-objectives', name: 'Clarity and Completeness of Ideas and Objectives', points: 15 },
          { id: 'doc-method', name: 'Methodology and Technical Approach', points: 25 },
          { id: 'doc-results', name: 'Results, Analysis, and Output', points: 30 },
          { id: 'doc-writing', name: 'Quality of Technical Writing', points: 20 }
        ]
      }
    ]
  }
];

const getLevelBadgeStyle = (level) => {
  const stylesMap = {
    5: { bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d' },
    4: { bg: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8' },
    3: { bg: '#fffbeb', border: '#fef3c7', text: '#b45309' },
    2: { bg: '#fff7ed', border: '#fed7aa', text: '#c2410c' },
    1: { bg: '#fef2f2', border: '#fecaca', text: '#b91c1c' },
  };
  return stylesMap[level] || { bg: '#f1f5f9', border: '#e2e8f0', text: '#475569' };
};

const renderFormattedText = (text) => {
  if (!text) return <Text style={{ color: '#64748b' }}>N/A</Text>;
  
  const lines = text.split('\n');
  return lines.map((line, lineIdx) => {
    let isBullet = false;
    let cleanLine = line;
    if (line.trim().startsWith('- ')) {
      isBullet = true;
      cleanLine = line.trim().substring(2);
    }
    
    const regex = /(\*\*.*?\*\*|\*.*?\*|<u>.*?<\/u>)/g;
    const parts = cleanLine.split(regex);
    
    const elements = parts.map((part, partIdx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <Text key={partIdx} style={{ fontWeight: 'bold' }}>{part.slice(2, -2)}</Text>;
      } else if (part.startsWith('*') && part.endsWith('*')) {
        return <Text key={partIdx} style={{ fontStyle: 'italic' }}>{part.slice(1, -1)}</Text>;
      } else if (part.startsWith('<u>') && part.endsWith('</u>')) {
        return <Text key={partIdx} style={{ textDecorationLine: 'underline' }}>{part.slice(3, -4)}</Text>;
      }
      return <Text key={partIdx}>{part}</Text>;
    });

    return (
      <View key={lineIdx} style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 4, alignItems: 'flex-start' }}>
        {isBullet && <Text style={{ marginRight: 6, fontSize: 13, color: '#334155' }}>•</Text>}
        <Text style={{ flex: 1, fontSize: 13, color: '#334155', lineHeight: 18 }}>{elements}</Text>
      </View>
    );
  });
};

export default function ResultsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [activeStage, setActiveStage] = useState('All');

  // Dynamically generate stages based on available results
  const STAGES = ['All', ...new Set(results.map(r => r.stage).filter(Boolean))];

  const exportToPDF = () => {
    if (Platform.OS === 'web') {
      window.print();
    } else {
      alert('PDF Export is supported on Web browsers. Please save/print as PDF from your browser.');
    }
  };

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
          submissions: submissions,
          defense_minutes: ev.defense_minutes
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
                
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={[styles.statusBadge, { backgroundColor: status.bg, borderColor: status.border, marginRight: 8 }]}>
                    <Text style={[styles.statusText, { color: status.text }]}>{row.status}</Text>
                  </View>
                  {row.defense_minutes ? (
                    <View style={[styles.statusBadge, { 
                      backgroundColor: row.defense_minutes.status === 'submitted' ? '#eff6ff' : '#fffbeb',
                      borderColor: row.defense_minutes.status === 'submitted' ? '#bfdbfe' : '#fef3c7',
                    }]}>
                      <Text style={[styles.statusText, { 
                        color: row.defense_minutes.status === 'submitted' ? '#2563eb' : '#d97706' 
                      }]}>
                        Minutes: {row.defense_minutes.status === 'submitted' ? 'Submitted' : 'Draft'}
                      </Text>
                    </View>
                  ) : (
                    <View style={[styles.statusBadge, { backgroundColor: '#fef2f2', borderColor: '#fecaca' }]}>
                      <Text style={[styles.statusText, { color: '#dc2626' }]}>Minutes: Missing</Text>
                    </View>
                  )}
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
        {Platform.OS === 'web' && (
          <style dangerouslySetInnerHTML={{ __html: `
            @media print {
              body {
                background-color: #ffffff !important;
              }
              body * {
                visibility: hidden !important;
              }
              #printable-summary, #printable-summary * {
                visibility: visible !important;
              }
              #printable-summary {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                height: auto !important;
                background-color: #ffffff !important;
                box-shadow: none !important;
                border: none !important;
                padding: 0 !important;
                margin: 0 !important;
              }
              #no-print-header-btn,
              #no-print-footer-actions,
              #no-print-close-x {
                display: none !important;
                visibility: hidden !important;
              }
              [id^="panelist-card-"] {
                page-break-after: always !important;
                break-after: page !important;
              }
              [id^="panelist-card-"]:last-child {
                page-break-after: avoid !important;
                break-after: avoid !important;
              }
            }
          ` }} />
        )}
        <View style={styles.modalOverlay}>
          <View style={styles.reportBox} nativeID="printable-summary">
            <View style={styles.reportHeader}>
              <Text style={styles.reportTitle}>Evaluation Summary</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Pressable 
                  nativeID="no-print-header-btn" 
                  style={styles.modalExportHeaderBtn} 
                  onPress={exportToPDF}
                >
                  <Download size={18} color="#16a34a" />
                  <Text style={styles.modalExportHeaderBtnText}>Export PDF</Text>
                </Pressable>
                <Pressable nativeID="no-print-close-x" onPress={() => setSelectedResult(null)}>
                  <X size={24} color="#6b7280" />
                </Pressable>
              </View>
            </View>
            
            <ScrollView contentContainerStyle={styles.reportScroll}>
              {selectedResult && (
                <>
                  {/* Institutional Letterhead */}
                  <View style={styles.letterheadContainer}>
                    <Building2 size={36} color="#1e3a8a" />
                    <View style={{ marginLeft: 12, flex: 1 }}>
                      <Text style={styles.letterheadUniv}>UNIVERSITY OF NUEVA CACERES</Text>
                      <Text style={styles.letterheadDept}>School of Computer and Information Sciences</Text>
                      <Text style={styles.letterheadDoc}>RESEARCH DEFENSE EVALUATION REPORT</Text>
                    </View>
                  </View>

                  <View style={styles.reportMainInfo}>
                    <Text style={styles.reportGroupTitle}>{selectedResult.title}</Text>
                    <Text style={styles.reportAuthors}>Authors: {selectedResult.authors}</Text>
                  </View>

                  <View style={styles.reportStats}>
                    <View style={styles.reportStatItem}>
                      <Text style={styles.reportStatLabel}>Final Average Grade</Text>
                      <Text style={styles.reportStatVal}>{selectedResult.score}%</Text>
                    </View>
                    <View style={styles.reportStatItem}>
                      <Text style={styles.reportStatLabel}>Status</Text>
                      <View style={[styles.statusBadgeModal, { backgroundColor: getStatusColor(selectedResult.status_tone).bg, borderColor: getStatusColor(selectedResult.status_tone).border }]}>
                        <Text style={[styles.statusTextModal, { color: getStatusColor(selectedResult.status_tone).text }]}>{selectedResult.status}</Text>
                      </View>
                    </View>
                  </View>

                  {selectedResult.defense_minutes ? (
                    <View style={styles.reportSection}>
                      <Text style={styles.reportSectionTitle}>Defense Minutes (Secretary Transcription)</Text>
                      <View style={[styles.panelistCard, { borderColor: '#2563eb', borderLeftWidth: 4 }]}>
                        <View style={[styles.panelistCardHeader, { backgroundColor: '#2563eb' }]}>
                          <FileText size={20} color="#fff" />
                          <Text style={styles.panelistCardTitle}>
                            Thesis Defense Minutes (Transcribed by Secretary)
                          </Text>
                          <View style={[styles.panelistScoreBadge, { backgroundColor: selectedResult.defense_minutes.status === 'submitted' ? '#10b981' : '#f59e0b' }]}>
                            <Text style={styles.panelistScoreBadgeText}>
                              {selectedResult.defense_minutes.status === 'submitted' ? 'Submitted' : 'Draft'}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.panelistCardBody}>
                          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
                            <View style={{ flex: 1, minWidth: 150 }}>
                              <Text style={styles.formLabel}>Panel Secretary</Text>
                              <Text style={{ fontSize: 14, color: '#334155', fontWeight: '600' }}>
                                {selectedResult.defense_minutes.secretary_name || 'N/A'}
                              </Text>
                            </View>
                            <View style={{ flex: 1, minWidth: 150 }}>
                              <Text style={styles.formLabel}>Date and Time</Text>
                              <Text style={{ fontSize: 14, color: '#334155', fontWeight: '600' }}>
                                {selectedResult.defense_minutes.date_time || 'N/A'}
                              </Text>
                            </View>
                          </View>

                          <View style={{ marginBottom: 12 }}>
                            <Text style={[styles.formLabel, { color: '#1e293b', fontWeight: '800' }]}>Suggestions</Text>
                            <View style={{ backgroundColor: '#f8fafc', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0', minHeight: 40 }}>
                              {renderFormattedText(selectedResult.defense_minutes.suggestions)}
                            </View>
                          </View>

                          {selectedResult.defense_minutes.compliance ? (
                            <View style={{ marginBottom: 12 }}>
                              <Text style={[styles.formLabel, { color: '#1e293b', fontWeight: '800' }]}>Compliance Requirements</Text>
                              <View style={{ backgroundColor: '#f8fafc', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0', minHeight: 40 }}>
                                {renderFormattedText(selectedResult.defense_minutes.compliance)}
                              </View>
                            </View>
                          ) : null}
                        </View>
                      </View>
                    </View>
                  ) : null}

                  <View style={styles.reportSection}>
                    <Text style={styles.reportSectionTitle}>Detailed Panel Evaluations</Text>
                    {selectedResult.submissions && selectedResult.submissions.length > 0 ? (
                      selectedResult.submissions.map((sub, i) => {
                        let parsedScores = sub.scores || {};
                        if (typeof parsedScores === 'string') {
                          try { parsedScores = JSON.parse(parsedScores); } catch (e) { parsedScores = {}; }
                        }
                        let parsedComments = sub.comments || {};
                        if (typeof parsedComments === 'string') {
                          try { parsedComments = JSON.parse(parsedComments); } catch (e) { parsedComments = {}; }
                        }

                        // Determine which rubrics section list to use based on existing score keys
                        const hasNewRubrics = Object.keys(parsedScores).some(k => k.startsWith('ch') || k.startsWith('rm') || k.startsWith('sdm') || k.startsWith('sm') || k.startsWith('ssp'));
                        const rubricSections = hasNewRubrics ? sections : fallbackSections;
                        
                        // Calculate Documentation Subtotal
                        let docTotal = 0;
                        let docMax = 0;
                        rubricSections.forEach(sec => {
                          sec.subsections.forEach(subSec => {
                            subSec.criteria.forEach(crit => {
                              docTotal += (parsedScores[crit.id] || 0);
                              docMax += crit.points;
                            });
                          });
                        });

                        const studentScores = parsedScores.studentPresentations || [];

                        return (
                          <View key={i} nativeID={"panelist-card-" + i} style={styles.panelistCard}>
                            <View style={styles.panelistCardHeader}>
                              <UserCheck size={20} color="#fff" />
                              <Text style={styles.panelistCardTitle}>
                                Panel Member {i + 1} Scorecard
                              </Text>
                              <View style={styles.panelistScoreBadge}>
                                <Text style={styles.panelistScoreBadgeText}>
                                  {sub.total_score} / 100
                                </Text>
                              </View>
                            </View>

                            <View style={styles.panelistCardBody}>
                              <Text style={styles.subSectionSummaryTitle}>
                                I. PROJECT DOCUMENTATION AND MANUSCRIPT ({docTotal} / {docMax})
                              </Text>

                              {rubricSections.map((section, secIdx) => {
                                let sectionScore = 0;
                                let sectionMax = 0;
                                section.subsections.forEach(s => {
                                  s.criteria.forEach(c => {
                                    sectionScore += (parsedScores[c.id] || 0);
                                    sectionMax += c.points;
                                  });
                                });

                                return (
                                  <View key={secIdx} style={styles.summarySectionContainer}>
                                    <View style={styles.summarySectionBarHeader}>
                                      <Text style={styles.summarySectionBarTitle}>{section.title}</Text>
                                      <View style={styles.summarySectionScoreBadge}>
                                        <Text style={styles.summarySectionScoreBadgeText}>
                                          {sectionScore} / {sectionMax}
                                        </Text>
                                      </View>
                                    </View>

                                    {section.subsections.map((subsection, subIdx) => {
                                      let subScore = 0;
                                      let subMax = 0;
                                      subsection.criteria.forEach(c => {
                                        subScore += (parsedScores[c.id] || 0);
                                        subMax += c.points;
                                      });

                                      return (
                                        <View key={subIdx} style={styles.summarySubsectionContainer}>
                                          <View style={styles.summarySubsectionHeader}>
                                            <Text style={styles.summarySubsectionTitle}>{subsection.title}</Text>
                                            <Text style={styles.summarySubsectionScore}>{subScore} / {subMax}</Text>
                                          </View>

                                          {subsection.criteria.map((criterion) => {
                                            const score = parsedScores[criterion.id] || 0;
                                            const selectedLevel = getSelectedLevel(score, criterion.points);
                                            const selectedRubric = (criterion as any).rubric?.find(r => r.level === selectedLevel);
                                            const selectedDesc = selectedRubric ? selectedRubric.description : '';
                                            const critComment = parsedComments[criterion.id];
                                            const badgeTheme = getLevelBadgeStyle(selectedLevel);

                                            return (
                                              <View key={criterion.id} style={styles.summaryCriterionCard}>
                                                <View style={styles.summaryCriterionRow}>
                                                  <View style={{ flex: 1, marginRight: 12 }}>
                                                    <Text style={styles.summaryCriterionName}>{criterion.name}</Text>
                                                    {selectedDesc ? (
                                                      <Text style={styles.summaryCriterionDesc}>{selectedDesc}</Text>
                                                    ) : null}
                                                  </View>
                                                  <View style={styles.summaryCriterionScoreContainer}>
                                                    <Text style={styles.summaryCriterionScoreText}>
                                                      {score} <Text style={styles.summaryCriterionMaxText}>/ {criterion.points}</Text>
                                                    </Text>
                                                    {selectedLevel ? (
                                                      <View style={[styles.summaryLevelBadge, { backgroundColor: badgeTheme.bg, borderColor: badgeTheme.border }]}>
                                                        <Text style={[styles.summaryLevelBadgeText, { color: badgeTheme.text }]}>
                                                          Level {selectedLevel}
                                                        </Text>
                                                      </View>
                                                    ) : null}
                                                  </View>
                                                </View>
                                                {critComment ? (
                                                  <View style={styles.summaryCritCommentBox}>
                                                    <MessageSquare size={12} color="#475569" style={{ marginRight: 6 }} />
                                                    <Text style={styles.summaryCritCommentText}>
                                                      {critComment}
                                                    </Text>
                                                  </View>
                                                ) : null}
                                              </View>
                                            );
                                          })}
                                        </View>
                                      );
                                    })}
                                  </View>
                                );
                              })}

                              {/* Student presentation scores */}
                              {studentScores.length > 0 && (
                                <View style={{ marginTop: 24 }}>
                                  <Text style={styles.subSectionSummaryTitle}>
                                    II. ORAL DEFENSE PRESENTATION (INDIVIDUAL)
                                  </Text>
                                  
                                  {studentScores.map((student, idx) => {
                                    const studentTotal = presentationCriteria.reduce((sum, c) => sum + (student.scores?.[c.id] || 0), 0);
                                    const studentMax = presentationCriteria.reduce((sum, c) => sum + c.points, 0);
                                    const sCommentObj = parsedComments.studentPresentations?.find(sc => sc.studentName === student.studentName) || {};

                                    return (
                                      <View key={idx} style={styles.studentSummaryCard}>
                                        <View style={styles.studentSummaryHeader}>
                                          <User size={16} color="#1e3a8a" style={{ marginRight: 8 }} />
                                          <Text style={styles.studentSummaryName}>{student.studentName}</Text>
                                          <Text style={styles.studentSummaryTotalScore}>{studentTotal} / {studentMax}</Text>
                                        </View>

                                        <View style={{ padding: 12 }}>
                                          {presentationCriteria.map((criterion) => {
                                            const score = student.scores?.[criterion.id] || 0;
                                            const selectedLevel = getSelectedLevel(score, criterion.points);
                                            const selectedRubric = (criterion as any).rubric?.find(r => r.level === selectedLevel);
                                            const selectedDesc = selectedRubric ? selectedRubric.description : '';
                                            const critComment = sCommentObj.comments?.[criterion.id];
                                            const badgeTheme = getLevelBadgeStyle(selectedLevel);

                                            return (
                                              <View key={criterion.id} style={styles.studentCriterionRow}>
                                                <View style={{ flex: 1, marginRight: 12 }}>
                                                  <Text style={styles.summaryCriterionName}>{criterion.name}</Text>
                                                  {selectedDesc ? (
                                                    <Text style={styles.summaryCriterionDesc}>{selectedDesc}</Text>
                                                  ) : null}
                                                </View>
                                                <View style={styles.summaryCriterionScoreContainer}>
                                                  <Text style={styles.summaryCriterionScoreText}>
                                                    {score} <Text style={styles.summaryCriterionMaxText}>/ {criterion.points}</Text>
                                                  </Text>
                                                  {selectedLevel ? (
                                                    <View style={[styles.summaryLevelBadge, { backgroundColor: badgeTheme.bg, borderColor: badgeTheme.border }]}>
                                                      <Text style={[styles.summaryLevelBadgeText, { color: badgeTheme.text }]}>
                                                        Level {selectedLevel}
                                                      </Text>
                                                    </View>
                                                  ) : null}
                                                </View>
                                                {critComment ? (
                                                  <View style={[styles.summaryCritCommentBox, { marginTop: 4, width: '100%' }]}>
                                                    <MessageSquare size={12} color="#475569" style={{ marginRight: 6 }} />
                                                    <Text style={styles.summaryCritCommentText}>
                                                      {critComment}
                                                    </Text>
                                                  </View>
                                                ) : null}
                                              </View>
                                            );
                                          })}
                                        </View>
                                      </View>
                                    );
                                  })}
                                </View>
                              )}

                              {/* General Panel Comments */}
                              <View style={styles.summaryGeneralRemarksBox}>
                                <Text style={styles.summaryGeneralRemarksTitle}>General Remarks & Recommendations</Text>
                                <Text style={styles.summaryGeneralRemarksText}>
                                  {sub.general_comments || 'No general comments or recommendations provided.'}
                                </Text>
                              </View>
                            </View>
                          </View>
                        );
                      })
                    ) : (
                      <Text style={styles.reportDetailText}>No submissions yet.</Text>
                    )}
                  </View>
                </>
              )}
            </ScrollView>

            <View nativeID="no-print-footer-actions" style={styles.modalBottomActions}>
              <Pressable style={styles.modalCloseBtn} onPress={() => setSelectedResult(null)}>
                <Text style={styles.modalCloseBtnText}>Done</Text>
              </Pressable>
              <Pressable style={styles.modalExportBtn} onPress={exportToPDF}>
                <Download size={20} color="#ffffff" />
                <Text style={styles.modalExportBtnText}>Export to PDF</Text>
              </Pressable>
            </View>
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
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
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

  // PDF Export Header Btn
  modalExportHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#16a34a',
    backgroundColor: '#f0fdf4',
    gap: 6,
  },
  modalExportHeaderBtnText: {
    color: '#16a34a',
    fontWeight: '700',
    fontSize: 12,
  },

  // Institutional letterhead
  letterheadContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 20,
  },
  letterheadUniv: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1e3a8a',
    letterSpacing: 0.5,
  },
  letterheadDept: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginTop: 2,
  },
  letterheadDoc: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1e3a8a',
    marginTop: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Panel Scorecard and Sections
  panelistCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  panelistCardHeader: {
    backgroundColor: '#1e3a8a',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  panelistCardTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
    marginLeft: 10,
    flex: 1,
  },
  panelistScoreBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  panelistScoreBadgeText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  panelistCardBody: {
    padding: 16,
  },
  subSectionSummaryTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summarySectionContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
    overflow: 'hidden',
  },
  summarySectionBarHeader: {
    backgroundColor: '#475569',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  summarySectionBarTitle: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
    flex: 1,
  },
  summarySectionScoreBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  summarySectionScoreBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  summarySubsectionContainer: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  summarySubsectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  summarySubsectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#334155',
  },
  summarySubsectionScore: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1e293b',
  },

  // Criterion Card / Remarks details
  summaryCriterionCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  summaryCriterionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  summaryCriterionName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1e293b',
  },
  summaryCriterionDesc: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 4,
    lineHeight: 14,
  },
  summaryCriterionScoreContainer: {
    alignItems: 'flex-end',
    minWidth: 70,
  },
  summaryCriterionScoreText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1e293b',
  },
  summaryCriterionMaxText: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '500',
  },
  summaryLevelBadge: {
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  summaryLevelBadgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  summaryCritCommentBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  summaryCritCommentText: {
    fontSize: 11,
    color: '#475569',
    flex: 1,
  },

  // Student Presentation details
  studentSummaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
    overflow: 'hidden',
  },
  studentSummaryHeader: {
    backgroundColor: '#f1f5f9',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  studentSummaryName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1e3a8a',
    flex: 1,
  },
  studentSummaryTotalScore: {
    fontSize: 12,
    fontWeight: '800',
    color: '#10b981',
  },
  studentCriterionRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingVertical: 8,
  },

  // Remarks & Bottom Actions
  summaryGeneralRemarksBox: {
    marginTop: 20,
    backgroundColor: '#fffbeb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fef3c7',
    padding: 16,
  },
  summaryGeneralRemarksTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#b45309',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  summaryGeneralRemarksText: {
    fontSize: 12,
    color: '#78350f',
    lineHeight: 18,
    fontWeight: '500',
  },
  modalBottomActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  modalCloseBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  modalCloseBtnText: {
    color: '#475569',
    fontWeight: '700',
    fontSize: 14,
  },
  modalExportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#16a34a',
    gap: 8,
  },
  modalExportBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  formLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
});
