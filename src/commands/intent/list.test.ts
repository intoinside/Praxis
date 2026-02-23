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

    it('should list only WIP intents by default', async () => {
        vi.mocked(fs.existsSync).mockReturnValue(true);
        vi.mocked(fs.readdirSync).mockImplementation((p) => {
            if (p.toString().endsWith('intents')) return ['intent-wip', 'intent-archived'] as any;
            return ['intent.md'] as any;
        });
        vi.mocked(fs.statSync).mockImplementation((p) => ({
            isDirectory: () => !p.toString().endsWith('intent.md'),
            isFile: () => p.toString().endsWith('intent.md')
        } as any));

        vi.mocked(fs.readFileSync).mockImplementation((p) => {
            if (p.toString().includes('intent-wip')) return '**Status**: WIP\n**Created**: 2024-01-01';
            return '**Status**: Archived\n**Created**: 2024-01-01';
        });

        await intentListAction();

        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('intent-wip'));
        expect(consoleSpy).not.toHaveBeenCalledWith(expect.stringContaining('intent-archived'));
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('WIP'));
    });

    it('should list all intents when --with-archived is provided', async () => {
        vi.mocked(fs.existsSync).mockReturnValue(true);
        vi.mocked(fs.readdirSync).mockImplementation((p) => {
            if (p.toString().endsWith('intents')) return ['intent-wip', 'intent-archived'] as any;
            return ['intent.md'] as any;
        });
        vi.mocked(fs.statSync).mockImplementation((p) => ({
            isDirectory: () => !p.toString().endsWith('intent.md'),
            isFile: () => p.toString().endsWith('intent.md')
        } as any));

        vi.mocked(fs.readFileSync).mockImplementation((p) => {
            if (p.toString().includes('intent-wip')) return '**Status**: WIP\n**Created**: 2024-01-01';
            return '**Status**: Archived\n**Created**: 2024-01-01';
        });

        await intentListAction({ withArchived: true });

        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('intent-wip'));
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('intent-archived'));
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('WIP'));
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Archived'));
    });

    it('should show a message when no WIP intents are found', async () => {
        vi.mocked(fs.existsSync).mockReturnValue(true);
        vi.mocked(fs.readdirSync).mockImplementation((p) => {
            if (p.toString().endsWith('intents')) return ['intent-archived'] as any;
            return ['intent.md'] as any;
        });
        vi.mocked(fs.statSync).mockImplementation((p) => ({
            isDirectory: () => !p.toString().endsWith('intent.md'),
            isFile: () => p.toString().endsWith('intent.md')
        } as any));

        vi.mocked(fs.readFileSync).mockReturnValue('**Status**: Archived\n**Created**: 2024-01-01');

        await intentListAction();

        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('No WIP intents found. Use --with-archived to see all intents.'));
    });
});
