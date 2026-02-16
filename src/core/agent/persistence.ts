import fs from 'fs';
import path from 'path';
import { PRAXIS_DIR } from '../utils.js';
import { mqClient } from './mq-client.js';
import { loadConfig } from './config.js';

const AGENT_DIR = path.join(PRAXIS_DIR, 'agent');
const TASKS_FILE = path.join(AGENT_DIR, 'tasks.json');

export interface TaskRecord {
    id: string;
    type: string;
    payload?: any;
    status: 'pending' | 'running' | 'completed' | 'failed';
    createdAt: string;
}

export function ensureAgentDir() {
    if (!fs.existsSync(AGENT_DIR)) {
        fs.mkdirSync(AGENT_DIR, { recursive: true });
    }
}

export function saveTasks(tasks: TaskRecord[]) {
    ensureAgentDir();
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
}

export function loadTasks(): TaskRecord[] {
    if (!fs.existsSync(TASKS_FILE)) return [];
    try {
        return JSON.parse(fs.readFileSync(TASKS_FILE, 'utf-8'));
    } catch (e) {
        return [];
    }
}

export async function queueTask(type: string, payload?: any) {
    const config = loadConfig();
    const tasks = loadTasks();
    const id = `${type}-${Date.now()}`;
    const task: TaskRecord = {
        id,
        type,
        payload,
        status: 'pending',
        createdAt: new Date().toISOString()
    };

    tasks.push(task);
    saveTasks(tasks);
    console.log(`Task queued locally: ${id}`);

    if (config.agent.enabled) {
        try {
            await mqClient.publishTask(task);
            console.log(`Task published to MQTT: ${id}`);
        } catch (e) {
            console.error(`Failed to publish task to MQTT: ${e instanceof Error ? e.message : String(e)}`);
            console.error('Task will remain in local queue for fallback processing.');
        }
    }

    return id;
}
