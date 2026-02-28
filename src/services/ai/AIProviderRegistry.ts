import type { AIProvider, AIProviderName, PhotoAnalysisRequest, PhotoAnalysisResponse } from './types';

class AIProviderRegistry {
  private providers: Map<AIProviderName, AIProvider> = new Map();
  private primaryProvider: AIProviderName = 'claude';

  register(provider: AIProvider): void {
    this.providers.set(provider.name, provider);
  }

  setPrimary(name: AIProviderName): void {
    if (!this.providers.has(name)) {
      throw new Error(`Provider "${name}" is not registered`);
    }
    this.primaryProvider = name;
  }

  getPrimary(): AIProviderName {
    return this.primaryProvider;
  }

  async analyze(request: PhotoAnalysisRequest): Promise<PhotoAnalysisResponse> {
    const primary = this.providers.get(this.primaryProvider);
    if (!primary) throw new Error('No primary provider configured');

    try {
      const isAvailable = await primary.isAvailable();
      if (!isAvailable) throw new Error(`${this.primaryProvider} is not available`);
      return await primary.analyzePhotos(request);
    } catch (error) {
      // Attempt fallback to the other provider
      const fallbackName: AIProviderName =
        this.primaryProvider === 'claude' ? 'openai' : 'claude';
      const fallback = this.providers.get(fallbackName);

      if (fallback) {
        console.warn(
          `Primary provider ${this.primaryProvider} failed, falling back to ${fallbackName}`,
          error
        );
        return await fallback.analyzePhotos(request);
      }

      throw error;
    }
  }

  getProvider(name: AIProviderName): AIProvider | undefined {
    return this.providers.get(name);
  }
}

export const aiProviderRegistry = new AIProviderRegistry();
