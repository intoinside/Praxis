import { taskManager } from '../../core/agent/task-manager.js';
import { PraxisMcpServer } from '../../core/agent/mcp-server.js';
import { loadConfig } from '../../core/agent/config.js';

export interface ServeOptions {
    mcp?: boolean;
    polling?: boolean;
    pollInterval?: string;
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

    if (!config.agent.enabled && !options.mcp && !options.polling) {
        console.error('Error: Background agent is disabled in configuration.');
        console.error('Enable it in .praxisrc.json or use CLI flags.');
        return;
    }

    console.error('Starting Praxis Background Agent...');

    if (config.agent.services.taskPolling) {
        console.error(`- Task polling enabled (interval: ${config.agent.pollIntervalMs}ms)`);
        taskManager.startPolling(config.agent.pollIntervalMs);
    }

    if (config.agent.services.mcp) {
        console.error('- MCP server enabled');
        const mcpServer = new PraxisMcpServer();

        // The MCP server uses stdio, so it should be the only thing writing to stdout.
        // We use console.error for logging.

        await mcpServer.run();
    }

    // Keep process alive handled by mcpServer.run() + transport connection
    return new Promise<void>((resolve) => {
        process.on('SIGINT', () => {
            console.error('\nStopping Praxis Background Agent...');
            resolve();
        });
    });
}
