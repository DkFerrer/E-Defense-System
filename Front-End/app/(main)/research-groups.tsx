import React, { useState, useMemo } from 'react';
import {
  View, FlatList, StyleSheet, Text,
} from 'react-native';
import { useRouter } from 'expo-router';
import SearchFilterBar from '../../src/components/SearchFilterBar';
import ResearchGroupCard from '../../src/components/ResearchGroupCard';
import { mockResearchGroups, ResearchGroup } from '../../src/data/mockData';
import { Colors } from '../../src/theme/colors';
import { Typography } from '../../src/theme/typography';

export default function ResearchGroupsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [selectedStage, setSelectedStage] = useState('All Stages');

  const filtered = useMemo(() => {
    return mockResearchGroups.filter((g) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        g.title.toLowerCase().includes(q) ||
        g.members.some((m) => m.toLowerCase().includes(q));
      const matchesDept =
        selectedDepartment === 'All Departments' || g.department === selectedDepartment;
      const matchesStage =
        selectedStage === 'All Stages' || g.stage === selectedStage;
      return matchesSearch && matchesDept && matchesStage;
    });
  }, [searchQuery, selectedDepartment, selectedStage]);

  return (
    <FlatList
      data={filtered}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      accessibilityRole="list"
      ListHeaderComponent={
        <SearchFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedDepartment={selectedDepartment}
          onDepartmentChange={setSelectedDepartment}
          selectedStage={selectedStage}
          onStageChange={setSelectedStage}
        />
      }
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No research groups match your filters.</Text>
        </View>
      }
      renderItem={({ item }) => (
        <ResearchGroupCard
          item={item}
          onViewDetails={(g) => {
            router.push({
              pathname: '/(main)/research-group-detail',
              params: { id: g.id },
            } as any);
          }}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 24,
    paddingBottom: 40,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
  },
});
