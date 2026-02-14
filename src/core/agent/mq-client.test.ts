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
            publish: vi.fn(),
            endAsync: vi.fn()
        })
    }
}));

vi.mock('aedes', () => {
    const aedesMock = vi.fn().mockReturnValue({
        handle: vi.fn(),
        close: vi.fn((cb) => cb && cb())
    });
    return {
        default: aedesMock,
        __esModule: true
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
        const config = { type: 'internal' as const, host: 'localhost', port: 1883 };
        await client.connect(config);
        // Expectation on mqtt.connect can be added if we import mqtt as well
    });

    it('should publish status', async () => {
        const config = { type: 'internal' as const, host: 'localhost', port: 1883 };
        await client.connect(config);
        await client.publishStatus('taskId', 'running');
        // Check if publish was called (requires mocking mqtt more deeply)
    });
});
