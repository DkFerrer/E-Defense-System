import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { mockResearchGroups, mockPanelistEvaluations } from '../../src/data/mockData';
import { Colors } from '../../src/theme/colors';
import { Typography } from '../../src/theme/typography';
import StatusBadge from '../../src/components/StatusBadge';
import { useAppData } from '../../src/context/AppDataContext';

function getScoreColor(score: number, max?: number): string {
  const ratio = max ? score / max : score / 100;
  if (ratio >= 0.9) return '#16a34a';
  if (ratio >= 0.7) return '#2563eb';
  if (ratio >= 0.5) return '#d97706';
  return '#dc2626';
}

function getScoreBgColor(score: number, max: number): string {
  const ratio = score / max;
  if (ratio >= 0.9) return '#DCFCE7';
  if (ratio >= 0.7) return '#DBEAFE';
  if (ratio >= 0.5) return '#FEF9C3';
  return '#FEE2E2';
}

function getScoreTextColor(score: number, max: number): string {
  const ratio = score / max;
  if (ratio >= 0.9) return '#166534';
  if (ratio >= 0.7) return '#1E40AF';
  if (ratio >= 0.5) return '#854D0E';
  return '#991B1B';
}



export default function ResearchGroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  const group = mockResearchGroups.find((g) => g.id === id);
  const evaluations = id ? (mockPanelistEvaluations[id] ?? []) : [];
  const avgScore = evaluations.length
    ? Math.round(evaluations.reduce((sum, e) => sum + e.totalScore, 0) / evaluations.length)
    : 0;
  const [activeTab, setActiveTab] = useState(0);
  const { logActivity } = useAppData();

  useEffect(() => {
    if (group) {
      logActivity(
        'Viewed Group Details',
        `Opened evaluation details for "${group.title}"`,
        'eye-outline',
        '#7C3AED',
      );
    }
  }, [id]);

  if (!group) {
    return (
      <View style={styles.container}>
        <View style={styles.notFound}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.textSecondary} />
          <Text style={styles.notFoundText}>Research group not found.</Text>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={18} color="#fff" />
            <Text style={styles.primaryBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Back button */}
      <TouchableOpacity
        style={styles.backRow}
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel="Go back to Research Groups"
      >
        <Ionicons name="arrow-back" size={20} color={Colors.btnPrimaryBg} />
        <Text style={styles.backText}>Back to Research Groups</Text>
      </TouchableOpacity>

      {/* Title + score summary */}
      <View style={styles.card}>
        <View style={styles.titleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title} accessibilityRole="header">{group.title}</Text>
          </View>
          <StatusBadge stage={group.stage} />
        </View>

        <View style={[styles.scoreGrid, isWide && { flexDirection: 'row' }]}>
          <View style={[styles.scoreBox, { backgroundColor: '#F0F9FF', borderColor: '#BFDBFE' }]}>
            <Text style={styles.scoreBoxLabel}>Overall Score</Text>
            <Text style={[styles.scoreBoxValue, { color: getScoreColor(group.score) }]}>{group.score}/100</Text>
          </View>
          {evaluations.length > 0 && (
            <View style={[styles.scoreBox, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
              <Text style={styles.scoreBoxLabel}>Panelist Average</Text>
              <Text style={[styles.scoreBoxValue, { color: getScoreColor(avgScore) }]}>{avgScore}/100</Text>
            </View>
          )}
          <View style={[styles.scoreBox, { backgroundColor: '#FFF7ED', borderColor: '#FED7AA' }]}>
            <Text style={styles.scoreBoxLabel}>Panelists</Text>
            <Text style={[styles.scoreBoxValue, { color: '#d97706' }]}>{evaluations.length}</Text>
          </View>
        </View>
      </View>

      {/* Group Information */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Group Information</Text>

        <View style={styles.infoRow}>
          <Ionicons name="people-outline" size={18} color={Colors.textSecondary} style={styles.infoIcon} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Members</Text>
            <Text style={styles.infoValue}>{group.members.join(', ')}</Text>
          </View>
        </View>
        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={18} color={Colors.textSecondary} style={styles.infoIcon} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Adviser</Text>
            <Text style={styles.infoValue}>{group.adviser}</Text>
          </View>
        </View>
        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Ionicons name="school-outline" size={18} color={Colors.textSecondary} style={styles.infoIcon} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Program</Text>
            <Text style={styles.infoValue}>{group.program}</Text>
          </View>
        </View>
        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Ionicons name="business-outline" size={18} color={Colors.textSecondary} style={styles.infoIcon} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Department</Text>
            <Text style={styles.infoValue}>{group.department}</Text>
          </View>
        </View>
        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={18} color={Colors.textSecondary} style={styles.infoIcon} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Defense Date</Text>
            <Text style={styles.infoValue}>{group.defenseDate}</Text>
          </View>
        </View>
      </View>

      {/* Panelist Evaluations */}
      <Text style={styles.sectionTitle}>Panelist Evaluations</Text>

      {evaluations.length === 0 ? (
        <View style={styles.card}>
          <View style={styles.placeholder}>
            <Ionicons name="clipboard-outline" size={40} color={Colors.textSecondary} />
            <Text style={styles.placeholderText}>No panelist evaluations available yet.</Text>
          </View>
        </View>
      ) : (
        <>
          {/* Tab bar */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabScrollView}
            contentContainerStyle={styles.tabBar}
          >
            {evaluations.map((ev, idx) => {
              const isActive = idx === activeTab;
              return (
                <TouchableOpacity
                  key={ev.panelist}
                  style={[
                    styles.tab,
                    isActive && styles.tabActive,
                  ]}
                  onPress={() => setActiveTab(idx)}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: isActive }}
                  accessibilityLabel={`${ev.panelist} evaluation tab`}
                >
                  <View style={[styles.tabAvatar, isActive && styles.tabAvatarActive]}>
                    <Text style={[styles.tabAvatarText, isActive && styles.tabAvatarTextActive]}>
                      {ev.panelist.replace('Dr. ', '').charAt(0)}
                    </Text>
                  </View>
                  <Text
                    style={[styles.tabLabel, isActive && styles.tabLabelActive]}
                    numberOfLines={1}
                  >
                    {ev.panelist}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Active panelist evaluation content */}
          {(() => {
            const ev = evaluations[activeTab];
            if (!ev) return null;
            return (
              <View style={styles.evalContainer}>
                {/* Gradient-style header */}
                <View style={styles.evalGradientHeader}>
                  <Text style={styles.evalHeaderName}>{ev.panelist}</Text>
                  <Text style={styles.evalHeaderScore}>Total Score: {ev.totalScore}/100</Text>
                </View>

                {/* Rubric content */}
                <View style={styles.evalBody}>
                  <Text style={styles.rubricTitle}>PROJECT DOCUMENTATION AND MANUSCRIPT</Text>

                  {ev.chapters.map((chapter, chapterIdx) => {
                    const chapterTotal = chapter.criteria.reduce((s, c) => s + c.score, 0);
                    const chapterMax = chapter.criteria.reduce((s, c) => s + c.maxPoints, 0);
                    return (
                      <View key={chapterIdx} style={styles.chapterBlock}>
                        {/* Chapter header */}
                        <View style={styles.chapterHeader}>
                          <Text style={styles.chapterHeaderText}>{chapter.chapter}</Text>
                        </View>

                        {/* Table header */}
                        <View style={styles.tableHeaderRow}>
                          <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Criterion</Text>
                          <Text style={[styles.tableHeaderCell, { flex: 0.8, textAlign: 'center' }]}>Points</Text>
                          <Text style={[styles.tableHeaderCell, { flex: 3.5 }]}>Description</Text>
                          <Text style={[styles.tableHeaderCell, { flex: 0.8, textAlign: 'center' }]}>Score</Text>
                          <Text style={[styles.tableHeaderCell, { flex: 3 }]}>Comment</Text>
                        </View>

                        {/* Criteria rows */}
                        {chapter.criteria.map((criterion, cIdx) => (
                          <View key={cIdx} style={[styles.tableRow, cIdx % 2 === 1 && styles.tableRowAlt]}>
                            <Text style={[styles.tableCellBold, { flex: 2 }]}>{criterion.criterion}</Text>
                            <Text style={[styles.tableCellCenter, { flex: 0.8 }]}>{criterion.maxPoints}</Text>
                            <Text style={[styles.tableCellDesc, { flex: 3.5 }]}>{criterion.description}</Text>
                            <View style={[styles.tableCellScoreWrap, { flex: 0.8 }]}>
                              <View style={[
                                styles.scoreBadge,
                                { backgroundColor: getScoreBgColor(criterion.score, criterion.maxPoints) }
                              ]}>
                                <Text style={[
                                  styles.scoreBadgeText,
                                  { color: getScoreTextColor(criterion.score, criterion.maxPoints) }
                                ]}>
                                  {criterion.score}
                                </Text>
                              </View>
                            </View>
                            <Text style={[styles.tableCellComment, { flex: 3 }]}>{criterion.comment}</Text>
                          </View>
                        ))}

                        {/* Chapter total row */}
                        <View style={styles.chapterTotalRow}>
                          <Text style={[styles.chapterTotalLabel, { flex: 3.5 }]}>Chapter Total</Text>
                          <Text style={[styles.chapterTotalMax, { flex: 5 }]}>Max: {chapterMax} points</Text>
                          <View style={[styles.tableCellScoreWrap, { flex: 1 }]}>
                            <View style={styles.chapterTotalBadge}>
                              <Text style={styles.chapterTotalBadgeText}>{chapterTotal}</Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    );
                  })}

                  {/* Comments */}
                  {ev.comments ? (
                    <View style={styles.evalCommentBox}>
                      <Text style={styles.evalCommentTitle}>Panelist Comments:</Text>
                      <Text style={styles.evalComment}>{ev.comments}</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            );
          })()}

          {/* Action buttons */}
          {evaluations.length > 0 && (
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => router.back()}
                accessibilityRole="button"
                accessibilityLabel="Go back"
              >
                <Ionicons name="arrow-back" size={18} color="#374151" />
                <Text style={styles.backBtnText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.compileBtn}
                onPress={() => {
                  logActivity(
                    'Compile Evaluations',
                    `Clicked "Compile All Evaluations" for "${group.title}"`,
                    'documents-outline',
                    '#2563EB',
                  );
                  router.push(`/(main)/consolidated-reports-generation?id=${id}`);
                }}
                accessibilityRole="button"
                accessibilityLabel="Compile all evaluations"
              >
                <Ionicons name="documents-outline" size={18} color="#fff" />
                <Text style={styles.compileBtnText}>Compile All Evaluations</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.pageBg },
  content: { padding: 24, paddingBottom: 40 },

  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
    minHeight: 44,
  },
  backText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.base,
    color: Colors.btnPrimaryBg,
  },

  card: {
    backgroundColor: Colors.cardBg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 12,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 20,
  },
  title: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.xl,
    color: Colors.textPrimary,
  },

  scoreGrid: {
    gap: 12,
  },
  scoreBox: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
    gap: 4,
  },
  scoreBoxLabel: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scoreBoxValue: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize['2xl'],
  },

  sectionTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.md,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 10,
  },
  infoIcon: { marginTop: 2 },
  infoContent: { flex: 1 },
  infoLabel: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  infoValue: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
  },

  // Tab bar
  tabScrollView: {
    marginBottom: 16,
    flexGrow: 0,
  },
  tabBar: {
    flexDirection: 'row',
    gap: 0,
    backgroundColor: Colors.cardBg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 4,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: Colors.btnPrimaryBg,
  },
  tabAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabAvatarActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  tabAvatarText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },
  tabAvatarTextActive: {
    color: '#fff',
  },
  tabLabel: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  tabLabelActive: {
    fontFamily: Typography.fontFamily.semiBold,
    color: '#fff',
  },

  // Evaluation container
  evalContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Colors.cardBg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 20,
  },
  evalGradientHeader: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  evalHeaderName: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 20,
    color: '#fff',
  },
  evalHeaderScore: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 22,
    color: '#fff',
  },
  evalBody: {
    padding: 24,
  },
  rubricTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
    textTransform: 'uppercase',
    marginBottom: 20,
  },

  // Chapter
  chapterBlock: {
    marginBottom: 24,
  },
  chapterHeader: {
    backgroundColor: '#111827',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 0,
  },
  chapterHeaderText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.sm,
    color: '#fff',
  },

  // Table
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderLeftColor: '#D1D5DB',
    borderRightColor: '#D1D5DB',
  },
  tableHeaderCell: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 12,
    color: '#374151',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderLeftColor: '#D1D5DB',
    borderRightColor: '#D1D5DB',
    backgroundColor: '#fff',
  },
  tableRowAlt: {
    backgroundColor: '#FAFAFA',
  },
  tableCellBold: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 13,
    color: '#1F2937',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tableCellCenter: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 13,
    color: '#1F2937',
    paddingHorizontal: 16,
    paddingVertical: 12,
    textAlign: 'center',
  },
  tableCellDesc: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 12,
    color: '#4B5563',
    paddingHorizontal: 16,
    paddingVertical: 12,
    lineHeight: 18,
  },
  tableCellScoreWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  scoreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  scoreBadgeText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 14,
  },
  tableCellComment: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 12,
    color: '#4B5563',
    paddingHorizontal: 16,
    paddingVertical: 12,
    lineHeight: 18,
    fontStyle: 'italic',
  },

  // Chapter total
  chapterTotalRow: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderLeftColor: '#D1D5DB',
    borderRightColor: '#D1D5DB',
  },
  chapterTotalLabel: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 13,
    color: '#1F2937',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  chapterTotalMax: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 13,
    color: '#1F2937',
    paddingHorizontal: 16,
    paddingVertical: 12,
    textAlign: 'right',
  },
  chapterTotalBadge: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  chapterTotalBadgeText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 14,
    color: '#fff',
  },

  // Comments
  evalCommentBox: {
    marginTop: 24,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 16,
  },
  evalCommentTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.sm,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  evalComment: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 13,
    color: '#374151',
    lineHeight: 20,
  },

  // Action buttons
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: 8,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 14,
    minHeight: 48,
  },
  backBtnText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.sm,
    color: '#374151',
  },
  compileBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 14,
    minHeight: 48,
  },
  compileBtnText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.sm,
    color: '#fff',
  },

  placeholder: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  placeholderText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 16,
  },
  notFoundText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.btnPrimaryBg,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 44,
  },
  primaryBtnText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.sm,
    color: '#fff',
  },
});
