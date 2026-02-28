import type { AIProvider, PhotoAnalysisRequest, PhotoAnalysisResponse } from '../types';
import { SYSTEM_PROMPT } from '../prompts/systemPrompt';
import { buildAnalysisPrompt } from '../prompts/roomPrompts';

export class OpenAIProvider implements AIProvider {
  name = 'openai' as const;
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1/chat/completions';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async analyzePhotos(request: PhotoAnalysisRequest): Promise<PhotoAnalysisResponse> {
    const startTime = Date.now();

    const userPrompt = buildAnalysisPrompt(
      request.roomType,
      request.rehabLevel,
      request.propertyContext.yearBuilt,
      request.previousAnalyses
    );

    // Build content array with images + text for OpenAI format
    const userContent: any[] = [
      ...request.photos.map((photo) => ({
        type: 'image_url',
        image_url: {
          url: `data:${photo.mimeType};base64,${photo.base64}`,
          detail: 'high',
        },
      })),
      { type: 'text', text: userPrompt },
    ];

    // Append follow-up responses if present
    if (request.userResponses && request.userResponses.length > 0) {
      const followUpContext = request.userResponses
        .map((r) => `Q: ${r.questionText}\nA: ${r.responseText}`)
        .join('\n\n');
      userContent.push({
        type: 'text',
        text: `\n\nThe user answered these follow-up questions:\n${followUpContext}\n\nRefine your analysis based on these answers.`,
      });
    }

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: 4096,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userContent },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `OpenAI API error: ${response.status} - ${JSON.stringify(errorData)}`
      );
    }

    const data = await response.json();
    const latencyMs = Date.now() - startTime;

    return this.parseResponse(data, latencyMs);
  }

  async isAvailable(): Promise<boolean> {
    return !!this.apiKey;
  }

  private parseResponse(data: any, latencyMs: number): PhotoAnalysisResponse {
    const messageContent = data.choices?.[0]?.message?.content;
    if (!messageContent) {
      throw new Error('No content in OpenAI response');
    }

    const parsed = JSON.parse(messageContent);

    return {
      provider: 'openai',
      modelVersion: data.model ?? 'gpt-4o',
      observations: parsed.observations ?? [],
      defects: parsed.defects ?? [],
      conditionScore: parsed.conditionScore ?? 5,
      followUpQuestions: parsed.followUpQuestions ?? [],
      suggestedRepairs: parsed.suggestedRepairs ?? [],
      narrativeSummary: parsed.narrativeSummary ?? '',
      rawResponse: data,
      tokensUsed: (data.usage?.prompt_tokens ?? 0) + (data.usage?.completion_tokens ?? 0),
      latencyMs,
    };
  }
}
