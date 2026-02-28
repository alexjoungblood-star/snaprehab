import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../../src/services/supabase/client';
import { Card } from '../../../src/components/ui/Card';
import { Button } from '../../../src/components/ui/Button';
import { colors } from '../../../src/theme/colors';
import { typography } from '../../../src/theme/typography';
import { spacing } from '../../../src/theme/spacing';
import { ROOM_TYPE_LABELS } from '../../../src/types/room';

interface SOWRoom {
  roomLabel: string;
  items: string[];
}

export default function ScopeOfWorkScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [sections, setSections] = useState<SOWRoom[]>([]);
  const [propertyAddress, setPropertyAddress] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    generateSOW();
  }, []);

  const generateSOW = async () => {
    try {
      const { data: property } = await supabase
        .from('properties')
        .select('address_line1, city, state, zip_code')
        .eq('id', id)
        .single();

      if (property) {
        setPropertyAddress(
          `${property.address_line1}, ${property.city}, ${property.state} ${property.zip_code}`
        );
      }

      // Load selected repair items grouped by room
      const { data: items } = await supabase
        .from('repair_items')
        .select('*, rooms(room_type, room_label)')
        .eq('property_id', id)
        .eq('is_selected', true)
        .order('sort_order');

      if (!items || items.length === 0) {
        setIsLoading(false);
        return;
      }

      // Group by room
      const roomMap = new Map<string, { label: string; items: string[] }>();

      for (const item of items) {
        const roomData = item.rooms as any;
        const roomKey = item.room_id || 'general';
        const roomLabel =
          roomData?.room_label ||
          ROOM_TYPE_LABELS[roomData?.room_type as keyof typeof ROOM_TYPE_LABELS] ||
          'General';

        if (!roomMap.has(roomKey)) {
          roomMap.set(roomKey, { label: roomLabel, items: [] });
        }

        // Generate SOW line item text
        const qty = parseFloat(item.quantity);
        const unit = item.unit;
        const desc = item.description;

        let sowText = desc;
        if (qty > 0 && unit !== 'LS') {
          sowText = `${desc} (${qty} ${unit})`;
        }

        roomMap.get(roomKey)!.items.push(sowText);
      }

      setSections(
        Array.from(roomMap.values()).map((room) => ({
          roomLabel: room.label,
          items: room.items,
        }))
      );
    } catch (err) {
      console.error('Failed to generate SOW:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
        <Text style={styles.loadingText}>Generating scope of work...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <Card style={styles.headerCard}>
        <Text style={styles.docTitle}>SCOPE OF WORK</Text>
        <Text style={styles.propertyAddress}>{propertyAddress}</Text>
        <Text style={styles.dateText}>
          Generated {new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
      </Card>

      {/* Sections */}
      {sections.map((section, sIndex) => (
        <View key={sIndex} style={styles.section}>
          <Text style={styles.sectionTitle}>
            {section.roomLabel.toUpperCase()} — Scope of Work
          </Text>
          {section.items.map((item, iIndex) => (
            <View key={iIndex} style={styles.sowItem}>
              <Text style={styles.sowNumber}>{iIndex + 1}.</Text>
              <Text style={styles.sowText}>{item}</Text>
            </View>
          ))}
        </View>
      ))}

      {sections.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No repair items selected. Complete room walkthroughs first.
          </Text>
        </View>
      )}

      <Button
        title="Export as PDF"
        onPress={() => router.push(`/property/${id}/export`)}
        fullWidth
        size="lg"
        style={styles.exportButton}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.base, paddingBottom: spacing['3xl'] },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: { ...typography.body, color: colors.text.secondary, marginTop: spacing.md },
  headerCard: { alignItems: 'center', marginBottom: spacing.xl },
  docTitle: {
    ...typography.heading2,
    color: colors.primary[600],
    letterSpacing: 2,
  },
  propertyAddress: {
    ...typography.body,
    color: colors.text.primary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  dateText: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.heading3,
    color: colors.text.primary,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary[500],
    paddingBottom: spacing.sm,
    marginBottom: spacing.md,
  },
  sowItem: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  sowNumber: {
    ...typography.body,
    color: colors.primary[500],
    fontWeight: '700',
    width: 28,
  },
  sowText: {
    ...typography.body,
    color: colors.text.primary,
    flex: 1,
    lineHeight: 22,
  },
  emptyContainer: { alignItems: 'center', paddingTop: spacing['3xl'] },
  emptyText: { ...typography.body, color: colors.text.secondary, textAlign: 'center' },
  exportButton: { marginTop: spacing.xl },
});
