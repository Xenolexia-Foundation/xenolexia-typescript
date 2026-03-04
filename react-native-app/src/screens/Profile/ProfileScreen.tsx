/**
 * Copyright (C) 2016-2026 Husain Alamri (H4n) and Xenolexia Foundation.
 * Licensed under the GNU Affero General Public License v3.0 (AGPL-3.0). See LICENSE.
 */

/**
 * Profile Screen - User settings and preferences
 */

import React from 'react';

import {View, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';

import {SafeAreaView} from 'react-native-safe-area-context';

import {useNavigation} from '@react-navigation/native';

import {useColors} from '@/theme';
import {spacing, borderRadius} from '@/theme/tokens';

import {ScreenHeader} from '@components/common';
import {ChevronRightIcon} from '@components/common/TabBarIcon';
import {Text, Card, ThemeSwitcher} from '@components/ui';

import {useUserStore} from '@stores/userStore';

import type {RootStackParamList} from '@/types';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

type ProfileNavigationProp = NativeStackNavigationProp<RootStackParamList>;

// ============================================================================
// Menu Item Component
// ============================================================================

interface MenuItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
  showChevron?: boolean;
}

function MenuItem({
  icon,
  title,
  subtitle,
  onPress,
  showChevron = true,
}: MenuItemProps): React.JSX.Element {
  const colors = useColors();

  return (
    <TouchableOpacity
      style={[styles.menuItem, {borderBottomColor: colors.divider}]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text variant="bodyLarge" style={styles.menuIcon}>
        {icon}
      </Text>
      <View style={styles.menuTextContainer}>
        <Text variant="bodyMedium">{title}</Text>
        {subtitle && (
          <Text variant="bodySmall" color="secondary" style={styles.menuSubtitle}>
            {subtitle}
          </Text>
        )}
      </View>
      {showChevron && <ChevronRightIcon color={colors.textTertiary} size={20} />}
    </TouchableOpacity>
  );
}

// ============================================================================
// Profile Screen
// ============================================================================

export function ProfileScreen(): React.JSX.Element {
  const navigation = useNavigation<ProfileNavigationProp>();
  const colors = useColors();
  const {preferences} = useUserStore();

  const getLanguageName = (code: string): string => {
    const names: Record<string, string> = {
      en: 'English',
      el: 'Greek',
      es: 'Spanish',
      fr: 'French',
      de: 'German',
      it: 'Italian',
      pt: 'Portuguese',
      ru: 'Russian',
      ja: 'Japanese',
      zh: 'Chinese',
      ko: 'Korean',
      ar: 'Arabic',
    };
    return names[code] || code;
  };

  const getProficiencyLabel = (level: string): string => {
    const labels: Record<string, string> = {
      beginner: 'Beginner (A1-A2)',
      intermediate: 'Intermediate (B1-B2)',
      advanced: 'Advanced (C1-C2)',
    };
    return labels[level] || level;
  };

  const handleNavigateSettings = () => {
    navigation.navigate('Settings');
  };

  const handleNavigateAbout = () => {
    navigation.navigate('About');
  };

  const handleExportData = () => {
    navigation.navigate('DataManagement');
  };

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.avatar, {backgroundColor: colors.primaryLight}]}>
            <Text variant="displaySmall">👤</Text>
          </View>
          <Text variant="headlineMedium" style={styles.name}>
            Reader
          </Text>
          <Text variant="bodyMedium" color="secondary">
            Learning {getLanguageName(preferences.defaultTargetLanguage)}
          </Text>
        </View>

        {/* Theme Selection */}
        <View style={styles.section}>
          <Text variant="labelMedium" color="secondary" uppercase style={styles.sectionTitle}>
            Appearance
          </Text>
          <Card variant="outlined" padding="md">
            <ThemeSwitcher />
          </Card>
        </View>

        {/* Language Settings */}
        <View style={styles.section}>
          <Text variant="labelMedium" color="secondary" uppercase style={styles.sectionTitle}>
            Language Learning
          </Text>
          <Card variant="filled" padding="none">
            <MenuItem
              icon="🌐"
              title="Target Language"
              subtitle={getLanguageName(preferences.defaultTargetLanguage)}
              onPress={handleNavigateSettings}
            />
            <MenuItem
              icon="📊"
              title="Proficiency Level"
              subtitle={getProficiencyLabel(preferences.defaultProficiencyLevel)}
              onPress={handleNavigateSettings}
            />
            <MenuItem
              icon="🎚️"
              title="Word Density"
              subtitle={`${Math.round(preferences.defaultWordDensity * 100)}% foreign words`}
              onPress={handleNavigateSettings}
            />
          </Card>
        </View>

        {/* Reader Settings */}
        <View style={styles.section}>
          <Text variant="labelMedium" color="secondary" uppercase style={styles.sectionTitle}>
            Reader
          </Text>
          <Card variant="filled" padding="none">
            <MenuItem
              icon="🎨"
              title="Reader Appearance"
              subtitle="Fonts, spacing, and layout"
              onPress={() => navigation.navigate('ReaderSettings')}
            />
            <MenuItem
              icon="🔤"
              title="Typography"
              subtitle={`${preferences.readerSettings.fontSize}px • ${preferences.readerSettings.fontFamily}`}
              onPress={() => navigation.navigate('ReaderSettings')}
            />
          </Card>
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <Text variant="labelMedium" color="secondary" uppercase style={styles.sectionTitle}>
            App
          </Text>
          <Card variant="filled" padding="none">
            <MenuItem
              icon="🔔"
              title="Notifications"
              subtitle={preferences.notificationsEnabled ? 'Enabled' : 'Disabled'}
              onPress={() => navigation.navigate('NotificationSettings')}
            />
            <MenuItem
              icon="🎯"
              title="Daily Goal"
              subtitle={`${preferences.dailyGoal} minutes`}
              onPress={handleNavigateSettings}
            />
            <MenuItem icon="💾" title="Data & Storage" onPress={handleExportData} />
            <MenuItem icon="ℹ️" title="About Xenolexia" onPress={handleNavigateAbout} />
          </Card>
        </View>

        {/* Version */}
        <Text variant="bodySmall" color="tertiary" center style={styles.version}>
          Xenolexia v0.1.0 • Built with ❤️
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    borderRadius: 50,
    height: 100,
    justifyContent: 'center',
    marginBottom: spacing[3],
    width: 100,
  },
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingBottom: spacing[6],
    paddingTop: spacing[4],
  },
  menuIcon: {
    marginRight: spacing[3],
  },
  menuItem: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
  },
  menuSubtitle: {
    marginTop: spacing[0.5],
  },
  menuTextContainer: {
    flex: 1,
  },
  name: {
    marginBottom: spacing[1],
  },
  scrollContent: {
    paddingBottom: spacing[8],
  },
  section: {
    marginBottom: spacing[6],
    paddingHorizontal: spacing[5],
  },
  sectionTitle: {
    letterSpacing: 0.5,
    marginBottom: spacing[3],
  },
  version: {
    marginTop: spacing[4],
    paddingBottom: spacing[4],
  },
});
