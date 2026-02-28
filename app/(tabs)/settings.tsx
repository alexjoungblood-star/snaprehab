import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '../../src/stores/authStore';
import { useSettingsStore } from '../../src/stores/settingsStore';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing } from '../../src/theme/spacing';
import type { AIProviderName } from '../../src/types/analysis';

function SettingRow({
  icon,
  label,
  value,
  onPress,
}: {
  icon: string;
  label: string;
  value: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.settingRow}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingLeft}>
        <Ionicons name={icon as any} size={20} color={colors.primary[500]} />
        <Text style={styles.settingLabel}>{label}</Text>
      </View>
      <View style={styles.settingRight}>
        <Text style={styles.settingValue}>{value}</Text>
        {onPress && (
          <Ionicons name="chevron-forward" size={16} color={colors.gray[400]} />
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const { user, signOut } = useAuthStore();
  const {
    aiProvider,
    defaultContingencyPct,
    defaultRehabLevel,
    setAIProvider,
    setDefaultContingencyPct,
    setDefaultRehabLevel,
  } = useSettingsStore();

  const toggleAIProvider = () => {
    Haptics.selectionAsync();
    const options: AIProviderName[] = ['claude', 'openai'];
    const currentIndex = options.indexOf(aiProvider);
    const nextIndex = (currentIndex + 1) % options.length;
    setAIProvider(options[nextIndex]);
  };

  const cycleRehabLevel = () => {
    Haptics.selectionAsync();
    const levels = ['cosmetic', 'moderate', 'full_gut'] as const;
    const currentIndex = levels.indexOf(defaultRehabLevel);
    const nextIndex = (currentIndex + 1) % levels.length;
    setDefaultRehabLevel(levels[nextIndex]);
  };

  const cycleContingency = () => {
    Haptics.selectionAsync();
    const options = [10, 15, 20, 25];
    const currentIndex = options.indexOf(defaultContingencyPct);
    const nextIndex = (currentIndex + 1) % options.length;
    setDefaultContingencyPct(options[nextIndex]);
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  const providerLabel = aiProvider === 'claude' ? 'Claude (Anthropic)' : 'GPT-4o (OpenAI)';
  const rehabLabel = {
    cosmetic: 'Cosmetic',
    moderate: 'Moderate',
    full_gut: 'Full Gut',
  }[defaultRehabLevel];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Section */}
      <Text style={styles.sectionTitle}>Profile</Text>
      <Card style={styles.section}>
        <SettingRow
          icon="person-outline"
          label="Name"
          value={user?.user_metadata?.full_name ?? 'Not set'}
        />
        <View style={styles.divider} />
        <SettingRow
          icon="mail-outline"
          label="Email"
          value={user?.email ?? ''}
        />
      </Card>

      {/* Preferences Section */}
      <Text style={styles.sectionTitle}>Preferences</Text>
      <Card style={styles.section}>
        <SettingRow
          icon="sparkles-outline"
          label="AI Provider"
          value={providerLabel}
          onPress={toggleAIProvider}
        />
        <View style={styles.divider} />
        <SettingRow
          icon="construct-outline"
          label="Default Rehab Level"
          value={rehabLabel}
          onPress={cycleRehabLevel}
        />
        <View style={styles.divider} />
        <SettingRow
          icon="shield-outline"
          label="Default Contingency"
          value={`${defaultContingencyPct}%`}
          onPress={cycleContingency}
        />
      </Card>

      {/* App Info */}
      <Text style={styles.sectionTitle}>About</Text>
      <Card style={styles.section}>
        <SettingRow
          icon="information-circle-outline"
          label="Version"
          value="1.0.0 (Beta)"
        />
      </Card>

      {/* Sign Out */}
      <Button
        title="Sign Out"
        onPress={handleSignOut}
        variant="outline"
        fullWidth
        style={styles.signOutButton}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.base,
    paddingBottom: spacing['3xl'],
  },
  sectionTitle: {
    ...typography.label,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  section: {
    padding: 0,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    minHeight: 48,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  settingLabel: {
    ...typography.body,
    color: colors.text.primary,
  },
  settingValue: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: spacing.base + 20 + spacing.md,
  },
  signOutButton: {
    marginTop: spacing['2xl'],
  },
});
