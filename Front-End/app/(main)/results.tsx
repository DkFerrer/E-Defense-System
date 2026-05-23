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
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { sections, presentationCriteria, getSelectedLevel } from '../../src/data/evaluationRubric';
import { mockResearchGroups, mockPanelistEvaluations, mockBookings, getStorageItem } from '../../src/data/mockData';
import { useAppData } from '../../src/context/AppDataContext';
import { useAuth } from '../../src/context/AuthContext';
import { Colors } from '../../src/theme/colors';
import { Typography } from '../../src/theme/typography';

const { width } = Dimensions.get('window');
const isLargeScreen = width >= 768;

const levelStyles: Record<number, { bg: string; border: string; text: string }> = {
  5: { bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d' },
  4: { bg: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8' },
  3: { bg: '#fffbeb', border: '#fef3c7', text: '#b45309' },
  2: { bg: '#fff7ed', border: '#fed7aa', text: '#c2410c' },
  1: { bg: '#fef2f2', border: '#fecaca', text: '#b91c1c' },
};

const getLevelBadgeStyle = (level: number | null) => {
  return level ? levelStyles[level] || { bg: '#f1f5f9', border: '#e2e8f0', text: '#475569' } : { bg: '#f1f5f9', border: '#e2e8f0', text: '#475569' };
};

const formatDate = (dateStr: string) => {
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return `${monthNames[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
    }
    return dateStr;
  } catch (e) {
    return dateStr;
  }
};

export default function ResultsScreen() {
  const { evaluations: sessionEvaluations, saveEvaluation, logActivity } = useAppData();
  const { user } = useAuth();
  const isChairman = user?.role === 'Panel Chairman';

  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [activeStage, setActiveStage] = useState('All');
  
  // Feedback Modal State
  const [verdictFeedbackVisible, setVerdictFeedbackVisible] = useState(false);
  const [verdictFeedbackSuccess, setVerdictFeedbackSuccess] = useState(false);

  const selectedResult = results.find((r) => r.id === selectedGroupId) || null;

  const handleDone = () => {
    if (isChairman && selectedResult) {
      if (selectedResult.approvalDecision) {
        setVerdictFeedbackSuccess(true);
      } else {
        setVerdictFeedbackSuccess(false);
      }
      setVerdictFeedbackVisible(true);
    }
    setSelectedGroupId(null);
  };

  const handleSelectVerdict = (verdictValue: string) => {
    if (!selectedGroupId) return;

    // Find existing chairman evaluation
    const existingEval = sessionEvaluations.find(
      (e) => e.groupId === selectedGroupId && e.panelist === 'Panel Chairman'
    );

    if (existingEval) {
      saveEvaluation({
        ...existingEval,
        approvalDecision: verdictValue,
      });
    } else {
      // Find the group title/details to log it properly
      const groupResult = results.find((r) => r.id === selectedGroupId);
      // Create a new chairman evaluation placeholder
      saveEvaluation({
        groupId: selectedGroupId,
        panelist: 'Panel Chairman',
        totalScore: groupResult ? groupResult.score : 0,
        comments: '',
        submittedAt: new Date().toISOString(),
        criterionScores: {},
        criterionComments: {},
        studentPresentationScores: [],
        approvalDecision: verdictValue,
      });
    }

    // Log activity
    const groupResult = results.find((r) => r.id === selectedGroupId);
    const groupTitle = groupResult ? groupResult.title : 'Research Group';
    const readableVerdict =
      verdictValue === 'approved-no-revisions' ? 'Approved — No revisions required' :
      verdictValue === 'approved-minor-revisions' ? 'Approved — Minor revisions required' :
      verdictValue === 'approved-major-revisions' ? 'Approved — Major revisions required' :
      'Disapproved — For Redefense';

    logActivity(
      'Verdict Selected',
      `Panel Chairman selected verdict "${readableVerdict}" for "${groupTitle}"`,
      'checkmark-circle-outline',
      verdictValue.includes('approved') ? '#16a34a' : '#dc2626'
    );
  };

  const STAGES = ['All', 'Review Defense', 'Title Defense', 'Final Defense'];

  const exportToPDF = () => {
    if (Platform.OS === 'web') {
      window.print();
    } else {
      if (typeof window !== 'undefined') {
        window.alert('PDF Export is supported on Web browsers. Please save/print as PDF from your browser.');
      }
    }
  };

  useEffect(() => {
    loadData();
  }, [sessionEvaluations]);

  const loadData = () => {
    setLoading(true);

    // Load accepted bookings from storage
    const acceptedBookings = mockBookings
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

        return {
          id: String(b.id),
          title: b.research_title,
          members: b.members,
          adviser: b.adviser_name,
          program: b.program,
          defenseDate: formattedDate,
          stage: b.defense_type as any,
          score: 0,
          department: b.department,
        };
      });

    // Merge lists, avoiding duplicates by id
    const allGroupsMap: Record<string, any> = {};
    mockResearchGroups.forEach((g) => {
      allGroupsMap[g.id] = g;
    });
    acceptedBookings.forEach((b) => {
      allGroupsMap[b.id] = b;
    });

    const allGroups = Object.values(allGroupsMap);

    const formatted = allGroups.map((g) => {
      // Fetch static panelist evaluations for this group
      const mockEvals = mockPanelistEvaluations[g.id] || [];

      // Fetch live chairman evaluation submitted in the current session
      const sessionEval = sessionEvaluations.find((e) => e.groupId === g.id);

      const submissions = [...mockEvals];

      if (sessionEval) {
        // Replace or add chairman's evaluation
        const existingChairIdx = submissions.findIndex((s) => s.panelist === 'Panel Chairman');
        const formattedSessionEval = {
          panelist: sessionEval.panelist,
          totalScore: sessionEval.totalScore,
          general_comments: sessionEval.comments,
          submittedAt: sessionEval.submittedAt,
          scores: { ...sessionEval.criterionScores },
          comments: { ...sessionEval.criterionComments },
          studentPresentations: sessionEval.studentPresentationScores.map((s) => ({
            studentName: s.studentName,
            scores: { ...s.scores },
            comments: { ...s.comments },
          })),
          approvalDecision: sessionEval.approvalDecision,
        };

        if (existingChairIdx !== -1) {
          submissions[existingChairIdx] = formattedSessionEval as any;
        } else {
          submissions.push(formattedSessionEval as any);
        }
      }

      const totalSubScore = submissions.reduce((sum, s) => sum + (s.totalScore || (s as any).total_score || 0), 0);
      const avgScore = submissions.length > 0 ? totalSubScore / submissions.length : g.score;
      const chair = submissions.find((s) => s.panelist === 'Panel Chairman');
      
      const isMockGroup = mockResearchGroups.some((mg) => mg.id === g.id);
      const defaultDecision = isMockGroup
        ? (avgScore >= 90 ? 'approved-no-revisions' : avgScore >= 80 ? 'approved-minor-revisions' : 'approved-major-revisions')
        : '';
      const approvalDecision = chair?.approvalDecision || defaultDecision;

      const hasVerdict = !!approvalDecision;
      let status = 'Pending';
      let status_tone = 'teal';

      if (hasVerdict) {
        status = approvalDecision === 'disapproved-redefense' ? 'Failed' : 'Passed';
        status_tone = approvalDecision === 'disapproved-redefense' ? 'red' : 'green';
      } else if (submissions.length > 0) {
        status = 'Pending Verdict';
        status_tone = 'orange';
      }

      return {
        id: g.id,
        title: g.title,
        authors: g.members.join(', '),
        score: Math.round(avgScore),
        pct: `${Math.round(avgScore)}%`,
        date: formatDate(g.defenseDate),
        stage: g.stage,
        status: status,
        status_tone: status_tone,
        submissions: submissions,
        approvalDecision: approvalDecision,
      };
    });

    setResults(formatted);
    setLoading(false);
  };

  const getStatusColor = (tone: string) => {
    const tones: Record<string, { bg: string; text: string; border: string }> = {
      teal: { bg: '#f0fdfa', text: '#0d9488', border: '#99f6e4' },
      orange: { bg: '#fff7ed', text: '#ea580c', border: '#fed7aa' },
      green: { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' },
      red: { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
    };
    return tones[tone] || tones.teal;
  };

  const filteredResults = results.filter((r) =>
    (activeStage === 'All' || r.stage === activeStage) &&
    (r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.authors.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const stats = {
    avgScore: results.length > 0 ? (results.reduce((sum, r) => sum + r.score, 0) / results.length).toFixed(1) : '0.0',
    passed: results.filter((r) => r.score >= 75).length,
    pending: results.filter((r) => r.status === 'Pending').length,
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#ea580c" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Defense Results</Text>
          <Text style={styles.subTitle}>Track and analyze student research performance</Text>
        </View>
        <Pressable style={styles.exportBtn} onPress={exportToPDF}>
          <Ionicons name="download-outline" size={20} color="#ffffff" />
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
        <View style={[styles.statCard, { borderLeftColor: '#ea580c' }]}>
          <Text style={styles.statLabel}>Pending</Text>
          <Text style={styles.statVal}>{stats.pending}</Text>
          <Text style={styles.statSub}>Upcoming defenses</Text>
        </View>
      </View>

      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          {STAGES.map((stage) => (
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
          <Ionicons name="search-outline" size={20} color="#9ca3af" />
          <TextInput
            placeholder="Search groups or authors..."
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9ca3af"
          />
        </View>
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
                  <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={14} color="#6b7280" />
                    <Text style={styles.metaText}>{row.date}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="document-text-outline" size={14} color="#6b7280" />
                    <Text style={styles.metaText}>{row.stage}</Text>
                  </View>
                </View>

                <View style={[styles.statusBadge, { backgroundColor: status.bg, borderColor: status.border }]}>
                  <Text style={[styles.statusText, { color: status.text }]}>{row.status}</Text>
                </View>
              </View>

              <Pressable style={styles.viewLink} onPress={() => setSelectedGroupId(row.id)}>
                <Text style={styles.viewLinkText}>View Full Report</Text>
                <Ionicons name="chevron-forward-outline" size={16} color="#ea580c" />
              </Pressable>
            </View>
          );
        })}
      </ScrollView>

      {/* Report Modal */}
      <Modal visible={!!selectedResult} transparent animationType="slide">
        {Platform.OS === 'web' && (
          <View style={{ display: 'none' }}>
            {/* Embedded styles for print formatting on web */}
            <style dangerouslySetInnerHTML={{
              __html: `
              @media print {
                body { background-color: #ffffff !important; }
                body * { visibility: hidden !important; }
                #printable-summary, #printable-summary * { visibility: visible !important; }
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
                #no-print-header-btn, #no-print-footer-actions, #no-print-close-x {
                  display: none !important;
                  visibility: hidden !important;
                }
              }
            ` }} />
          </View>
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
                  <Ionicons name="download-outline" size={18} color="#16a34a" />
                  <Text style={styles.modalExportHeaderBtnText}>Export PDF</Text>
                </Pressable>
                <Pressable nativeID="no-print-close-x" onPress={() => setSelectedGroupId(null)}>
                  <Ionicons name="close" size={24} color="#6b7280" />
                </Pressable>
              </View>
            </View>

            <ScrollView contentContainerStyle={styles.reportScroll}>
              {selectedResult && (
                <>
                  {/* Institutional Letterhead */}
                  <View style={styles.letterheadContainer}>
                    <Ionicons name="business-outline" size={36} color="#ea580c" />
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
                      <Text style={[styles.reportStatVal, { color: '#ea580c' }]}>{selectedResult.score}%</Text>
                    </View>
                    <View style={styles.reportStatItem}>
                      <Text style={styles.reportStatLabel}>Status</Text>
                      <View style={[styles.statusBadgeModal, { backgroundColor: getStatusColor(selectedResult.status_tone).bg, borderColor: getStatusColor(selectedResult.status_tone).border }]}>
                        <Text style={[styles.statusTextModal, { color: getStatusColor(selectedResult.status_tone).text }]}>{selectedResult.status}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Panel Verdict / Recommendation */}
                  <View style={styles.verdictSectionContainer}>
                    <Text style={styles.verdictSectionTitle}>PANEL RECOMMENDATION & VERDICT</Text>
                    <View style={styles.verdictCheckboxGroup}>
                      {[
                        { value: 'approved-no-revisions',    label: 'Approved — No revisions required',    icon: 'checkbox',        tint: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
                        { value: 'approved-minor-revisions',  label: 'Approved — Minor revisions required', icon: 'checkbox-outline', tint: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
                        { value: 'approved-major-revisions',  label: 'Approved — Major revisions required', icon: 'alert-circle',    tint: '#c2410c', bg: '#fff7ed', border: '#fed7aa' },
                        { value: 'disapproved-redefense',     label: 'Disapproved — For Redefense',         icon: 'close-circle',     tint: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
                      ].map((opt) => {
                        const isSelected = selectedResult.approvalDecision === opt.value;
                        const OptionContainer = isChairman ? Pressable : View;
                        return (
                          <OptionContainer
                            key={opt.value}
                            style={[
                              styles.verdictCheckboxOption,
                              isSelected && { borderColor: opt.border, backgroundColor: opt.bg },
                              !isChairman && { opacity: 0.8 }
                            ]}
                            onPress={isChairman ? () => handleSelectVerdict(opt.value) : undefined}
                            accessibilityRole="checkbox"
                            accessibilityState={{ checked: isSelected, disabled: !isChairman }}
                            accessibilityLabel={`${opt.label} ${isSelected ? 'Selected' : 'Not Selected'}`}
                          >
                            <Ionicons
                              name={isSelected ? 'checkbox' : 'square-outline'}
                              size={20}
                              color={isSelected ? opt.tint : '#94a3b8'}
                              style={{ marginRight: 10 }}
                            />
                            <Text style={[
                              styles.verdictLabel,
                              isSelected && { color: opt.tint, fontFamily: Typography.fontFamily.bold }
                            ]}>
                              {opt.label}
                            </Text>
                          </OptionContainer>
                        );
                      })}
                    </View>

                    {isChairman && selectedResult.approvalDecision ? (
                      <View style={styles.successMessage}>
                        <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
                        <Text style={styles.successMessageText}>
                          Verdict saved! The evaluations are now compiled and visible in the post-evaluation system.
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  <View style={styles.reportSection}>
                    <Text style={styles.reportSectionTitle}>Detailed Panel Evaluations</Text>
                    {selectedResult.submissions && selectedResult.submissions.length > 0 ? (
                      selectedResult.submissions.map((sub: any, i: number) => {
                        const isMockEval = Array.isArray(sub.chapters);
                        let docTotal = 0;
                        let docMax = 0;

                        let parsedScores = sub.scores || {};
                        let parsedComments = sub.comments || {};

                        if (isMockEval) {
                          // Format mock chapter layout into sections
                          (sub.chapters || []).forEach((ch: any) => {
                            (ch.criteria || []).forEach((cr: any) => {
                              docTotal += cr.score || 0;
                              docMax += cr.maxPoints || 0;
                            });
                          });
                        } else {
                          // Live app data evaluation
                          sections.forEach((sec) => {
                            sec.subsections.forEach((subSec) => {
                              subSec.criteria.forEach((crit) => {
                                docTotal += (parsedScores[crit.id] || 0);
                                docMax += crit.points;
                              });
                            });
                          });
                        }

                        const studentPresentations = sub.studentPresentations || [];

                        return (
                          <View key={i} nativeID={"panelist-card-" + i} style={styles.panelistCard}>
                            <View style={styles.panelistCardHeader}>
                              <Ionicons name="star-outline" size={20} color="#fff" />
                              <Text style={styles.panelistCardTitle}>
                                {sub.panelist || `Panel Member ${i + 1}`} Scorecard
                              </Text>
                              <View style={styles.panelistScoreBadge}>
                                <Text style={styles.panelistScoreBadgeText}>
                                  {sub.totalScore || sub.total_score || Math.round(docTotal)} / 100
                                </Text>
                              </View>
                            </View>

                            <View style={styles.panelistCardBody}>
                              <Text style={styles.subSectionSummaryTitle}>
                                I. PROJECT DOCUMENTATION AND MANUSCRIPT ({Math.round(docTotal * 10) / 10} / {docMax})
                              </Text>

                              {isMockEval ? (
                                (sub.chapters || []).map((ch: any, idx: number) => (
                                  <View key={idx} style={styles.summarySectionContainer}>
                                    <View style={styles.summarySectionBarHeader}>
                                      <Text style={styles.summarySectionBarTitle}>{ch.chapter}</Text>
                                    </View>
                                    <View style={{ padding: 12 }}>
                                      {(ch.criteria || []).map((cr: any, cidx: number) => {
                                        return (
                                          <View key={cidx} style={styles.summaryCriterionCard}>
                                            <View style={styles.summaryCriterionRow}>
                                              <View style={{ flex: 1, marginRight: 12 }}>
                                                <Text style={styles.summaryCriterionName}>{cr.description}</Text>
                                              </View>
                                              <View style={styles.summaryCriterionScoreContainer}>
                                                <Text style={styles.summaryCriterionScoreText}>
                                                  {cr.score} <Text style={styles.summaryCriterionMaxText}>/ {cr.maxPoints}</Text>
                                                </Text>
                                              </View>
                                            </View>
                                            {cr.comment ? (
                                              <View style={styles.summaryCritCommentBox}>
                                                <Ionicons name="chatbubble-ellipses-outline" size={12} color="#475569" style={{ marginRight: 6 }} />
                                                <Text style={styles.summaryCritCommentText}>{cr.comment}</Text>
                                              </View>
                                            ) : null}
                                          </View>
                                        );
                                      })}
                                    </View>
                                  </View>
                                ))
                              ) : (
                                sections.map((section, secIdx) => {
                                  let sectionScore = 0;
                                  let sectionMax = 0;
                                  section.subsections.forEach((s) => {
                                    s.criteria.forEach((c) => {
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
                                        subsection.criteria.forEach((c) => {
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
                                              const selectedRubric = criterion.rubric?.find((r) => r.level === selectedLevel);
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
                                                      <Ionicons name="chatbubble-ellipses-outline" size={12} color="#475569" style={{ marginRight: 6 }} />
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
                                })
                              )}

                              {/* Student presentations */}
                              {studentPresentations.length > 0 && (
                                <View style={{ marginTop: 24 }}>
                                  <Text style={styles.subSectionSummaryTitle}>
                                    II. ORAL DEFENSE PRESENTATION (INDIVIDUAL)
                                  </Text>

                                  {studentPresentations.map((student: any, idx: number) => {
                                    let studentTotal = 0;
                                    let studentMax = 0;
                                    let commentsObj: Record<string, string> = {};

                                    if (isMockEval) {
                                      (student.criteria || []).forEach((cr: any) => {
                                        studentTotal += cr.score || 0;
                                        studentMax += cr.maxPoints || 0;
                                      });
                                    } else {
                                      presentationCriteria.forEach((c) => {
                                        studentTotal += (student.scores?.[c.id] || 0);
                                        studentMax += c.points;
                                      });
                                      commentsObj = student.comments || {};
                                    }

                                    return (
                                      <View key={idx} style={styles.studentSummaryCard}>
                                        <View style={styles.studentSummaryHeader}>
                                          <Ionicons name="person-outline" size={16} color="#ea580c" style={{ marginRight: 8 }} />
                                          <Text style={styles.studentSummaryName}>{student.studentName}</Text>
                                          <Text style={styles.studentSummaryTotalScore}>{Math.round(studentTotal * 10) / 10} / {studentMax}</Text>
                                        </View>

                                        {!isMockEval && (
                                          <View style={{ padding: 12 }}>
                                            {presentationCriteria.map((criterion) => {
                                              const score = student.scores?.[criterion.id] || 0;
                                              const selectedLevel = getSelectedLevel(score, criterion.points);
                                              const selectedRubric = criterion.rubric?.find((r) => r.level === selectedLevel);
                                              const selectedDesc = selectedRubric ? selectedRubric.description : '';
                                              const critComment = commentsObj[criterion.id];
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
                                                      <Ionicons name="chatbubble-ellipses-outline" size={12} color="#475569" style={{ marginRight: 6 }} />
                                                      <Text style={styles.summaryCritCommentText}>{critComment}</Text>
                                                    </View>
                                                  ) : null}
                                                </View>
                                              );
                                            })}
                                          </View>
                                        )}
                                      </View>
                                    );
                                  })}
                                </View>
                              )}

                              {/* General comments */}
                              <View style={styles.summaryGeneralRemarksBox}>
                                <Text style={styles.summaryGeneralRemarksTitle}>General Remarks & Recommendations</Text>
                                <Text style={styles.summaryGeneralRemarksText}>
                                  {sub.general_comments || (typeof sub.comments === 'string' ? sub.comments : '') || 'No general comments or recommendations provided.'}
                                </Text>
                              </View>
                            </View>
                          </View>
                        );
                      })
                    ) : (
                      <Text style={styles.reportDetailText}>No evaluations submitted yet.</Text>
                    )}
                  </View>
                </>
              )}
            </ScrollView>

            <View nativeID="no-print-footer-actions" style={styles.modalBottomActions}>
              <Pressable style={styles.modalCloseBtn} onPress={handleDone}>
                <Text style={styles.modalCloseBtnText}>Done</Text>
              </Pressable>
              <Pressable style={styles.modalExportBtn} onPress={exportToPDF}>
                <Ionicons name="download-outline" size={20} color="#ffffff" style={{ marginRight: 6 }} />
                <Text style={styles.modalExportBtnText}>Export to PDF</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Verdict Feedback Modal */}
      <Modal visible={verdictFeedbackVisible} transparent animationType="fade">
        <View style={styles.feedbackModalOverlay}>
          <View style={styles.feedbackModalContent}>
            {verdictFeedbackSuccess ? (
              <>
                <Ionicons name="checkmark-circle" size={64} color="#16a34a" />
                <Text style={styles.feedbackModalTitle}>Verdict Submitted</Text>
                <Text style={styles.feedbackModalMessage}>
                  The evaluation has been successfully finalized. It is now available for the Research Coordinator to compile.
                </Text>
              </>
            ) : (
              <>
                <Ionicons name="alert-circle" size={64} color="#ea580c" />
                <Text style={styles.feedbackModalTitle}>No Verdict Selected</Text>
                <Text style={styles.feedbackModalMessage}>
                  You closed the report without selecting a final verdict. The evaluation remains pending.
                </Text>
              </>
            )}
            <Pressable
              style={styles.feedbackModalBtn}
              onPress={() => setVerdictFeedbackVisible(false)}
            >
              <Text style={styles.feedbackModalBtnText}>Understood</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.pageBg },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: { fontSize: 26, fontFamily: Typography.fontFamily.bold, color: '#111827' },
  subTitle: { fontSize: 14, color: '#6b7280', marginTop: 4, fontFamily: Typography.fontFamily.regular },
  exportBtn: {
    backgroundColor: '#16a34a',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  exportBtnText: { color: '#ffffff', fontFamily: Typography.fontFamily.bold, fontSize: 14 },
  statsRow: { flexDirection: 'row', padding: 16, gap: 12 },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    ...Platform.select({
      web: { boxShadow: '0 2px 4px rgba(0,0,0,0.06)' },
      default: { elevation: 2 },
    }),
  },
  statLabel: { fontSize: 12, fontFamily: Typography.fontFamily.bold, color: '#6b7280', textTransform: 'uppercase' },
  statVal: { fontSize: 22, fontFamily: Typography.fontFamily.bold, color: '#111827', marginVertical: 4 },
  statSub: { fontSize: 11, color: '#9ca3af', fontFamily: Typography.fontFamily.medium },
  tabsContainer: { paddingHorizontal: 16, marginBottom: 16 },
  tabsScroll: { gap: 8 },
  tabBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#e5e7eb' },
  tabBtnActive: { backgroundColor: '#ea580c' },
  tabText: { fontSize: 13, fontFamily: Typography.fontFamily.bold, color: '#4b5563' },
  tabTextActive: { color: '#ffffff' },
  filterBar: { paddingHorizontal: 16, marginBottom: 16 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: '#1f2937', fontFamily: Typography.fontFamily.medium },
  scrollContent: { padding: 16, gap: 16 },
  resultCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    ...Platform.select({
      web: { boxShadow: '0 2px 4px rgba(0,0,0,0.06)' },
      default: { elevation: 2 },
    }),
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  titleGroup: { flex: 1, marginRight: 16 },
  resultTitle: { fontSize: 17, fontFamily: Typography.fontFamily.bold, color: '#111827', lineHeight: 24 },
  resultAuthors: { fontSize: 13, color: '#6b7280', marginTop: 4, fontFamily: Typography.fontFamily.medium },
  scoreGroup: { alignItems: 'flex-end' },
  scoreVal: { fontSize: 20, fontFamily: Typography.fontFamily.bold, color: '#111827' },
  scorePct: { fontSize: 12, color: '#ea580c', fontFamily: Typography.fontFamily.bold, marginTop: 2 },
  cardDivider: { height: 1, backgroundColor: '#f3f4f6', marginVertical: 16 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metaInfo: { flexDirection: 'row', gap: 16 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 12, color: '#6b7280', fontFamily: Typography.fontFamily.semiBold },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  statusText: { fontSize: 11, fontFamily: Typography.fontFamily.bold, textTransform: 'uppercase' },
  statusBadgeModal: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1, marginTop: 4 },
  statusTextModal: { fontSize: 13, fontFamily: Typography.fontFamily.bold, textTransform: 'uppercase' },
  viewLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  viewLinkText: { fontSize: 14, fontFamily: Typography.fontFamily.bold, color: '#ea580c' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  reportBox: { backgroundColor: '#ffffff', borderTopLeftRadius: 32, borderTopRightRadius: 32, height: '85%', padding: 24 },
  reportHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  reportTitle: { fontSize: 20, fontFamily: Typography.fontFamily.bold, color: '#111827' },
  reportScroll: { paddingBottom: 40 },
  reportMainInfo: { marginBottom: 24 },
  reportGroupTitle: { fontSize: 24, fontFamily: Typography.fontFamily.bold, color: '#111827', marginBottom: 8, lineHeight: 30 },
  reportAuthors: { fontSize: 14, color: '#6b7280', fontFamily: Typography.fontFamily.medium },
  reportStats: { flexDirection: 'row', gap: 16, marginBottom: 32 },
  reportStatItem: { flex: 1, backgroundColor: '#f8fafc', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center' },
  reportStatLabel: { fontSize: 11, fontFamily: Typography.fontFamily.bold, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 },
  reportStatVal: { fontSize: 24, fontFamily: Typography.fontFamily.bold },
  reportSection: { marginBottom: 24 },
  reportSectionTitle: { fontSize: 14, fontFamily: Typography.fontFamily.bold, color: '#111827', textTransform: 'uppercase', marginBottom: 12 },
  reportDetailText: { fontSize: 14, color: '#4b5563', fontFamily: Typography.fontFamily.semiBold },
 
  // Verdict Section
  verdictSectionContainer: {
    marginBottom: 32,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  verdictSectionTitle: {
    fontSize: 13,
    fontFamily: Typography.fontFamily.bold,
    color: '#0f172a',
    letterSpacing: 0.5,
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  verdictCheckboxGroup: {
    gap: 10,
  },
  verdictCheckboxOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#ffffff',
    minHeight: 48,
  },
  verdictLabel: {
    fontSize: 13,
    fontFamily: Typography.fontFamily.medium,
    color: '#475569',
    flex: 1,
  },
  successMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 8,
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    gap: 6,
  },
  successMessageText: {
    fontSize: 11,
    fontFamily: Typography.fontFamily.semiBold,
    color: '#16a34a',
    flex: 1,
  },
 
  modalBottomActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 16, paddingBottom: 8 },
  modalCloseBtn: { backgroundColor: '#f3f4f6', height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  modalCloseBtnText: { color: '#4b5563', fontFamily: Typography.fontFamily.bold, fontSize: 15 },
  modalExportBtn: { backgroundColor: '#ea580c', height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, flexDirection: 'row' },
  modalExportBtnText: { color: '#ffffff', fontFamily: Typography.fontFamily.bold, fontSize: 15 },
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
  modalExportHeaderBtnText: { color: '#16a34a', fontFamily: Typography.fontFamily.bold, fontSize: 12 },

  // Letterhead
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
  letterheadUniv: { fontSize: 16, fontFamily: Typography.fontFamily.bold, color: '#ea580c', letterSpacing: 0.5 },
  letterheadDept: { fontSize: 12, fontFamily: Typography.fontFamily.semiBold, color: '#475569', marginTop: 2 },
  letterheadDoc: { fontSize: 13, fontFamily: Typography.fontFamily.bold, color: '#ea580c', marginTop: 6, textTransform: 'uppercase', letterSpacing: 0.5 },

  // Panelist Card
  panelistCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 24,
    overflow: 'hidden',
    ...Platform.select({
      web: { boxShadow: '0 2px 4px rgba(0,0,0,0.06)' },
      default: { elevation: 2 },
    }),
  },
  panelistCardHeader: { backgroundColor: '#1e293b', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  panelistCardTitle: { color: '#ffffff', fontSize: 14, fontFamily: Typography.fontFamily.bold, marginLeft: 10, flex: 1 },
  panelistScoreBadge: { backgroundColor: 'rgba(255, 255, 255, 0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  panelistScoreBadgeText: { color: '#ffffff', fontSize: 13, fontFamily: Typography.fontFamily.bold },
  panelistCardBody: { padding: 16 },
  subSectionSummaryTitle: { fontSize: 13, fontFamily: Typography.fontFamily.bold, color: '#1e293b', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  summarySectionContainer: { backgroundColor: '#f8fafc', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 16, overflow: 'hidden' },
  summarySectionBarHeader: { backgroundColor: '#475569', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8 },
  summarySectionBarTitle: { color: '#ffffff', fontSize: 12, fontFamily: Typography.fontFamily.bold, flex: 1 },
  summarySectionScoreBadge: { backgroundColor: 'rgba(255, 255, 255, 0.2)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  summarySectionScoreBadgeText: { color: '#ffffff', fontSize: 11, fontFamily: Typography.fontFamily.bold },
  summarySubsectionContainer: { margin: 12 },
  summarySubsectionHeader: { backgroundColor: '#f97316', padding: 8, borderRadius: 6, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  summarySubsectionTitle: { color: '#ffffff', fontSize: 12, fontFamily: Typography.fontFamily.bold },
  summarySubsectionScore: { color: '#c2410c', backgroundColor: '#ffffff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, fontSize: 10, fontFamily: Typography.fontFamily.bold },
  summaryCriterionCard: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', padding: 12, borderRadius: 8, marginBottom: 8 },
  summaryCriterionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  summaryCriterionName: { fontSize: 13, fontFamily: Typography.fontFamily.semiBold, color: '#1e293b' },
  summaryCriterionDesc: { fontSize: 11, color: '#64748b', fontFamily: Typography.fontFamily.regular, marginTop: 4, lineHeight: 15 },
  summaryCriterionScoreContainer: { alignItems: 'flex-end', minWidth: 70 },
  summaryCriterionScoreText: { fontSize: 14, fontFamily: Typography.fontFamily.bold, color: '#111827' },
  summaryCriterionMaxText: { fontSize: 11, color: '#94a3b8', fontFamily: Typography.fontFamily.medium },
  summaryLevelBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, marginTop: 4 },
  summaryLevelBadgeText: { fontSize: 9, fontFamily: Typography.fontFamily.bold, textTransform: 'uppercase' },
  summaryCritCommentBox: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#f8fafc', padding: 8, borderRadius: 6, marginTop: 8 },
  summaryCritCommentText: { fontSize: 11, color: '#475569', flex: 1, fontFamily: Typography.fontFamily.regular, fontStyle: 'italic', lineHeight: 15 },

  // Student Summary
  studentSummaryCard: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, marginBottom: 12, overflow: 'hidden' },
  studentSummaryHeader: { backgroundColor: '#fff7ed', paddingHorizontal: 12, paddingVertical: 8, flexDirection: 'row', alignItems: 'center' },
  studentSummaryName: { fontSize: 13, fontFamily: Typography.fontFamily.bold, color: '#ea580c', flex: 1 },
  studentSummaryTotalScore: { fontSize: 13, fontFamily: Typography.fontFamily.bold, color: '#ea580c' },
  studentCriterionRow: { borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingVertical: 10, paddingHorizontal: 12 },
  summaryGeneralRemarksBox: { backgroundColor: '#f8fafc', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', marginTop: 16 },
  summaryGeneralRemarksTitle: { fontSize: 12, fontFamily: Typography.fontFamily.bold, color: '#374151', textTransform: 'uppercase', marginBottom: 4 },
  summaryGeneralRemarksText: { fontSize: 12, color: '#4b5563', fontFamily: Typography.fontFamily.regular, fontStyle: 'italic', lineHeight: 18 },
  
  // Feedback Modal Styles
  feedbackModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  feedbackModalContent: {
    backgroundColor: '#fff', borderRadius: 20, padding: 32, width: '80%', maxWidth: 400, alignItems: 'center',
    ...Platform.select({ web: { boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }, default: { elevation: 10 } }),
  },
  feedbackModalTitle: { fontSize: 20, fontFamily: Typography.fontFamily.bold, color: '#0f172a', marginTop: 16, marginBottom: 8, textAlign: 'center' },
  feedbackModalMessage: { fontSize: 14, fontFamily: Typography.fontFamily.medium, color: '#64748b', textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  feedbackModalBtn: { backgroundColor: '#ea580c', paddingHorizontal: 24, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', width: '100%' },
  feedbackModalBtnText: { color: '#ffffff', fontFamily: Typography.fontFamily.bold, fontSize: 16 },
});
