import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import { loadConfig, saveConfig, DEFAULT_CONFIG } from './config.js';

vi.mock('fs');

describe('Config Utils', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return default config if file does not exist', () => {
        vi.mocked(fs.existsSync).mockReturnValue(false);
        const config = loadConfig();
        expect(config).toEqual(DEFAULT_CONFIG);
    });

    it('should load config from file', () => {
        vi.mocked(fs.existsSync).mockReturnValue(true);
        const mockConfig = { agent: { enabled: false } };
        vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockConfig));

        const config = loadConfig();
        expect(config.agent.enabled).toBe(false);
        // Should merge with defaults
        expect(config.agent.concurrency).toBe(1);
    });

    it('should save config to file', () => {
        const mockConfig = { ...DEFAULT_CONFIG, agent: { ...DEFAULT_CONFIG.agent, enabled: false } };
        saveConfig(mockConfig);
        expect(fs.writeFileSync).toHaveBeenCalledWith(
            expect.stringContaining('.praxisrc.json'),
            expect.stringContaining('"enabled": false'),
            'utf8'
        );
    });
});
