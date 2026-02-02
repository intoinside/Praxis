import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import { specDeleteAction } from './delete.js';

vi.mock('fs');

describe('specDeleteAction', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { });
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should delete the spec if it exists', async () => {
        vi.mocked(fs.existsSync).mockReturnValue(true);
        vi.mocked(fs.readdirSync).mockImplementation((p) => {
            if (p.toString().endsWith('specs')) return ['intent1'] as any;
            return ['spec.md'] as any;
        });
        vi.mocked(fs.statSync).mockImplementation((p) => ({
            isDirectory: () => p.toString().endsWith('intent1'),
            isFile: () => p.toString().endsWith('spec.md')
        } as any));

        await specDeleteAction('intent1');

        expect(fs.rmSync).toHaveBeenCalled();
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Successfully deleted spec'));
    });

    it('should log an error if the spec does not exist', async () => {
        vi.mocked(fs.existsSync).mockImplementation((p) => {
            if (p.toString().includes('missing-spec')) return false;
            return true;
        });
        vi.mocked(fs.readdirSync).mockReturnValue([] as any);

        await specDeleteAction('missing-spec');

        expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Spec with ID \'missing-spec\' not found'));
    });
});
