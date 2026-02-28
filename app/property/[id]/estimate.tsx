import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../../src/services/supabase/client';
import {
  getLocationFactor,
  calculateEstimateTotal,
} from '../../../src/services/costs/costEngine';
import { useSettingsStore } from '../../../src/stores/settingsStore';
import { Card } from '../../../src/components/ui/Card';
import { Button } from '../../../src/components/ui/Button';
import { colors } from '../../../src/theme/colors';
import { typography } from '../../../src/theme/typography';
import { spacing } from '../../../src/theme/spacing';
import { formatCurrency } from '../../../src/utils/formatCurrency';
import { ROOM_TYPE_LABELS } from '../../../src/types/room';

interface CategoryGroup {
  category: string;
  label: string;
  items: RepairItemRow[];
  subtotal: number;
}

interface RepairItemRow {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  isSelected: boolean;
  roomLabel: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  ext: 'Exterior',
  kit: 'Kitchen',
  bath: 'Bathrooms',
  bed: 'Bedrooms',
  liv: 'Living Areas',
  flr: 'Flooring',
  paint: 'Painting',
  plumb: 'Plumbing',
  elec: 'Electrical',
  hvac: 'HVAC',
  gen: 'General',
  struct: 'Structural',
};

export default function EstimateScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { defaultContingencyPct } = useSettingsStore();
  const [groups, setGroups] = useState<CategoryGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [contingencyPct, setContingencyPct] = useState(defaultContingencyPct);
  const [locationFactorValue, setLocationFactorValue] = useState(1.0);

  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editField, setEditField] = useState<'qty' | 'cost' | null>(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    loadEstimate();
  }, []);

  const loadEstimate = async () => {
    try {
      // Get property info
      const { data: property } = await supabase
        .from('properties')
        .select('zip_code')
        .eq('id', id)
        .single();

      const locFactor = await getLocationFactor(property?.zip_code || '');
      setLocationFactorValue(locFactor.combinedFactor);

      // Load all repair items for this property with room info
      const { data: items } = await supabase
        .from('repair_items')
        .select('*, rooms(room_type, room_label)')
        .eq('property_id', id)
        .order('sort_order');

      if (!items) {
        setIsLoading(false);
        return;
      }

      // Group by category
      const categoryMap = new Map<string, RepairItemRow[]>();

      for (const item of items) {
        const catKey = (item.category || item.repair_code.split('-')[0] || 'gen').toLowerCase();
        const roomData = item.rooms as any;
        const roomLabel = roomData?.room_label || ROOM_TYPE_LABELS[roomData?.room_type as keyof typeof ROOM_TYPE_LABELS] || '';

        const row: RepairItemRow = {
          id: item.id,
          description: item.description,
          quantity: parseFloat(item.quantity),
          unit: item.unit,
          unitCost: parseFloat(item.unit_cost),
          totalCost: parseFloat(item.total_cost),
          isSelected: item.is_selected,
          roomLabel,
        };

        if (!categoryMap.has(catKey)) {
          categoryMap.set(catKey, []);
        }
        categoryMap.get(catKey)!.push(row);
      }

      const grouped: CategoryGroup[] = Array.from(categoryMap.entries()).map(
        ([category, catItems]) => ({
          category,
          label: CATEGORY_LABELS[category] || category.toUpperCase(),
          items: catItems,
          subtotal: catItems
            .filter((i) => i.isSelected)
            .reduce((sum, i) => sum + i.totalCost, 0),
        })
      );

      setGroups(grouped);

      // Expand all by default
      setExpandedCategories(new Set(grouped.map((g) => g.category)));
    } catch (err) {
      console.error('Failed to load estimate:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = (itemId: string, field: 'qty' | 'cost', currentValue: number) => {
    setEditingItemId(itemId);
    setEditField(field);
    setEditValue(String(currentValue));
  };

  const saveEdit = async () => {
    if (!editingItemId || !editField) return;
    const numValue = parseFloat(editValue);
    if (isNaN(numValue) || numValue < 0) {
      Alert.alert('Invalid', 'Please enter a valid number.');
      return;
    }

    const updateData = editField === 'qty'
      ? { quantity: numValue }
      : { unit_cost: numValue };

    await supabase
      .from('repair_items')
      .update(updateData)
      .eq('id', editingItemId);

    // Update local state
    setGroups((prev) =>
      prev.map((group) => ({
        ...group,
        items: group.items.map((item) => {
          if (item.id !== editingItemId) return item;
          const newQty = editField === 'qty' ? numValue : item.quantity;
          const newCost = editField === 'cost' ? numValue : item.unitCost;
          return {
            ...item,
            quantity: newQty,
            unitCost: newCost,
            totalCost: newQty * newCost,
          };
        }),
        subtotal: 0, // recalculate below
      })).map((group) => ({
        ...group,
        subtotal: group.items
          .filter((i) => i.isSelected)
          .reduce((sum, i) => sum + i.totalCost, 0),
      }))
    );

    setEditingItemId(null);
    setEditField(null);
  };

  const cancelEdit = () => {
    setEditingItemId(null);
    setEditField(null);
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const allItems = groups.flatMap((g) => g.items);
  const { subtotal, contingencyAmt, total } = calculateEstimateTotal(
    allItems.map((i) => ({ quantity: i.quantity, unitCost: i.unitCost, isSelected: i.isSelected })),
    contingencyPct
  );

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
        <Text style={styles.loadingText}>Generating estimate...</Text>
      </View>
    );
  }

  if (groups.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="document-text-outline" size={48} color={colors.gray[300]} />
        <Text style={styles.emptyTitle}>No Repair Items</Text>
        <Text style={styles.emptySubtext}>
          Complete room walkthroughs and select repair items first.
        </Text>
        <Button
          title="Go Back"
          onPress={() => router.back()}
          variant="outline"
          style={styles.backButton}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Location Factor Banner */}
        {locationFactorValue !== 1.0 && (
          <View style={styles.factorBanner}>
            <Ionicons name="location-outline" size={16} color={colors.primary[600]} />
            <Text style={styles.factorText}>
              Prices adjusted by {((locationFactorValue - 1) * 100).toFixed(1)}% for your area
            </Text>
          </View>
        )}

        {/* Category Sections */}
        {groups.map((group) => (
          <View key={group.category}>
            <TouchableOpacity
              style={styles.categoryHeader}
              onPress={() => toggleCategory(group.category)}
            >
              <Ionicons
                name={expandedCategories.has(group.category) ? 'chevron-down' : 'chevron-forward'}
                size={20}
                color={colors.text.primary}
              />
              <Text style={styles.categoryTitle}>{group.label}</Text>
              <Text style={styles.categoryTotal}>{formatCurrency(group.subtotal)}</Text>
            </TouchableOpacity>

            {expandedCategories.has(group.category) &&
              group.items.map((item) => (
                <View
                  key={item.id}
                  style={[styles.lineItem, !item.isSelected && styles.lineItemDeselected]}
                >
                  <View style={styles.lineItemTop}>
                    <Text style={styles.lineItemDesc} numberOfLines={2}>
                      {item.description}
                    </Text>
                    {item.roomLabel ? (
                      <Text style={styles.lineItemRoom}>{item.roomLabel}</Text>
                    ) : null}
                  </View>
                  <View style={styles.lineItemNumbers}>
                    {/* Quantity — tappable to edit */}
                    {editingItemId === item.id && editField === 'qty' ? (
                      <View style={styles.editCell}>
                        <TextInput
                          style={styles.editInput}
                          value={editValue}
                          onChangeText={setEditValue}
                          keyboardType="decimal-pad"
                          autoFocus
                          selectTextOnFocus
                          onBlur={saveEdit}
                          onSubmitEditing={saveEdit}
                        />
                        <Text style={styles.editUnit}>{item.unit}</Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.tappableCell}
                        onPress={() => startEdit(item.id, 'qty', item.quantity)}
                      >
                        <Text style={styles.lineItemQty}>
                          {item.quantity} {item.unit}
                        </Text>
                      </TouchableOpacity>
                    )}

                    {/* Unit cost — tappable to edit */}
                    {editingItemId === item.id && editField === 'cost' ? (
                      <View style={styles.editCell}>
                        <Text style={styles.editDollar}>$</Text>
                        <TextInput
                          style={styles.editInput}
                          value={editValue}
                          onChangeText={setEditValue}
                          keyboardType="decimal-pad"
                          autoFocus
                          selectTextOnFocus
                          onBlur={saveEdit}
                          onSubmitEditing={saveEdit}
                        />
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.tappableCell}
                        onPress={() => startEdit(item.id, 'cost', item.unitCost)}
                      >
                        <Text style={styles.lineItemCost}>
                          {formatCurrency(item.unitCost)}
                        </Text>
                      </TouchableOpacity>
                    )}

                    {/* Total — not editable */}
                    <Text style={styles.lineItemTotal}>
                      {formatCurrency(item.totalCost)}
                    </Text>
                  </View>
                </View>
              ))}
          </View>
        ))}

        {/* Totals */}
        <Card style={styles.totalsCard}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>{formatCurrency(subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Contingency ({contingencyPct}%)</Text>
            <Text style={styles.totalValue}>{formatCurrency(contingencyAmt)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.grandTotalLabel}>Total Estimate</Text>
            <Text style={styles.grandTotalValue}>{formatCurrency(total)}</Text>
          </View>
        </Card>

        {/* Actions */}
        <Button
          title="View Scope of Work"
          onPress={() => router.push(`/property/${id}/scope-of-work`)}
          fullWidth
          size="lg"
          style={styles.actionButton}
        />
        <Button
          title="Export as PDF"
          onPress={() => router.push(`/property/${id}/export`)}
          variant="outline"
          fullWidth
          size="lg"
          style={styles.actionButton}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.base, paddingBottom: spacing['3xl'] },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['2xl'],
    backgroundColor: colors.background,
  },
  loadingText: { ...typography.body, color: colors.text.secondary, marginTop: spacing.md },
  emptyTitle: { ...typography.heading2, color: colors.text.primary, marginTop: spacing.lg },
  emptySubtext: { ...typography.body, color: colors.text.secondary, marginTop: spacing.sm, textAlign: 'center' },
  backButton: { marginTop: spacing.xl },
  factorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary[50],
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.base,
  },
  factorText: { ...typography.caption, color: colors.primary[700] },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.gray[50],
    borderRadius: 8,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  categoryTitle: { ...typography.body, fontWeight: '700', color: colors.text.primary, flex: 1 },
  categoryTotal: { ...typography.body, fontWeight: '600', color: colors.primary[600] },
  lineItem: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  lineItemDeselected: { opacity: 0.4 },
  lineItemTop: {
    marginBottom: 4,
  },
  lineItemDesc: { ...typography.bodySmall, color: colors.text.primary },
  lineItemRoom: { ...typography.caption, color: colors.text.tertiary },
  lineItemNumbers: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tappableCell: {
    backgroundColor: colors.gray[50],
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderStyle: 'dashed',
  },
  editCell: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.primary[500],
    borderRadius: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  editInput: {
    ...typography.bodySmall,
    color: colors.text.primary,
    fontWeight: '600',
    minWidth: 50,
    padding: 0,
    textAlign: 'right',
  },
  editUnit: {
    ...typography.caption,
    color: colors.text.secondary,
    marginLeft: 4,
  },
  editDollar: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginRight: 2,
  },
  lineItemQty: { ...typography.caption, color: colors.text.secondary },
  lineItemCost: { ...typography.caption, color: colors.text.secondary },
  lineItemTotal: { ...typography.bodySmall, fontWeight: '700', color: colors.text.primary },
  totalsCard: { marginTop: spacing.xl },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  totalLabel: { ...typography.body, color: colors.text.secondary },
  totalValue: { ...typography.body, color: colors.text.primary, fontWeight: '500' },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  grandTotalLabel: { ...typography.heading3, color: colors.text.primary },
  grandTotalValue: { ...typography.heading2, color: colors.primary[600] },
  actionButton: { marginTop: spacing.md },
});
