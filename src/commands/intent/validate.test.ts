import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { intentValidateAction, findIntentDirectory, generateValidatePrompt } from './validate.js';

vi.mock('fs');

describe('intentValidateAction', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation((...args) => { console.info(...args); });
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation((...args) => { console.info('ERROR:', ...args); });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should generate and log a prompt when the intent exists', async () => {
        const intentId = 'test-intent';
        const templateContent = 'template content';
        const intentContent = 'intent content';

        // Mock existsSync for different paths
        vi.mocked(fs.existsSync).mockImplementation((p) => {
            const pStr = p.toString();
            if (pStr.endsWith('.praxis' + path.sep + 'intents')) return true;
            if (pStr.includes('intent-template.md')) return true;
            if (pStr.endsWith('intent.md')) return true;
            if (pStr.endsWith(intentId)) return true;
            return false;
        });

        vi.mocked(fs.readdirSync).mockImplementation((p) => {
            if (p.toString().includes('.praxis' + path.sep + 'intents')) return [intentId] as any;
            if (p.toString().includes(intentId)) return ['intent.md'] as any;
            return [] as any;
        });

        vi.mocked(fs.readFileSync).mockImplementation((p) => {
            if (p.toString().includes('intent-template.md')) return templateContent;
            if (p.toString().includes('intent.md')) return intentContent;
            return '';
        });

        vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => true, isFile: () => true } as any);

        await intentValidateAction(intentId);

        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('--- IDE AI CHAT PROMPT ---'));
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining(intentId));
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining(intentContent));
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining(templateContent));
        expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should log an error when the intent is missing', async () => {
        const intentId = 'missing-intent';

        vi.mocked(fs.existsSync).mockImplementation((p) => {
            const pStr = p.toString();
            if (pStr.endsWith('.praxis' + path.sep + 'intents')) return true;
            return false;
        });
        vi.mocked(fs.readdirSync).mockImplementation((p) => {
            if (p.toString().includes('.praxis' + path.sep + 'intents')) return [] as any;
            return [] as any;
        });
        vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => true } as any);

        await intentValidateAction(intentId);

        expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining(`Error: Intent with ID "${intentId}" not found.`));
    });
});

describe('findIntentDirectory', () => {
    it('should find direct match', () => {
        vi.mocked(fs.readdirSync).mockReturnValue(['test-intent'] as any);
        vi.mocked(fs.existsSync).mockImplementation((p) => {
            if (p.toString().endsWith('test-intent')) return true;
            if (p.toString().endsWith('intent.md')) return true;
            return false;
        });
        vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => true } as any);

        const result = findIntentDirectory('/root', 'test-intent');
        expect(result).toContain('test-intent');
    });

    it('should find nested match', () => {
        vi.mocked(fs.readdirSync).mockImplementation((p) => {
            if (p.toString() === '/root') return ['subdir'] as any;
            if (p.toString().endsWith('subdir')) return ['test-intent'] as any;
            return [] as any;
        });
        vi.mocked(fs.existsSync).mockImplementation((p) => {
            if (p.toString().endsWith('test-intent')) return true;
            if (p.toString().endsWith('intent.md')) return true;
            if (p.toString().endsWith('subdir')) return true;
            return false;
        });
        vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => true } as any);

        const result = findIntentDirectory('/root', 'test-intent');
        expect(result).toContain('test-intent');
    });
});

describe('generateValidatePrompt', () => {
    it('should include all required sections in the prompt', () => {
        const intentId = 'test-id';
        const intentContent = 'test intent content';
        const templateContent = 'test template content';
        const artifacts = [{ name: 'extra.md', content: 'extra content' }];

        const prompt = generateValidatePrompt(intentId, intentContent, templateContent, artifacts);

        expect(prompt).toContain(intentId);
        expect(prompt).toContain(intentContent);
        expect(prompt).toContain(templateContent);
        expect(prompt).toContain('extra.md');
        expect(prompt).toContain('extra content');
        expect(prompt).toContain('validation and suggest any necessary modifications');
    });
});
