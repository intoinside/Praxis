import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import { intentListAction } from './list.js';

vi.mock('fs');

describe('intentListAction', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { });
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should log a message when no intents directory exists', async () => {
        vi.mocked(fs.existsSync).mockReturnValue(false);

        await intentListAction();

        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('No intents found'));
    });

    it('should list intents when they exist', async () => {
        vi.mocked(fs.existsSync).mockReturnValue(true);
        vi.mocked(fs.readdirSync).mockImplementation((p) => {
            if (p.toString().endsWith('intents')) return ['intent1'] as any;
            return ['intent.md'] as any;
        });
        vi.mocked(fs.statSync).mockImplementation((p) => ({
            isDirectory: () => p.toString().endsWith('intent1'),
            isFile: () => p.toString().endsWith('intent.md')
        } as any));

        vi.mocked(fs.readFileSync).mockReturnValue('**Status**: Active\n**Created**: 2024-01-01');

        await intentListAction();

        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('intent1'));
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Active'));
    });
});
