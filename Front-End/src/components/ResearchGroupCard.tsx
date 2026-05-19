import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, useWindowDimensions,
} from 'react-native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { ResearchGroup } from '../data/mockData';
import StatusBadge from './StatusBadge';

interface ResearchGroupCardProps {
  item: ResearchGroup;
  onViewDetails: (item: ResearchGroup) => void;
}

export default function ResearchGroupCard({ item, onViewDetails }: ResearchGroupCardProps) {
  const { width } = useWindowDimensions();
  const isWide = width >= 600;

  return (
    <View
      style={styles.card}
      accessible
      accessibilityLabel={`Research group: ${item.title}`}
    >
      {/* Top row: title + button */}
      <View style={styles.topRow}>
        <Text style={[styles.title, isWide && { flex: 1 }]} numberOfLines={isWide ? 2 : 3}>
          {item.title}
        </Text>
        <TouchableOpacity
          style={styles.viewBtn}
          onPress={() => onViewDetails(item)}
          accessibilityRole="button"
          accessibilityLabel={`View details for ${item.title}`}
          activeOpacity={0.8}
        >
          <Text style={styles.viewBtnText}>View Details</Text>
        </TouchableOpacity>
      </View>

      {/* Meta grid */}
      <View style={[styles.metaGrid, { flexDirection: isWide ? 'row' : 'column' }]}>
        <View style={styles.metaCol}>
          <Text style={styles.metaLabel}>Members</Text>
          <Text style={styles.metaValue}>{item.members.join(', ')}</Text>
        </View>
        <View style={styles.metaCol}>
          <Text style={styles.metaLabel}>Adviser</Text>
          <Text style={styles.metaValue}>{item.adviser}</Text>
        </View>
        <View style={styles.metaCol}>
          <Text style={styles.metaLabel}>Program</Text>
          <Text style={styles.metaValue}>{item.program}</Text>
        </View>
        <View style={styles.metaCol}>
          <Text style={styles.metaLabel}>Defense Date</Text>
          <Text style={styles.metaValue}>{item.defenseDate}</Text>
        </View>
      </View>

      {/* Footer: badge + score */}
      <View style={styles.footer}>
        <StatusBadge stage={item.stage} />
        <Text style={styles.score} accessibilityLabel={`Score: ${item.score} out of 100`}>
          Score: {item.score}/100
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  title: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.md,
    color: Colors.textPrimary,
    flexShrink: 1,
  },
  viewBtn: {
    backgroundColor: Colors.btnPrimaryBg,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minWidth: 110,
    alignItems: 'center',
    flexShrink: 0,
  },
  viewBtnText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.sm,
    color: Colors.btnPrimaryText,
  },
  metaGrid: {
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  metaCol: {
    minWidth: 160,
    flex: 1,
  },
  metaLabel: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.xs,
    color: Colors.textLabel,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metaValue: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  score: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
  },
});
