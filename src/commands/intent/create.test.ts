import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import { intentCreateAction, generateAiPrompt } from './create.js';

vi.mock('fs');

describe('intentCreateAction', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { });
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should generate and log a prompt when the template exists', async () => {
        const description = 'test description';
        const templateContent = 'template content';

        vi.mocked(fs.existsSync).mockReturnValue(true);
        vi.mocked(fs.readFileSync).mockReturnValue(templateContent);

        await intentCreateAction(description);

        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('--- IDE AI CHAT PROMPT ---'));
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining(description));
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining(templateContent));
        expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should log an error when the template is missing', async () => {
        const description = 'test description';

        vi.mocked(fs.existsSync).mockReturnValue(false);

        await intentCreateAction(description);

        expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Error: Template not found'));
        expect(consoleSpy).not.toHaveBeenCalled();
    });
});

describe('generateAiPrompt', () => {
    it('should include description and template in the prompt', () => {
        const description = 'test feature';
        const template = 'test template';
        const prompt = generateAiPrompt(description, template);

        expect(prompt).toContain(description);
        expect(prompt).toContain(template);
        expect(prompt).toContain('Short ID');
        expect(prompt).toContain('Intent File');
    });
});
