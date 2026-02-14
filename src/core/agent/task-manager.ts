import { BackgroundTask } from './tasks/base.js';
import { loadTasks, saveTasks } from './persistence.js';
import { DocumentationUpdateTask } from './tasks/documentation-update.js';
import { DriftDetectionTask } from './tasks/drift-detection.js';

export class TaskManager {
    private tasks: Map<string, BackgroundTask> = new Map();
    private activeCount: number = 0;
    private maxConcurrency: number = 1; // Default to 1 to avoid conflicts

    constructor(maxConcurrency: number = 1) {
        this.maxConcurrency = maxConcurrency;
    }

    addTask(task: BackgroundTask) {
        this.tasks.set(task.id, task);
        this.schedule();
    }

    getTask(id: string): BackgroundTask | undefined {
        return this.tasks.get(id);
    }

    getAllTasks(): BackgroundTask[] {
        return Array.from(this.tasks.values());
    }

    private schedule() {
        if (this.activeCount >= this.maxConcurrency) return;

        const pendingTask = this.getAllTasks().find(t => t.status === 'pending');
        if (pendingTask) {
            this.runTask(pendingTask);
        }
    }

    private async runTask(task: BackgroundTask) {
        this.activeCount++;
        this.updatePersistentTaskStatus(task.id, 'running');
        try {
            await task.run();
            this.updatePersistentTaskStatus(task.id, 'completed');
        } catch (e) {
            this.updatePersistentTaskStatus(task.id, 'failed');
        } finally {
            this.activeCount--;
            this.schedule();
        }
    }

    private updatePersistentTaskStatus(id: string, status: 'running' | 'completed' | 'failed') {
        const tasks = loadTasks();
        const t = tasks.find(x => x.id === id);
        if (t) {
            t.status = status;
            saveTasks(tasks);
        }
    }

    public startPolling(intervalMs: number = 3000) {
        setInterval(() => {
            const persistentTasks = loadTasks();
            const pending = persistentTasks.filter(t => t.status === 'pending');

            for (const p of pending) {
                if (!this.tasks.has(p.id)) {
                    // Instantiate the correct task type
                    let task: BackgroundTask | null = null;
                    if (p.type === 'documentation-update') {
                        task = new DocumentationUpdateTask(p.id);
                    } else if (p.type === 'drift-detection') {
                        task = new DriftDetectionTask(p.id);
                    }

                    if (task) {
                        this.addTask(task);
                    }
                }
            }
        }, intervalMs);
    }
}

// Export a singleton instance
export const taskManager = new TaskManager();
