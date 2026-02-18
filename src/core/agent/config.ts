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
    broker: 'internal' | 'external';
    brokerUrl: string;
    concurrency: number;
    tasks: {
        [key: string]: boolean;
    };
    llm?: {
        provider: 'openai' | 'anthropic' | 'custom';
        apiKey: string;
        model: string;
        options?: Record<string, any>;
    };
}

export interface PraxisConfig {
    agent: AgentConfig;
}

export const DEFAULT_CONFIG: PraxisConfig = {
    agent: {
        enabled: true,
        broker: 'internal',
        brokerUrl: 'mqtt://127.0.0.1:1883',
        concurrency: 1,
        tasks: {
            'drift-detection': true,
            'documentation-update': true
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
