import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import { queueTask, loadTasks } from './persistence.js';
import { mqClient } from './mq-client.js';

vi.mock('fs');
vi.mock('../utils.js', () => ({
    PRAXIS_DIR: '.praxis'
}));

vi.mock('./config.js', () => ({
    loadConfig: vi.fn().mockReturnValue({
        agent: { mode: 'file' }
    })
}));

vi.mock('./mq-client.js', () => ({
    mqClient: {
        connect: vi.fn(),
        publishTask: vi.fn(),
        disconnect: vi.fn()
    }
}));

describe('Task Persistence', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should queue a new task', async () => {
        vi.mocked(fs.existsSync).mockReturnValue(false);
        vi.mocked(fs.readFileSync).mockReturnValue('[]');

        await queueTask('test-task', { foo: 'bar' });

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

    it('should publish to MQTT when mode is mqtt', async () => {
        const { loadConfig } = await import('./config.js');
        vi.mocked(loadConfig).mockReturnValue({
            agent: {
                mode: 'mqtt',
                mqtt: { host: 'localhost', port: 1883 }
            }
        } as any);

        vi.mocked(fs.existsSync).mockReturnValue(false);
        vi.mocked(fs.readFileSync).mockReturnValue('[]');

        await queueTask('mq-task', { test: true });

        expect(mqClient.connect).toHaveBeenCalled();
        expect(mqClient.publishTask).toHaveBeenCalledWith(expect.objectContaining({
            type: 'mq-task'
        }));
        expect(mqClient.disconnect).toHaveBeenCalled();
    });
});
