import { aiProviderRegistry } from './AIProviderRegistry';
import { ClaudeProvider } from './providers/ClaudeProvider';
import { OpenAIProvider } from './providers/OpenAIProvider';
import type { PhotoAnalysisRequest, PhotoAnalysisResponse, AIProviderName } from './types';

let isInitialized = false;

export function initializeAIProviders() {
  if (isInitialized) return;

  const claudeKey = process.env.EXPO_PUBLIC_CLAUDE_API_KEY;
  const openaiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

  if (claudeKey) {
    aiProviderRegistry.register(new ClaudeProvider(claudeKey));
  }

  if (openaiKey) {
    aiProviderRegistry.register(new OpenAIProvider(openaiKey));
  }

  isInitialized = true;
}

export function setPreferredProvider(provider: AIProviderName) {
  aiProviderRegistry.setPrimary(provider);
}

export async function analyzeRoomPhotos(
  request: PhotoAnalysisRequest
): Promise<PhotoAnalysisResponse> {
  initializeAIProviders();
  return aiProviderRegistry.analyze(request);
}
