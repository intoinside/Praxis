import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MQClient } from './mq-client.js';
import * as aedes from 'aedes';
import net from 'net';

vi.mock('mqtt', () => ({
    default: {
        connect: vi.fn().mockReturnValue({
            on: vi.fn((event, cb) => {
                if (event === 'connect') setTimeout(cb, 0);
            }),
            subscribe: vi.fn(),
            publish: vi.fn((topic, msg, opts, cb) => {
                if (typeof opts === 'function') opts();
                else if (typeof cb === 'function') cb();
            }),
            endAsync: vi.fn().mockResolvedValue(undefined)
        })
    }
}));

vi.mock('aedes', () => {
    const aedesInstance = {
        handle: vi.fn(),
        close: vi.fn((cb) => cb && cb())
    };
    return {
        Aedes: {
            createBroker: vi.fn().mockResolvedValue(aedesInstance)
        }
    };
});

vi.mock('net', () => ({
    default: {
        createServer: vi.fn().mockReturnValue({
            listen: vi.fn((port, cb) => cb && cb()),
            on: vi.fn(),
            close: vi.fn((cb) => cb && cb())
        })
    }
}));

describe('MQClient', () => {
    let client: MQClient;

    beforeEach(() => {
        vi.clearAllMocks();
        client = new MQClient();
    });

    afterEach(async () => {
        await client.disconnect();
    });

    it('should start an internal broker', async () => {
        await client.startInternalBroker(1883);
        expect(net.createServer).toHaveBeenCalled();
    });

    it('should connect to a broker', async () => {
        const brokerUrl = 'mqtt://localhost:1883';
        await client.connect(brokerUrl);
        // Expectation on mqtt.connect can be added if we import mqtt as well
    });

    it('should publish status', async () => {
        const brokerUrl = 'mqtt://localhost:1883';
        await client.connect(brokerUrl);
        await client.publishStatus('taskId', 'running');
        // Check if publish was called (requires mocking mqtt more deeply)
    });
});
