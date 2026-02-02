import { describe, it, expect, vi } from 'vitest';
import { generateCommand, generateCommands } from './generator.js';

describe('generator', () => {
    const mockAdapter = {
        getFilePath: vi.fn((id) => `/path/to/${id}.txt`),
        formatFile: vi.fn((content) => `Formatted: ${content.id}`),
    };

    it('should generate a single command', () => {
        const content = { id: 'test', name: 'Test', description: 'desc', category: 'C', tags: [], body: '' };
        const result = generateCommand(content, mockAdapter as any);

        expect(result).toEqual({
            path: '/path/to/test.txt',
            fileContent: 'Formatted: test',
        });
        expect(mockAdapter.getFilePath).toHaveBeenCalledWith('test');
    });

    it('should generate multiple commands', () => {
        const contents = [
            { id: 'test1', name: 'Test1', description: 'desc1', category: 'C', tags: [], body: '' },
            { id: 'test2', name: 'Test2', description: 'desc2', category: 'C', tags: [], body: '' },
        ];
        const results = generateCommands(contents, mockAdapter as any);

        expect(results).toHaveLength(2);
        expect(results[0].path).toBe('/path/to/test1.txt');
        expect(results[1].path).toBe('/path/to/test2.txt');
    });
});
