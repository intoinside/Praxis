import { queueTask } from '../../core/agent/persistence.js';

/**
 * Action for 'praxis agent ping'
 */
export async function agentPingAction() {
    console.error('Sending PING to agent queue...');
    try {
        const taskId = await queueTask('ping');
        console.error(`Ping task queued: ${taskId}`);

        // Disconnect and exit to return control to the console
        const { mqClient } = await import('../../core/agent/mq-client.js');
        await mqClient.disconnect();
        process.exit(0);
    } catch (error) {
        if (error instanceof Error) {
            console.error(`Failed to send ping: ${error.message}`);
        } else {
            console.error('An unknown error occurred while sending ping.');
        }
        process.exit(1);
    }
}
