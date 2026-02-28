import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../../../../src/services/supabase/client';
import {
  loadBaseCosts,
  getBaseCost,
  getLocationFactor,
  calculateAdjustedCost,
  calculateLineItemTotal,
} from '../../../../../src/services/costs/costEngine';
import { Button } from '../../../../../src/components/ui/Button';
import { Card } from '../../../../../src/components/ui/Card';
import { colors } from '../../../../../src/theme/colors';
import { typography } from '../../../../../src/theme/typography';
import { spacing, borderRadius } from '../../../../../src/theme/spacing';
import { formatCurrency } from '../../../../../src/utils/formatCurrency';

interface RepairItemUI {
  id?: string;
  repairCode: string;
  description: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  isSelected: boolean;
  isAiSuggested: boolean;
  confidence: number;
  reasoning: string;
}

export default function RepairsScreen() {
  const { id, roomId } = useLocalSearchParams<{ id: string; roomId: string }>();
  const router = useRouter();
  const [items, setItems] = useState<RepairItemUI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [zipCode, setZipCode] = useState('');

  useEffect(() => {
    loadRepairItems();
  }, []);

  const loadRepairItems = async () => {
    try {
      await loadBaseCosts();

      // Get property zip code
      const { data: property } = await supabase
        .from('properties')
        .select('zip_code')
        .eq('id', id)
        .single();

      if (property) setZipCode(property.zip_code);
      const locationFactor = await getLocationFactor(property?.zip_code || '');

      // Check for existing saved items
      const { data: existingItems } = await supabase
        .from('repair_items')
        .select('*')
        .eq('room_id', roomId)
        .order('sort_order');

      if (existingItems && existingItems.length > 0) {
        setItems(
          existingItems.map((item: any) => ({
            id: item.id,
            repairCode: item.repair_code,
            description: item.description,
            quantity: parseFloat(item.quantity),
            unit: item.unit,
            unitCost: parseFloat(item.unit_cost),
            totalCost: parseFloat(item.total_cost),
            isSelected: item.is_selected,
            isAiSuggested: item.is_ai_suggested,
            confidence: 1,
            reasoning: '',
          }))
        );
      } else {
        // Load from AI analysis suggestions
        const { data: analysis } = await supabase
          .from('ai_analyses')
          .select('id, suggested_repairs')
          .eq('room_id', roomId)
          .order('created_at', { ascending: false })
          .limit(1);

        if (analysis && analysis.length > 0) {
          const suggestions = analysis[0].suggested_repairs || [];
          const mapped: RepairItemUI[] = suggestions.map((s: any) => {
            const baseCost = getBaseCost(s.repairCode);
            const adjustedCost = baseCost
              ? calculateAdjustedCost(baseCost.baseUnitCost, locationFactor)
              : 0;

            return {
              repairCode: s.repairCode,
              description: s.description || baseCost?.description || s.repairCode,
              quantity: s.estimatedQuantity || 1,
              unit: s.unit || baseCost?.unit || 'EA',
              unitCost: adjustedCost || 0,
              totalCost: calculateLineItemTotal(
                s.estimatedQuantity || 1,
                adjustedCost || 0
              ),
              isSelected: true,
              isAiSuggested: true,
              confidence: s.confidence || 0.5,
              reasoning: s.reasoning || '',
            };
          });
          setItems(mapped);
        }
      }
    } catch (err) {
      console.error('Failed to load repair items:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleItem = (index: number) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, isSelected: !item.isSelected } : item
      )
    );
  };

  const updateQuantity = (index: number, text: string) => {
    const quantity = parseFloat(text) || 0;
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? { ...item, quantity, totalCost: calculateLineItemTotal(quantity, item.unitCost) }
          : item
      )
    );
  };

  const updateUnitCost = (index: number, text: string) => {
    const unitCost = parseFloat(text) || 0;
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? { ...item, unitCost, totalCost: calculateLineItemTotal(item.quantity, unitCost) }
          : item
      )
    );
  };

  const selectedTotal = items
    .filter((item) => item.isSelected)
    .reduce((sum, item) => sum + item.totalCost, 0);

  const saveAndContinue = async () => {
    setIsSaving(true);
    try {
      // Delete existing items for this room and re-insert
      await supabase.from('repair_items').delete().eq('room_id', roomId);

      const inserts = items.map((item, index) => ({
        property_id: id,
        room_id: roomId,
        repair_code: item.repairCode,
        category: item.repairCode.split('-')[0]?.toLowerCase() || 'general',
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unit_cost: item.unitCost,
        is_selected: item.isSelected,
        is_ai_suggested: item.isAiSuggested,
        is_user_added: !item.isAiSuggested,
        source: item.isAiSuggested ? 'ai' : 'user',
        sort_order: index,
      }));

      await supabase.from('repair_items').insert(inserts);

      await supabase
        .from('rooms')
        .update({ status: 'items_selected' })
        .eq('id', roomId);

      router.back();
    } catch (err) {
      Alert.alert('Error', 'Failed to save repair items.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
        <Text style={styles.loadingText}>Loading repair items...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {items.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No repair items suggested.</Text>
            <Text style={styles.emptySubtext}>
              You can add items manually using the button below.
            </Text>
          </View>
        ) : (
          items.map((item, index) => (
            <Card key={index} style={[styles.itemCard, !item.isSelected && styles.itemDeselected]}>
              <TouchableOpacity style={styles.itemHeader} onPress={() => toggleItem(index)}>
                <Ionicons
                  name={item.isSelected ? 'checkbox' : 'square-outline'}
                  size={24}
                  color={item.isSelected ? colors.primary[500] : colors.gray[300]}
                />
                <Text style={[styles.itemDescription, !item.isSelected && styles.textDeselected]}>
                  {item.description}
                </Text>
              </TouchableOpacity>

              {item.reasoning ? (
                <Text style={styles.reasoningText}>{item.reasoning}</Text>
              ) : null}

              <View style={styles.itemDetails}>
                <View style={styles.detailField}>
                  <Text style={styles.detailLabel}>Qty</Text>
                  <TextInput
                    style={styles.detailInput}
                    value={item.quantity.toString()}
                    onChangeText={(text) => updateQuantity(index, text)}
                    keyboardType="decimal-pad"
                  />
                  <Text style={styles.unitLabel}>{item.unit}</Text>
                </View>

                <View style={styles.detailField}>
                  <Text style={styles.detailLabel}>$/unit</Text>
                  <TextInput
                    style={styles.detailInput}
                    value={item.unitCost.toFixed(2)}
                    onChangeText={(text) => updateUnitCost(index, text)}
                    keyboardType="decimal-pad"
                  />
                </View>

                <View style={styles.totalField}>
                  <Text style={styles.detailLabel}>Total</Text>
                  <Text style={styles.totalValue}>{formatCurrency(item.totalCost)}</Text>
                </View>
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      {/* Bottom bar */}
      <View style={styles.bottomBar}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Room Total</Text>
          <Text style={styles.totalAmount}>{formatCurrency(selectedTotal)}</Text>
        </View>
        <Button
          title="Save & Continue"
          onPress={saveAndContinue}
          loading={isSaving}
          fullWidth
          size="lg"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.base, paddingBottom: 160 },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: { ...typography.body, color: colors.text.secondary, marginTop: spacing.md },
  emptyContainer: { alignItems: 'center', paddingTop: spacing['3xl'] },
  emptyText: { ...typography.heading3, color: colors.text.primary },
  emptySubtext: { ...typography.bodySmall, color: colors.text.secondary, marginTop: spacing.xs },
  itemCard: { marginBottom: spacing.sm },
  itemDeselected: { opacity: 0.5 },
  itemHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  itemDescription: { ...typography.body, fontWeight: '600', color: colors.text.primary, flex: 1 },
  textDeselected: { textDecorationLine: 'line-through' },
  reasoningText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontStyle: 'italic',
    marginTop: spacing.xs,
    marginLeft: 36,
  },
  itemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
    marginLeft: 36,
  },
  detailField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  detailLabel: { ...typography.caption, color: colors.text.secondary },
  detailInput: {
    ...typography.bodySmall,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    minWidth: 60,
    textAlign: 'center',
    color: colors.text.primary,
    backgroundColor: colors.white,
  },
  unitLabel: { ...typography.caption, color: colors.text.secondary },
  totalField: { marginLeft: 'auto', alignItems: 'flex-end' },
  totalValue: { ...typography.body, fontWeight: '700', color: colors.text.primary },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    padding: spacing.base,
    paddingBottom: spacing['2xl'],
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  totalLabel: { ...typography.heading3, color: colors.text.primary },
  totalAmount: { ...typography.heading2, color: colors.primary[600] },
});
