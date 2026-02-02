import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import { specApplyAction } from './apply.js';

vi.mock('fs');

describe('specApplyAction', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { });
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should generate implementation prompt when spec exists', async () => {
        vi.mocked(fs.existsSync).mockReturnValue(true);
        vi.mocked(fs.readdirSync).mockReturnValue(['spec.md'] as any);
        vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => true, isFile: () => true } as any);
        vi.mocked(fs.readFileSync).mockReturnValue('spec content');

        await specApplyAction('test-spec');

        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('--- IDE AI CHAT PROMPT ---'));
        expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should do nothing when spec is not found', async () => {
        vi.mocked(fs.existsSync).mockReturnValue(false);

        await specApplyAction('missing-spec');

        expect(consoleErrorSpy).not.toHaveBeenCalled();
        expect(consoleSpy).not.toHaveBeenCalled();
    });
});
