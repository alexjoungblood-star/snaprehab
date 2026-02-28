import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { usePropertyStore } from '../../../src/stores/propertyStore';
import { Card } from '../../../src/components/ui/Card';
import { Badge } from '../../../src/components/ui/Badge';
import { Button } from '../../../src/components/ui/Button';
import { ProgressBar } from '../../../src/components/ui/ProgressBar';
import { colors } from '../../../src/theme/colors';
import { typography } from '../../../src/theme/typography';
import { spacing } from '../../../src/theme/spacing';
import { supabase } from '../../../src/services/supabase/client';
import type { Room } from '../../../src/types/room';
import { ROOM_TYPE_LABELS } from '../../../src/types/room';

export default function PropertyOverviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { activeProperty, setActiveProperty, properties } = usePropertyStore();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [exteriorDone, setExteriorDone] = useState(false);

  useEffect(() => {
    const property = properties.find((p) => p.id === id);
    if (property) setActiveProperty(property);
    loadRooms();
  }, [id]);

  const loadRooms = async () => {
    if (!id) return;
    const { data } = await supabase
      .from('rooms')
      .select('*')
      .eq('property_id', id)
      .order('sort_order');

    if (data) {
      const mapped: Room[] = data.map((r: any) => ({
        id: r.id,
        propertyId: r.property_id,
        roomType: r.room_type,
        roomLabel: r.room_label,
        floorLevel: r.floor_level,
        sortOrder: r.sort_order,
        status: r.status,
        notes: r.notes,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      }));
      setRooms(mapped);

      const hasExterior = mapped.some((r) => r.roomType.startsWith('exterior_'));
      setExteriorDone(hasExterior);
    }
  };

  if (!activeProperty) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading property...</Text>
      </View>
    );
  }

  const completedRooms = rooms.filter((r) => r.status === 'completed').length;
  const totalRooms = rooms.length;
  const progress = totalRooms > 0 ? completedRooms / totalRooms : 0;

  const rehabLabel = {
    cosmetic: 'Cosmetic Rehab',
    moderate: 'Moderate Rehab',
    full_gut: 'Full Gut Rehab',
  }[activeProperty.rehabLevel];

  const statusBadge = {
    in_progress: { label: 'In Progress', variant: 'warning' as const },
    completed: { label: 'Completed', variant: 'success' as const },
    archived: { label: 'Archived', variant: 'default' as const },
  }[activeProperty.status];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Property Header */}
      <Card style={styles.headerCard}>
        <View style={styles.headerTop}>
          <View style={styles.headerInfo}>
            <Text style={styles.address}>{activeProperty.addressLine1}</Text>
            <Text style={styles.cityState}>
              {activeProperty.city}, {activeProperty.state} {activeProperty.zipCode}
            </Text>
          </View>
          <Badge label={statusBadge.label} variant={statusBadge.variant} />
        </View>

        <View style={styles.detailsRow}>
          {activeProperty.bedrooms != null && (
            <View style={styles.detailItem}>
              <Text style={styles.detailValue}>{activeProperty.bedrooms}</Text>
              <Text style={styles.detailLabel}>Beds</Text>
            </View>
          )}
          {activeProperty.bathrooms != null && (
            <View style={styles.detailItem}>
              <Text style={styles.detailValue}>{activeProperty.bathrooms}</Text>
              <Text style={styles.detailLabel}>Baths</Text>
            </View>
          )}
          {activeProperty.squareFootage != null && (
            <View style={styles.detailItem}>
              <Text style={styles.detailValue}>{activeProperty.squareFootage.toLocaleString()}</Text>
              <Text style={styles.detailLabel}>Sq Ft</Text>
            </View>
          )}
          {activeProperty.yearBuilt != null && (
            <View style={styles.detailItem}>
              <Text style={styles.detailValue}>{activeProperty.yearBuilt}</Text>
              <Text style={styles.detailLabel}>Built</Text>
            </View>
          )}
        </View>

        <Badge label={rehabLabel} variant="info" style={styles.rehabBadge} />
      </Card>

      {/* Progress */}
      {totalRooms > 0 && (
        <Card style={styles.progressCard}>
          <Text style={styles.progressLabel}>
            Walkthrough Progress — {completedRooms} of {totalRooms} rooms
          </Text>
          <ProgressBar progress={progress} />
        </Card>
      )}

      {/* Exterior Walkthrough */}
      <Text style={styles.sectionTitle}>Walkthrough</Text>
      <Card
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push(`/property/${id}/exterior`);
        }}
        style={styles.actionCard}
      >
        <View style={styles.actionRow}>
          <Ionicons name="home-outline" size={24} color={colors.primary[500]} />
          <View style={styles.actionInfo}>
            <Text style={styles.actionTitle}>Exterior Walk-Around</Text>
            <Text style={styles.actionSubtitle}>
              {exteriorDone ? 'Completed' : '5-8 photos of the exterior'}
            </Text>
          </View>
          <Ionicons
            name={exteriorDone ? 'checkmark-circle' : 'chevron-forward'}
            size={24}
            color={exteriorDone ? colors.success[500] : colors.gray[400]}
          />
        </View>
      </Card>

      {/* Rooms */}
      <Card
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push(`/property/${id}/rooms`);
        }}
        style={styles.actionCard}
      >
        <View style={styles.actionRow}>
          <Ionicons name="grid-outline" size={24} color={colors.primary[500]} />
          <View style={styles.actionInfo}>
            <Text style={styles.actionTitle}>Interior Rooms</Text>
            <Text style={styles.actionSubtitle}>
              {rooms.filter((r) => !r.roomType.startsWith('exterior_')).length} rooms added
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={colors.gray[400]} />
        </View>
      </Card>

      {/* Room List */}
      {rooms.filter((r) => !r.roomType.startsWith('exterior_')).map((room) => (
        <TouchableOpacity
          key={room.id}
          style={styles.roomItem}
          onPress={() => router.push(`/property/${id}/room/${room.id}/capture`)}
        >
          <Text style={styles.roomName}>
            {room.roomLabel || ROOM_TYPE_LABELS[room.roomType]}
          </Text>
          <Badge
            label={room.status.replace('_', ' ')}
            variant={room.status === 'completed' ? 'success' : 'default'}
          />
        </TouchableOpacity>
      ))}

      {/* Actions */}
      <Text style={styles.sectionTitle}>Generate</Text>
      <Button
        title="Generate Estimate"
        onPress={() => router.push(`/property/${id}/estimate`)}
        fullWidth
        size="lg"
        disabled={rooms.length === 0}
      />
      <Button
        title="View Scope of Work"
        onPress={() => router.push(`/property/${id}/scope-of-work`)}
        variant="outline"
        fullWidth
        size="lg"
        style={styles.sowButton}
        disabled={rooms.length === 0}
      />
      <Button
        title="Export PDF"
        onPress={() => router.push(`/property/${id}/export`)}
        variant="secondary"
        fullWidth
        size="lg"
        style={styles.exportButton}
        disabled={rooms.length === 0}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  headerCard: {
    marginBottom: spacing.base,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  address: {
    ...typography.heading2,
    color: colors.text.primary,
  },
  cityState: {
    ...typography.body,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  detailsRow: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    gap: spacing.xl,
  },
  detailItem: {
    alignItems: 'center',
  },
  detailValue: {
    ...typography.heading3,
    color: colors.text.primary,
  },
  detailLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
  rehabBadge: {
    marginTop: spacing.md,
  },
  progressCard: {
    marginBottom: spacing.xl,
  },
  progressLabel: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.heading3,
    color: colors.text.primary,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  actionCard: {
    marginBottom: spacing.sm,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
  },
  actionSubtitle: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
  roomItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    backgroundColor: colors.white,
    borderRadius: 8,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  roomName: {
    ...typography.body,
    color: colors.text.primary,
  },
  sowButton: {
    marginTop: spacing.md,
  },
  exportButton: {
    marginTop: spacing.md,
  },
});
