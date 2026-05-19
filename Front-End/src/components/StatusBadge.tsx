import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { DefenseStage } from '../data/mockData';

interface StatusBadgeProps {
  stage: DefenseStage;
}

const badgeConfig: Record<DefenseStage, {
  bg: string; text: string; border: string; label: string;
}> = {
  'Review Defense': {
    bg: Colors.badgeReviewBg,
    text: Colors.badgeReviewText,
    border: Colors.badgeReviewBorder,
    label: 'Review Defense',
  },
  'Title Defense': {
    bg: Colors.badgeTitleBg,
    text: Colors.badgeTitleText,
    border: Colors.badgeTitleBorder,
    label: 'Title Defense',
  },
  'Final Defense': {
    bg: Colors.badgeFinalBg,
    text: Colors.badgeFinalText,
    border: Colors.badgeFinalBorder,
    label: 'Final Defense',
  },
};

export default function StatusBadge({ stage }: StatusBadgeProps) {
  const config = badgeConfig[stage];
  return (
    <View
      style={[styles.badge, { backgroundColor: config.bg, borderColor: config.border }]}
      accessibilityRole="text"
      accessible
    >
      <Text style={[styles.text, { color: config.text }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  text: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.sm,
  },
});
