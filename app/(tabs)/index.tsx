import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { usePropertyStore } from '../../src/stores/propertyStore';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing } from '../../src/theme/spacing';
import type { Property } from '../../src/types/property';

function StatsHeader({ properties }: { properties: Property[] }) {
  const inProgress = properties.filter((p) => p.status === 'in_progress').length;
  const completed = properties.filter((p) => p.status === 'completed').length;
  const total = properties.length;

  if (total === 0) return null;

  return (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{total}</Text>
        <Text style={styles.statLabel}>Total</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={[styles.statValue, { color: colors.warning[500] }]}>{inProgress}</Text>
        <Text style={styles.statLabel}>In Progress</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={[styles.statValue, { color: colors.success[500] }]}>{completed}</Text>
        <Text style={styles.statLabel}>Completed</Text>
      </View>
    </View>
  );
}

function PropertyCard({
  property,
  onDelete,
}: {
  property: Property;
  onDelete: (id: string, address: string) => void;
}) {
  const router = useRouter();

  const statusVariant = {
    in_progress: 'warning' as const,
    completed: 'success' as const,
    archived: 'default' as const,
  };

  const statusLabel = {
    in_progress: 'In Progress',
    completed: 'Completed',
    archived: 'Archived',
  };

  const rehabLabel = {
    cosmetic: 'Cosmetic',
    moderate: 'Moderate',
    full_gut: 'Full Gut',
  };

  const timeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/property/${property.id}`);
  };

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onDelete(property.id, property.addressLine1);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePress}
      onLongPress={handleLongPress}
      delayLongPress={500}
    >
      <Card style={styles.propertyCard}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <View style={styles.iconContainer}>
              <Ionicons name="home" size={14} color={colors.white} />
            </View>
            <Text style={styles.address} numberOfLines={1}>
              {property.addressLine1}
            </Text>
          </View>
          <Badge
            label={statusLabel[property.status]}
            variant={statusVariant[property.status]}
          />
        </View>

        <Text style={styles.cityState}>
          {property.city}, {property.state} {property.zipCode}
        </Text>

        <View style={styles.cardDetails}>
          {property.bedrooms != null && (
            <View style={styles.detailChip}>
              <Ionicons name="bed-outline" size={12} color={colors.text.secondary} />
              <Text style={styles.detail}>{property.bedrooms}</Text>
            </View>
          )}
          {property.bathrooms != null && (
            <View style={styles.detailChip}>
              <Ionicons name="water-outline" size={12} color={colors.text.secondary} />
              <Text style={styles.detail}>{property.bathrooms}</Text>
            </View>
          )}
          {property.squareFootage != null && (
            <View style={styles.detailChip}>
              <Ionicons name="resize-outline" size={12} color={colors.text.secondary} />
              <Text style={styles.detail}>{property.squareFootage.toLocaleString()}</Text>
            </View>
          )}
          <Badge label={rehabLabel[property.rehabLevel]} variant="info" />
          <Text style={styles.timeAgo}>{timeAgo(property.createdAt)}</Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

export default function DashboardScreen() {
  const router = useRouter();
  const { properties, isLoading, fetchProperties, deleteProperty } = usePropertyStore();

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleDelete = useCallback(
    (id: string, address: string) => {
      Alert.alert(
        'Delete Property',
        `Are you sure you want to delete "${address}"? This cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              deleteProperty(id);
            },
          },
        ]
      );
    },
    [deleteProperty]
  );

  const handleFABPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/property/create');
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="camera-outline" size={48} color={colors.primary[300]} />
      </View>
      <Text style={styles.emptyTitle}>No Properties Yet</Text>
      <Text style={styles.emptySubtitle}>
        Tap the + button to start your first property walkthrough
      </Text>
      <TouchableOpacity style={styles.emptyButton} onPress={handleFABPress}>
        <Ionicons name="add" size={20} color={colors.white} />
        <Text style={styles.emptyButtonText}>New Property</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => <StatsHeader properties={properties} />;

  return (
    <View style={styles.container}>
      <FlatList
        data={properties}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PropertyCard property={item} onDelete={handleDelete} />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={fetchProperties}
            tintColor={colors.primary[500]}
          />
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      {properties.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={handleFABPress}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={28} color={colors.white} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: spacing.base,
    flexGrow: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.base,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  propertyCard: {
    marginBottom: 0,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  address: {
    ...typography.heading3,
    flex: 1,
  },
  cityState: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.md,
    marginLeft: 36,
  },
  cardDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginLeft: 36,
    flexWrap: 'wrap',
  },
  detailChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.gray[50],
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 6,
  },
  detail: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  timeAgo: {
    ...typography.caption,
    color: colors.gray[400],
    marginLeft: 'auto',
  },
  separator: {
    height: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    ...typography.heading2,
    color: colors.text.primary,
    marginTop: spacing.xl,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.text.secondary,
    marginTop: spacing.sm,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 12,
    marginTop: spacing.xl,
  },
  emptyButtonText: {
    ...typography.button,
    color: colors.white,
  },
  fab: {
    position: 'absolute',
    right: spacing.xl,
    bottom: spacing.xl,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
