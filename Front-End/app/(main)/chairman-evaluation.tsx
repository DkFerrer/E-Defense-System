import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, Modal, Pressable, useWindowDimensions, Alert, Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { mockResearchGroups, mockBookings, ResearchGroup } from '../../src/data/mockData';
import { sections, presentationCriteria, scorePercentages, getSelectedLevel } from '../../src/data/evaluationRubric';
import { Colors } from '../../src/theme/colors';
import { Typography } from '../../src/theme/typography';
import { useAppData } from '../../src/context/AppDataContext';

// ─── Helpers ────────────────────────────────────────────────────────────────

const showAlert = (title: string, message: string) => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') window.alert(`${title}: ${message}`);
  } else {
    Alert.alert(title, message);
  }
};

// ─── Criterion Card (interactive) ───────────────────────────────────────────

interface CriterionCardProps {
  criterion: { id: string; name: string; points: number; rubric: { level: number; description: string }[] };
  score: number | undefined;
  comment: string | undefined;
  onScoreChange: (score: number) => void;
  onCommentChange: (comment: string) => void;
  isWide: boolean;
}

const CriterionCard = React.memo(
  ({ criterion, score, comment, onScoreChange, onCommentChange, isWide }: CriterionCardProps) => {
    const selectedLevel = getSelectedLevel(score ?? 0, criterion.points);

    return (
      <View style={styles.criterionContainer}>
        <View style={[styles.criterionRow, { flexDirection: isWide ? 'row' : 'column' }]}>
          {/* Left: points + name */}
          <View style={[styles.critLeftCol, { width: isWide ? '12%' : '100%' }]}>
            <Text style={styles.critPointsText}>{criterion.points}</Text>
            <Text style={styles.critNameText}>{criterion.name}</Text>
          </View>

          {/* Level columns */}
          {criterion.rubric.map((r) => {
            const isSelected = selectedLevel === r.level;
            return (
              <Pressable
                key={r.level}
                style={[
                  styles.levelCol,
                  { width: isWide ? '16%' : '100%' },
                  isSelected && styles.levelColSelected,
                ]}
                onPress={() => {
                  const calc = Math.round(criterion.points * (scorePercentages[r.level] ?? 0) * 10) / 10;
                  onScoreChange(calc);
                }}
                accessibilityRole="button"
                accessibilityLabel={`Level ${r.level}: ${r.level === 5 ? 'Excellent' : r.level === 4 ? 'Good' : r.level === 3 ? 'Adequate' : r.level === 2 ? 'Needs Work' : 'Poor'}`}
                accessibilityState={{ selected: isSelected }}
              >
                <View style={styles.levelHeaderRow}>
                  <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]} />
                  <Text style={[styles.levelTitle, isSelected && styles.levelTitleSelected]}>
                    {r.level}{' '}
                    {r.level === 5 ? 'Excellent' : r.level === 4 ? 'Good' : r.level === 3 ? 'Adequate' : r.level === 2 ? 'Needs Work' : 'Poor'}
                  </Text>
                </View>
                <Text style={styles.levelDescText}>{r.description}</Text>
              </Pressable>
            );
          })}

          {/* Right: score input */}
          <View style={[styles.critRightCol, { width: isWide ? '8%' : '100%' }]}>
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
              accessibilityLabel={`Score for ${criterion.name}`}
            />
            <Text style={styles.maxScoreText}>/ {criterion.points}</Text>
          </View>
        </View>

        {/* Comments */}
        <View style={styles.commentRow}>
          <View style={styles.commentLabelRow}>
            <Ionicons name="chatbubble-ellipses-outline" size={14} color="#9ca3af" />
            <Text style={styles.commentLabelText}>Remarks / Comments:</Text>
          </View>
          <TextInput
            style={styles.commentTextInput}
            placeholder="Enter specific remarks or comments for this criterion..."
            value={comment || ''}
            onChangeText={onCommentChange}
            multiline
          />
        </View>
      </View>
    );
  },
  (prev, next) =>
    prev.score === next.score &&
    prev.comment === next.comment &&
    prev.criterion.id === next.criterion.id &&
    prev.isWide === next.isWide,
);

// ─── Main Screen ─────────────────────────────────────────────────────────────

const CHAIRMAN_NAME = 'Panel Chairman';

export default function ChairmanEvaluationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWide = width >= 768;
  const { saveEvaluation, logActivity } = useAppData();

  let group = mockResearchGroups.find((g) => g.id === id);

  if (!group) {
    const booking = mockBookings.find((b) => String(b.id) === id);
    if (booking) {
      let formattedDate = booking.requested_date;
      try {
        const d = new Date(booking.requested_date);
        if (!isNaN(d.getTime())) {
          const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          formattedDate = `${monthNames[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
        }
      } catch (e) {}

      group = {
        id: String(booking.id),
        title: booking.research_title,
        members: booking.members,
        adviser: booking.adviser_name,
        program: booking.program,
        defenseDate: formattedDate,
        stage: booking.defense_type as any,
        score: 0,
        department: booking.department,
      };
    }
  }

  const [scores, setScores] = useState<Record<string, number>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [studentPresentationScores, setStudentPresentationScores] = useState<
    { studentName: string; scores: Record<string, number>; comments: Record<string, string> }[]
  >([]);
  const [generalComments, setGeneralComments] = useState('');
  const [activeStudentTab, setActiveStudentTab] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Modals
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'draft' | 'submitted' | null>(null);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Init student presentation tabs
  useEffect(() => {
    if (group && group.members.length > 0) {
      if (!activeStudentTab) setActiveStudentTab(group.members[0]);
      setStudentPresentationScores(
        group.members.map((member) => ({ studentName: member, scores: {}, comments: {} })),
      );
    }
  }, [group]);

  if (!group) {
    return (
      <View style={styles.notFound}>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.textSecondary} />
        <Text style={styles.notFoundText}>Research group not found.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Score calculations ─────────────────────────────────────────────────────

  const getDocumentationTotal = () => {
    let total = 0;
    sections.forEach((sec) =>
      sec.subsections.forEach((sub) =>
        sub.criteria.forEach((c) => (total += scores[c.id] || 0)),
      ),
    );
    return Math.round(total * 10) / 10;
  };

  const getStudentPresentationTotal = (studentName: string) => {
    const student = studentPresentationScores.find((s) => s.studentName === studentName);
    if (!student) return 0;
    let total = 0;
    presentationCriteria.forEach((c) => (total += student.scores[c.id] || 0));
    return Math.round(total * 10) / 10;
  };

  const getAveragePresentationScore = () => {
    if (!studentPresentationScores.length) return 0;
    const total = studentPresentationScores.reduce(
      (sum, s) => sum + getStudentPresentationTotal(s.studentName),
      0,
    );
    return Math.round((total / studentPresentationScores.length) * 10) / 10;
  };

  const getTotalScore = () =>
    Math.round((getDocumentationTotal() + getAveragePresentationScore()) * 10) / 10;

  const calculateMaxDocScore = () => {
    let total = 0;
    sections.forEach((s) => s.subsections.forEach((sub) => sub.criteria.forEach((c) => (total += c.points))));
    return total;
  };

  const calculateMaxPresScore = () => {
    let total = 0;
    presentationCriteria.forEach((c) => (total += c.points));
    return total;
  };

  const maxCombined = calculateMaxDocScore() + calculateMaxPresScore();

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleScoreChange = useCallback((criterionId: string, points: number) => {
    setScores((prev) => ({ ...prev, [criterionId]: points }));
  }, []);

  const handleCommentChange = useCallback((criterionId: string, comment: string) => {
    setComments((prev) => ({ ...prev, [criterionId]: comment }));
  }, []);

  const handleStudentScoreChange = useCallback(
    (studentName: string, criterionId: string, points: number) => {
      setStudentPresentationScores((prev) =>
        prev.map((s) =>
          s.studentName === studentName
            ? { ...s, scores: { ...s.scores, [criterionId]: points } }
            : s,
        ),
      );
    },
    [],
  );

  const handleStudentCommentChange = useCallback(
    (studentName: string, criterionId: string, comment: string) => {
      setStudentPresentationScores((prev) =>
        prev.map((s) =>
          s.studentName === studentName
            ? { ...s, comments: { ...s.comments, [criterionId]: comment } }
            : s,
        ),
      );
    },
    [],
  );

  const requestSave = (status: 'draft' | 'submitted') => {
    setConfirmAction(status);
    setConfirmModalVisible(true);
  };

  const executeSave = async () => {
    setConfirmModalVisible(false);
    setSubmitting(true);
    try {
      await new Promise<void>((resolve) => setTimeout(resolve, 800));

      if (confirmAction === 'submitted') {
        if (group) {
          saveEvaluation({
            groupId:                  group.id,
            panelist:                 CHAIRMAN_NAME,
            totalScore:               getTotalScore(),
            comments:                 generalComments,
            submittedAt:              new Date().toISOString(),
            criterionScores:          { ...scores },
            criterionComments:        { ...comments },
            studentPresentationScores: studentPresentationScores.map((s) => ({
              studentName: s.studentName,
              scores:      { ...s.scores },
              comments:    { ...s.comments },
            })),
          });

          logActivity(
            'Evaluation Submitted',
            `Panel Chairman submitted evaluation for "${group.title}" — Score: ${getTotalScore()}`,
            'ribbon-outline',
            '#ea580c',
          );
        }

        setSuccessModalVisible(true);
      } else {
        showAlert('Draft Saved', 'Your draft evaluation has been saved successfully.');
      }
    } catch (error: any) {
      setErrorMessage(error?.message || 'Failed to submit the evaluation. Please check your network connection and try again.');
      setErrorModalVisible(true);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <View style={styles.root}>
      <ScrollView style={styles.container} contentContainerStyle={styles.formScroll}>

        {/* Back Link */}
        <TouchableOpacity
          style={styles.backLink}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back to list"
        >
          <View style={styles.backLinkContent}>
            <Ionicons name="arrow-back" size={16} color="#6b7280" />
            <Text style={styles.backLinkText}>Back to List</Text>
          </View>
        </TouchableOpacity>

        {/* Title Banner */}
        <View style={styles.titleBanner}>
          <Ionicons name="ribbon-outline" size={32} color="#fff" />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={styles.titleBannerText}>Thesis Evaluation Form</Text>
            <Text style={styles.titleBannerSub}>Comprehensive evaluation rubric for research projects</Text>
          </View>
        </View>

        {/* Group Details Card */}
        <View style={styles.detailCard}>
          <View style={styles.detailHeader}>
            <Text style={styles.groupTitleLarge} numberOfLines={2}>{group.title}</Text>
            <View style={[styles.roleBadge, { backgroundColor: '#fff7ed' }]}>
              <Ionicons name="star-outline" size={14} color="#ea580c" style={{ marginRight: 4 }} />
              <Text style={[styles.roleText, { color: '#ea580c' }]}>Panel Chairman</Text>
            </View>
          </View>

          <View style={styles.detailGrid}>
            <View style={styles.detailItem}>
              <Ionicons name="people-outline" size={16} color="#6b7280" />
              <Text style={styles.detailVal}>Proponents: {group.members.join(', ')}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="school-outline" size={16} color="#6b7280" />
              <Text style={styles.detailVal}>Program: {group.program}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="calendar-outline" size={16} color="#6b7280" />
              <Text style={styles.detailVal}>Defense Date: {group.defenseDate}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="person-outline" size={16} color="#6b7280" />
              <Text style={styles.detailVal}>Adviser: {group.adviser}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="business-outline" size={16} color="#6b7280" />
              <Text style={styles.detailVal}>Department: {group.department}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="trophy-outline" size={16} color="#6b7280" />
              <Text style={styles.detailVal}>Stage: {group.stage}</Text>
            </View>
          </View>
        </View>

        {/* DYNAMIC SECTIONS */}
        {sections.map((section, idx) => {
          let sectionScore = 0;
          let sectionMax = 0;
          section.subsections.forEach((sub) =>
            sub.criteria.forEach((c) => {
              sectionScore += scores[c.id] || 0;
              sectionMax += c.points;
            }),
          );

          return (
            <View key={idx} style={styles.sectionContainer}>
              <View style={styles.sectionBarHeader}>
                <Ionicons name="document-text-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.sectionBarTitle}>{section.title}</Text>
                <View style={styles.sectionScoreBadge}>
                  <Text style={styles.sectionScoreBadgeText}>{sectionScore} / {sectionMax}</Text>
                </View>
              </View>

              {section.subsections.map((subsection, subIdx) => {
                let subScore = 0;
                let subMax = 0;
                subsection.criteria.forEach((c) => {
                  subScore += scores[c.id] || 0;
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
                        isWide={isWide}
                      />
                    ))}
                  </View>
                );
              })}
            </View>
          );
        })}

        {/* ORAL DEFENSE PRESENTATION */}
        <View style={styles.sectionContainer}>
          <View style={[styles.sectionBarHeader, { backgroundColor: '#1f2937' }]}>
            <Ionicons name="ribbon-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.sectionBarTitle}>ORAL DEFENSE PRESENTATION</Text>
            <View style={styles.sectionScoreBadge}>
              <Text style={styles.sectionScoreBadgeText}>Individual</Text>
            </View>
          </View>

          {/* Student tabs */}
          <View style={styles.studentTabsScrollWrapper}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.studentTabsScroll}>
              {group.members.map((member) => {
                const isActive = activeStudentTab === member;
                const total = getStudentPresentationTotal(member);
                const presMax = calculateMaxPresScore();
                return (
                  <Pressable
                    key={member}
                    onPress={() => setActiveStudentTab(member)}
                    style={[styles.studentTabBtn, isActive && styles.studentTabBtnActive]}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: isActive }}
                  >
                    <Ionicons name="person-outline" size={16} color={isActive ? '#fff' : '#4b5563'} style={{ marginRight: 6 }} />
                    <Text style={[styles.studentTabBtnText, isActive && styles.studentTabBtnTextActive]}>
                      {member} ({total}/{presMax})
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          <View style={{ padding: 16 }}>
            {studentPresentationScores.map((student) => {
              if (student.studentName !== activeStudentTab) return null;
              return (
                <View key={student.studentName}>
                  {presentationCriteria.map((criterion) => (
                    <CriterionCard
                      key={criterion.id}
                      criterion={criterion}
                      score={student.scores[criterion.id]}
                      comment={student.comments[criterion.id]}
                      onScoreChange={(val) => handleStudentScoreChange(student.studentName, criterion.id, val)}
                      onCommentChange={(val) => handleStudentCommentChange(student.studentName, criterion.id, val)}
                      isWide={isWide}
                    />
                  ))}
                </View>
              );
            })}
          </View>
        </View>

        {/* REMARKS / COMMENTS */}
        <View style={styles.sectionContainer}>
          <View style={[styles.sectionBarHeader, { backgroundColor: '#374151' }]}>
            <Ionicons name="chatbubble-ellipses-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
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

        {/* TOTAL SCORE BANNER */}
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



        {/* ACTION BUTTONS */}
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity
            style={styles.saveDraftBtn}
            onPress={() => requestSave('draft')}
            disabled={submitting}
            accessibilityRole="button"
            accessibilityLabel="Save as draft"
          >
            <Ionicons name="save-outline" size={20} color="#ea580c" />
            <Text style={styles.saveDraftBtnText}>Save Draft</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
            onPress={() => requestSave('submitted')}
            disabled={submitting}
            accessibilityRole="button"
            accessibilityLabel="Submit evaluation"
          >
            <Ionicons name="send-outline" size={20} color="#fff" />
            <Text style={styles.submitBtnText}>{submitting ? 'Submitting...' : 'Submit Evaluation'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ── Custom Confirm Modal ──────────────────────────────────────────────── */}
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

      {/* ── Custom Success Modal ──────────────────────────────────────────────── */}
      <Modal
        visible={successModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setSuccessModalVisible(false)}
      >
        <View style={styles.confirmModalBackdrop}>
          <View style={[styles.confirmModalBox, { alignItems: 'center', paddingVertical: 32 }]}>
            <View style={styles.successIconWrapper}>
              <Ionicons name="checkmark-circle" size={56} color="#10b981" />
            </View>
            <Text style={[styles.confirmModalTitle, { textAlign: 'center', fontSize: 22, marginTop: 16 }]}>
              Evaluation Submitted!
            </Text>
            <Text style={[styles.confirmModalMessage, { textAlign: 'center', color: '#6b7280', marginBottom: 24 }]}>
              Your evaluation for the research project "{group.title}" has been recorded successfully.
            </Text>
            <View style={styles.scoreSummaryBox}>
              <Text style={styles.scoreSummaryLabel}>Total Given Score</Text>
              <Text style={styles.scoreSummaryValue}>
                {getTotalScore()}{' '}
                <Text style={{ fontSize: 16, color: '#6b7280' }}>/ {maxCombined}</Text>
              </Text>
            </View>
            <Pressable
              style={[styles.confirmModalConfirmBtn, { width: '100%', alignItems: 'center', paddingVertical: 14, borderRadius: 10, marginTop: 8 }]}
              onPress={() => {
                setSuccessModalVisible(false);
                router.replace('/(main)/results');
              }}
            >
              <Text style={[styles.confirmModalConfirmText, { fontSize: 16 }]}>View Results</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* ── Custom Error Modal ────────────────────────────────────────────────── */}
      <Modal
        visible={errorModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setErrorModalVisible(false)}
      >
        <View style={styles.confirmModalBackdrop}>
          <View style={[styles.confirmModalBox, { alignItems: 'center', paddingVertical: 32 }]}>
            <View style={styles.errorIconWrapper}>
              <Ionicons name="close-circle" size={56} color="#ef4444" />
            </View>
            <Text style={[styles.confirmModalTitle, { textAlign: 'center', fontSize: 22, marginTop: 16, color: '#ef4444' }]}>
              Submission Failed
            </Text>
            <Text style={[styles.confirmModalMessage, { textAlign: 'center', color: '#6b7280', marginBottom: 24 }]}>
              {errorMessage || 'Failed to submit the evaluation. Please check your network connection and try again.'}
            </Text>
            <Pressable
              style={[styles.confirmModalConfirmBtn, { width: '100%', alignItems: 'center', paddingVertical: 14, borderRadius: 10, backgroundColor: '#ef4444' }]}
              onPress={() => setErrorModalVisible(false)}
            >
              <Text style={[styles.confirmModalConfirmText, { fontSize: 16 }]}>Dismiss</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.pageBg },
  container: { flex: 1 },
  formScroll: {
    padding: 16,
    maxWidth: 1000,
    alignSelf: 'center',
    width: '100%',
    paddingBottom: 60,
  },

  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
  notFoundText: { fontFamily: Typography.fontFamily.medium, fontSize: Typography.fontSize.base, color: Colors.textSecondary },
  backBtn: { backgroundColor: '#ea580c', borderRadius: 10, paddingHorizontal: 20, paddingVertical: 12, marginTop: 8 },
  backBtnText: { fontFamily: Typography.fontFamily.semiBold, fontSize: Typography.fontSize.base, color: '#fff' },

  backLink: {
    alignSelf: 'flex-start',
    marginBottom: 8,
    minHeight: 44,
    justifyContent: 'center',
  },
  backLinkContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backLinkText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 6,
  },

  // ── Title Banner ──
  titleBanner: {
    backgroundColor: '#ea580c',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  titleBannerText: { fontFamily: Typography.fontFamily.bold, fontSize: 20, color: '#fff' },
  titleBannerSub: { fontFamily: Typography.fontFamily.regular, fontSize: 12, color: '#fed7aa', marginTop: 2 },

  // ── Detail Card ──
  detailCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ea580c',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  detailHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    flexWrap: 'wrap', gap: 12, marginBottom: 12,
  },
  groupTitleLarge: { fontFamily: Typography.fontFamily.bold, fontSize: 18, color: '#111827', flex: 1 },
  roleBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff7ed', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999,
  },
  roleText: { fontFamily: Typography.fontFamily.bold, fontSize: 12, color: '#ea580c' },
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
  detailVal: { fontFamily: Typography.fontFamily.regular, fontSize: 14, color: '#4b5563', flex: 1 },

  // ── Section ──
  sectionContainer: {
    backgroundColor: Colors.cardBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
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
    fontFamily: Typography.fontFamily.bold,
    fontSize: 16,
    color: '#fff',
    marginLeft: 12,
    flex: 1,
  },
  sectionScoreBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  sectionScoreBadgeText: { fontFamily: Typography.fontFamily.bold, color: '#fff', fontSize: 12 },

  subsectionContainer: { margin: 16 },
  subsectionHeader: {
    backgroundColor: '#f97316',
    padding: 12,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subsectionTitle: { fontFamily: Typography.fontFamily.bold, color: '#fff', fontSize: 14 },
  subsectionScore: {
    fontFamily: Typography.fontFamily.bold, fontSize: 12,
    color: '#c2410c', backgroundColor: '#fff',
    paddingHorizontal: 10, paddingVertical: 2, borderRadius: 999,
  },

  // ── Criterion Card ──
  criterionContainer: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb',
    marginBottom: 16, borderRadius: 8, overflow: 'hidden',
  },
  criterionRow: { borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  critLeftCol: { backgroundColor: '#1e293b', padding: 16, minHeight: 120 },
  critPointsText: { fontFamily: Typography.fontFamily.bold, fontSize: 24, color: '#ea580c', marginBottom: 8 },
  critNameText: { fontFamily: Typography.fontFamily.regular, fontSize: 12, color: '#fff', lineHeight: 16 },

  levelCol: { padding: 12, borderRightWidth: 1, borderRightColor: '#e5e7eb', backgroundColor: '#fff' },
  levelColSelected: { backgroundColor: '#ffedd5' },
  levelHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  radioCircle: { width: 14, height: 14, borderRadius: 7, borderWidth: 1, borderColor: '#9ca3af', marginRight: 6, backgroundColor: '#fff' },
  radioCircleSelected: { borderColor: '#ea580c', borderWidth: 4 },
  levelTitle: { fontFamily: Typography.fontFamily.bold, fontSize: 12, color: '#ea580c' },
  levelTitleSelected: { color: '#c2410c' },
  levelDescText: { fontFamily: Typography.fontFamily.regular, fontSize: 11, color: '#4b5563', lineHeight: 16 },

  critRightCol: { padding: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb' },
  scoreNumberInput: {
    borderWidth: 1, borderColor: '#fed7aa', borderRadius: 6,
    paddingVertical: 8, paddingHorizontal: 4, width: '100%',
    textAlign: 'center', fontSize: 16,
    fontFamily: Typography.fontFamily.bold, color: '#ea580c',
    backgroundColor: '#fff', marginBottom: 4,
  },
  maxScoreText: { fontFamily: Typography.fontFamily.medium, fontSize: 11, color: '#9ca3af', fontWeight: '500' },

  commentRow: { padding: 12, backgroundColor: '#fff' },
  commentLabelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  commentLabelText: { fontFamily: Typography.fontFamily.medium, fontSize: 12, color: '#6b7280', marginLeft: 6, fontWeight: '500' },
  commentTextInput: {
    borderWidth: 1, borderColor: '#ea580c', borderRadius: 6, padding: 10,
    fontSize: 13, color: '#374151', backgroundColor: '#fff', minHeight: 40,
  },

  // ── Student Tabs ──
  studentTabsScrollWrapper: { borderBottomWidth: 1, borderBottomColor: '#e5e7eb', backgroundColor: '#f3f4f6' },
  studentTabsScroll: { paddingHorizontal: 16 },
  studentTabBtn: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 12,
    borderBottomWidth: 3, borderBottomColor: 'transparent', marginRight: 8,
  },
  studentTabBtnActive: {
    borderBottomColor: '#ea580c', backgroundColor: '#ea580c',
    borderTopLeftRadius: 8, borderTopRightRadius: 8,
  },
  studentTabBtnText: { fontFamily: Typography.fontFamily.semiBold, color: '#4b5563', fontSize: 14 },
  studentTabBtnTextActive: { color: '#fff' },

  generalCommentsInput: {
    borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8,
    padding: 12, fontSize: 14, color: '#374151', backgroundColor: '#fff', minHeight: 120,
  },

  // ── Total Score Banner ──
  totalScoreBanner: {
    backgroundColor: '#ea580c', borderRadius: 8, padding: 24,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24,
  },
  totalScoreLabel: { fontFamily: Typography.fontFamily.bold, color: '#fff', fontSize: 20 },
  totalScoreSub: { fontFamily: Typography.fontFamily.regular, color: '#fed7aa', fontSize: 14, marginTop: 4 },
  totalScoreBox: {
    backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 24, paddingVertical: 12,
    borderRadius: 12, alignItems: 'center',
  },
  totalScoreValue: { fontFamily: Typography.fontFamily.bold, color: '#fff', fontSize: 32 },
  totalScoreMax: { fontFamily: Typography.fontFamily.regular, color: '#fed7aa', fontSize: 12 },

  // ── Panel Decision ──
  decisionInstructions: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 16,
  },
  decisionGroup: {
    gap: 12,
  },
  decisionOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    padding: 14,
    backgroundColor: '#ffffff',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#94a3b8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  decisionLabel: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 14,
    color: '#334155',
    flex: 1,
  },

  // ── Action Buttons ──
  actionButtonsRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  saveDraftBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 20, paddingVertical: 12,
    borderRadius: 8, borderWidth: 2, borderColor: '#ea580c', backgroundColor: '#fff',
  },
  saveDraftBtnText: { fontFamily: Typography.fontFamily.bold, color: '#ea580c', fontSize: 14 },
  submitBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 24, paddingVertical: 12,
    borderRadius: 8, backgroundColor: '#ea580c',
  },
  submitBtnText: { fontFamily: Typography.fontFamily.bold, color: '#fff', fontSize: 14 },

  // ── Modals ──
  confirmModalBackdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center',
  },
  confirmModalBox: {
    backgroundColor: '#fff', borderRadius: 12, padding: 24,
    width: '90%', maxWidth: 400,
    shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 4 }, shadowRadius: 12, elevation: 5,
  },
  successIconWrapper: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#ecfdf5', justifyContent: 'center', alignItems: 'center',
  },
  errorIconWrapper: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#fef2f2', justifyContent: 'center', alignItems: 'center',
  },
  scoreSummaryBox: {
    backgroundColor: '#f3f4f6', borderRadius: 10, padding: 16,
    width: '100%', alignItems: 'center', marginBottom: 24,
  },
  scoreSummaryLabel: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4,
  },
  scoreSummaryValue: {
    fontFamily: Typography.fontFamily.bold, fontSize: 28, color: '#111827',
  },
  confirmModalTitle: {
    fontFamily: Typography.fontFamily.bold, fontSize: 18, color: '#111827', marginBottom: 12,
  },
  confirmModalMessage: {
    fontFamily: Typography.fontFamily.regular, fontSize: 14, color: '#4b5563', marginBottom: 24, lineHeight: 20,
  },
  confirmModalActionRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  confirmModalCancelBtn: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, backgroundColor: '#f3f4f6',
  },
  confirmModalCancelText: { fontFamily: Typography.fontFamily.semiBold, color: '#4b5563' },
  confirmModalConfirmBtn: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, backgroundColor: '#ea580c',
  },
  confirmModalConfirmText: { fontFamily: Typography.fontFamily.semiBold, color: '#fff' },
});
