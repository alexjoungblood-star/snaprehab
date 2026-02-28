import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import { supabase } from '../../../../../src/services/supabase/client';
import { analyzeRoomPhotos } from '../../../../../src/services/ai/analysisService';
import { useSettingsStore } from '../../../../../src/stores/settingsStore';
import { Button } from '../../../../../src/components/ui/Button';
import { Card } from '../../../../../src/components/ui/Card';
import { Badge } from '../../../../../src/components/ui/Badge';
import { colors } from '../../../../../src/theme/colors';
import { typography } from '../../../../../src/theme/typography';
import { spacing } from '../../../../../src/theme/spacing';
import type { Observation, Defect, SuggestedRepair } from '../../../../../src/services/ai/types';

type AnalysisState = 'loading' | 'analyzing' | 'done' | 'error';

export default function AnalysisScreen() {
  const { id, roomId } = useLocalSearchParams<{ id: string; roomId: string }>();
  const router = useRouter();
  const { aiProvider } = useSettingsStore();
  const [state, setState] = useState<AnalysisState>('loading');
  const [narrative, setNarrative] = useState('');
  const [observations, setObservations] = useState<Observation[]>([]);
  const [defects, setDefects] = useState<Defect[]>([]);
  const [conditionScore, setConditionScore] = useState(0);
  const [hasFollowUps, setHasFollowUps] = useState(false);
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    checkExistingAnalysis();
  }, []);

  const checkExistingAnalysis = async () => {
    // Check if analysis already exists
    const { data: existing } = await supabase
      .from('ai_analyses')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (existing && existing.length > 0) {
      const analysis = existing[0];
      setAnalysisId(analysis.id);
      setNarrative(analysis.narrative_summary || '');
      setObservations(analysis.observations || []);
      setDefects(analysis.defects || []);
      setConditionScore(analysis.condition_score || 0);
      setHasFollowUps((analysis.follow_up_questions || []).length > 0);
      setState('done');
    } else {
      runAnalysis();
    }
  };

  const runAnalysis = async () => {
    setState('analyzing');
    try {
      // Load room info and photos
      const { data: room } = await supabase
        .from('rooms')
        .select('room_type')
        .eq('id', roomId)
        .single();

      const { data: property } = await supabase
        .from('properties')
        .select('year_built, square_footage, zip_code, rehab_level')
        .eq('id', id)
        .single();

      const { data: photos } = await supabase
        .from('photos')
        .select('local_uri, storage_path, photo_type')
        .eq('room_id', roomId)
        .order('photo_position');

      if (!room || !property || !photos || photos.length === 0) {
        throw new Error('Missing room, property, or photo data');
      }

      // Convert photos to base64
      const photoInputs = await Promise.all(
        photos.map(async (photo: any) => {
          const uri = photo.local_uri || photo.storage_path;
          if (!uri) throw new Error('No photo URI available');

          const base64 = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
          });

          return {
            base64,
            mimeType: 'image/jpeg' as const,
            photoType: photo.photo_type || 'standard',
          };
        })
      );

      const result = await analyzeRoomPhotos({
        photos: photoInputs,
        roomType: room.room_type,
        rehabLevel: property.rehab_level,
        propertyContext: {
          yearBuilt: property.year_built,
          squareFootage: property.square_footage,
          zipCode: property.zip_code,
        },
      });

      // Save analysis to database
      const { data: saved } = await supabase
        .from('ai_analyses')
        .insert({
          room_id: roomId,
          ai_provider: result.provider,
          model_version: result.modelVersion,
          observations: result.observations,
          defects: result.defects,
          condition_score: result.conditionScore,
          follow_up_questions: result.followUpQuestions,
          suggested_repairs: result.suggestedRepairs,
          narrative_summary: result.narrativeSummary,
          raw_response: result.rawResponse,
          tokens_used: result.tokensUsed,
          latency_ms: result.latencyMs,
        })
        .select()
        .single();

      // Update room status
      await supabase
        .from('rooms')
        .update({ status: 'analyzed' })
        .eq('id', roomId);

      setAnalysisId(saved?.id ?? null);
      setNarrative(result.narrativeSummary);
      setObservations(result.observations);
      setDefects(result.defects);
      setConditionScore(result.conditionScore);
      setHasFollowUps(result.followUpQuestions.length > 0);
      setState('done');
    } catch (err: any) {
      setError(err.message || 'Analysis failed');
      setState('error');
    }
  };

  const severityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return colors.severity.critical;
      case 'major': return colors.severity.major;
      case 'moderate': return colors.severity.moderate;
      case 'minor': return colors.severity.minor;
      default: return colors.severity.info;
    }
  };

  const severityVariant = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'major': return 'error' as const;
      case 'moderate': return 'warning' as const;
      case 'minor': return 'default' as const;
      default: return 'info' as const;
    }
  };

  if (state === 'loading' || state === 'analyzing') {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
        <Text style={styles.loadingText}>
          {state === 'loading' ? 'Loading...' : 'AI is analyzing your photos...'}
        </Text>
        <Text style={styles.loadingSubtext}>
          This usually takes 10-30 seconds
        </Text>
      </View>
    );
  }

  if (state === 'error') {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.error[500]} />
        <Text style={styles.errorTitle}>Analysis Failed</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Button title="Retry" onPress={runAnalysis} style={styles.retryButton} />
        <Button
          title="Continue Without AI"
          onPress={() => router.replace(`/property/${id}/room/${roomId}/repairs`)}
          variant="outline"
          style={styles.skipButton}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Condition Score */}
      <Card style={styles.scoreCard}>
        <Text style={styles.scoreLabel}>Overall Condition</Text>
        <View style={styles.scoreRow}>
          <Text style={styles.scoreValue}>{conditionScore}</Text>
          <Text style={styles.scoreMax}>/10</Text>
        </View>
      </Card>

      {/* Narrative Summary */}
      {narrative ? (
        <Card style={styles.narrativeCard}>
          <Text style={styles.narrativeText}>{narrative}</Text>
        </Card>
      ) : null}

      {/* Defects */}
      {defects.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Issues Found ({defects.length})</Text>
          {defects.map((defect, i) => (
            <Card key={i} style={styles.defectCard}>
              <View style={styles.defectHeader}>
                <Badge label={defect.severity} variant={severityVariant(defect.severity)} />
                <Text style={styles.defectType}>{defect.type.replace(/_/g, ' ')}</Text>
              </View>
              <Text style={styles.defectLocation}>{defect.location}</Text>
              <Text style={styles.defectDescription}>{defect.description}</Text>
            </Card>
          ))}
        </>
      )}

      {/* Observations */}
      <Text style={styles.sectionTitle}>Observations ({observations.length})</Text>
      {observations.map((obs, i) => (
        <Card key={i} style={styles.observationCard}>
          <View style={styles.obsHeader}>
            <Text style={styles.obsCategory}>{obs.category}</Text>
            <Badge label={obs.severity} variant={severityVariant(obs.severity)} />
          </View>
          <Text style={styles.obsDescription}>{obs.description}</Text>
        </Card>
      ))}

      {/* Actions */}
      <View style={styles.actions}>
        {hasFollowUps && (
          <Button
            title="Answer Follow-Up Questions"
            onPress={() => router.push(`/property/${id}/room/${roomId}/followup`)}
            fullWidth
            size="lg"
          />
        )}
        <Button
          title="View Repair Items"
          onPress={() => router.push(`/property/${id}/room/${roomId}/repairs`)}
          variant={hasFollowUps ? 'outline' : 'primary'}
          fullWidth
          size="lg"
          style={styles.repairsButton}
        />
      </View>
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
    padding: spacing['2xl'],
    backgroundColor: colors.background,
  },
  loadingText: {
    ...typography.heading3,
    color: colors.text.primary,
    marginTop: spacing.xl,
    textAlign: 'center',
  },
  loadingSubtext: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing.sm,
  },
  errorTitle: { ...typography.heading2, color: colors.error[600], marginTop: spacing.lg },
  errorText: {
    ...typography.body,
    color: colors.text.secondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  retryButton: { marginTop: spacing.xl, minWidth: 200 },
  skipButton: { marginTop: spacing.md, minWidth: 200 },
  scoreCard: { alignItems: 'center', marginBottom: spacing.base },
  scoreLabel: { ...typography.label, color: colors.text.secondary },
  scoreRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: spacing.xs },
  scoreValue: { fontSize: 48, fontWeight: '700', color: colors.primary[600] },
  scoreMax: { fontSize: 20, fontWeight: '500', color: colors.text.secondary, marginLeft: 4 },
  narrativeCard: { marginBottom: spacing.base, backgroundColor: colors.primary[50] },
  narrativeText: { ...typography.body, color: colors.primary[800], lineHeight: 24 },
  sectionTitle: {
    ...typography.heading3,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  defectCard: { marginBottom: spacing.sm, borderLeftWidth: 3, borderLeftColor: colors.error[500] },
  defectHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  defectType: { ...typography.body, fontWeight: '600', color: colors.text.primary, textTransform: 'capitalize' },
  defectLocation: { ...typography.caption, color: colors.text.secondary, marginBottom: spacing.xs },
  defectDescription: { ...typography.bodySmall, color: colors.text.primary },
  observationCard: { marginBottom: spacing.sm },
  obsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  obsCategory: { ...typography.label, color: colors.primary[600], textTransform: 'capitalize' },
  obsDescription: { ...typography.bodySmall, color: colors.text.primary },
  actions: { marginTop: spacing.xl },
  repairsButton: { marginTop: spacing.md },
});
