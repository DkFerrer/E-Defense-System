import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Dimensions,
  Platform,
  Modal,
  TextInput,
} from 'react-native';
import {
  Search,
  BookOpen,
  Filter,
  ChevronRight,
  X,
  FileText,
  ChevronDown,
} from 'lucide-react-native';
import { sections, presentationCriteria } from '../data/evaluationRubric';

const { width } = Dimensions.get('window');

export default function RubricsScreen() {
  const [rubrics, setRubrics] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStage, setFilterStage] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedRubric, setSelectedRubric] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLoading(true);
    
    // Transform `sections` into rubric objects
    const rubricsData = sections.map((sec, i) => {
      const flatCriteria = [];
      sec.subsections.forEach(sub => {
         sub.criteria.forEach(c => {
           flatCriteria.push({
             name: c.name,
             maxScore: c.points,
             description: c.rubric.find(r => r.level === 5)?.description || 'No description available',
             fullRubric: c.rubric
           });
         });
      });
      return {
        id: `sec-${i}`,
        name: sec.title,
        stage: 'All Stages',
        criteria: flatCriteria
      };
    });

    // Add Oral Defense
    rubricsData.push({
      id: 'oral-defense',
      name: 'Oral Defense Presentation',
      stage: 'All Stages',
      criteria: presentationCriteria.map(c => ({
         name: c.name,
         maxScore: c.points,
         description: c.rubric.find(r => r.level === 5)?.description || 'No description available',
         fullRubric: c.rubric
      }))
    });

    setRubrics(rubricsData);
    setLoading(false);
  };

  const filteredRubrics = rubrics.filter(rubric => {
    const matchesSearch = searchQuery === '' ||
      rubric.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rubric.stage && rubric.stage.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStage = filterStage === 'all' || rubric.stage === filterStage;
    return matchesSearch && matchesStage;
  });

  const renderRubricModal = () => {
    if (!selectedRubric) return null;
    return (
      <Modal visible={!!selectedRubric} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>{selectedRubric.name}</Text>
                <Text style={styles.modalSub}>{selectedRubric.stage.toUpperCase()} Stage Rubric</Text>
              </View>
              <Pressable onPress={() => setSelectedRubric(null)} style={styles.closeBtn}>
                <X size={24} color="#1f2937" />
              </Pressable>
            </View>

            <ScrollView style={styles.modalScroll}>
              <View style={styles.criteriaTable}>
                <View style={styles.tableHead}>
                  <Text style={[styles.headText, { flex: 3 }]}>Criterion</Text>
                  <Text style={[styles.headText, { flex: 1, textAlign: 'center' }]}>Max Score</Text>
                  <Text style={[styles.headText, { flex: 6 }]}>Description</Text>
                </View>
                {(selectedRubric.criteria || []).map((c, i) => (
                  <View key={i} style={styles.tableRow}>
                    <Text style={[styles.critName, { flex: 3 }]}>{c.name}</Text>
                    <Text style={[styles.critPoints, { flex: 1, textAlign: 'center' }]}>{c.maxScore || c.points || 0}</Text>
                    <Text style={[styles.critDesc, { flex: 6 }]}>{c.description}</Text>
                  </View>
                ))}
              </View>
              
              <View style={styles.totalBox}>
                <Text style={styles.totalLabel}>Total Maximum Points:</Text>
                <Text style={styles.totalVal}>{(selectedRubric.criteria || []).reduce((sum, c) => sum + (c.maxScore || c.points || 0), 0)} pts</Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Evaluation Rubrics</Text>
        <Text style={styles.subTitle}>View and manage scoring criteria for all defense stages</Text>
      </View>

      <ScrollView contentContainerStyle={styles.mainScroll}>
        <View style={styles.controls}>
          <View style={styles.searchBar}>
            <Search size={20} color="#9ca3af" />
            <TextInput
              placeholder="Search rubrics..."
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <View style={styles.rubricGrid}>
            {filteredRubrics.map((rubric) => (
              <View key={rubric.id} style={styles.rubricCard}>
                <View style={styles.cardTop}>
                  <View style={styles.iconCircle}><FileText size={24} color="#2563eb" /></View>
                  <View style={styles.badge}><Text style={styles.badgeText}>{rubric.stage.toUpperCase()}</Text></View>
                </View>
                <Text style={styles.rubricTitle}>{rubric.name}</Text>
                <Text style={styles.rubricSubtitle}>{(rubric.criteria || []).length} criteria points defined</Text>
                <Pressable style={styles.viewBtn} onPress={() => setSelectedRubric(rubric)}>
                  <Text style={styles.viewBtnText}>View Rubric Details</Text>
                  <ChevronRight size={18} color="#2563eb" />
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
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { padding: 24, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  title: { fontSize: 28, fontWeight: '900', color: '#111827' },
  subTitle: { fontSize: 15, color: '#6b7280', marginTop: 4 },
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
    height: 52
  },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 15, fontWeight: '500', color: '#111827' },
  filterRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  stageChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb' },
  stageChipActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  stageChipText: { fontSize: 13, fontWeight: '700', color: '#6b7280' },
  stageChipTextActive: { color: '#ffffff' },
  rubricGrid: { paddingHorizontal: 24, gap: 20 },
  rubricCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    ...Platform.select({ web: { boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }, default: { elevation: 3 } })
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  iconCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center' },
  badge: { backgroundColor: '#f5f3ff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 11, fontWeight: '800', color: '#7c3aed' },
  rubricTitle: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 8 },
  rubricSubtitle: { fontSize: 14, color: '#6b7280', marginBottom: 24, fontWeight: '500' },
  viewBtn: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  viewBtnText: { fontSize: 14, fontWeight: '700', color: '#2563eb' },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 40 },
  modalContent: { width: '100%', maxWidth: 900, maxHeight: '85%', backgroundColor: '#ffffff', borderRadius: 20, overflow: 'hidden' },
  modalHeader: { padding: 24, borderBottomWidth: 1, borderBottomColor: '#e5e7eb', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: '900', color: '#111827' },
  modalSub: { fontSize: 13, color: '#6b7280', fontWeight: '700', marginTop: 2 },
  closeBtn: { padding: 8 },
  modalScroll: { padding: 24 },
  criteriaTable: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, overflow: 'hidden' },
  tableHead: { flexDirection: 'row', backgroundColor: '#f9fafb', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  headText: { fontSize: 12, fontWeight: '800', color: '#6b7280', textTransform: 'uppercase' },
  tableRow: { flexDirection: 'row', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', alignItems: 'center' },
  critName: { fontSize: 14, fontWeight: '700', color: '#111827' },
  critPoints: { fontSize: 15, fontWeight: '900', color: '#2563eb' },
  critDesc: { fontSize: 13, color: '#4b5563', lineHeight: 20 },
  totalBox: { marginTop: 24, padding: 20, backgroundColor: '#f8fafc', borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 16, fontWeight: '800', color: '#1e293b' },
  totalVal: { fontSize: 20, fontWeight: '900', color: '#2563eb' }
});
