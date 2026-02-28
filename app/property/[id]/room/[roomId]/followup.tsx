import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../../../../src/services/supabase/client';
import { Button } from '../../../../../src/components/ui/Button';
import { Card } from '../../../../../src/components/ui/Card';
import { colors } from '../../../../../src/theme/colors';
import { typography } from '../../../../../src/theme/typography';
import { spacing, borderRadius } from '../../../../../src/theme/spacing';

interface FollowUpQ {
  question: string;
  context: string;
  responseType: 'text' | 'yes_no' | 'multiple_choice' | 'numeric';
  options?: string[];
  priority: number;
}

export default function FollowUpScreen() {
  const { id, roomId } = useLocalSearchParams<{ id: string; roomId: string }>();
  const router = useRouter();
  const [questions, setQuestions] = useState<FollowUpQ[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    const { data } = await supabase
      .from('ai_analyses')
      .select('id, follow_up_questions')
      .eq('room_id', roomId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (data && data.length > 0) {
      setAnalysisId(data[0].id);
      const qs: FollowUpQ[] = data[0].follow_up_questions || [];
      setQuestions(qs.sort((a, b) => a.priority - b.priority));
    }
    setIsLoading(false);
  };

  const setAnswer = (index: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [index]: value }));
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      // Save follow-up responses
      const responses = Object.entries(answers).map(([index, text]) => ({
        analysis_id: analysisId,
        room_id: roomId,
        question_index: parseInt(index, 10),
        question_text: questions[parseInt(index, 10)]?.question ?? '',
        response_text: text,
        response_type: questions[parseInt(index, 10)]?.responseType ?? 'text',
      }));

      if (responses.length > 0) {
        await supabase.from('followup_responses').insert(responses);
      }

      // Navigate to repair items
      router.replace(`/property/${id}/room/${roomId}/repairs`);
    } catch {
      // Continue even if save fails
      router.replace(`/property/${id}/room/${roomId}/repairs`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  if (questions.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="checkmark-circle-outline" size={48} color={colors.success[500]} />
        <Text style={styles.noQuestionsText}>No follow-up questions needed</Text>
        <Button
          title="Continue to Repair Items"
          onPress={() => router.replace(`/property/${id}/room/${roomId}/repairs`)}
          size="lg"
          style={styles.continueButton}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerText}>
        The AI has some follow-up questions to refine the estimate. Answer what you can — skip any you're unsure about.
      </Text>

      {questions.map((q, index) => (
        <Card key={index} style={styles.questionCard}>
          <Text style={styles.questionText}>{q.question}</Text>
          <Text style={styles.contextText}>{q.context}</Text>

          {q.responseType === 'yes_no' ? (
            <View style={styles.yesNoRow}>
              {['Yes', 'No', 'Not Sure'].map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[
                    styles.yesNoButton,
                    answers[index] === opt && styles.yesNoSelected,
                  ]}
                  onPress={() => setAnswer(index, opt)}
                >
                  <Text
                    style={[
                      styles.yesNoText,
                      answers[index] === opt && styles.yesNoTextSelected,
                    ]}
                  >
                    {opt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : q.responseType === 'multiple_choice' && q.options ? (
            <View style={styles.optionsColumn}>
              {q.options.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[
                    styles.optionButton,
                    answers[index] === opt && styles.optionSelected,
                  ]}
                  onPress={() => setAnswer(index, opt)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      answers[index] === opt && styles.optionTextSelected,
                    ]}
                  >
                    {opt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <TextInput
              style={styles.textInput}
              placeholder="Type your answer..."
              placeholderTextColor={colors.gray[400]}
              value={answers[index] || ''}
              onChangeText={(text) => setAnswer(index, text)}
              multiline={q.responseType === 'text'}
              keyboardType={q.responseType === 'numeric' ? 'numeric' : 'default'}
            />
          )}
        </Card>
      ))}

      <Button
        title="Submit & View Repair Items"
        onPress={handleSubmit}
        loading={isSaving}
        fullWidth
        size="lg"
        style={styles.submitButton}
      />
      <Button
        title="Skip — Go to Repair Items"
        onPress={() => router.replace(`/property/${id}/room/${roomId}/repairs`)}
        variant="ghost"
        fullWidth
        style={styles.skipButton}
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
    padding: spacing['2xl'],
    backgroundColor: colors.background,
  },
  noQuestionsText: {
    ...typography.heading3,
    color: colors.text.primary,
    marginTop: spacing.lg,
  },
  continueButton: { marginTop: spacing.xl },
  headerText: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  questionCard: { marginBottom: spacing.base },
  questionText: { ...typography.body, fontWeight: '600', color: colors.text.primary },
  contextText: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
    fontStyle: 'italic',
  },
  yesNoRow: { flexDirection: 'row', gap: spacing.sm },
  yesNoButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
  },
  yesNoSelected: { borderColor: colors.primary[500], backgroundColor: colors.primary[50] },
  yesNoText: { ...typography.bodySmall, color: colors.text.secondary, fontWeight: '500' },
  yesNoTextSelected: { color: colors.primary[600] },
  optionsColumn: { gap: spacing.sm },
  optionButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  optionSelected: { borderColor: colors.primary[500], backgroundColor: colors.primary[50] },
  optionText: { ...typography.bodySmall, color: colors.text.secondary },
  optionTextSelected: { color: colors.primary[600], fontWeight: '500' },
  textInput: {
    ...typography.body,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    color: colors.text.primary,
    minHeight: 48,
    backgroundColor: colors.white,
  },
  submitButton: { marginTop: spacing.xl },
  skipButton: { marginTop: spacing.sm },
});
