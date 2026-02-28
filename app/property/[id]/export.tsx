import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { supabase } from '../../../src/services/supabase/client';
import { calculateEstimateTotal } from '../../../src/services/costs/costEngine';
import { Card } from '../../../src/components/ui/Card';
import { Button } from '../../../src/components/ui/Button';
import { colors } from '../../../src/theme/colors';
import { typography } from '../../../src/theme/typography';
import { spacing } from '../../../src/theme/spacing';
import { formatCurrencyDetailed } from '../../../src/utils/formatCurrency';
import { ROOM_TYPE_LABELS } from '../../../src/types/room';

export default function ExportScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [includeEstimate, setIncludeEstimate] = useState(true);
  const [includeSOW, setIncludeSOW] = useState(true);
  const [includePhotos, setIncludePhotos] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      // Load property info
      const { data: property } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();

      if (!property) throw new Error('Property not found');

      const address = `${property.address_line1}, ${property.city}, ${property.state} ${property.zip_code}`;
      const date = new Date().toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      });

      let html = `
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { font-family: -apple-system, Helvetica, Arial, sans-serif; color: #111827; padding: 40px; font-size: 12px; }
              .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #4F46E5; padding-bottom: 20px; }
              .header h1 { font-size: 24px; color: #4F46E5; letter-spacing: 2px; }
              .header .address { font-size: 16px; margin-top: 8px; }
              .header .date { font-size: 12px; color: #6B7280; margin-top: 4px; }
              .details { display: flex; gap: 20px; margin-bottom: 20px; }
              .detail-item { background: #F3F4F6; padding: 8px 16px; border-radius: 6px; }
              h2 { font-size: 16px; color: #4F46E5; margin: 24px 0 12px; border-bottom: 1px solid #E5E7EB; padding-bottom: 6px; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
              th { background: #F9FAFB; padding: 8px 10px; text-align: left; font-size: 11px; color: #6B7280; border-bottom: 2px solid #E5E7EB; }
              td { padding: 6px 10px; border-bottom: 1px solid #F3F4F6; font-size: 11px; }
              .text-right { text-align: right; }
              .total-row td { font-weight: 700; border-top: 2px solid #111827; font-size: 13px; }
              .grand-total td { font-size: 16px; color: #4F46E5; }
              .sow-section { margin-bottom: 20px; }
              .sow-item { padding: 4px 0; padding-left: 24px; }
              .sow-number { color: #4F46E5; font-weight: 700; }
              .footer { margin-top: 40px; text-align: center; color: #9CA3AF; font-size: 10px; border-top: 1px solid #E5E7EB; padding-top: 16px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>SNAPREHAB</h1>
              <div class="address">${address}</div>
              <div class="date">${date}</div>
            </div>
      `;

      // Estimate section
      if (includeEstimate) {
        const { data: items } = await supabase
          .from('repair_items')
          .select('*, rooms(room_type, room_label)')
          .eq('property_id', id)
          .eq('is_selected', true)
          .order('sort_order');

        if (items && items.length > 0) {
          // Group by category
          const categories = new Map<string, typeof items>();
          for (const item of items) {
            const cat = (item.category || 'general').toLowerCase();
            if (!categories.has(cat)) categories.set(cat, []);
            categories.get(cat)!.push(item);
          }

          const totals = calculateEstimateTotal(
            items.map((i: any) => ({
              quantity: parseFloat(i.quantity),
              unitCost: parseFloat(i.unit_cost),
              isSelected: true,
            })),
            15
          );

          html += `<h2>Rehab Cost Estimate</h2>`;
          html += `<table>
            <tr><th>Description</th><th>Room</th><th class="text-right">Qty</th><th>Unit</th><th class="text-right">Unit Cost</th><th class="text-right">Total</th></tr>`;

          for (const [cat, catItems] of categories) {
            const catLabel = cat.charAt(0).toUpperCase() + cat.slice(1);
            html += `<tr><td colspan="6" style="background:#EEF2FF;font-weight:700;color:#4F46E5;">${catLabel}</td></tr>`;

            for (const item of catItems) {
              const roomData = item.rooms as any;
              const roomLabel = roomData?.room_label || ROOM_TYPE_LABELS[roomData?.room_type as keyof typeof ROOM_TYPE_LABELS] || '';
              html += `<tr>
                <td>${item.description}</td>
                <td>${roomLabel}</td>
                <td class="text-right">${parseFloat(item.quantity)}</td>
                <td>${item.unit}</td>
                <td class="text-right">${formatCurrencyDetailed(parseFloat(item.unit_cost))}</td>
                <td class="text-right">${formatCurrencyDetailed(parseFloat(item.total_cost))}</td>
              </tr>`;
            }
          }

          html += `
            <tr class="total-row"><td colspan="5">Subtotal</td><td class="text-right">${formatCurrencyDetailed(totals.subtotal)}</td></tr>
            <tr class="total-row"><td colspan="5">Contingency (15%)</td><td class="text-right">${formatCurrencyDetailed(totals.contingencyAmt)}</td></tr>
            <tr class="total-row grand-total"><td colspan="5">TOTAL ESTIMATE</td><td class="text-right">${formatCurrencyDetailed(totals.total)}</td></tr>
          </table>`;
        }
      }

      // SOW section
      if (includeSOW) {
        const { data: items } = await supabase
          .from('repair_items')
          .select('*, rooms(room_type, room_label)')
          .eq('property_id', id)
          .eq('is_selected', true)
          .order('sort_order');

        if (items && items.length > 0) {
          const roomMap = new Map<string, { label: string; items: string[] }>();

          for (const item of items) {
            const roomData = item.rooms as any;
            const roomKey = item.room_id || 'general';
            const roomLabel = roomData?.room_label ||
              ROOM_TYPE_LABELS[roomData?.room_type as keyof typeof ROOM_TYPE_LABELS] || 'General';

            if (!roomMap.has(roomKey)) roomMap.set(roomKey, { label: roomLabel, items: [] });

            const qty = parseFloat(item.quantity);
            const unit = item.unit;
            let sowText = item.description;
            if (qty > 0 && unit !== 'LS') sowText = `${item.description} (${qty} ${unit})`;
            roomMap.get(roomKey)!.items.push(sowText);
          }

          html += `<h2>Scope of Work</h2>`;

          for (const [, room] of roomMap) {
            html += `<div class="sow-section">
              <h3 style="font-size:13px;margin-bottom:8px;">${room.label.toUpperCase()}</h3>`;
            room.items.forEach((item, i) => {
              html += `<div class="sow-item"><span class="sow-number">${i + 1}.</span> ${item}</div>`;
            });
            html += `</div>`;
          }
        }
      }

      html += `
            <div class="footer">
              Generated by SnapRehab | ${date} | This is an estimate — actual costs may vary
            </div>
          </body>
        </html>
      `;

      // Generate PDF
      const { uri } = await Print.printToFileAsync({ html, width: 612, height: 792 });

      // Share the PDF
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: `SnapRehab Estimate - ${address}`,
          UTI: 'com.adobe.pdf',
        });
      } else {
        Alert.alert('Success', `PDF saved to: ${uri}`);
      }
    } catch (err: any) {
      Alert.alert('Error', `Failed to generate PDF: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Export Options</Text>
      <Text style={styles.subtitle}>
        Choose what to include in your PDF export
      </Text>

      <Card style={styles.optionCard}>
        <View style={styles.optionRow}>
          <View style={styles.optionInfo}>
            <Ionicons name="calculator-outline" size={24} color={colors.primary[500]} />
            <View>
              <Text style={styles.optionLabel}>Cost Estimate</Text>
              <Text style={styles.optionDesc}>Categorized line items with totals</Text>
            </View>
          </View>
          <Switch
            value={includeEstimate}
            onValueChange={setIncludeEstimate}
            trackColor={{ true: colors.primary[500] }}
          />
        </View>
      </Card>

      <Card style={styles.optionCard}>
        <View style={styles.optionRow}>
          <View style={styles.optionInfo}>
            <Ionicons name="document-text-outline" size={24} color={colors.primary[500]} />
            <View>
              <Text style={styles.optionLabel}>Scope of Work</Text>
              <Text style={styles.optionDesc}>Contractor-ready room-by-room SOW</Text>
            </View>
          </View>
          <Switch
            value={includeSOW}
            onValueChange={setIncludeSOW}
            trackColor={{ true: colors.primary[500] }}
          />
        </View>
      </Card>

      <Card style={styles.optionCard}>
        <View style={styles.optionRow}>
          <View style={styles.optionInfo}>
            <Ionicons name="images-outline" size={24} color={colors.gray[400]} />
            <View>
              <Text style={[styles.optionLabel, styles.disabledText]}>Property Photos</Text>
              <Text style={styles.optionDesc}>Coming in a future update</Text>
            </View>
          </View>
          <Switch value={false} disabled trackColor={{ true: colors.gray[300] }} />
        </View>
      </Card>

      <Button
        title={isGenerating ? 'Generating PDF...' : 'Generate & Share PDF'}
        onPress={generatePDF}
        loading={isGenerating}
        disabled={!includeEstimate && !includeSOW}
        fullWidth
        size="lg"
        style={styles.generateButton}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.base, paddingBottom: spacing['3xl'] },
  title: { ...typography.heading2, color: colors.text.primary },
  subtitle: { ...typography.body, color: colors.text.secondary, marginTop: spacing.xs, marginBottom: spacing.xl },
  optionCard: { marginBottom: spacing.sm },
  optionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  optionInfo: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  optionLabel: { ...typography.body, fontWeight: '600', color: colors.text.primary },
  optionDesc: { ...typography.caption, color: colors.text.secondary },
  disabledText: { color: colors.gray[400] },
  generateButton: { marginTop: spacing.xl },
});
