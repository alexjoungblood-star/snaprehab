import type { AIProvider, PhotoAnalysisRequest, PhotoAnalysisResponse } from '../types';
import { SYSTEM_PROMPT } from '../prompts/systemPrompt';
import { buildAnalysisPrompt } from '../prompts/roomPrompts';

export class ClaudeProvider implements AIProvider {
  name = 'claude' as const;
  private apiKey: string;
  private baseUrl = 'https://api.anthropic.com/v1/messages';

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

    // Build content array with images + text
    const content: any[] = [
      ...request.photos.map((photo) => ({
        type: 'image',
        source: {
          type: 'base64',
          media_type: photo.mimeType,
          data: photo.base64,
        },
      })),
      { type: 'text', text: userPrompt },
    ];

    // If user provided follow-up responses, append them
    if (request.userResponses && request.userResponses.length > 0) {
      const followUpContext = request.userResponses
        .map((r) => `Q: ${r.questionText}\nA: ${r.responseText}`)
        .join('\n\n');
      content.push({
        type: 'text',
        text: `\n\nThe user answered these follow-up questions about this room:\n${followUpContext}\n\nPlease refine your analysis based on these answers.`,
      });
    }

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2024-10-22',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content }],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Claude API error: ${response.status} - ${JSON.stringify(errorData)}`
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
    const textContent = data.content?.find((c: any) => c.type === 'text');
    if (!textContent) {
      throw new Error('No text content in Claude response');
    }

    let parsed: any;
    try {
      // Try to parse the raw text as JSON
      parsed = JSON.parse(textContent.text);
    } catch {
      // If that fails, try to extract JSON from code blocks
      const jsonMatch = textContent.text.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[1].trim());
      } else {
        throw new Error('Failed to parse JSON from Claude response');
      }
    }

    return {
      provider: 'claude',
      modelVersion: data.model ?? 'claude-sonnet-4-20250514',
      observations: parsed.observations ?? [],
      defects: parsed.defects ?? [],
      conditionScore: parsed.conditionScore ?? 5,
      followUpQuestions: parsed.followUpQuestions ?? [],
      suggestedRepairs: parsed.suggestedRepairs ?? [],
      narrativeSummary: parsed.narrativeSummary ?? '',
      rawResponse: data,
      tokensUsed: (data.usage?.input_tokens ?? 0) + (data.usage?.output_tokens ?? 0),
      latencyMs,
    };
  }
}
