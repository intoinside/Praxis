export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface TaskProgress {
    percentage: number;
    message?: string;
}

export abstract class BackgroundTask {
    public id: string;
    public status: TaskStatus = 'pending';
    public progress: TaskProgress = { percentage: 0 };
    public error?: string;

    constructor(id: string) {
        this.id = id;
    }

    abstract execute(): Promise<void>;

    async run(): Promise<void> {
        this.status = 'running';
        try {
            await this.execute();
            this.status = 'completed';
            this.progress.percentage = 100;
        } catch (e: any) {
            this.status = 'failed';
            this.error = e.message;
            throw e;
        }
    }

    updateProgress(percentage: number, message?: string) {
        this.progress = { percentage, message };
    }
}
