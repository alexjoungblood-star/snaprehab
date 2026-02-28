import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing } from '../../theme/spacing';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

const variantColors: Record<BadgeVariant, { bg: string; text: string }> = {
  default: { bg: colors.gray[100], text: colors.gray[700] },
  success: { bg: colors.success[50], text: colors.success[700] },
  warning: { bg: colors.warning[50], text: colors.warning[700] },
  error: { bg: colors.error[50], text: colors.error[700] },
  info: { bg: colors.primary[50], text: colors.primary[700] },
};

export function Badge({ label, variant = 'default', style }: BadgeProps) {
  const colorScheme = variantColors[variant];

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: colorScheme.bg },
        style,
      ]}
    >
      <Text style={[styles.label, { color: colorScheme.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  label: {
    ...typography.caption,
    fontWeight: '600',
  },
});
