import { BackgroundTask } from './base.js';

export class PingTask extends BackgroundTask {
    constructor(id: string) {
        super(id);
    }

    async execute(): Promise<void> {
        console.error(`[Task ${this.id}] RECEIVED PING...`);
        console.log('PONG');
        console.error(`[Task ${this.id}] PONG SENT.`);
    }
}
