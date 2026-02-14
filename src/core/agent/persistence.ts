import fs from 'fs';
import path from 'path';
import { PRAXIS_DIR } from '../utils.js';

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

export function queueTask(type: string, payload?: any) {
    const tasks = loadTasks();
    const id = `${type}-${Date.now()}`;
    tasks.push({
        id,
        type,
        payload,
        status: 'pending',
        createdAt: new Date().toISOString()
    });
    saveTasks(tasks);
    console.log(`Task queued: ${id}`);
    return id;
}
