/**
 * Copyright (C) 2016-2026 Husain Alamri (H4n) and Xenolexia Foundation.
 * Licensed under the GNU Affero General Public License v3.0 (AGPL-3.0). See LICENSE.
 */

/**
 * Reader Settings Screen - Standalone reader settings (from Settings/Profile)
 */

import React, {useCallback} from 'react';

import {View, StyleSheet} from 'react-native';

import {SafeAreaView} from 'react-native-safe-area-context';

import {useNavigation} from '@react-navigation/native';

import {ReaderSettingsModal} from '@components/reader/ReaderSettingsModal';

import type {RootStackParamList} from '@/types';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

type ReaderSettingsNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function ReaderSettingsScreen(): React.JSX.Element {
  const navigation = useNavigation<ReaderSettingsNavigationProp>();

  const handleClose = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <ReaderSettingsModal visible onClose={handleClose} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
