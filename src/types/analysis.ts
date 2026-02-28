export type AIProviderName = 'claude' | 'openai';
export type SeverityLevel = 'info' | 'minor' | 'moderate' | 'major' | 'critical';

export interface Observation {
  category: string;
  description: string;
  severity: SeverityLevel;
  confidence: number;
}

export interface Defect {
  type: string;
  location: string;
  severity: SeverityLevel;
  description: string;
}

export interface FollowUpQuestion {
  question: string;
  context: string;
  responseType: 'text' | 'yes_no' | 'multiple_choice' | 'numeric';
  options?: string[];
  priority: number;
}

export interface SuggestedRepair {
  repairCode: string;
  description: string;
  estimatedQuantity: number;
  unit: string;
  confidence: number;
  reasoning: string;
}

export interface AIAnalysis {
  id: string;
  roomId: string;
  photoId?: string;
  aiProvider: AIProviderName;
  modelVersion: string;
  observations: Observation[];
  defects: Defect[];
  conditionScore: number;
  followUpQuestions: FollowUpQuestion[];
  suggestedRepairs: SuggestedRepair[];
  tokensUsed: number;
  latencyMs: number;
  createdAt: string;
}

export interface FollowUpResponse {
  id: string;
  analysisId: string;
  roomId: string;
  questionIndex: number;
  questionText: string;
  responseText: string;
  responseType: 'text' | 'yes_no' | 'multiple_choice' | 'numeric';
  createdAt: string;
}
