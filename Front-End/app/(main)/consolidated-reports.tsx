import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/theme/colors';
import { Typography } from '../../src/theme/typography';
import { useAppData, GeneratedReport } from '../../src/context/AppDataContext';

function getGradeColor(score: number): string {
  if (score >= 90) return '#166534';
  if (score >= 80) return '#1E40AF';
  if (score >= 70) return '#854D0E';
  if (score >= 60) return '#92400E';
  return '#991B1B';
}

function getGradeBg(score: number): string {
  if (score >= 90) return '#DCFCE7';
  if (score >= 80) return '#DBEAFE';
  if (score >= 70) return '#FEF9C3';
  if (score >= 60) return '#FEF3C7';
  return '#FEE2E2';
}

function ReportCard({ report }: { report: GeneratedReport }) {
  const router = useRouter();
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        router.push(`/(main)/consolidated-reports-generation?id=${report.groupId}`)
      }
      accessibilityRole="button"
      accessibilityLabel={`View report for ${report.groupTitle}`}
    >
      {/* Card header */}
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle} numberOfLines={2}>{report.groupTitle}</Text>
          <Text style={styles.cardStage}>{report.stage}</Text>
        </View>
        <View style={[styles.gradeBadge, { backgroundColor: getGradeBg(report.totalFinalGrade) }]}>
          <Text style={[styles.gradeScore, { color: getGradeColor(report.totalFinalGrade) }]}>
            {report.totalFinalGrade}
          </Text>
          <Text style={[styles.gradeLabel, { color: getGradeColor(report.totalFinalGrade) }]}>
            {report.gradeLabel}
          </Text>
        </View>
      </View>

      {/* Info rows */}
      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Ionicons name="people-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.infoText}>{report.members.join(', ')}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.infoText}>{report.adviser}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="school-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.infoText}>{report.program}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.infoText}>Defense: {report.defenseDate}</Text>
        </View>
      </View>

      {/* Panelists table */}
      <View style={styles.evalSection}>
        <Text style={styles.evalSectionTitle}>Panelist Evaluations</Text>
        <View style={styles.evalTableHeader}>
          <Text style={[styles.evalTh, { flex: 2 }]}>Panelist</Text>
          <Text style={[styles.evalTh, { flex: 1, textAlign: 'center' }]}>Grade</Text>
          <Text style={[styles.evalTh, { flex: 3 }]}>Remarks</Text>
        </View>
        {report.panelists.map((p, idx) => (
          <View key={idx} style={[styles.evalRow, idx % 2 === 1 && { backgroundColor: '#F9FAFB' }]}>
            <View style={[{ flex: 2 }, styles.evalCell]}>
              <Text style={styles.evalName}>{p.name}</Text>
              {p.isChair && (
                <View style={styles.chairBadge}>
                  <Text style={styles.chairBadgeText}>Chair</Text>
                </View>
              )}
            </View>
            <View style={[{ flex: 1 }, styles.evalCell, { alignItems: 'center' }]}>
              <View style={[styles.scorePill, { backgroundColor: getGradeBg(p.score) }]}>
                <Text style={[styles.scoreNum, { color: getGradeColor(p.score) }]}>{p.score}</Text>
              </View>
            </View>
            <Text style={[styles.evalRemarks, { flex: 3 }]}>{p.remarks}</Text>
          </View>
        ))}
      </View>

      {/* Footer */}
      <View style={styles.cardFooter}>
        {/* Verdict */}
        <View style={styles.verdictRow}>
          <Ionicons name="ribbon-outline" size={14} color="#DC2626" />
          <Text style={styles.verdictLabel}>Chair Verdict:</Text>
          <View style={[
            styles.verdictPill,
            { backgroundColor: report.chairApproved ? '#DCFCE7' : '#FEE2E2' }
          ]}>
            <Text style={[
              styles.verdictPillText,
              { color: report.chairApproved ? '#166534' : '#991B1B' }
            ]}>
              {report.chairApproved ? 'Approved' : 'Requires Revision'}
            </Text>
          </View>
        </View>
        {/* Date */}
        <View style={styles.dateRow}>
          <Ionicons name="time-outline" size={13} color={Colors.textSecondary} />
          <Text style={styles.dateText}>Finalized: {report.dateFinalized}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function ConsolidatedReportsScreen() {
  const { reports } = useAppData();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      accessible
      accessibilityLabel="Consolidated Reports page"
    >
      <Text style={styles.pageTitle}>Consolidated Reports</Text>
      <Text style={styles.pageSubtitle}>
        All generated evaluation reports appear here.
      </Text>

      {reports.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="document-outline" size={64} color={Colors.textSecondary} />
          <Text style={styles.emptyTitle}>No Reports Yet</Text>
          <Text style={styles.emptyBody}>
            Generate a report from a research group's evaluation to see it here.
          </Text>
        </View>
      ) : (
        <View style={styles.reportList}>
          {reports.map((r) => (
            <ReportCard key={r.id} report={r} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.pageBg },
  content: { padding: 24, paddingBottom: 48 },

  pageTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize['2xl'],
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: 24,
  },

  reportList: { gap: 20 },

  // Card
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#F8FAFC',
  },
  cardTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.md,
    color: Colors.textPrimary,
    lineHeight: 22,
    marginBottom: 4,
  },
  cardStage: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.xs,
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  gradeBadge: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: 'center',
    minWidth: 72,
  },
  gradeScore: { fontFamily: Typography.fontFamily.bold, fontSize: 22, lineHeight: 26 },
  gradeLabel: { fontFamily: Typography.fontFamily.semiBold, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.4, marginTop: 2 },

  // Info
  cardBody: { padding: 16, gap: 6, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  infoText: { fontFamily: Typography.fontFamily.regular, fontSize: 13, color: Colors.textPrimary, flex: 1, lineHeight: 20 },

  // Eval table
  evalSection: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  evalSectionTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 12,
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  evalTableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  evalTh: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 11,
    color: '#6B7280',
    paddingHorizontal: 16,
    paddingVertical: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  evalRow: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F3F4F6', alignItems: 'center' },
  evalCell: { paddingHorizontal: 16, paddingVertical: 10, justifyContent: 'center' },
  evalName: { fontFamily: Typography.fontFamily.semiBold, fontSize: 13, color: Colors.textPrimary, marginBottom: 3 },
  chairBadge: { backgroundColor: '#FEE2E2', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1, alignSelf: 'flex-start' },
  chairBadgeText: { fontFamily: Typography.fontFamily.bold, fontSize: 9, color: '#991B1B', textTransform: 'uppercase' },
  scorePill: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, alignItems: 'center' },
  scoreNum: { fontFamily: Typography.fontFamily.bold, fontSize: 15 },
  evalRemarks: { fontFamily: Typography.fontFamily.regular, fontSize: 12, color: '#374151', lineHeight: 18, fontStyle: 'italic', paddingHorizontal: 16, paddingVertical: 10 },

  // Footer
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    backgroundColor: '#F9FAFB',
    flexWrap: 'wrap',
    gap: 8,
  },
  verdictRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  verdictLabel: { fontFamily: Typography.fontFamily.semiBold, fontSize: 12, color: '#374151' },
  verdictPill: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 },
  verdictPillText: { fontFamily: Typography.fontFamily.bold, fontSize: 12 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dateText: { fontFamily: Typography.fontFamily.regular, fontSize: 12, color: Colors.textSecondary },

  // Empty
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 16 },
  emptyTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.xl,
    color: Colors.textPrimary,
  },
  emptyBody: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 320,
  },
});
