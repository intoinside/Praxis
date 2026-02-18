import { mqClient } from '../../core/agent/mq-client.js';
import { loadConfig } from '../../core/agent/config.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Action for 'praxis agent ask <prompt>'
 */
export async function agentAskAction(prompt: string) {
    const config = loadConfig();

    if (!config.agent.enabled) {
        console.error('Agent support is disabled in configuration.');
        process.exit(0);
    }

    console.log(`Sending prompt to agent: "${prompt}"`);

    try {
        const { queueTask } = await import('../../core/agent/persistence.js');
        const taskId = await queueTask('llm-chat', { prompt });

        console.log(`Task queued: ${taskId}`);
        console.log('Check agent logs for response.');

        // We need to disconnect explicitly if queueTask connected to MQTT, 
        // but queueTask uses mqClient singleton which might be connected.
        // Actually queueTask calls mqClient.publishTask which connects if needed.
        await mqClient.disconnect();
    } catch (error) {
        console.error('Failed to send prompt:', error);
        process.exit(1);
    }
}
