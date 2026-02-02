import { describe, it, expect } from 'vitest';
import path from 'path';
import { antigravityAdapter } from './antigravity.js';

describe('AntigravityCommandAdapter', () => {
    const adapter = antigravityAdapter;

    it('should return the correct toolId', () => {
        expect(adapter.toolId).toBe('antigravity');
    });

    it('should format the file correctly', () => {
        const content = {
            id: 'test-cmd',
            name: 'Test Name',
            description: 'Test Desc',
            body: 'Test Body',
            category: 'Category',
            tags: ['tag1']
        };
        const formatted = adapter.formatFile(content as any);

        expect(formatted).toContain('---');
        expect(formatted).toContain('description: Test Desc');
        expect(formatted).toContain('Test Body');
    });

    it('should return the correct file path', () => {
        expect(adapter.getFilePath('test-cmd')).toBe(path.join('.agent', 'workflows', 'praxis-test-cmd.md'));
    });
});
