import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/theme/colors';
import { Typography } from '../../src/theme/typography';
import { useAppData } from '../../src/context/AppDataContext';

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export default function HistoryScreen() {
  const { activities } = useAppData();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      accessible
      accessibilityLabel="History page"
    >
      <Text style={styles.pageTitle}>Activity History</Text>
      <Text style={styles.pageSubtitle}>
        Every action and navigation in the system is recorded here.
      </Text>

      {activities.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="time-outline" size={64} color={Colors.textSecondary} />
          <Text style={styles.emptyTitle}>No Activity Yet</Text>
          <Text style={styles.emptyBody}>System activities will appear here.</Text>
        </View>
      ) : (
        <View style={styles.timeline}>
          {activities.map((entry, idx) => (
            <View key={entry.id} style={styles.timelineItem}>
              {/* Icon dot */}
              <View style={styles.timelineDotCol}>
                <View style={[styles.timelineDot, { backgroundColor: entry.color + '22' }]}>
                  <Ionicons
                    name={entry.icon as any}
                    size={16}
                    color={entry.color}
                  />
                </View>
                {idx < activities.length - 1 && <View style={styles.timelineLine} />}
              </View>

              {/* Content */}
              <View style={styles.timelineContent}>
                <View style={styles.timelineHeader}>
                  <Text style={styles.timelineAction}>{entry.action}</Text>
                  <Text style={styles.timelineTime}>{formatTime(entry.timestamp)}</Text>
                </View>
                <Text style={styles.timelineDetails}>{entry.details}</Text>
              </View>
            </View>
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
    marginBottom: 28,
  },

  // Timeline
  timeline: { gap: 0 },
  timelineItem: { flexDirection: 'row', gap: 12 },

  timelineDotCol: { alignItems: 'center', width: 36 },
  timelineDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 4,
    minHeight: 16,
  },

  timelineContent: {
    flex: 1,
    paddingBottom: 20,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 4,
    marginTop: 6,
  },
  timelineAction: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.sm,
    color: Colors.textPrimary,
    flex: 1,
  },
  timelineTime: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  timelineDetails: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },

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
  },
});
