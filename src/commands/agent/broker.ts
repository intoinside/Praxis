import { mqClient } from '../../core/agent/mq-client.js';
import { loadConfig } from '../../core/agent/config.js';

/**
 * Action for 'praxis agent broker'
 */
export async function agentBrokerAction(portOption?: string) {
    const config = loadConfig();

    if (!config.agent.enabled) {
        console.error('Agent support is disabled in configuration.');
        process.exit(0);
    }

    if (config.agent.broker === 'external') {
        console.error('Configured to use an external broker. Internal broker will not start.');
        process.exit(0);
    }

    let port = 1883;
    if (portOption) {
        port = parseInt(portOption);
    } else {
        try {
            const trimmedUrl = config.agent.brokerUrl.trim();
            const url = new URL(trimmedUrl);
            if (url.port) {
                port = parseInt(url.port);
            }
        } catch (e) {
            // Fallback to regex if URL parsing fails
            const match = config.agent.brokerUrl.match(/:(\d+)(?:["']|)?$/);
            if (match) {
                port = parseInt(match[1]);
            }
        }
    }

    if (isNaN(port)) {
        port = 1883;
    }

    console.error(`Starting Praxis MQTT Broker on port ${port}...`);
    console.error('This process acts as the central messaging hub for distributed agents.');

    try {
        await mqClient.startInternalBroker(port);
        console.error(`Broker is listening on mqtt://127.0.0.1:${port}`);

        // Keep process alive
        process.on('SIGINT', async () => {
            console.error('\nStopping broker...');
            try {
                await mqClient.disconnect();
            } catch (err) {
                console.error('Error during broker shutdown:', err);
            } finally {
                process.exit(0);
            }
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
