import { taskManager } from '../../core/agent/task-manager.js';
import { PraxisMcpServer } from '../../core/agent/mcp-server.js';
import { loadConfig } from '../../core/agent/config.js';
import { mqClient } from '../../core/agent/mq-client.js';

export interface ServeOptions {
    mcp?: boolean;
    polling?: boolean;
    pollInterval?: string;
    mqMode?: boolean;
    brokerHost?: string;
    brokerPort?: string;
}

/**
 * Action for 'praxis integration serve'
 * Starts the standalone background agent daemon with MCP support.
 */
export async function integrationServeAction(options: ServeOptions = {}) {
    const config = loadConfig();

    // Merge CLI options (overrides)
    if (options.mcp === false) config.agent.services.mcp = false;
    if (options.polling === false) config.agent.services.taskPolling = false;
    if (options.pollInterval) config.agent.pollIntervalMs = parseInt(options.pollInterval, 10);
    if (options.mqMode) config.agent.mode = 'mqtt';
    if (options.brokerHost && config.agent.mqtt) config.agent.mqtt.host = options.brokerHost;
    if (options.brokerPort && config.agent.mqtt) config.agent.mqtt.port = parseInt(options.brokerPort, 10);

    if (!config.agent.enabled && !options.mcp && !options.polling && config.agent.mode !== 'mqtt') {
        console.error('Error: Background agent is disabled in configuration.');
        console.error('Enable it in .praxisrc.json or use CLI flags.');
        return;
    }

    console.error('Starting Praxis Background Agent...');

    if (config.agent.mode === 'mqtt' && config.agent.mqtt) {
        if (config.agent.mqtt.type === 'internal' && config.agent.mqtt.autoStart) {
            console.error(`- Auto-starting integrated MQTT broker on port ${config.agent.mqtt.port}`);
            await mqClient.startInternalBroker(config.agent.mqtt.port);
        }

        console.error(`- Connecting to MQTT broker at ${config.agent.mqtt.host}:${config.agent.mqtt.port}`);
        await mqClient.connect(config.agent.mqtt);

        console.error('- MQTT task listener enabled');
        taskManager.startMqListener(config.agent.mqtt.useSharedSubscription);
    } else if (config.agent.services.taskPolling) {
        console.error(`- Task polling enabled (interval: ${config.agent.pollIntervalMs}ms)`);
        taskManager.startPolling(config.agent.pollIntervalMs);
    }

    if (config.agent.services.mcp) {
        console.error('- MCP server enabled');
        const mcpServer = new PraxisMcpServer();
        await mcpServer.run();
    }

    return new Promise<void>((resolve) => {
        process.on('SIGINT', async () => {
            console.error('\nStopping Praxis Background Agent...');
            if (config.agent.mode === 'mqtt') {
                await mqClient.disconnect();
            }
            resolve();
        });
    });
}
