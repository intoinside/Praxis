import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import { specDeriveAction } from './derive.js';

vi.mock('fs');

describe('specDeriveAction', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { });
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should generate a prompt when intent and template exist', async () => {
        vi.mocked(fs.existsSync).mockReturnValue(true);
        vi.mocked(fs.readdirSync).mockImplementation((p) => {
            const pathStr = p.toString();
            if (pathStr.includes('intents')) return ['intent-found'] as any;
            return ['intent.md'] as any;
        });
        vi.mocked(fs.statSync).mockImplementation((p) => ({
            isDirectory: () => p.toString().includes('intent-found'),
            isFile: () => p.toString().includes('intent.md')
        } as any));
        vi.mocked(fs.readFileSync).mockReturnValue('content');

        await specDeriveAction({ fromIntent: 'intent-found' });

        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('--- IDE AI CHAT PROMPT ---'));
        expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should log error if intent is not found', async () => {
        vi.mocked(fs.existsSync).mockImplementation((p) => {
            if (p.toString().includes('missing-intent')) return false;
            return true;
        });
        vi.mocked(fs.readdirSync).mockReturnValue([] as any);

        await specDeriveAction({ fromIntent: 'missing-intent' });

        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('not found'));
    });
});
