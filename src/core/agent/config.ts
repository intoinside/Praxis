import fs from 'fs';
import path from 'path';

export interface MqttConfig {
    type: 'internal' | 'external';
    host: string;
    port: number;
    clientId?: string;
    autoStart?: boolean;
    useSharedSubscription?: boolean;
}

export interface AgentConfig {
    enabled: boolean;
    mode: 'file' | 'mqtt';
    services: {
        mcp: boolean;
        taskPolling: boolean;
    };
    tasks: {
        [key: string]: boolean;
    };
    pollIntervalMs: number;
    mqtt?: MqttConfig;
}

export interface PraxisConfig {
    agent: AgentConfig;
}

export const DEFAULT_CONFIG: PraxisConfig = {
    agent: {
        enabled: true,
        mode: 'file',
        services: {
            mcp: true,
            taskPolling: true
        },
        tasks: {
            'drift-detection': true,
            'documentation-update': true
        },
        pollIntervalMs: 3000,
        mqtt: {
            type: 'internal',
            host: '127.0.0.1',
            port: 1883,
            autoStart: false,
            useSharedSubscription: true
        }
    }
};

const CONFIG_FILE = '.praxisrc.json';

export function loadConfig(): PraxisConfig {
    const configPath = path.join(process.cwd(), CONFIG_FILE);
    if (!fs.existsSync(configPath)) {
        return DEFAULT_CONFIG;
    }
    try {
        const fileContent = fs.readFileSync(configPath, 'utf8');
        const fileConfig = JSON.parse(fileContent);
        return {
            ...DEFAULT_CONFIG,
            ...fileConfig,
            agent: {
                ...DEFAULT_CONFIG.agent,
                ...(fileConfig.agent || {})
            }
        };
    } catch (e) {
        return DEFAULT_CONFIG;
    }
}

export function saveConfig(config: PraxisConfig) {
    const configPath = path.join(process.cwd(), CONFIG_FILE);
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
}
