import { taskManager } from '../../core/agent/task-manager.js';
import { mqClient } from '../../core/agent/mq-client.js';
import { loadConfig } from '../../core/agent/config.js';
import fs from 'fs';
import path from 'path';

/**
 * Action for 'praxis agent run'
 */
export async function agentRunAction() {
    const config = loadConfig();

    if (!config.agent.enabled) {
        console.error('Agent support is disabled in configuration.');
        process.exit(0);
    }

    console.error('Starting Praxis Agent...');
    console.error(`Connecting to broker at ${config.agent.brokerUrl}`);

    try {
        // Ensure agent directory exists for lock file
        const { ensureAgentDir } = await import('../../core/agent/persistence.js');
        ensureAgentDir();

        const lockFile = path.join(process.cwd(), '.praxis', 'agent', 'agent.lock');
        fs.writeFileSync(lockFile, process.pid.toString(), 'utf8');

        await mqClient.connect(config.agent.brokerUrl);

        // Start workers based on concurrency config
        taskManager.startMqListener(false);

        console.error(`Agent is ready and waiting for tasks (concurrency: ${config.agent.concurrency})`);

        process.on('SIGINT', async () => {
            console.error('\nStopping agent...');
            try {
                if (fs.existsSync(lockFile)) fs.unlinkSync(lockFile);
                await mqClient.disconnect();
            } catch (err) {
                console.error('Error during agent shutdown:', err);
            } finally {
                process.exit(0);
            }
        });

        process.on('exit', () => {
            if (fs.existsSync(lockFile)) fs.unlinkSync(lockFile);
        });
    } catch (error) {
        if (error instanceof Error) {
            console.error(`Failed to start agent: ${error.message}`);
        } else {
            console.error('An unknown error occurred while starting the agent.');
        }
        process.exit(1);
    }
}
