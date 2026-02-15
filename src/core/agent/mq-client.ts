import mqtt, { MqttClient } from 'mqtt';
// @ts-ignore
import { Aedes } from 'aedes';
import net from 'net';
import { MqttConfig } from './config.js';

export interface TaskMessage {
    id: string;
    type: string;
    payload?: any;
    status: 'pending' | 'running' | 'completed' | 'failed';
    createdAt: string;
}

export class MQClient {
    private client: MqttClient | null = null;
    private broker: any = null;

    async startInternalBroker(port: number = 1883): Promise<void> {
        // Handle Aedes v1.x async creation
        const aedesInstance = await (Aedes as any).createBroker();
        const server = net.createServer(aedesInstance.handle);

        return new Promise((resolve, reject) => {
            server.listen(port, () => {
                console.error(`MQTT Broker started on port ${port}`);
                this.broker = { aedes: aedesInstance, server };
                resolve();
            });

            server.on('error', (err) => {
                console.error(`Failed to start MQTT Broker: ${err.message}`);
                reject(err);
            });
        });
    }

    async connect(brokerUrl: string, clientId?: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.client = mqtt.connect(brokerUrl, {
                protocolVersion: 4,
                clientId: clientId || `praxis-agent-${Math.random().toString(16).slice(2)}`,
                clean: true
            });

            this.client.on('connect', () => {
                console.error(`Connected to MQTT broker at ${brokerUrl}`);
                resolve();
            });

            this.client.on('error', (err) => {
                console.error(`MQTT Connection Error: ${err.message}`);
                reject(err);
            });
        });
    }

    async subscribeToTasks(callback: (task: TaskMessage) => void, useShared: boolean = true) {
        if (!this.client) throw new Error('MQTT Client not connected');

        const topic = useShared
            ? '$share/praxis-workers/praxis/tasks/request'
            : 'praxis/tasks/request';

        this.client.subscribe(topic, { qos: 1 });

        this.client.on('message', (t, message) => {
            console.error(`MQTT message received on topic: ${t}`);
            if (t === 'praxis/tasks/request' || t === topic) {
                try {
                    const task = JSON.parse(message.toString()) as TaskMessage;
                    callback(task);
                } catch (e) {
                    console.error('Failed to parse task message:', e);
                }
            }
        });
    }

    async publishTask(task: TaskMessage): Promise<void> {
        const { ensureBrokerRunning, ensureAgentRunning } = await import('./lifecycle.js');
        await ensureBrokerRunning();
        await ensureAgentRunning();

        if (!this.client) {
            const { loadConfig } = await import('./config.js');
            const config = loadConfig();
            await this.connect(config.agent.brokerUrl);
        }

        const topic = 'praxis/tasks/request';
        return new Promise((resolve, reject) => {
            this.client!.publish(topic, JSON.stringify(task), { qos: 1, retain: true }, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    async publishStatus(taskId: string, status: string, payload?: any): Promise<void> {
        if (!this.client) throw new Error('MQTT Client not connected');
        const topic = `praxis/tasks/status/${taskId}`;
        return new Promise((resolve, reject) => {
            this.client!.publish(topic, JSON.stringify({ taskId, status, payload, updatedAt: new Date().toISOString() }), { qos: 1, retain: true }, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    async disconnect() {
        if (this.client) {
            await this.client.endAsync();
        }
        if (this.broker) {
            await new Promise<void>((resolve) => {
                this.broker.server.close(() => resolve());
            });
            await this.broker.aedes.close();
        }
    }
}

export const mqClient = new MQClient();
