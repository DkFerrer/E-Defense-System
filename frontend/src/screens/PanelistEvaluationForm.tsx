import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import {
  ArrowLeft,
  FileText,
  BookOpen,
  ClipboardList,
  Save,
  Send,
  Eye,
} from 'lucide-react-native';
import { format } from 'date-fns';
import { submitPanelistEvaluation } from '../services/defenseWorkflow';
import { SAMPLE_RUBRICS } from '../data/sampleDataset';

export default function PanelistEvaluationForm({ group, currentUser, onBack }) {
  const [activeTab, setActiveTab] = useState('evaluation');
  const [rubrics, setRubrics] = useState([]);
  const [scores, setScores] = useState({});
  const [comments, setComments] = useState({});
  const [generalComments, setGeneralComments] = useState('');
  const [secretaryMinutes, setSecretaryMinutes] = useState('');

  useEffect(() => {
    // Load rubrics - using SAMPLE_RUBRICS from dataset as fallback for localStorage
    const loadRubrics = () => {
      try {
        const savedRubrics = typeof localStorage !== 'undefined' ? localStorage.getItem('rubrics') : null;
        let allRubrics = savedRubrics ? JSON.parse(savedRubrics) : SAMPLE_RUBRICS;
        
        const currentStage = group.stage || group.defenseStage || group.defense_type || 'Title Defense';
        const stageMap = {
          'Title Defense': 'proposal',
          'Review Defense': 'pre-final',
          'Final Defense': 'final'
        };
        const mappedStage = stageMap[currentStage] || currentStage;
        
        const stageRubrics = allRubrics.filter((r) => r.stage === mappedStage || r.stage === currentStage);
        setRubrics(stageRubrics);

        // Initialize scores if not already set
        const initialScores = {};
        stageRubrics.forEach((rubric) => {
          rubric.criteria.forEach((criterion) => {
            initialScores[criterion.id] = 0;
          });
        });
        setScores((prev) => ({ ...initialScores, ...prev }));
      } catch (e) {
        console.error('Error loading rubrics:', e);
      }
    };

    loadRubrics();

    // Load existing evaluation if present
    const existingEval = group.evaluations?.find((e) => e.panelistName === currentUser.name);
    if (existingEval) {
      setScores(existingEval.scores || {});
      setComments(existingEval.comments || {});
      setGeneralComments(existingEval.generalComments || '');
    }

    // Load secretary minutes
    if (group.secretaryMinutes) {
      setSecretaryMinutes(group.secretaryMinutes);
    }
  }, [group, currentUser]);

  const getStageLabel = (stage) => {
    const labels = {
      proposal: 'Title Defense',
      'pre-final': 'Review Defense',
      final: 'Final Defense',
    };
    return labels[stage] || stage;
  };

  const handleScoreChange = (criterionId, value) => {
    setScores((prev) => ({
      ...prev,
      [criterionId]: value,
    }));
  };

  const handleCommentChange = (criterionId, value) => {
    setComments((prev) => ({
      ...prev,
      [criterionId]: value,
    }));
  };

  const calculateTotalScore = () => {
    return Object.values(scores).reduce((sum, score) => sum + (parseFloat(score) || 0), 0);
  };

  const handleSaveDraft = () => {
    // Save to simulated legacy system (localStorage)
    try {
      const groups = JSON.parse(typeof localStorage !== 'undefined' ? localStorage.getItem('research_groups') || '[]' : '[]');
      const groupIndex = groups.findIndex((g) => g.id === group.id);
      
      const evaluation = {
        panelistName: currentUser.name,
        scores,
        comments,
        generalComments,
        totalScore: calculateTotalScore(),
        status: 'draft',
        updatedAt: new Date().toISOString(),
      };

      if (groupIndex !== -1) {
        if (!groups[groupIndex].evaluations) groups[groupIndex].evaluations = [];
        const evalIndex = groups[groupIndex].evaluations.findIndex((e) => e.panelistName === currentUser.name);
        if (evalIndex !== -1) groups[groupIndex].evaluations[evalIndex] = evaluation;
        else groups[groupIndex].evaluations.push(evaluation);
        if (typeof localStorage !== 'undefined') localStorage.setItem('research_groups', JSON.stringify(groups));
      }
      
      Alert.alert('Success', 'Draft saved successfully!');
    } catch (e) {
      console.error('Save Draft Error:', e);
    }
  };

  const handleSubmit = () => {
    const total = calculateTotalScore();
    if (total === 0) {
      Alert.alert('Error', 'Please provide scores before submitting.');
      return;
    }

    // Submit logic
    const evaluation = {
      panelistName: currentUser.name,
      scores,
      comments,
      generalComments,
      totalScore: total,
      status: 'submitted',
      submittedAt: new Date().toISOString(),
    };

    // Save to workflow system
    submitPanelistEvaluation({
      ...evaluation,
      id: `eval-${Date.now()}-${currentUser.id}`,
      bookingId: group.bookingId,
      groupId: group.id,
      panelistId: currentUser.id,
      defenseType: getStageLabel(group.defenseStage),
    });

    Alert.alert('Success', 'Evaluation submitted successfully!');
    onBack();
  };



  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Pressable onPress={onBack} style={styles.backBtn}>
            <ArrowLeft size={20} color="#4b5563" />
            <Text style={styles.backBtnText}>Back to My Evaluations</Text>
          </Pressable>
        </View>
        
        <View style={styles.groupInfoRow}>
          <View style={styles.iconContainer}>
            <FileText size={32} color="#2563eb" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.researchTitle}>{group.researchTitle}</Text>
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}><Text style={styles.infoLabel}>Program: </Text><Text style={styles.infoValue}>{group.program}</Text></View>
              <View style={styles.infoItem}><Text style={styles.infoLabel}>Stage: </Text><Text style={styles.infoValue}>{getStageLabel(group.defenseStage)}</Text></View>
              <View style={styles.infoItem}><Text style={styles.infoLabel}>Adviser: </Text><Text style={styles.infoValue}>{group.adviser}</Text></View>
              <View style={styles.infoItem}><Text style={styles.infoLabel}>Date: </Text><Text style={styles.infoValue}>{format(new Date(group.defenseDate), 'MMMM d, yyyy')}</Text></View>
            </View>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          <Pressable
            onPress={() => setActiveTab('evaluation')}
            style={[styles.tabBtn, activeTab === 'evaluation' && styles.tabBtnEvalActive]}
          >
            <ClipboardList size={18} color={activeTab === 'evaluation' ? '#ffffff' : '#4b5563'} />
            <Text style={[styles.tabBtnText, activeTab === 'evaluation' && styles.tabBtnTextActive]}>Evaluation</Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab('rubrics')}
            style={[styles.tabBtn, activeTab === 'rubrics' && styles.tabBtnRubricActive]}
          >
            <BookOpen size={18} color={activeTab === 'rubrics' ? '#ffffff' : '#4b5563'} />
            <Text style={[styles.tabBtnText, activeTab === 'rubrics' && styles.tabBtnTextActive]}>Rubrics</Text>
          </Pressable>
          {secretaryMinutes ? (
            <Pressable
              onPress={() => setActiveTab('minutes')}
              style={[styles.tabBtn, activeTab === 'minutes' && styles.tabBtnMinutesActive]}
            >
              <Eye size={18} color={activeTab === 'minutes' ? '#ffffff' : '#4b5563'} />
              <Text style={[styles.tabBtnText, activeTab === 'minutes' && styles.tabBtnTextActive]}>Minutes</Text>
            </Pressable>
          ) : null}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeTab === 'evaluation' && (
          <View style={styles.tabPanel}>
            <Text style={styles.panelTitle}>Provide Your Evaluation</Text>
            
            {rubrics.length === 0 ? (
              <View style={styles.emptyState}>
                <ClipboardList size={48} color="#9ca3af" />
                <Text style={styles.emptyText}>No evaluation criteria available.</Text>
              </View>
            ) : (
              <View style={styles.evaluationContent}>
                {rubrics.map((rubric) => (
                  <View key={rubric.id} style={styles.rubricSection}>
                    {rubric.criteria.map((criterion, cIdx) => {
                      const selectedScore = scores[criterion.id] || 0;
                      const max = criterion.maxScore;
                      
                      const getOptions = () => {
                        const opts = [
                          { label: 'Excellent', pct: 1 },
                          { label: 'Good', pct: 0.75 },
                          { label: 'Satisfactory', pct: 0.5 },
                          { label: 'Needs Imp.', pct: 0.25 }
                        ];
                        return opts.map(o => ({
                          score: Math.round(max * o.pct),
                          label: o.label,
                          desc: o.label === 'Excellent' ? 'Exceptional quality' : 'Standard quality'
                        }));
                      };

                      return (
                        <View key={criterion.id} style={styles.criterionCard}>
                          <View style={styles.criterionHeader}>
                            <View style={{ flex: 1 }}>
                              <View style={styles.chapterBadge}>
                                <Text style={styles.chapterBadgeText}>Criterion {cIdx + 1}</Text>
                              </View>
                              <Text style={styles.criterionName}>{criterion.name}</Text>
                              <Text style={styles.criterionDesc}>{criterion.description || 'Provide detailed feedback for this section.'}</Text>
                            </View>
                            <View style={styles.scoreDisplay}>
                              <Text style={styles.scoreText}>{selectedScore}<Text style={styles.maxScoreText}>/{max}</Text></Text>
                            </View>
                          </View>

                          <View style={styles.optionsGrid}>
                            {getOptions().map((opt) => (
                              <Pressable
                                key={opt.score}
                                onPress={() => handleScoreChange(criterion.id, opt.score)}
                                style={[
                                  styles.optionBtn,
                                  selectedScore === opt.score && styles.optionBtnActive,
                                ]}
                              >
                                <Text style={[styles.optionScore, selectedScore === opt.score && styles.optionTextActive]}>{opt.score}</Text>
                                <Text style={[styles.optionLabel, selectedScore === opt.score && styles.optionTextActive]}>{opt.label}</Text>
                              </Pressable>
                            ))}
                          </View>

                          <Text style={styles.label}>Comments and Feedback</Text>
                          <TextInput
                            style={styles.commentInput}
                            value={comments[criterion.id] || ''}
                            onChangeText={(val) => handleCommentChange(criterion.id, val)}
                            placeholder="Provide specific feedback..."
                            multiline
                            numberOfLines={3}
                          />
                        </View>
                      );
                    })}
                  </View>
                ))}

                <View style={styles.generalCommentsBox}>
                  <Text style={styles.panelTitleSmall}>General Comments & Recommendations</Text>
                  <TextInput
                    style={styles.generalInput}
                    value={generalComments}
                    onChangeText={setGeneralComments}
                    placeholder="Provide overall feedback..."
                    multiline
                    numberOfLines={5}
                  />
                </View>

                <View style={styles.totalScoreBox}>
                  <Text style={styles.totalLabel}>Total Score:</Text>
                  <Text style={styles.totalValue}>{calculateTotalScore().toFixed(1)}</Text>
                </View>

                <View style={styles.actionsRow}>
                  <Pressable onPress={handleSaveDraft} style={[styles.actionBtn, styles.draftBtn]}>
                    <Save size={20} color="#ffffff" />
                    <Text style={styles.actionBtnText}>Save as Draft</Text>
                  </Pressable>
                  <Pressable onPress={handleSubmit} style={[styles.actionBtn, styles.submitBtn]}>
                    <Send size={20} color="#ffffff" />
                    <Text style={styles.actionBtnText}>Submit Evaluation</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        )}
        {activeTab === 'rubrics' && (
          <View style={styles.tabPanel}>
            <Text style={styles.panelTitle}>Evaluation Rubrics - {getStageLabel(group.defenseStage)}</Text>
            <Text style={styles.panelSub}>View the evaluation criteria for this defense stage. Rubrics are fixed and cannot be modified.</Text>
            
            {rubrics.length === 0 ? (
              <View style={styles.emptyState}>
                <BookOpen size={48} color="#9ca3af" />
                <Text style={styles.emptyText}>No rubrics available for this defense stage.</Text>
              </View>
            ) : (
              rubrics.map((rubric, idx) => (
                <View key={idx} style={styles.rubricContainer}>
                  <View style={styles.rubricHeader}>
                    <Text style={styles.rubricHeaderText}>{rubric.name}</Text>
                  </View>
                  <View style={styles.rubricContent}>
                    <View style={styles.tableHeader}>
                      <Text style={[styles.tableCell, styles.tableCellLabel, styles.headerCellText]}>Criterion</Text>
                      <Text style={[styles.tableCell, styles.tableCellPoints, styles.headerCellText]}>Max</Text>
                      <Text style={[styles.tableCell, styles.tableCellDesc, styles.headerCellText]}>Description</Text>
                    </View>
                    {rubric.criteria.map((c) => (
                      <View key={c.id} style={styles.tableRow}>
                        <Text style={[styles.tableCell, styles.tableCellLabel]}>{c.name}</Text>
                        <Text style={[styles.tableCell, styles.tableCellPoints]}>{c.maxScore}</Text>
                        <Text style={[styles.tableCell, styles.tableCellDesc]}>{c.description || 'N/A'}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))
            )}
          </View>
        )}
        {activeTab === 'minutes' && (
          <View style={styles.tabPanel}>
            <View style={styles.panelHeaderRow}>
              <Eye size={24} color="#7c3aed" />
              <Text style={styles.panelTitle}>Secretary's Minutes (View Only)</Text>
            </View>
            <View style={styles.minutesBox}>
              <Text style={styles.minutesText}>{secretaryMinutes}</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { backgroundColor: '#ffffff', padding: 20, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  headerTop: { marginBottom: 16 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  backBtnText: { color: '#4b5563', fontSize: 14, fontWeight: '600' },
  groupInfoRow: { flexDirection: 'row', gap: 20 },
  iconContainer: { width: 64, height: 64, borderRadius: 12, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center' },
  researchTitle: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 12 },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  infoItem: { flexDirection: 'row', backgroundColor: '#f3f4f6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  infoLabel: { color: '#6b7280', fontSize: 12, fontWeight: '600' },
  infoValue: { color: '#1f2937', fontSize: 12, fontWeight: '700' },
  tabsContainer: { backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  tabsScroll: { padding: 12, gap: 8 },
  tabBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, backgroundColor: '#f3f4f6' },
  tabBtnEvalActive: { backgroundColor: '#2563eb' },
  tabBtnRubricActive: { backgroundColor: '#9333ea' },
  tabBtnMinutesActive: { backgroundColor: '#059669' },
  tabBtnText: { fontSize: 14, fontWeight: '700', color: '#4b5563' },
  tabBtnTextActive: { color: '#ffffff' },
  scrollContent: { padding: 20 },
  tabPanel: { gap: 20 },
  panelTitle: { fontSize: 22, fontWeight: '800', color: '#111827' },
  panelTitleSmall: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 12 },
  panelSub: { fontSize: 14, color: '#6b7280' },
  panelHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  emptyState: { padding: 48, alignItems: 'center', gap: 12 },
  emptyText: { color: '#9ca3af', textAlign: 'center' },
  rubricContainer: { borderRadius: 16, overflow: 'hidden', backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb' },
  rubricHeader: { backgroundColor: '#6366f1', padding: 16 },
  rubricHeaderText: { color: '#ffffff', fontWeight: '800', fontSize: 18 },
  rubricContent: { padding: 0 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f8fafc', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', padding: 12 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', padding: 12 },
  tableCell: { fontSize: 13, color: '#1e293b' },
  headerCellText: { fontWeight: '800', color: '#475569' },
  tableCellLabel: { flex: 2, fontWeight: '700' },
  tableCellPoints: { flex: 0.5, textAlign: 'center', fontWeight: '800' },
  tableCellDesc: { flex: 3, color: '#64748b' },
  minutesBox: { padding: 20, backgroundColor: '#f8fafc', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  minutesText: { color: '#334155', lineHeight: 22 },
  evaluationContent: { gap: 24 },
  rubricSection: { gap: 16 },
  criterionCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#e5e7eb' },
  criterionHeader: { flexDirection: 'row', gap: 16, marginBottom: 20 },
  chapterBadge: { backgroundColor: '#2563eb', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginBottom: 8 },
  chapterBadgeText: { color: '#ffffff', fontSize: 10, fontWeight: '800' },
  criterionName: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 4 },
  criterionDesc: { fontSize: 13, color: '#6b7280' },
  scoreDisplay: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, alignItems: 'center', justifyContent: 'center', minWidth: 80 },
  scoreText: { fontSize: 22, fontWeight: '800', color: '#111827' },
  maxScoreText: { color: '#9ca3af', fontSize: 14 },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  optionBtn: { flex: 1, minWidth: '45%', padding: 12, borderRadius: 12, borderWidth: 2, borderColor: '#e5e7eb', backgroundColor: '#ffffff', alignItems: 'center' },
  optionBtnActive: { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  optionScore: { fontSize: 24, fontWeight: '900', color: '#2563eb', marginBottom: 4 },
  optionLabel: { fontSize: 12, fontWeight: '700', color: '#4b5563' },
  optionTextActive: { color: '#1d4ed8' },
  label: { fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 8 },
  commentInput: { backgroundColor: '#f9fafb', borderRadius: 12, borderWidth: 1, borderColor: '#d1d5db', padding: 12, textAlignVertical: 'top', minHeight: 80 },
  generalCommentsBox: { backgroundColor: '#f9fafb', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#e5e7eb' },
  generalInput: { backgroundColor: '#ffffff', borderRadius: 12, borderWidth: 1, borderColor: '#d1d5db', padding: 16, textAlignVertical: 'top', minHeight: 120 },
  totalScoreBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#eff6ff', borderRadius: 16, padding: 24, borderWidth: 1, borderColor: '#bfdbfe' },
  totalLabel: { fontSize: 20, fontWeight: '800', color: '#111827' },
  totalValue: { fontSize: 36, fontWeight: '900', color: '#2563eb' },
  actionsRow: { flexDirection: 'row', gap: 12 },
  actionBtn: { flex: 1, height: 56, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  draftBtn: { backgroundColor: '#4b5563' },
  submitBtn: { backgroundColor: '#059669' },
  actionBtnText: { color: '#ffffff', fontWeight: '800', fontSize: 16 },
});

