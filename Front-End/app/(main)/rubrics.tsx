import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Platform,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { sections, presentationCriteria } from '../../src/data/evaluationRubric';
import { Colors } from '../../src/theme/colors';
import { Typography } from '../../src/theme/typography';

export default function RubricsScreen() {
  const [rubrics, setRubrics] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedRubric, setSelectedRubric] = useState<any | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLoading(true);

    // Transform `sections` into rubric objects
    const rubricsData = sections.map((sec, i) => {
      const flatCriteria: any[] = [];
      sec.subsections.forEach((sub) => {
        sub.criteria.forEach((c) => {
          flatCriteria.push({
            name: c.name,
            maxScore: c.points,
            description: c.rubric.find((r) => r.level === 5)?.description || 'No description available',
            fullRubric: c.rubric,
          });
        });
      });
      return {
        id: `sec-${i}`,
        name: sec.title,
        stage: 'All Stages',
        criteria: flatCriteria,
      };
    });

    // Add Oral Defense
    rubricsData.push({
      id: 'oral-defense',
      name: 'Oral Defense Presentation',
      stage: 'All Stages',
      criteria: presentationCriteria.map((c) => ({
        name: c.name,
        maxScore: c.points,
        description: c.rubric.find((r) => r.level === 5)?.description || 'No description available',
        fullRubric: c.rubric,
      })),
    });

    setRubrics(rubricsData);
    setLoading(false);
  };

  const filteredRubrics = rubrics.filter((rubric) => {
    const matchesSearch =
      searchQuery === '' ||
      rubric.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rubric.stage && rubric.stage.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const renderRubricModal = () => {
    if (!selectedRubric) return null;
    return (
      <Modal visible={!!selectedRubric} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>{selectedRubric.name}</Text>
                <Text style={styles.modalSub}>{selectedRubric.stage.toUpperCase()} Stage Rubric</Text>
              </View>
              <Pressable onPress={() => setSelectedRubric(null)} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color="#1f2937" />
              </Pressable>
            </View>

            <ScrollView style={styles.modalScroll}>
              <View style={styles.criteriaTable}>
                <View style={styles.tableHead}>
                  <Text style={[styles.headText, { flex: 3 }]}>Criterion</Text>
                  <Text style={[styles.headText, { flex: 1.2, textAlign: 'center' }]}>Max Score</Text>
                  <Text style={[styles.headText, { flex: 5.8 }]}>Description</Text>
                </View>
                {(selectedRubric.criteria || []).map((c: any, i: number) => (
                  <View key={i} style={styles.tableRow}>
                    <Text style={[styles.critName, { flex: 3 }]}>{c.name}</Text>
                    <Text style={[styles.critPoints, { flex: 1.2, textAlign: 'center' }]}>{c.maxScore || c.points || 0}</Text>
                    <Text style={[styles.critDesc, { flex: 5.8 }]}>{c.description}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.totalBox}>
                <Text style={styles.totalLabel}>Total Maximum Points:</Text>
                <Text style={styles.totalVal}>
                  {(selectedRubric.criteria || []).reduce((sum: number, c: any) => sum + (c.maxScore || c.points || 0), 0)} pts
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.mainScroll}>
        <View style={styles.controls}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={20} color="#9ca3af" />
            <TextInput
              placeholder="Search rubrics..."
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        <View style={styles.rubricGrid}>
          {filteredRubrics.map((rubric) => (
            <View key={rubric.id} style={styles.rubricCard}>
              <View style={styles.cardTop}>
                <View style={styles.iconCircle}>
                  <Ionicons name="document-text-outline" size={24} color="#ea580c" />
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{rubric.stage.toUpperCase()}</Text>
                </View>
              </View>
              <Text style={styles.rubricTitle}>{rubric.name}</Text>
              <Text style={styles.rubricSubtitle}>{(rubric.criteria || []).length} criteria points defined</Text>
              <Pressable style={styles.viewBtn} onPress={() => setSelectedRubric(rubric)}>
                <Text style={styles.viewBtnText}>View Rubric Details</Text>
                <Ionicons name="chevron-forward-outline" size={18} color="#ea580c" />
              </Pressable>
            </View>
          ))}
        </View>
      </ScrollView>

      {renderRubricModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.pageBg },
  mainScroll: { paddingBottom: 60 },
  controls: { padding: 24, gap: 16 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    fontFamily: Typography.fontFamily.medium,
    color: '#111827',
  },
  rubricGrid: { paddingHorizontal: 24, gap: 20 },
  rubricCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    ...Platform.select({
      web: { boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' },
      default: { elevation: 3 },
    }),
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  iconCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#fff7ed', alignItems: 'center', justifyContent: 'center' },
  badge: { backgroundColor: '#fff7ed', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 11, fontFamily: Typography.fontFamily.bold, color: '#ea580c' },
  rubricTitle: { fontSize: 18, fontFamily: Typography.fontFamily.bold, color: '#111827', marginBottom: 8 },
  rubricSubtitle: { fontSize: 14, color: '#6b7280', marginBottom: 24, fontFamily: Typography.fontFamily.medium },
  viewBtn: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  viewBtnText: { fontSize: 14, fontFamily: Typography.fontFamily.bold, color: '#ea580c' },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 40 },
  modalContent: { width: '100%', maxWidth: 900, maxHeight: '85%', backgroundColor: '#ffffff', borderRadius: 20, overflow: 'hidden' },
  modalHeader: { padding: 24, borderBottomWidth: 1, borderBottomColor: '#e5e7eb', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 20, fontFamily: Typography.fontFamily.bold, color: '#111827' },
  modalSub: { fontSize: 13, color: '#6b7280', fontFamily: Typography.fontFamily.bold, marginTop: 2 },
  closeBtn: { padding: 8 },
  modalScroll: { padding: 24 },
  criteriaTable: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, overflow: 'hidden' },
  tableHead: { flexDirection: 'row', backgroundColor: '#f9fafb', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  headText: { fontSize: 12, fontFamily: Typography.fontFamily.bold, color: '#6b7280', textTransform: 'uppercase' },
  tableRow: { flexDirection: 'row', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', alignItems: 'center' },
  critName: { fontSize: 14, fontFamily: Typography.fontFamily.bold, color: '#111827' },
  critPoints: { fontSize: 15, fontFamily: Typography.fontFamily.bold, color: '#ea580c' },
  critDesc: { fontSize: 13, color: '#4b5563', lineHeight: 20, fontFamily: Typography.fontFamily.regular },
  totalBox: { marginTop: 24, padding: 20, backgroundColor: '#f8fafc', borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 16, fontFamily: Typography.fontFamily.bold, color: '#1e293b' },
  totalVal: { fontSize: 20, fontFamily: Typography.fontFamily.bold, color: '#ea580c' },
});
