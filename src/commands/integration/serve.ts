import { taskManager } from '../../core/agent/task-manager.js';
import { PraxisMcpServer } from '../../core/agent/mcp-server.js';
import { loadConfig } from '../../core/agent/config.js';
import { mqClient } from '../../core/agent/mq-client.js';

export interface ServeOptions {
    noMcp?: boolean;
}

/**
 * Action for 'praxis serve'
 * Starts the MCP server for IDE integration.
 */
export async function integrationServeAction(options: ServeOptions = {}) {
    const config = loadConfig();

    if (!config.agent.enabled) {
        console.error('Error: Background agent support is disabled in configuration.');
        return;
    }

    console.error('Starting Praxis Integration Service...');

    if (options.noMcp) {
        console.error('MCP server disabled via flag.');
    } else {
        console.error('- Starting MCP server');
        const mcpServer = new PraxisMcpServer();
        await mcpServer.run();
    }

    return new Promise<void>((resolve) => {
        process.on('SIGINT', async () => {
            console.error('\nStopping Praxis Integration Service...');
            resolve();
        });
    });
}
