import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
    specValidateAction,
    findSpecDirectory,
    extractIntentId,
    generateSpecValidatePrompt
} from './validate.js';

vi.mock('fs');

describe('spec/validate.ts', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { });
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

    beforeEach(() => {
        vi.resetAllMocks();
    });

    describe('findSpecDirectory', () => {
        it('should find a spec directory directly', () => {
            vi.mocked(fs.readdirSync).mockReturnValue(['my-spec'] as any);
            vi.mocked(fs.existsSync).mockImplementation((p) => {
                const pStr = p.toString();
                if (pStr.endsWith('my-spec')) return true;
                if (pStr.endsWith('spec.md')) return true;
                return false;
            });
            vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => true } as any);

            const result = findSpecDirectory('/root', 'my-spec');
            expect(result).toContain('my-spec');
        });

        it('should return null if spec directory not found', () => {
            vi.mocked(fs.readdirSync).mockReturnValue([]);
            const result = findSpecDirectory('/root', 'missing-spec');
            expect(result).toBeNull();
        });
    });

    describe('extractIntentId', () => {
        it('should extract intent id from spec content', () => {
            const content = '# Spec\n\n**Intent**: my-intent-id\n\nContent...';
            expect(extractIntentId(content)).toBe('my-intent-id');
        });

        it('should return null if intent id not found', () => {
            const content = '# Spec\n\nNo intent here...';
            expect(extractIntentId(content)).toBeNull();
        });
    });

    describe('generateSpecValidatePrompt', () => {
        it('should contain all required sections', () => {
            const prompt = generateSpecValidatePrompt(
                'spec-1',
                'spec content',
                'template content',
                'intent content',
                [{ name: 'art.sql', content: 'SELECT 1' }]
            );

            expect(prompt).toContain('spec-1');
            expect(prompt).toContain('spec content');
            expect(prompt).toContain('template content');
            expect(prompt).toContain('intent content');
            expect(prompt).toContain('art.sql');
            expect(prompt).toContain('SELECT 1');
            expect(prompt).toContain('quality assurance engineer');
        });
    });

    describe('specValidateAction', () => {
        it('should generate a prompt when all files exist', async () => {
            vi.mocked(fs.existsSync).mockReturnValue(true);
            vi.mocked(fs.readdirSync).mockImplementation((p) => {
                const s = p.toString();
                if (s.includes('specs')) return ['spec-1'] as any;
                if (s.includes('spec-1')) return ['spec.md', 'artifact.ts'] as any;
                if (s.includes('intents')) return ['intent-1'] as any;
                return [] as any;
            });
            vi.mocked(fs.statSync).mockImplementation((p) => ({
                isDirectory: () => !p.toString().endsWith('.md') && !p.toString().endsWith('.ts'),
                isFile: () => p.toString().endsWith('.md') || p.toString().endsWith('.ts')
            } as any));
            vi.mocked(fs.readFileSync).mockImplementation((p) => {
                if (p.toString().includes('spec.md')) return '# Spec\n**Intent**: intent-1';
                return 'file content';
            });

            await specValidateAction('spec-1');

            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('--- IDE AI CHAT PROMPT ---'));
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('intent-1'));
        });

        it('should log error if spec not found', async () => {
            vi.mocked(fs.existsSync).mockReturnValue(true);
            vi.mocked(fs.readdirSync).mockReturnValue([]);

            await specValidateAction('missing-spec');

            expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('not found'));
        });
    });
});
