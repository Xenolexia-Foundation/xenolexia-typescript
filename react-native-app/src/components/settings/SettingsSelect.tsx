/**
 * Copyright (C) 2016-2026 Husain Alamri (H4n) and Xenolexia Foundation.
 * Licensed under the GNU Affero General Public License v3.0 (AGPL-3.0). See LICENSE.
 */

/**
 * Settings Select - Segmented control for selecting options
 */

import React from 'react';

import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';

interface Option {
  value: string;
  label: string;
}

interface SettingsSelectProps {
  value: string;
  options: Option[];
  onSelect: (value: string) => void;
}

export function SettingsSelect({value, options, onSelect}: SettingsSelectProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      {options.map((option, index) => {
        const isSelected = option.value === value;
        const isFirst = index === 0;
        const isLast = index === options.length - 1;

        return (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.option,
              isSelected && styles.optionSelected,
              isFirst && styles.optionFirst,
              isLast && styles.optionLast,
            ]}
            onPress={() => onSelect(option.value)}
          >
            <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    flexDirection: 'row',
    padding: 4,
  },
  option: {
    alignItems: 'center',
    borderRadius: 8,
    flex: 1,
    paddingVertical: 10,
  },
  optionFirst: {},
  optionLast: {},
  optionSelected: {
    backgroundColor: '#ffffff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  optionText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '500',
  },
  optionTextSelected: {
    color: '#1f2937',
    fontWeight: '600',
  },
});
