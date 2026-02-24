import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { specListAction } from './list.js';

vi.mock('fs');

describe('specListAction', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(fs.existsSync).mockReturnValue(true);
    });

    it('should log a message when no specs directory exists', async () => {
        vi.mocked(fs.existsSync).mockReturnValue(false);

        await specListAction({});

        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('No specifications found'));
    });

    it('should list only WIP specs when no flags are provided', async () => {
        // Setup mock filesystem structure
        // .praxis/specs/intent1/spec1/spec.md (WIP)
        // .praxis/specs/intent1/spec2/spec.md (Archived)
        // .praxis/specs/intent2/spec3/spec.md (Draft)

        vi.mocked(fs.readdirSync).mockImplementation((p) => {
            const pathStr = p.toString();
            if (pathStr.endsWith('specs')) return ['intent1', 'intent2'] as any;
            if (pathStr.endsWith('intent1')) return ['spec1', 'spec2'] as any;
            if (pathStr.endsWith('intent2')) return ['spec3'] as any;
            return ['spec.md'] as any;
        });

        vi.mocked(fs.statSync).mockImplementation((p) => {
            const pathStr = p.toString();
            return {
                isDirectory: () => !pathStr.endsWith('spec.md'),
                isFile: () => pathStr.endsWith('spec.md')
            } as any;
        });

        vi.mocked(fs.readFileSync).mockImplementation((p) => {
            const pathStr = p.toString();
            if (pathStr.includes('spec1')) {
                return '**Status**: WIP\n**Created**: 2024-01-01';
            }
            if (pathStr.includes('spec2')) {
                return '**Status**: Archived\n**Created**: 2024-01-01';
            }
            return '**Status**: Draft\n**Created**: 2024-01-01';
        });

        await specListAction({});

        // Should show spec1 (WIP), but not spec2 (Archived) or spec3 (Draft)
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('spec1'));
        expect(consoleSpy).not.toHaveBeenCalledWith(expect.stringContaining('spec2'));
        expect(consoleSpy).not.toHaveBeenCalledWith(expect.stringContaining('spec3'));
    });

    it('should list all specs when --with-archived is provided', async () => {
        vi.mocked(fs.readdirSync).mockImplementation((p) => {
            const pathStr = p.toString();
            if (pathStr.endsWith('specs')) return ['intent1'] as any;
            if (pathStr.endsWith('intent1')) return ['spec1', 'spec2'] as any;
            return ['spec.md'] as any;
        });

        vi.mocked(fs.statSync).mockImplementation((p) => {
            const pathStr = p.toString();
            return {
                isDirectory: () => !pathStr.endsWith('spec.md'),
                isFile: () => pathStr.endsWith('spec.md')
            } as any;
        });

        vi.mocked(fs.readFileSync).mockImplementation((p) => {
            const pathStr = p.toString();
            if (pathStr.includes('spec1')) {
                return '**Status**: WIP\n**Created**: 2024-01-01';
            }
            return '**Status**: Archived\n**Created**: 2024-01-01';
        });

        await specListAction({ withArchived: true });

        // Should show both specs
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('spec1'));
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('spec2'));
    });

    it('should filter specs by intent ID', async () => {
        vi.mocked(fs.readdirSync).mockImplementation((p) => {
            const pathStr = p.toString();
            if (pathStr.endsWith('specs')) return ['intent1', 'intent2'] as any;
            if (pathStr.endsWith('intent1')) return ['spec1'] as any;
            if (pathStr.endsWith('intent2')) return ['spec2'] as any;
            return ['spec.md'] as any;
        });

        vi.mocked(fs.statSync).mockImplementation((p) => {
            const pathStr = p.toString();
            return {
                isDirectory: () => !pathStr.endsWith('spec.md'),
                isFile: () => pathStr.endsWith('spec.md')
            } as any;
        });

        vi.mocked(fs.readFileSync).mockReturnValue('**Status**: WIP\n**Created**: 2024-01-01');

        await specListAction({ fromIntent: 'intent1' });

        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('spec1'));
        expect(consoleSpy).not.toHaveBeenCalledWith(expect.stringContaining('spec2'));
    });

    it('should handle case where no specs match the intent filter', async () => {
        vi.mocked(fs.readdirSync).mockImplementation((p) => {
            const pathStr = p.toString();
            if (pathStr.endsWith('specs')) return ['intent1'] as any;
            if (pathStr.endsWith('intent1')) return ['spec1'] as any;
            return ['spec.md'] as any;
        });

        vi.mocked(fs.statSync).mockImplementation((p) => {
            const pathStr = p.toString();
            return {
                isDirectory: () => !pathStr.endsWith('spec.md'),
                isFile: () => pathStr.endsWith('spec.md')
            } as any;
        });

        vi.mocked(fs.readFileSync).mockReturnValue('**Status**: WIP\n**Created**: 2024-01-01');

        await specListAction({ fromIntent: 'unknown-intent' });

        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("No active specifications found for intent 'unknown-intent'"));
    });
});
