import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    useWindowDimensions,
    Modal,
    Pressable,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { mockResearchGroups, mockPanelistEvaluations } from '../../src/data/mockData';
import { Colors } from '../../src/theme/colors';
import { Typography } from '../../src/theme/typography';
import { useAppData } from '../../src/context/AppDataContext';
import { saveReport } from '../../src/services/reportService';

function getGradeLabel(score: number): string {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Needs Improvement';
}

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

function getTodayFormatted(): string {
    const now = new Date();
    return now.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

export default function ConsolidatedReportsGenerationScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { width } = useWindowDimensions();
    const { addReport, logActivity, getEvaluationForGroup } = useAppData();
    const [modalState, setModalState] = useState<'hidden' | 'success' | 'error'>('hidden');
    const [apiWarning, setApiWarning] = useState<string | null>(null);

    const group = mockResearchGroups.find((g) => g.id === id);
    const mockEvals = id ? (mockPanelistEvaluations[id] ?? []) : [];

    // If the Panel Chairman submitted an evaluation this session, merge it in
    const liveChairEval = id ? getEvaluationForGroup(id) : undefined;
    const evaluations = liveChairEval
        ? [
              // Live chairman entry (replaces the first mock placeholder)
              {
                  panelist:   liveChairEval.panelist,
                  totalScore: liveChairEval.totalScore,
                  comments:   liveChairEval.comments,
                  approvalDecision: liveChairEval.approvalDecision,
              },
              // Keep the remaining mock panelist rows
              ...mockEvals.slice(1),
          ]
        : mockEvals;

    const totalFinalGrade =
        evaluations.length > 0
            ? Math.round(
                evaluations.reduce((sum, e) => sum + e.totalScore, 0) / evaluations.length
            )
            : 0;

    const chairEval = evaluations[0] ?? null;
    const dateFinalized = getTodayFormatted();

    const getVerdictLabel = (decision?: string) => {
        if (decision === 'approved-no-revisions') return 'Approved — No revisions required';
        if (decision === 'approved-minor-revisions') return 'Approved — Minor revisions required';
        if (decision === 'approved-major-revisions') return 'Approved — Major revisions required';
        if (decision === 'disapproved-redefense') return 'Disapproved — For Redefense';
        return 'Pending Verdict';
    };

    const hasLiveDecision = !!liveChairEval?.approvalDecision;
    const chairApproved = (hasLiveDecision && liveChairEval?.approvalDecision)
        ? !liveChairEval.approvalDecision.includes('disapproved')
        : totalFinalGrade >= 75;

    const chairVerdict = (hasLiveDecision && liveChairEval?.approvalDecision)
        ? getVerdictLabel(liveChairEval.approvalDecision)
        : (totalFinalGrade >= 75 ? 'Approved — Revisions Required' : 'Disapproved — For Redefense');

    const handleGenerateReport = async () => {
        try {
            if (!group) throw new Error('No group found');
            setApiWarning(null);

            const payload = {
                group_id:        group.id,
                groupTitle:      group.title,
                members:         group.members,
                adviser:         group.adviser,
                program:         group.program,
                department:      group.department,
                defenseDate:     group.defenseDate,
                stage:           group.stage,
                totalFinalGrade,
                gradeLabel:      getGradeLabel(totalFinalGrade),
                chairName:       chairEval?.panelist ?? 'N/A',
                chairVerdict:    chairVerdict,
                chairApproved:   chairApproved,
                dateFinalized,
                panelists: evaluations.map((ev, idx) => ({
                    name:    ev.panelist,
                    score:   ev.totalScore,
                    remarks: ev.comments,
                    isChair: idx === 0,
                })),
            };

            // 1. Save to local context (always works offline)
            // addReport expects groupId (camelCase), payload has group_id (snake_case) for API
            addReport({
                id:              `report-${group.id}-${Date.now()}`,
                groupId:         group.id,
                groupTitle:      group.title,
                members:         group.members,
                adviser:         group.adviser,
                program:         group.program,
                department:      group.department,
                defenseDate:     group.defenseDate,
                stage:           group.stage,
                totalFinalGrade,
                gradeLabel:      getGradeLabel(totalFinalGrade),
                chairName:       chairEval?.panelist ?? 'N/A',
                chairVerdict:    chairVerdict,
                chairApproved:   chairApproved,
                dateFinalized,
                panelists: evaluations.map((ev, idx) => ({
                    name:    ev.panelist,
                    score:   ev.totalScore,
                    remarks: ev.comments,
                    isChair: idx === 0,
                })),
            });

            // 2. Log activity
            logActivity(
                'Report Generated',
                `Consolidated report generated for "${group.title}"`,
                'document-text',
                '#0F766E',
            );

            // 3. Persist to MySQL via API (non-blocking — show warning if fails)
            const apiResult = await saveReport(payload);
            if (!apiResult.success) {
                setApiWarning(`Saved locally, but database sync failed: ${apiResult.message}`);
            }

            setModalState('success');
        } catch (e) {
            console.error('Generate report error:', e);
            setModalState('error');
        }
    };

    if (!group) {
        return (
            <View style={styles.center}>
                <Ionicons name="alert-circle-outline" size={48} color={Colors.textSecondary} />
                <Text style={styles.notFoundText}>Research group not found.</Text>
                <TouchableOpacity style={styles.backBtnSm} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={16} color="#fff" />
                    <Text style={styles.backBtnSmText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.rootContainer}>
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>

            {/* ─── Page header ──────────────────────────────────────────── */}
            <TouchableOpacity style={styles.backRow} onPress={() => router.back()} accessibilityRole="button">
                <Ionicons name="arrow-back" size={18} color={Colors.btnPrimaryBg} />
                <Text style={styles.backText}>Back to Group Details</Text>
            </TouchableOpacity>

            <Text style={styles.pageTitle}>Consolidated Evaluation Report</Text>
            <Text style={styles.pageSubtitle}>Defense Stage: {group.stage}</Text>

            {/* ─── 1. Group Information ─────────────────────────────────── */}
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Ionicons name="people" size={18} color="#fff" />
                    <Text style={styles.cardHeaderText}>Group Information</Text>
                </View>

                <View style={styles.infoTable}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Research Title</Text>
                        <Text style={[styles.infoValue, { fontFamily: Typography.fontFamily.semiBold }]}>{group.title}</Text>
                    </View>
                    <View style={styles.infoRowAlt}>
                        <Text style={styles.infoLabel}>Members</Text>
                        <Text style={styles.infoValue}>{group.members.join(', ')}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Adviser</Text>
                        <Text style={styles.infoValue}>{group.adviser}</Text>
                    </View>
                    <View style={styles.infoRowAlt}>
                        <Text style={styles.infoLabel}>Program</Text>
                        <Text style={styles.infoValue}>{group.program}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Department</Text>
                        <Text style={styles.infoValue}>{group.department}</Text>
                    </View>
                    <View style={styles.infoRowAlt}>
                        <Text style={styles.infoLabel}>Defense Date</Text>
                        <Text style={styles.infoValue}>{group.defenseDate}</Text>
                    </View>
                </View>
            </View>

            {/* ─── 2. Individual Panelist Evaluations ───────────────────── */}
            <View style={styles.card}>
                <View style={[styles.cardHeader, { backgroundColor: '#7C3AED' }]}>
                    <Ionicons name="clipboard" size={18} color="#fff" />
                    <Text style={styles.cardHeaderText}>Individual Panelist Evaluations</Text>
                </View>

                {evaluations.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="document-outline" size={40} color={Colors.textSecondary} />
                        <Text style={styles.emptyText}>No evaluations submitted yet.</Text>
                    </View>
                ) : (
                    <View style={styles.evalTable}>
                        {/* Table header */}
                        <View style={styles.evalTableHeader}>
                            <Text style={[styles.evalTh, { flex: 2 }]}>Panelist Name</Text>
                            <Text style={[styles.evalTh, { flex: 1, textAlign: 'center' }]}>Final Grade</Text>
                            <Text style={[styles.evalTh, { flex: 3 }]}>Remarks & Recommendations</Text>
                        </View>

                        {/* Table rows */}
                        {evaluations.map((ev, idx) => {
                            const isChair = idx === 0;
                            return (
                                <View
                                    key={idx}
                                    style={[styles.evalTableRow, idx % 2 === 1 && styles.evalTableRowAlt]}
                                >
                                    {/* Panelist Name */}
                                    <View style={[{ flex: 2 }, styles.evalCell]}>
                                        <Text style={styles.evalPanelistName}>{ev.panelist}</Text>
                                        {isChair && (
                                            <View style={styles.chairBadge}>
                                                <Text style={styles.chairBadgeText}>Panel Chair</Text>
                                            </View>
                                        )}
                                    </View>

                                    {/* Final Grade */}
                                    <View style={[{ flex: 1 }, styles.evalCell, { alignItems: 'center' }]}>
                                        <View style={[styles.gradePill, { backgroundColor: getGradeBg(ev.totalScore) }]}>
                                            <Text style={[styles.gradeScore, { color: getGradeColor(ev.totalScore) }]}>
                                                {ev.totalScore}
                                            </Text>
                                            <Text style={[styles.gradeLabel, { color: getGradeColor(ev.totalScore) }]}>
                                                {getGradeLabel(ev.totalScore)}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Remarks & Recommendations */}
                                    <View style={[{ flex: 3 }, styles.evalCell]}>
                                        <Text style={styles.evalRemarks}>{ev.comments}</Text>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                )}
            </View>

            {/* ─── 3. Total Final Grade ─────────────────────────────────── */}
            <View style={[styles.card, styles.totalCard]}>
                <View style={styles.totalRow}>
                    <View>
                        <Text style={styles.totalLabel}>Total Final Grade</Text>
                        <Text style={styles.totalSub}>Average of all panelist scores</Text>
                    </View>
                    <View style={[styles.totalScoreBox, { backgroundColor: getGradeBg(totalFinalGrade) }]}>
                        <Text style={[styles.totalScore, { color: getGradeColor(totalFinalGrade) }]}>
                            {totalFinalGrade}
                        </Text>
                        <Text style={[styles.totalGradeLabel, { color: getGradeColor(totalFinalGrade) }]}>
                            {getGradeLabel(totalFinalGrade)}
                        </Text>
                    </View>
                </View>
            </View>

            {/* ─── 4. Verdict of Panel Chairman ─────────────────────────── */}
            <View style={styles.card}>
                <View style={[styles.cardHeader, { backgroundColor: '#DC2626' }]}>
                    <Ionicons name="ribbon" size={18} color="#fff" />
                    <Text style={styles.cardHeaderText}>Verdict of the Panel Chairman</Text>
                </View>

                {chairEval ? (
                    <View style={styles.verdictBody}>
                        <View style={styles.verdictChairRow}>
                            <View style={styles.verdictAvatar}>
                                <Text style={styles.verdictAvatarText}>
                                    {chairEval.panelist.replace('Dr. ', '').charAt(0)}
                                </Text>
                            </View>
                            <View>
                                <Text style={styles.verdictChairName}>{chairEval.panelist}</Text>
                                <Text style={styles.verdictChairRole}>Panel Chairman</Text>
                            </View>
                        </View>

                        <View style={styles.verdictBox}>
                            <Text style={styles.verdictBoxLabel}>Recommendation / Verdict</Text>
                            <Text style={styles.verdictBoxText}>{chairEval.comments}</Text>
                        </View>

                        <View style={[styles.verdictStatusRow]}>
                            <View style={[styles.verdictStatusPill, { backgroundColor: getGradeBg(chairEval.totalScore) }]}>
                                <Ionicons
                                    name={chairEval.totalScore >= 75 ? 'checkmark-circle' : 'close-circle'}
                                    size={16}
                                    color={getGradeColor(chairEval.totalScore)}
                                />
                                <Text style={[styles.verdictStatusText, { color: getGradeColor(chairEval.totalScore) }]}>
                                    {chairEval.totalScore >= 75 ? 'Approved to Proceed' : 'Requires Revision'}
                                </Text>
                            </View>
                        </View>
                    </View>
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No panel chairman evaluation available.</Text>
                    </View>
                )}
            </View>

            {/* ─── 5. Date Finalized ────────────────────────────────────── */}
            <View style={styles.card}>
                <View style={[styles.cardHeader, { backgroundColor: '#0F766E' }]}>
                    <Ionicons name="calendar" size={18} color="#fff" />
                    <Text style={styles.cardHeaderText}>Date Finalized</Text>
                </View>
                <View style={styles.dateBody}>
                    <Ionicons name="calendar-outline" size={24} color="#0F766E" />
                    <View>
                        <Text style={styles.dateText}>{dateFinalized}</Text>
                        <Text style={styles.dateSubText}>Report compiled and finalized on this date</Text>
                    </View>
                </View>
            </View>

            {/* ─── Action Buttons ───────────────────────────────────────── */}
            <View style={styles.actionRow}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} accessibilityRole="button">
                    <Ionicons name="arrow-back" size={18} color="#374151" />
                    <Text style={styles.backBtnText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.generateReportBtn}
                    onPress={handleGenerateReport}
                    accessibilityRole="button"
                    accessibilityLabel="Generate Report"
                >
                    <Ionicons name="print-outline" size={18} color="#fff" />
                    <Text style={styles.generateReportBtnText}>Generate Report</Text>
                </TouchableOpacity>
            </View>

        </ScrollView>

        {/* ─── Success / Fail Modal ─────────────────────────────────── */}
        <Modal
            visible={modalState !== 'hidden'}
            transparent
            animationType="fade"
            onRequestClose={() => setModalState('hidden')}
        >
            <Pressable style={styles.modalOverlay} onPress={() => setModalState('hidden')}>
                <Pressable style={styles.modalBox} onPress={() => {}}>
                    {/* Icon */}
                    <View style={[
                        styles.modalIconCircle,
                        { backgroundColor: modalState === 'success' ? '#DCFCE7' : '#FEE2E2' }
                    ]}>
                        <Ionicons
                            name={modalState === 'success' ? 'checkmark-circle' : 'close-circle'}
                            size={56}
                            color={modalState === 'success' ? '#16a34a' : '#DC2626'}
                        />
                    </View>

                    {/* Title */}
                    <Text style={styles.modalTitle}>
                        {modalState === 'success' ? 'Report Generated!' : 'Generation Failed'}
                    </Text>

                    {/* Message */}
                    <Text style={styles.modalMessage}>
                        {modalState === 'success'
                            ? `The consolidated report for "${group?.title}" has been saved successfully and is now visible in Consolidated Reports.`
                            : 'Something went wrong while generating the report. Please try again.'}
                    </Text>

                    {/* API warning (saved locally but DB failed) */}
                    {modalState === 'success' && apiWarning ? (
                        <View style={styles.modalWarning}>
                            <Ionicons name="warning-outline" size={14} color="#92400E" />
                            <Text style={styles.modalWarningText}>{apiWarning}</Text>
                        </View>
                    ) : null}

                    {/* Buttons */}
                    <View style={styles.modalActions}>
                        <TouchableOpacity
                            style={styles.modalCloseBtn}
                            onPress={() => setModalState('hidden')}
                        >
                            <Text style={styles.modalCloseBtnText}>Close</Text>
                        </TouchableOpacity>

                        {modalState === 'success' && (
                            <TouchableOpacity
                                style={styles.modalViewBtn}
                                onPress={() => {
                                    setModalState('hidden');
                                    router.push('/(main)/consolidated-reports');
                                }}
                            >
                                <Ionicons name="albums-outline" size={16} color="#fff" />
                                <Text style={styles.modalViewBtnText}>View Reports</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    rootContainer: { flex: 1 },
    container: { flex: 1, backgroundColor: Colors.pageBg },
    content: { padding: 24, paddingBottom: 60 },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32 },

    // Back row
    backRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16, minHeight: 44 },
    backText: { fontFamily: Typography.fontFamily.semiBold, fontSize: 14, color: Colors.btnPrimaryBg },

    // Page title
    pageTitle: { fontFamily: Typography.fontFamily.bold, fontSize: 22, color: Colors.textPrimary, marginBottom: 4 },
    pageSubtitle: { fontFamily: Typography.fontFamily.regular, fontSize: 13, color: Colors.textSecondary, marginBottom: 24 },

    // Card
    card: {
        backgroundColor: Colors.cardBg,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.cardBorder,
        marginBottom: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: {
        backgroundColor: '#1E40AF',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    cardHeaderText: { fontFamily: Typography.fontFamily.bold, fontSize: 14, color: '#fff', letterSpacing: 0.3 },

    // Info table
    infoTable: {},
    infoRow: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 12, backgroundColor: '#fff' },
    infoRowAlt: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 12, backgroundColor: '#F9FAFB' },
    infoLabel: {
        flex: 1.2,
        fontFamily: Typography.fontFamily.semiBold,
        fontSize: 13,
        color: Colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.4,
        paddingRight: 8,
    },
    infoValue: { flex: 2.5, fontFamily: Typography.fontFamily.regular, fontSize: 14, color: Colors.textPrimary, lineHeight: 20 },

    // Eval table
    evalTable: {},
    evalTableHeader: {
        flexDirection: 'row',
        backgroundColor: '#F3F4F6',
        borderBottomWidth: 2,
        borderBottomColor: '#E5E7EB',
    },
    evalTh: {
        fontFamily: Typography.fontFamily.bold,
        fontSize: 12,
        color: '#374151',
        paddingHorizontal: 16,
        paddingVertical: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    evalTableRow: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    evalTableRowAlt: { backgroundColor: '#FAFAFA' },
    evalCell: { paddingHorizontal: 16, paddingVertical: 14, justifyContent: 'center' },
    evalPanelistName: { fontFamily: Typography.fontFamily.semiBold, fontSize: 14, color: Colors.textPrimary, marginBottom: 4 },
    chairBadge: { backgroundColor: '#FEE2E2', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, alignSelf: 'flex-start' },
    chairBadgeText: { fontFamily: Typography.fontFamily.bold, fontSize: 10, color: '#991B1B', textTransform: 'uppercase', letterSpacing: 0.3 },
    gradePill: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, alignItems: 'center', gap: 2 },
    gradeScore: { fontFamily: Typography.fontFamily.bold, fontSize: 18 },
    gradeLabel: { fontFamily: Typography.fontFamily.medium, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.4 },
    evalRemarks: { fontFamily: Typography.fontFamily.regular, fontSize: 13, color: '#374151', lineHeight: 20, fontStyle: 'italic' },

    // Total grade
    totalCard: { borderWidth: 2, borderColor: '#1E40AF' },
    totalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
    totalLabel: { fontFamily: Typography.fontFamily.bold, fontSize: 16, color: Colors.textPrimary, marginBottom: 4 },
    totalSub: { fontFamily: Typography.fontFamily.regular, fontSize: 12, color: Colors.textSecondary },
    totalScoreBox: { borderRadius: 12, paddingHorizontal: 20, paddingVertical: 12, alignItems: 'center' },
    totalScore: { fontFamily: Typography.fontFamily.bold, fontSize: 32, lineHeight: 36 },
    totalGradeLabel: { fontFamily: Typography.fontFamily.semiBold, fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 },

    // Verdict
    verdictBody: { padding: 20, gap: 16 },
    verdictChairRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    verdictAvatar: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center',
    },
    verdictAvatarText: { fontFamily: Typography.fontFamily.bold, fontSize: 18, color: '#991B1B' },
    verdictChairName: { fontFamily: Typography.fontFamily.bold, fontSize: 15, color: Colors.textPrimary },
    verdictChairRole: { fontFamily: Typography.fontFamily.regular, fontSize: 12, color: Colors.textSecondary },
    verdictBox: {
        backgroundColor: '#FFF7ED',
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#F97316',
        padding: 16,
    },
    verdictBoxLabel: { fontFamily: Typography.fontFamily.bold, fontSize: 12, color: '#92400E', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6 },
    verdictBoxText: { fontFamily: Typography.fontFamily.regular, fontSize: 14, color: '#374151', lineHeight: 22, fontStyle: 'italic' },
    verdictStatusRow: { flexDirection: 'row' },
    verdictStatusPill: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
    verdictStatusText: { fontFamily: Typography.fontFamily.bold, fontSize: 13 },

    // Date
    dateBody: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 20 },
    dateText: { fontFamily: Typography.fontFamily.bold, fontSize: 16, color: Colors.textPrimary },
    dateSubText: { fontFamily: Typography.fontFamily.regular, fontSize: 12, color: Colors.textSecondary, marginTop: 2 },

    // Action
    actionRow: { flexDirection: 'row', gap: 12, marginTop: 8, justifyContent: 'flex-end', },
    backBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#D1D5DB',
        borderRadius: 10, paddingHorizontal: 20, paddingVertical: 14, minHeight: 48,
    },
    backBtnText: { fontFamily: Typography.fontFamily.semiBold, fontSize: 14, color: '#374151', },
    generateReportBtn: {
        paddingVertical: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        backgroundColor: '#1E40AF', borderRadius: 10, paddingHorizontal: 14, minHeight: 18,
    },
    generateReportBtnText: { fontFamily: Typography.fontFamily.semiBold, fontSize: 14, color: '#fff' },

    // Not found
    notFoundText: { fontFamily: Typography.fontFamily.regular, fontSize: 15, color: Colors.textSecondary },
    backBtnSm: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.btnPrimaryBg, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10 },
    backBtnSmText: { fontFamily: Typography.fontFamily.semiBold, fontSize: 13, color: '#fff' },

    emptyState: { alignItems: 'center', paddingVertical: 32, gap: 12 },
    emptyText: { fontFamily: Typography.fontFamily.regular, fontSize: 14, color: Colors.textSecondary },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.55)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    modalBox: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 32,
        width: '100%',
        maxWidth: 420,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.18,
        shadowRadius: 24,
        elevation: 12,
        gap: 12,
    },
    modalIconCircle: {
        width: 96,
        height: 96,
        borderRadius: 48,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },
    modalTitle: {
        fontFamily: Typography.fontFamily.bold,
        fontSize: 22,
        color: Colors.textPrimary,
        textAlign: 'center',
    },
    modalMessage: {
        fontFamily: Typography.fontFamily.regular,
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 8,
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
        width: '100%',
    },
    modalCloseBtn: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F9FAFB',
        minHeight: 44,
    },
    modalCloseBtnText: {
        fontFamily: Typography.fontFamily.semiBold,
        fontSize: 14,
        color: '#374151',
    },
    modalViewBtn: {
        flex: 1,
        flexDirection: 'row',
        gap: 6,
        backgroundColor: '#1E40AF',
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 44,
    },
    modalViewBtnText: {
        fontFamily: Typography.fontFamily.semiBold,
        fontSize: 14,
        color: '#fff',
    },

    // Warning banner inside modal
    modalWarning: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        backgroundColor: '#FEF3C7',
        borderRadius: 8,
        borderLeftWidth: 3,
        borderLeftColor: '#F59E0B',
        padding: 10,
        width: '100%',
    },
    modalWarningText: {
        fontFamily: Typography.fontFamily.regular,
        fontSize: 12,
        color: '#92400E',
        flex: 1,
        lineHeight: 18,
    },
});