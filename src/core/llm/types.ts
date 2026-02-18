export interface LLMRequest {
    system?: string;
    prompt: string;
    history?: { role: 'user' | 'assistant' | 'system'; content: string }[];
}

export interface LLMResponse {
    content: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}

export interface LLMProvider {
    name: string;
    complete(request: LLMRequest): Promise<LLMResponse>;
}
