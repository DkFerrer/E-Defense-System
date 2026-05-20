import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  Platform,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import TopNav from '../components/TopNav';
import Sidebar from '../components/Sidebar';
import {
  User,
  Users,
  UserCheck,
  Building2,
  GraduationCap,
  MessageSquare,
  Save,
  ArrowLeft,
  Calendar as CalendarIcon,
  Star,
  Send,
  FileText,
  Award,
} from 'lucide-react-native';
import { getEvaluationRubricBundle, upsertEvaluationSubmission } from '../services/api';
import { useApp } from '../context/AppContext';
import { sections, presentationCriteria } from '../data/evaluationRubric';


const showAlert = (title, message) => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      window.alert(`${title}: ${message}`);
    }
  } else {
    Alert.alert(title, message);
  }
};

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

const CriterionCard = React.memo(({ criterion, score, comment, onScoreChange, onCommentChange }) => {
  const selectedLevel = getSelectedLevel(score, criterion.points);
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;

  return (
    <View style={styles.criterionContainer}>
      <View style={[styles.criterionRow, { flexDirection: isLargeScreen ? 'row' : 'column' }]}>
        {/* Left Column */}
        <View style={[styles.critLeftCol, { width: isLargeScreen ? '12%' : '100%' }]}>
          <Text style={styles.critPointsText}>{criterion.points}</Text>
          <Text style={styles.critNameText}>{criterion.name}</Text>
        </View>

        {/* Levels Columns */}
        {criterion.rubric.map((r) => {
          const isSelected = selectedLevel === r.level;
          return (
            <Pressable
              key={r.level}
              style={[
                styles.levelCol,
                { width: isLargeScreen ? '16%' : '100%' },
                isSelected && styles.levelColSelected
              ]}
              onPress={() => {
                const calc = Math.round(criterion.points * scorePercentages[r.level] * 10) / 10;
                onScoreChange(calc);
              }}
            >
              <View style={styles.levelHeaderRow}>
                <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]} />
                <Text style={[styles.levelTitle, isSelected && styles.levelTitleSelected]}>
                  {r.level} {r.level === 5 ? 'Excellent' : r.level === 4 ? 'Good' : r.level === 3 ? 'Adequate' : r.level === 2 ? 'Needs Work' : 'Poor'}
                </Text>
              </View>
              <Text style={styles.levelDescText}>{r.description}</Text>
            </Pressable>
          );
        })}

        {/* Right Column (Score Input) */}
        <View style={[styles.critRightCol, { width: isLargeScreen ? '8%' : '100%' }]}>
          <TextInput
            keyboardType="numeric"
            style={styles.scoreNumberInput}
            value={score !== undefined ? String(score) : ''}
            onChangeText={(val) => {
              const num = parseFloat(val);
              if (val === '' || isNaN(num)) {
                onScoreChange(0);
              } else {
                onScoreChange(Math.min(criterion.points, Math.max(0, num)));
              }
            }}
            placeholder="0"
          />
          <Text style={styles.maxScoreText}>/ {criterion.points}</Text>
        </View>
      </View>

      {/* Remarks/Comments Row */}
      <View style={styles.commentRow}>
        <View style={styles.commentLabelRow}>
          <MessageSquare size={14} color="#9ca3af" />
          <Text style={styles.commentLabelText}>Remarks / Comments:</Text>
        </View>
        <TextInput
          style={styles.commentTextInput}
          placeholder="Enter your specific remarks or comments for this criterion..."
          value={comment || ''}
          onChangeText={onCommentChange}
        />
      </View>
    </View>
  );
}, (prevProps, nextProps) => {
  return prevProps.score === nextProps.score &&
         prevProps.comment === nextProps.comment &&
         prevProps.criterion.id === nextProps.criterion.id;
});

export default function EvaluationFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user: currentUser, logout } = useApp();
  
  let group;
  try {
    group = params?.group ? JSON.parse(params.group) : null;
  } catch (e) {
    group = null;
  }

  const evaluation = group?.evaluation;

  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState({});
  const [comments, setComments] = useState({});
  const [studentPresentationScores, setStudentPresentationScores] = useState([]);
  const [generalComments, setGeneralComments] = useState('');
  const [submissionStatus, setSubmissionStatus] = useState('draft');
  const [submitting, setSubmitting] = useState(false);
  const [activeStudentTab, setActiveStudentTab] = useState('');

  // Layout state
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Modal state
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  const onNavigate = useCallback((navId) => {
    router.push({ pathname: '/main', params: { activeNavId: navId } });
  }, [router]);

  const onToggleSidebar = useCallback(() => {
    setSidebarOpen((o) => !o);
  }, []);

  const requestSave = (status) => {
    setConfirmAction(status);
    setConfirmModalVisible(true);
  };

  const executeSave = async () => {
    const status = confirmAction;
    setConfirmModalVisible(false);
    await handleSave(status);
  };

  const loadData = useCallback(async () => {
    if (!evaluation?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await getEvaluationRubricBundle(evaluation.id);
      if (data && data.submission) {
        let loadedScores = data.submission.scores || {};
        if (typeof loadedScores === 'string') {
          try {
            loadedScores = JSON.parse(loadedScores);
          } catch {
            loadedScores = {};
          }
        }

        let loadedComments = data.submission.comments || {};
        if (typeof loadedComments === 'string') {
          try {
            loadedComments = JSON.parse(loadedComments);
          } catch {
            loadedComments = {};
          }
        }

        // We can just set the flat dictionaries directly for the new dynamic rubrics
        setScores(loadedScores || {});
        setComments(loadedComments || {});
        setGeneralComments(data.submission.general_comments || '');
        setSubmissionStatus(data.submission.status || 'draft');

        if (loadedScores && Array.isArray(loadedScores.studentPresentations)) {
          setStudentPresentationScores(
            loadedScores.studentPresentations.map((s) => {
              const matchingComments = loadedComments && Array.isArray(loadedComments.studentPresentations)
                ? loadedComments.studentPresentations.find((c) => c.studentName === s.studentName)
                : null;
              return {
                studentName: s.studentName,
                scores: s.scores || {},
                comments: matchingComments?.comments || {},
              };
            })
          );
        }
      }
    } catch (error) {
      console.error('Failed to load rubric bundle:', error);
      showAlert('Error', 'Failed to load evaluation criteria. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [evaluation?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle student tabs
  useEffect(() => {
    if (group?.members) {
      const membersArray = Array.isArray(group.members)
        ? group.members
        : typeof group.members === 'string'
        ? group.members.split(',')
        : [];

      const cleanMembers = membersArray.map((m) => m.trim()).filter(Boolean);

      if (cleanMembers.length > 0 && !activeStudentTab) {
        setActiveStudentTab(cleanMembers[0]);
      }

      setStudentPresentationScores((prev) => {
        if (prev && prev.length === cleanMembers.length) {
          return prev;
        }

        return cleanMembers.map((member) => {
          const existing = prev?.find((p) => p.studentName === member);
          if (existing) return existing;

          // Initialize with empty scores and comments
          return {
            studentName: member,
            scores: {},
            comments: {},
          };
        });
      });
    }
  }, [group]);

  const handleScoreChange = (criterionId, points) => {
    setScores((prev) => ({ ...prev, [criterionId]: points }));
  };

  const handleCommentChange = (criterionId, comment) => {
    setComments((prev) => ({ ...prev, [criterionId]: comment }));
  };

  const handleStudentScoreChange = (studentName, criterionId, points) => {
    setStudentPresentationScores((prev) =>
      prev.map((student) =>
        student.studentName === studentName
          ? { ...student, scores: { ...(student.scores || {}), [criterionId]: points } }
          : student
      )
    );
  };

  const handleStudentCommentChange = (studentName, criterionId, comment) => {
    setStudentPresentationScores((prev) =>
      prev.map((student) =>
        student.studentName === studentName
          ? { ...student, comments: { ...(student.comments || {}), [criterionId]: comment } }
          : student
      )
    );
  };

  const getDocumentationTotal = () => {
    let total = 0;
    sections.forEach(section => {
      section.subsections.forEach(subsection => {
        subsection.criteria.forEach(criterion => {
          total += (scores[criterion.id] || 0);
        });
      });
    });
    return total;
  };

  const getStudentPresentationTotal = (studentName) => {
    const student = studentPresentationScores.find((s) => s.studentName === studentName);
    if (!student) return 0;
    let total = 0;
    presentationCriteria.forEach(criterion => {
      total += (student.scores[criterion.id] || 0);
    });
    return total;
  };

  const getAveragePresentationScore = () => {
    if (!studentPresentationScores || studentPresentationScores.length === 0) return 0;
    const total = studentPresentationScores.reduce(
      (sum, s) => sum + getStudentPresentationTotal(s.studentName),
      0
    );
    return total / studentPresentationScores.length;
  };

  const getTotalScore = () => {
    return getDocumentationTotal() + getAveragePresentationScore();
  };

  const calculateMaxDocScore = () => {
    let total = 0;
    sections.forEach(s => s.subsections.forEach(sub => sub.criteria.forEach(c => total += c.points)));
    return total;
  };

  const calculateMaxPresScore = () => {
    let total = 0;
    presentationCriteria.forEach(c => total += c.points);
    return total;
  };

  const handleSave = async (status = 'draft') => {
    if (!evaluation?.id) return;

    setSubmitting(true);
    try {
      const docTotal = getDocumentationTotal();
      const avgPres = getAveragePresentationScore();
      const totalScore = docTotal + avgPres;

      const packedScores = {
        ...scores,
        studentPresentations: studentPresentationScores.map((s) => ({
          studentName: s.studentName,
          scores: s.scores,
        })),
      };

      const packedComments = {
        ...comments,
        studentPresentations: studentPresentationScores.map((s) => ({
          studentName: s.studentName,
          comments: s.comments,
        })),
      };

      await upsertEvaluationSubmission(evaluation.id, {
        scores: packedScores,
        comments: packedComments,
        general_comments: generalComments,
        status,
        total_score: totalScore,
      });

      if (status === 'submitted') {
        showAlert('Success', 'Evaluation submitted successfully!');
        router.push({ pathname: '/main', params: { activeNavId: 'results' } });
      } else {
        showAlert('Success', 'Draft saved successfully!');
      }
    } catch (error) {
      console.error('Failed to save submission:', error);
      showAlert('Error', 'Failed to save evaluation. Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!group || !evaluation) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Invalid evaluation data.</Text>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ea580c" />
        <Text style={styles.loadingText}>Loading evaluation criteria...</Text>
      </View>
    );
  }

  const userRole = group.role || 'Member';
  const isChairman = userRole === 'Chairman';
  const maxCombined = calculateMaxDocScore() + calculateMaxPresScore();

  return (
    <View style={styles.root}>
      <TopNav currentUser={currentUser} onToggleSidebar={onToggleSidebar} onLogout={logout} />

      <View style={styles.row}>
        {isDesktop ? (
          <Sidebar active="evaluation" onNavigate={onNavigate} />
        ) : null}

        <View style={styles.main} accessibilityRole="main">
          <ScrollView style={styles.container} contentContainerStyle={styles.formScroll}>
        {/* Header */}
        <View style={styles.formHeader}>
          <Pressable onPress={() => router.back()} style={styles.backLink}>
            <View style={styles.backLinkContent}>
              <ArrowLeft size={16} color="#6b7280" />
              <Text style={styles.backLinkText}>Back to List</Text>
            </View>
          </Pressable>
        </View>

        {/* Title Banner */}
        <View style={styles.titleBanner}>
          <Award size={32} color="#fff" />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.titleBannerText}>Thesis Evaluation Form</Text>
            <Text style={styles.titleBannerSub}>Comprehensive evaluation rubric for research projects</Text>
          </View>
        </View>

        {/* Group Details Card */}
        <View style={styles.detailCard}>
          <View style={styles.detailHeader}>
            <Text style={styles.groupTitleLarge}>{group.title || group.research_title}</Text>
            <View
              style={[
                styles.roleBadge,
                { backgroundColor: isChairman ? '#fff1f2' : '#fff7ed' },
              ]}
            >
              {isChairman ? (
                <Star size={14} color="#e11d48" style={{ marginRight: 4 }} />
              ) : (
                <UserCheck size={14} color="#ea580c" style={{ marginRight: 4 }} />
              )}
              <Text style={[styles.roleText, { color: isChairman ? '#e11d48' : '#ea580c' }]}>
                {isChairman ? 'Panel Chairman' : 'Panel Member'}
              </Text>
            </View>
          </View>

          <View style={styles.detailGrid}>
            <View style={styles.detailItem}>
              <Users size={16} color="#6b7280" />
              <Text style={styles.detailVal}>
                Proponents: {Array.isArray(group.members) ? group.members.join(', ') : group.members}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <GraduationCap size={16} color="#6b7280" />
              <Text style={styles.detailVal}>
                Program: {group.program || 'N/A'} {group.year_level ? `(${group.year_level})` : ''}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <CalendarIcon size={16} color="#6b7280" />
              <Text style={styles.detailVal}>
                Term: {group.semester || 'N/A'}, {group.academic_year || 'N/A'}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <User size={16} color="#6b7280" />
              <Text style={styles.detailVal}>Adviser: {group.adviser || group.adviser_name || 'N/A'}</Text>
            </View>
            <View style={styles.detailItem}>
              <Star size={16} color="#6b7280" />
              <Text style={styles.detailVal}>Panel Chair: {group.panel_chair || 'N/A'}</Text>
            </View>
            <View style={styles.detailItem}>
              <UserCheck size={16} color="#6b7280" />
              <Text style={styles.detailVal}>
                Panel: {Array.isArray(group.assigned_panelists) ? group.assigned_panelists.map(p => p.name).join(', ') : group.assigned_panelists || 'N/A'}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <FileText size={16} color="#6b7280" />
              <Text style={styles.detailVal}>Secretary: {group.secretary || 'N/A'}</Text>
            </View>
            <View style={styles.detailItem}>
              <Building2 size={16} color="#6b7280" />
              <Text style={styles.detailVal}>Venue: {group.venue || 'N/A'}</Text>
            </View>
            <View style={styles.detailItem}>
              <CalendarIcon size={16} color="#6b7280" />
              <Text style={styles.detailVal}>
                Schedule: {group.date || group.requested_date} at {group.startTime || group.requested_time}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Award size={16} color="#6b7280" />
              <Text style={styles.detailVal}>Defense Stage: {group.defense_type || group.stage || 'Title Defense'}</Text>
            </View>
          </View>
        </View>

        {/* DYNAMIC SECTIONS */}
        {sections.map((section, idx) => {
          let sectionScore = 0;
          let sectionMax = 0;
          section.subsections.forEach(sub => {
            sub.criteria.forEach(c => {
              sectionScore += (scores[c.id] || 0);
              sectionMax += c.points;
            });
          });

          return (
            <View key={idx} style={styles.sectionContainer}>
              <View style={styles.sectionBarHeader}>
                <FileText size={20} color="#fff" />
                <Text style={styles.sectionBarTitle}>{section.title}</Text>
                <View style={styles.sectionScoreBadge}>
                  <Text style={styles.sectionScoreBadgeText}>{sectionScore} / {sectionMax}</Text>
                </View>
              </View>

              {section.subsections.map((subsection, subIdx) => {
                let subScore = 0;
                let subMax = 0;
                subsection.criteria.forEach(c => {
                  subScore += (scores[c.id] || 0);
                  subMax += c.points;
                });

                return (
                  <View key={subIdx} style={styles.subsectionContainer}>
                    <View style={styles.subsectionHeader}>
                      <Text style={styles.subsectionTitle}>{subsection.title}</Text>
                      <Text style={styles.subsectionScore}>{subScore} / {subMax}</Text>
                    </View>
                    
                    {subsection.criteria.map((criterion) => (
                      <CriterionCard
                        key={criterion.id}
                        criterion={criterion}
                        score={scores[criterion.id]}
                        comment={comments[criterion.id]}
                        onScoreChange={(val) => handleScoreChange(criterion.id, val)}
                        onCommentChange={(val) => handleCommentChange(criterion.id, val)}
                      />
                    ))}
                  </View>
                );
              })}
            </View>
          );
        })}

        {/* ORAL DEFENSE PRESENTATION SECTION */}
        <View style={styles.sectionContainer}>
          <View style={[styles.sectionBarHeader, { backgroundColor: '#1f2937' }]}>
            <Award size={20} color="#fff" />
            <Text style={styles.sectionBarTitle}>ORAL DEFENSE PRESENTATION</Text>
            <View style={styles.sectionScoreBadge}>
              <Text style={styles.sectionScoreBadgeText}>Individual</Text>
            </View>
          </View>

          <View style={styles.studentTabsScrollWrapper}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.studentTabsScroll}>
              {(studentPresentationScores || []).map((student) => {
                const isActive = activeStudentTab === student.studentName;
                const total = getStudentPresentationTotal(student.studentName);
                const max = calculateMaxPresScore();
                return (
                  <Pressable
                    key={student.studentName}
                    onPress={() => setActiveStudentTab(student.studentName)}
                    style={[styles.studentTabBtn, isActive && styles.studentTabBtnActive]}
                  >
                    <User size={16} color={isActive ? '#fff' : '#4b5563'} style={{ marginRight: 6 }} />
                    <Text style={[styles.studentTabBtnText, isActive && styles.studentTabBtnTextActive]}>
                      {student.studentName} ({total}/{max})
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {(studentPresentationScores || []).map((student) => {
            if (student.studentName !== activeStudentTab) return null;
            return (
              <View key={student.studentName} style={{ padding: 16 }}>
                {presentationCriteria.map((criterion) => (
                  <CriterionCard
                    key={criterion.id}
                    criterion={criterion}
                    score={student.scores[criterion.id]}
                    comment={student.comments[criterion.id]}
                    onScoreChange={(val) => handleStudentScoreChange(student.studentName, criterion.id, val)}
                    onCommentChange={(val) => handleStudentCommentChange(student.studentName, criterion.id, val)}
                  />
                ))}
              </View>
            );
          })}
        </View>

        {/* REMARKS/COMMENTS SECTION */}
        <View style={styles.sectionContainer}>
          <View style={[styles.sectionBarHeader, { backgroundColor: '#374151' }]}>
            <MessageSquare size={20} color="#fff" />
            <Text style={styles.sectionBarTitle}>REMARKS / COMMENTS / RECOMMENDATIONS</Text>
          </View>
          <View style={{ padding: 16 }}>
            <TextInput
              style={styles.generalCommentsInput}
              value={generalComments}
              onChangeText={setGeneralComments}
              placeholder="Enter your detailed remarks, comments, or recommendations for the research project..."
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* TOTAL SCORE SUMMARY */}
        <View style={styles.totalScoreBanner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.totalScoreLabel}>Total Evaluation Score</Text>
            <Text style={styles.totalScoreSub}>Combined score across all sections</Text>
          </View>
          <View style={styles.totalScoreBox}>
            <Text style={styles.totalScoreValue}>{getTotalScore()}</Text>
            <Text style={styles.totalScoreMax}>out of {maxCombined}</Text>
          </View>
        </View>

        <View style={styles.actionButtonsRow}>
          <Pressable
            style={styles.saveDraftBtn}
            onPress={() => requestSave('draft')}
            disabled={submitting}
          >
            <Save size={20} color="#ea580c" />
            <Text style={styles.saveDraftBtnText}>Save Draft</Text>
          </Pressable>
          <Pressable
            style={styles.submitBtn}
            onPress={() => requestSave('submitted')}
            disabled={submitting}
          >
            <Send size={20} color="#fff" />
            <Text style={styles.submitBtnText}>Submit Evaluation</Text>
          </Pressable>
        </View>

      </ScrollView>
        </View>
      </View>

      {/* Sidebar Modal for Mobile */}
      {!isDesktop ? (
        <Modal
          visible={sidebarOpen}
          animationType="fade"
          transparent
          onRequestClose={() => setSidebarOpen(false)}
        >
          <View style={styles.modalRoot}>
            <View style={[styles.drawer, { backgroundColor: '#212121' }]} accessibilityViewIsModal>
              <Sidebar active="evaluation" onNavigate={onNavigate} isMobile />
            </View>
            <Pressable style={styles.backdrop} onPress={() => setSidebarOpen(false)} accessibilityLabel="Close menu" />
          </View>
        </Modal>
      ) : null}

      {/* Custom Confirm Modal */}
      <Modal
        visible={confirmModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setConfirmModalVisible(false)}
      >
        <View style={styles.confirmModalBackdrop}>
          <View style={styles.confirmModalBox}>
            <Text style={styles.confirmModalTitle}>
              {confirmAction === 'submitted' ? 'Submit Evaluation?' : 'Save Draft?'}
            </Text>
            <Text style={styles.confirmModalMessage}>
              {confirmAction === 'submitted' 
                ? 'Are you sure you want to submit this evaluation? It cannot be edited later.' 
                : 'Are you sure you want to save this draft? You can continue editing later.'}
            </Text>
            <View style={styles.confirmModalActionRow}>
              <Pressable style={styles.confirmModalCancelBtn} onPress={() => setConfirmModalVisible(false)}>
                <Text style={styles.confirmModalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.confirmModalConfirmBtn} onPress={executeSave}>
                <Text style={styles.confirmModalConfirmText}>
                  {confirmAction === 'submitted' ? 'Yes, Submit' : 'Yes, Save Draft'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f9fafb' },
  row: { flex: 1, flexDirection: 'row' },
  main: { flex: 1, minWidth: 0 },
  modalRoot: { flex: 1, flexDirection: 'row' },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    ...Platform.select({
      web: { cursor: 'pointer' },
      default: {},
    }),
  },
  drawer: {
    width: '82%',
    maxWidth: 280,
    alignSelf: 'stretch',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: -2, height: 0 },
    elevation: 8,
  },
  confirmModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmModalBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 5,
  },
  confirmModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  confirmModalMessage: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 24,
    lineHeight: 20,
  },
  confirmModalActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  confirmModalCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  confirmModalCancelText: {
    color: '#4b5563',
    fontWeight: '600',
  },
  confirmModalConfirmBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#ea580c',
  },
  confirmModalConfirmText: {
    color: '#fff',
    fontWeight: '600',
  },
  container: {
    flex: 1,
  },
  formScroll: {
    padding: 16,
    maxWidth: 1000,
    alignSelf: 'center',
    width: '100%',
    paddingBottom: 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#6b7280',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    marginTop: 12,
    color: '#ef4444',
    fontSize: 16,
  },
  backBtn: {
    marginTop: 16,
    padding: 10,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  backBtnText: {
    color: '#374151',
    fontWeight: '600',
  },
  formHeader: {
    marginBottom: 16,
  },
  backLink: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  backLinkContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backLinkText: {
    color: '#6b7280',
    fontSize: 14,
    marginLeft: 6,
  },
  titleBanner: {
    backgroundColor: '#ea580c',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  titleBannerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  titleBannerSub: {
    color: '#fed7aa',
    fontSize: 12,
  },
  detailCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ea580c',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  groupTitleLarge: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  roleText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '45%',
    minWidth: 200,
  },
  detailVal: {
    fontSize: 14,
    color: '#4b5563',
  },
  sectionContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 24,
    overflow: 'hidden',
  },
  sectionBarHeader: {
    backgroundColor: '#111827',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  sectionBarTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 12,
    flex: 1,
  },
  sectionScoreBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  sectionScoreBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  subsectionContainer: {
    margin: 16,
  },
  subsectionHeader: {
    backgroundColor: '#f97316',
    padding: 12,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subsectionTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  subsectionScore: {
    color: '#c2410c',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 'bold',
  },
  criterionContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  criterionRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  critLeftCol: {
    backgroundColor: '#1e293b',
    padding: 16,
    minHeight: 120,
  },
  critPointsText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ea580c',
    marginBottom: 8,
  },
  critNameText: {
    fontSize: 12,
    color: '#fff',
    lineHeight: 16,
  },
  levelCol: {
    padding: 12,
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  levelColSelected: {
    backgroundColor: '#ffedd5',
  },
  levelHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  radioCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#9ca3af',
    marginRight: 6,
    backgroundColor: '#fff',
  },
  radioCircleSelected: {
    borderColor: '#ea580c',
    borderWidth: 4,
  },
  levelTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ea580c',
  },
  levelTitleSelected: {
    color: '#c2410c',
  },
  levelDescText: {
    fontSize: 11,
    color: '#4b5563',
    lineHeight: 16,
  },
  critRightCol: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
  },
  scoreNumberInput: {
    borderWidth: 1,
    borderColor: '#fed7aa',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 4,
    width: '100%',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ea580c',
    backgroundColor: '#fff',
    marginBottom: 4,
  },
  maxScoreText: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '500',
  },
  commentRow: {
    padding: 12,
    backgroundColor: '#fff',
  },
  commentLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  commentLabelText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 6,
    fontWeight: '500',
  },
  commentTextInput: {
    borderWidth: 1,
    borderColor: '#ea580c',
    borderRadius: 6,
    padding: 10,
    fontSize: 13,
    color: '#374151',
    backgroundColor: '#fff',
    minHeight: 40,
  },
  studentTabsScrollWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#f3f4f6',
  },
  studentTabsScroll: {
    paddingHorizontal: 16,
  },
  studentTabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
    marginRight: 8,
  },
  studentTabBtnActive: {
    borderBottomColor: '#ea580c',
    backgroundColor: '#ea580c',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  studentTabBtnText: {
    color: '#4b5563',
    fontWeight: '600',
    fontSize: 14,
  },
  studentTabBtnTextActive: {
    color: '#fff',
  },
  generalCommentsInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#374151',
    backgroundColor: '#fff',
  },
  totalScoreBanner: {
    backgroundColor: '#ea580c',
    borderRadius: 8,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  totalScoreLabel: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  totalScoreSub: {
    color: '#fed7aa',
    fontSize: 14,
    marginTop: 4,
  },
  totalScoreBox: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  totalScoreValue: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  totalScoreMax: {
    color: '#fed7aa',
    fontSize: 12,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  saveDraftBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ea580c',
    backgroundColor: '#fff',
  },
  saveDraftBtnText: {
    color: '#ea580c',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#ea580c',
  },
  submitBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
