import type { RoomType } from '../../types/room';

export type AIProviderName = 'claude' | 'openai';
export type RehabLevel = 'cosmetic' | 'moderate' | 'full_gut';

export interface PhotoInput {
  base64: string;
  mimeType: 'image/jpeg' | 'image/png';
  photoType: string;
}

export interface PhotoAnalysisRequest {
  photos: PhotoInput[];
  roomType: RoomType;
  rehabLevel: RehabLevel;
  propertyContext: {
    yearBuilt?: number;
    squareFootage?: number;
    zipCode: string;
  };
  previousAnalyses?: string[];
  userResponses?: { questionIndex: number; questionText: string; responseText: string }[];
}

export interface Observation {
  category: string;
  description: string;
  severity: 'info' | 'minor' | 'moderate' | 'major' | 'critical';
  confidence: number;
}

export interface Defect {
  type: string;
  location: string;
  severity: 'minor' | 'moderate' | 'major' | 'critical';
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

export interface PhotoAnalysisResponse {
  provider: AIProviderName;
  modelVersion: string;
  observations: Observation[];
  defects: Defect[];
  conditionScore: number;
  followUpQuestions: FollowUpQuestion[];
  suggestedRepairs: SuggestedRepair[];
  narrativeSummary: string;
  rawResponse: unknown;
  tokensUsed: number;
  latencyMs: number;
}

export interface AIProvider {
  name: AIProviderName;
  analyzePhotos(request: PhotoAnalysisRequest): Promise<PhotoAnalysisResponse>;
  isAvailable(): Promise<boolean>;
}
