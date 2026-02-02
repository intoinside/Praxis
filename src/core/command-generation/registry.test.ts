import { describe, it, expect, beforeEach } from 'vitest';
import { CommandAdapterRegistry } from './registry.js';

describe('CommandAdapterRegistry', () => {
    beforeEach(() => {
        // Since it's a static singleton, we might need to be careful with tests.
        // For now, let's just test what's there.
    });

    it('should have antigravity adapter registered by default', () => {
        const adapter = CommandAdapterRegistry.get('antigravity');
        expect(adapter).toBeDefined();
        expect(adapter?.toolId).toBe('antigravity');
    });

    it('should return undefined for non-existent adapters', () => {
        const adapter = CommandAdapterRegistry.get('non-existent');
        expect(adapter).toBeUndefined();
    });

    it('should allow registering new adapters', () => {
        const mockAdapter = { toolId: 'new-tool', getFilePath: () => '', formatFile: () => '' };
        CommandAdapterRegistry.register(mockAdapter as any);

        const adapter = CommandAdapterRegistry.get('new-tool');
        expect(adapter).toBe(mockAdapter);
    });
});
