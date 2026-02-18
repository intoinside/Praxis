import { BackgroundTask } from './base.js';
import { LLMService } from '../../llm/service.js';
import { loadConfig } from '../config.js';

export class LLMChatTask extends BackgroundTask {
    private prompt: string;
    private system?: string;

    constructor(id: string, prompt: string, system?: string) {
        super(id);
        this.prompt = prompt;
        this.system = system;
    }

    async execute(): Promise<void> {
        const config = loadConfig();
        if (!config.agent.llm) {
            throw new Error('LLM not configured');
        }

        const llmService = new LLMService(config);

        this.updateProgress(10, 'Initializing LLM...');

        try {
            const response = await llmService.complete({
                prompt: this.prompt,
                system: this.system
            });

            console.log(`[LLMChatTask] Response: ${response.content}`);
            // In a real scenario, we might want to store this response somewhere or send it back via MQTT.
            // For now, logging it is enough for verification.

            this.updateProgress(100, 'Completed');
        } catch (error) {
            console.error('[LLMChatTask] Error:', error);
            throw error;
        }
    }
}
