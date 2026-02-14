import fs from 'fs';
import path from 'path';

export interface AgentConfig {
    enabled: boolean;
    services: {
        mcp: boolean;
        taskPolling: boolean;
    };
    tasks: {
        [key: string]: boolean;
    };
    pollIntervalMs: number;
}

export interface PraxisConfig {
    agent: AgentConfig;
}

export const DEFAULT_CONFIG: PraxisConfig = {
    agent: {
        enabled: true,
        services: {
            mcp: true,
            taskPolling: true
        },
        tasks: {
            'drift-detection': true,
            'documentation-update': true
        },
        pollIntervalMs: 3000
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
        return { ...DEFAULT_CONFIG, ...JSON.parse(fileContent) };
    } catch (e) {
        return DEFAULT_CONFIG;
    }
}

export function saveConfig(config: PraxisConfig) {
    const configPath = path.join(process.cwd(), CONFIG_FILE);
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
}
