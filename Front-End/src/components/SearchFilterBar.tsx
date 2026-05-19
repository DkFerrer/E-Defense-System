import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Modal, FlatList, Platform, useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { DEPARTMENTS, DEFENSE_STAGES } from '../data/mockData';

interface SearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (v: string) => void;
  selectedDepartment: string;
  onDepartmentChange: (v: string) => void;
  selectedStage: string;
  onStageChange: (v: string) => void;
}

// Generic dropdown that works on web & native
function Dropdown({
  label, value, options, onChange, accessibilityLabel: ariaLabel,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  accessibilityLabel: string;
}) {
  const [open, setOpen] = useState(false);

  if (Platform.OS === 'web') {
    const selectEl = React.createElement('select', {
      value,
      onChange: (e: { target: { value: string } }) => onChange(e.target.value),
      'aria-label': ariaLabel,
      style: {
        width: '100%',
        padding: '10px 14px',
        borderRadius: 8,
        border: `1.5px solid ${Colors.inputBorder}`,
        backgroundColor: Colors.inputBg,
        fontFamily: Typography.fontFamily.regular,
        fontSize: Typography.fontSize.base,
        color: Colors.inputText,
        cursor: 'pointer',
        appearance: 'auto',
      },
    },
      ...options.map((o) =>
        React.createElement('option', { key: o, value: o }, o)
      ),
    );

    return (
      <View style={ddStyles.wrapper}>
        <Text style={ddStyles.label}>{label}</Text>
        {selectEl}
      </View>
    );
  }

  // Native modal picker
  return (
    <View style={ddStyles.wrapper}>
      <Text style={ddStyles.label}>{label}</Text>
      <TouchableOpacity
        style={ddStyles.trigger}
        onPress={() => setOpen(true)}
        accessibilityRole="combobox"
        accessibilityLabel={ariaLabel}
        accessibilityState={{ expanded: open }}
      >
        <Text style={ddStyles.triggerText}>{value}</Text>
        <Ionicons name="chevron-down" size={16} color={Colors.textSecondary} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade">
        <TouchableOpacity style={ddStyles.overlay} onPress={() => setOpen(false)} activeOpacity={1}>
          <View style={ddStyles.modal}>
            <FlatList
              data={options}
              keyExtractor={(o) => o}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[ddStyles.option, item === value && ddStyles.optionActive]}
                  onPress={() => { onChange(item); setOpen(false); }}
                  accessibilityRole="button"
                  accessibilityLabel={item}
                  accessibilityState={{ selected: item === value }}
                >
                  <Text style={[ddStyles.optionText, item === value && ddStyles.optionTextActive]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

export default function SearchFilterBar({
  searchQuery, onSearchChange,
  selectedDepartment, onDepartmentChange,
  selectedStage, onStageChange,
}: SearchFilterBarProps) {
  const { width } = useWindowDimensions();
  const isWide = width >= 768;
  const [searchFocused, setSearchFocused] = useState(false);

  const stageOptions = ['All Stages', ...DEFENSE_STAGES];

  return (
    <View
      style={styles.container}
      accessible
      accessibilityLabel="Search and filter research groups"
    >
      <View style={[styles.row, !isWide && styles.rowColumn]}>
        {/* Search */}
        <View style={[styles.searchWrapper, isWide && { flex: 1 }]}>
          <Text style={styles.label} nativeID="search-label">Search</Text>
          <View style={[styles.inputRow, searchFocused && styles.inputFocused]}>
            <Ionicons name="search" size={16} color={Colors.textSecondary} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.input}
              value={searchQuery}
              onChangeText={onSearchChange}
              placeholder="Search by title or members..."
              placeholderTextColor={Colors.inputPlaceholder}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              accessibilityLabel="Search research groups by title or members"
              returnKeyType="search"
            />
          </View>
        </View>

        {/* Department */}
        <View style={isWide ? { flex: 1 } : undefined}>
          <Dropdown
            label="Department"
            value={selectedDepartment}
            options={DEPARTMENTS}
            onChange={onDepartmentChange}
            accessibilityLabel="Filter by department"
          />
        </View>

        {/* Stage */}
        <View style={isWide ? { flex: 1 } : undefined}>
          <Dropdown
            label="Defense Stage"
            value={selectedStage}
            options={stageOptions}
            onChange={onStageChange}
            accessibilityLabel="Filter by defense stage"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.cardBg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-end',
  },
  rowColumn: {
    flexDirection: 'column',
  },
  label: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.sm,
    color: Colors.inputLabel,
    marginBottom: 6,
  },
  searchWrapper: {},
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.inputBorder,
    borderRadius: 8,
    backgroundColor: Colors.inputBg,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inputFocused: {
    borderColor: Colors.inputBorderFocus,
  },
  input: {
    flex: 1,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.base,
    color: Colors.inputText,
  },
});

const ddStyles = StyleSheet.create({
  wrapper: { flex: 1 },
  label: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.sm,
    color: Colors.inputLabel,
    marginBottom: 6,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: Colors.inputBorder,
    borderRadius: 8,
    backgroundColor: Colors.inputBg,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  triggerText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.base,
    color: Colors.inputText,
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  modal: {
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    maxHeight: 300,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  option: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  optionActive: {
    backgroundColor: '#EFF6FF',
  },
  optionText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
  },
  optionTextActive: {
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.btnPrimaryBg,
  },
});
