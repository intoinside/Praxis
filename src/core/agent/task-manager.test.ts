import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TaskManager } from './task-manager.js';
import { BackgroundTask } from './tasks/base.js';

class MockTask extends BackgroundTask {
    async execute(): Promise<void> {
        // Mock execution
    }
}

describe('TaskManager', () => {
    let taskManager: TaskManager;

    beforeEach(() => {
        taskManager = new TaskManager();
        vi.clearAllMocks();
    });

    it('should add and run a task', async () => {
        const task = new MockTask('test-1');
        const runSpy = vi.spyOn(task, 'run');

        taskManager.addTask(task);

        // Wait a bit for the async task to start
        await new Promise(resolve => setTimeout(resolve, 50));

        expect(runSpy).toHaveBeenCalled();
        expect(taskManager.getTask('test-1')).toBeDefined();
    });

    it('should respect concurrency limits', async () => {
        const task1 = new MockTask('task-1');
        const task2 = new MockTask('task-2');
        const task3 = new MockTask('task-3');

        // Force tasks to take some time
        const originalExecute = MockTask.prototype.execute;
        MockTask.prototype.execute = async function () {
            await new Promise(resolve => setTimeout(resolve, 50));
        };

        taskManager.addTask(task1);
        taskManager.addTask(task2);
        taskManager.addTask(task3);

        await new Promise(resolve => setTimeout(resolve, 10));

        const statuses = taskManager.getAllTasks();
        const running = statuses.filter((t: BackgroundTask) => t.status === 'running');

        expect(running.length).toBeLessThanOrEqual(1); // Default maxConcurrency is 1 now in the code!

        MockTask.prototype.execute = originalExecute;
    });

    it('should return all tasks in getAllTasks', () => {
        taskManager.addTask(new MockTask('t1'));
        taskManager.addTask(new MockTask('t2'));

        const tasks = taskManager.getAllTasks();
        expect(tasks).toHaveLength(2);
        expect(tasks.map((t: BackgroundTask) => t.id)).toContain('t1');
        expect(tasks.map((t: BackgroundTask) => t.id)).toContain('t2');
    });
});
