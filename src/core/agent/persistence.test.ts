import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import { queueTask, loadTasks } from './persistence.js';

vi.mock('fs');
vi.mock('../utils.js', () => ({
    PRAXIS_DIR: '.praxis'
}));

describe('Task Persistence', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should queue a new task', () => {
        vi.mocked(fs.existsSync).mockReturnValue(false);
        vi.mocked(fs.readFileSync).mockReturnValue('[]');

        queueTask('test-task', { foo: 'bar' });

        expect(fs.writeFileSync).toHaveBeenCalledWith(
            expect.stringContaining('tasks.json'),
            expect.stringContaining('"type": "test-task"'),
            'utf-8'
        );
    });

    it('should load tasks correctly', () => {
        vi.mocked(fs.existsSync).mockReturnValue(true);
        const mockTasks = [{ id: '1', type: 'test', status: 'pending' }];
        vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockTasks));

        const tasks = loadTasks();
        expect(tasks).toHaveLength(1);
        expect(tasks[0].id).toBe('1');
    });

    it('should handle corrupted tasks file', () => {
        vi.mocked(fs.existsSync).mockReturnValue(true);
        vi.mocked(fs.readFileSync).mockReturnValue('invalid-json');

        const tasks = loadTasks();
        expect(tasks).toEqual([]);
    });
});
