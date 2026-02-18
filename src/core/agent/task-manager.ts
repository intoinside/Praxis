import { BackgroundTask } from './tasks/base.js';
import { loadTasks, saveTasks } from './persistence.js';
import { DocumentationUpdateTask } from './tasks/documentation-update.js';
import { DriftDetectionTask } from './tasks/drift-detection.js';
import { PingTask } from './tasks/ping.js';
import { LLMChatTask } from './tasks/llm-chat.js';
import { mqClient, TaskMessage } from './mq-client.js';
import { loadConfig } from './config.js';

export class TaskManager {
    private tasks: Map<string, BackgroundTask> = new Map();
    private activeCount: number = 0;
    private maxConcurrency: number = 1; // Default to 1 to avoid conflicts

    constructor() {
        // Concurrency is now managed via config
    }

    private getConcurrency(): number {
        return loadConfig().agent.concurrency || 1;
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
        if (this.activeCount >= this.getConcurrency()) return;

        const pendingTask = this.getAllTasks().find(t => t.status === 'pending');
        if (pendingTask) {
            this.runTask(pendingTask);
        }
    }

    private async runTask(task: BackgroundTask) {
        this.activeCount++;
        console.error(`[Agent] Processing task: ${task.constructor.name} (ID: ${task.id})`);
        this.updatePersistentTaskStatus(task.id, 'running');
        mqClient.publishStatus(task.id, 'running').catch(() => { });
        try {
            await task.run();
            this.updatePersistentTaskStatus(task.id, 'completed');
            mqClient.publishStatus(task.id, 'completed').catch(() => { });
        } catch (e) {
            this.updatePersistentTaskStatus(task.id, 'failed');
            mqClient.publishStatus(task.id, 'failed', { error: e instanceof Error ? e.message : String(e) }).catch(() => { });
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

    public startMqListener(useShared: boolean = true) {
        mqClient.subscribeToTasks((msg: TaskMessage) => {
            if (!this.tasks.has(msg.id)) {
                let task: BackgroundTask | null = null;
                if (msg.type === 'documentation-update') {
                    task = new DocumentationUpdateTask(msg.id);
                } else if (msg.type === 'drift-detection') {
                    task = new DriftDetectionTask(msg.id);
                } else if (msg.type === 'ping') {
                    task = new PingTask(msg.id);
                } else if (msg.type === 'llm-chat') {
                    task = new LLMChatTask(msg.id, msg.payload.prompt, msg.payload.system);
                }

                if (task) {
                    this.addTask(task);
                    console.error(`Acquired task via MQTT: ${msg.id}`);
                }
            }
        }, useShared);
    }
}

// Export a singleton instance
export const taskManager = new TaskManager();
