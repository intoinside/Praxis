import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import fs from 'fs';
import { generateSlashCommandsAction } from './generate.js';
import { CommandAdapterRegistry } from '../../core/command-generation/index.js';
import { antigravityAdapter } from '../../core/command-generation/adapters/antigravity.js';

vi.mock('fs');

describe('generateSlashCommandsAction', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { });
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

    beforeAll(() => {
        CommandAdapterRegistry.register(antigravityAdapter);
    });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should generate and write slash commands file', async () => {
        await generateSlashCommandsAction('antigravity');

        expect(fs.mkdirSync).toHaveBeenCalled();
        expect(fs.writeFileSync).toHaveBeenCalled();
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('slash commands generated'));
    });

    it('should log an error for unsupported tools', async () => {
        await generateSlashCommandsAction('unsupported');

        expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Error: Adapter for tool \'unsupported\' not found'));
    });
});
