import { mqClient } from '../../core/agent/mq-client.js';
import { loadConfig } from '../../core/agent/config.js';

/**
 * Action for 'praxis agent broker'
 */
export async function agentBrokerAction(portOption?: string) {
    const config = loadConfig();
    const port = portOption ? parseInt(portOption) : (config.agent.mqtt?.port || 1883);

    console.error('Starting Praxis MQTT Broker...');
    console.error('This process acts as the central messaging hub for distributed agents.');

    try {
        await mqClient.startInternalBroker(port);
        console.error(`Broker is listening on mqtt://127.0.0.1:${port}`);

        // Keep process alive
        process.on('SIGINT', async () => {
            console.error('\nStopping broker...');
            await mqClient.disconnect();
            process.exit(0);
        });
    } catch (error) {
        if (error instanceof Error) {
            console.error(`Failed to start broker: ${error.message}`);
        } else {
            console.error('An unknown error occurred while starting the broker.');
        }
        process.exit(1);
    }
}
