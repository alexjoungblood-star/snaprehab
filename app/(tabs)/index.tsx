import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePropertyStore } from '../../src/stores/propertyStore';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing } from '../../src/theme/spacing';
import type { Property } from '../../src/types/property';

function PropertyCard({ property }: { property: Property }) {
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

  return (
    <Card
      onPress={() => router.push(`/property/${property.id}`)}
      style={styles.propertyCard}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          <Ionicons name="home-outline" size={20} color={colors.primary[500]} />
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
          <Text style={styles.detail}>{property.bedrooms} bed</Text>
        )}
        {property.bathrooms != null && (
          <Text style={styles.detail}>{property.bathrooms} bath</Text>
        )}
        {property.squareFootage != null && (
          <Text style={styles.detail}>{property.squareFootage.toLocaleString()} sqft</Text>
        )}
        <Badge
          label={rehabLabel[property.rehabLevel]}
          variant="info"
        />
      </View>
    </Card>
  );
}

export default function DashboardScreen() {
  const router = useRouter();
  const { properties, isLoading, fetchProperties } = usePropertyStore();

  useEffect(() => {
    fetchProperties();
  }, []);

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="camera-outline" size={64} color={colors.gray[300]} />
      <Text style={styles.emptyTitle}>No Properties Yet</Text>
      <Text style={styles.emptySubtitle}>
        Tap the + button to start your first property walkthrough
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={properties}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PropertyCard property={item} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={fetchProperties}
            tintColor={colors.primary[500]}
          />
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      {/* FAB - New Property */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/property/create')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color={colors.white} />
      </TouchableOpacity>
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
  address: {
    ...typography.heading3,
    marginLeft: spacing.sm,
    flex: 1,
  },
  cityState: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.md,
    marginLeft: 28,
  },
  cardDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginLeft: 28,
  },
  detail: {
    ...typography.bodySmall,
    color: colors.text.secondary,
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
