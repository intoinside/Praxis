import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import { initCommand } from './init.js';

vi.mock('fs');

describe('initCommand', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(fs.existsSync).mockReturnValue(false);
    });

    it('should create all required directories and copy templates', async () => {
        vi.mocked(fs.existsSync).mockImplementation((p) => {
            if (p.toString().includes('templates') && !p.toString().includes('.praxis')) return true;
            return false;
        });
        vi.mocked(fs.readdirSync).mockReturnValue(['template1.md'] as any);
        vi.mocked(fs.statSync).mockReturnValue({ isFile: () => true } as any);

        await initCommand();

        expect(fs.mkdirSync).toHaveBeenCalled();
        expect(fs.writeFileSync).toHaveBeenCalled();
        expect(fs.copyFileSync).toHaveBeenCalled();
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('initialized successfully'));
    });

    it('should skip directory creation if they already exist', async () => {
        vi.mocked(fs.existsSync).mockReturnValue(true);
        vi.mocked(fs.readdirSync).mockReturnValue([]);

        await initCommand();

        expect(fs.mkdirSync).not.toHaveBeenCalled();
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Directory already exists'));
    });
});
