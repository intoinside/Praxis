import { LLMProvider, LLMRequest, LLMResponse } from './types.js';
import { OpenAIProvider } from './openai.js';
import { PraxisConfig } from '../agent/config.js';

export class LLMService {
    private provider: LLMProvider | null = null;

    constructor(config: PraxisConfig) {
        if (config.agent.llm) {
            const { provider, apiKey, model, options } = config.agent.llm;
            if (provider === 'openai') {
                this.provider = new OpenAIProvider(apiKey, model, options?.baseUrl);
            }
            // Add other providers here
        }
    }

    async complete(request: LLMRequest): Promise<LLMResponse> {
        if (!this.provider) {
            throw new Error('LLM provider not configured');
        }
        return this.provider.complete(request);
    }
}
