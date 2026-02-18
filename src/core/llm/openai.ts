import { LLMProvider, LLMRequest, LLMResponse } from './types.js';

export class OpenAIProvider implements LLMProvider {
    name = 'openai';
    private apiKey: string;
    private model: string;
    private baseUrl: string;

    constructor(apiKey: string, model: string, baseUrl: string = 'https://api.openai.com/v1') {
        this.apiKey = apiKey;
        this.model = model;
        this.baseUrl = baseUrl;
    }

    async complete(request: LLMRequest): Promise<LLMResponse> {
        const messages = [];

        if (request.system) {
            messages.push({ role: 'system', content: request.system });
        }

        if (request.history) {
            messages.push(...request.history);
        }

        messages.push({ role: 'user', content: request.prompt });

        const response = await fetch(`${this.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: this.model,
                messages: messages,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`OpenAI API error: ${response.statusText} - ${error}`);
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content || '';

        return {
            content,
            usage: {
                promptTokens: data.usage?.prompt_tokens || 0,
                completionTokens: data.usage?.completion_tokens || 0,
                totalTokens: data.usage?.total_tokens || 0
            }
        };
    }
}
