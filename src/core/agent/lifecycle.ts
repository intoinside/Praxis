import { spawn } from 'child_process';
import { loadConfig } from './config.js';
import net from 'net';
import fs from 'fs';
import path from 'path';

/**
 * Checks if a port is in use.
 */
async function isPortInUse(port: number): Promise<boolean> {
    return new Promise((resolve) => {
        const server = net.createServer()
            .once('error', (err: any) => {
                if (err.code === 'EADDRINUSE') {
                    resolve(true);
                } else {
                    resolve(false);
                }
            })
            .once('listening', () => {
                server.close();
                resolve(false);
            })
            .listen(port);
    });
}

/**
 * Extracts port from broker URL.
 */
function getPortFromUrl(url: string): number {
    const match = url.match(/:(\d+)/);
    return match ? parseInt(match[1]) : 1883;
}

/**
 * Ensures the MQTT broker is running if configured as internal.
 */
export async function ensureBrokerRunning(): Promise<void> {
    const config = loadConfig();
    if (!config.agent.enabled || config.agent.broker !== 'internal') {
        return;
    }

    const port = getPortFromUrl(config.agent.brokerUrl);
    const inUse = await isPortInUse(port);

    if (!inUse) {
        console.error(`Broker not detected on port ${port}. Starting internal broker...`);
        const child = spawn('node', [process.argv[1], 'agent', 'broker'], {
            detached: true,
            stdio: 'ignore'
        });
        child.unref();

        // Wait a bit for the broker to start
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
}

/**
 * Ensures at least one agent is running.
 */
export async function ensureAgentRunning(): Promise<void> {
    const config = loadConfig();
    if (!config.agent.enabled) {
        return;
    }

    const lockFile = path.join(process.cwd(), '.praxis', 'agent', 'agent.lock');

    // Check if lock file exists and if the PID inside is still running
    let running = false;
    if (fs.existsSync(lockFile)) {
        try {
            const pid = parseInt(fs.readFileSync(lockFile, 'utf8'));
            if (pid) {
                // process.kill(pid, 0) checks if process exists without killing it
                process.kill(pid, 0);
                running = true;
            }
        } catch (e) {
            // Process not running, or other error
            running = false;
        }
    }

    if (!running) {
        console.error('Agent not detected. Starting background agent...');
        const child = spawn('node', [process.argv[1], 'agent', 'run'], {
            detached: true,
            stdio: 'ignore'
        });
        child.unref();

        // Wait a bit for the agent to start and create the lock
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}
