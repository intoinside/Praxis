import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import { specArchiveAction } from './archive.js';

vi.mock('fs');

describe('specArchiveAction', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { });
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should archive the spec if it exists', async () => {
        vi.mocked(fs.existsSync).mockImplementation((p) => {
            if (p.toString().includes('archive')) return false;
            return true;
        });
        vi.mocked(fs.readdirSync).mockImplementation((p) => {
            const pathStr = p.toString();
            if (pathStr.includes('specs')) return ['intent1'] as any;
            return ['spec.md'] as any;
        });
        vi.mocked(fs.statSync).mockImplementation((p) => ({
            isDirectory: () => p.toString().includes('intent1') || p.toString().includes('specs'),
            isFile: () => p.toString().includes('spec.md')
        } as any));
        vi.mocked(fs.readFileSync).mockReturnValue('**Status**: Draft\ncontent');

        await specArchiveAction('intent1');

        expect(fs.mkdirSync).toHaveBeenCalled();
        expect(fs.renameSync).toHaveBeenCalled();
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Successfully archived spec'));
    });

    it('should log an error if the spec does not exist', async () => {
        vi.mocked(fs.existsSync).mockImplementation((p) => {
            if (p.toString().includes('missing-spec')) return false;
            return true;
        });
        vi.mocked(fs.readdirSync).mockReturnValue([] as any);

        await specArchiveAction('missing-spec');

        expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('not found'));
    });
});
