/**
 * Command Adapter Registry
 *
 * Centralized registry for tool command adapters.
 * Similar pattern to existing SlashCommandRegistry in the codebase.
 */
// import { amazonQAdapter } from './adapters/amazon-q.js';
import { antigravityAdapter } from './adapters/antigravity.js';
// import { auggieAdapter } from './adapters/auggie.js';
// import { claudeAdapter } from './adapters/claude.js';
// import { clineAdapter } from './adapters/cline.js';
// import { codexAdapter } from './adapters/codex.js';
// import { codebuddyAdapter } from './adapters/codebuddy.js';
// import { continueAdapter } from './adapters/continue.js';
// import { costrictAdapter } from './adapters/costrict.js';
// import { crushAdapter } from './adapters/crush.js';
// import { cursorAdapter } from './adapters/cursor.js';
// import { factoryAdapter } from './adapters/factory.js';
// import { geminiAdapter } from './adapters/gemini.js';
// import { githubCopilotAdapter } from './adapters/github-copilot.js';
// import { iflowAdapter } from './adapters/iflow.js';
// import { kilocodeAdapter } from './adapters/kilocode.js';
// import { opencodeAdapter } from './adapters/opencode.js';
// import { qoderAdapter } from './adapters/qoder.js';
// import { qwenAdapter } from './adapters/qwen.js';
// import { roocodeAdapter } from './adapters/roocode.js';
// import { windsurfAdapter } from './adapters/windsurf.js';
/**
 * Registry for looking up tool command adapters.
 */
export class CommandAdapterRegistry {
    static adapters = new Map();
    // Static initializer - register built-in adapters
    static {
        // CommandAdapterRegistry.register(amazonQAdapter);
        CommandAdapterRegistry.register(antigravityAdapter);
        // CommandAdapterRegistry.register(auggieAdapter);
        // CommandAdapterRegistry.register(claudeAdapter);
        // CommandAdapterRegistry.register(clineAdapter);
        // CommandAdapterRegistry.register(codexAdapter);
        // CommandAdapterRegistry.register(codebuddyAdapter);
        // CommandAdapterRegistry.register(continueAdapter);
        // CommandAdapterRegistry.register(costrictAdapter);
        // CommandAdapterRegistry.register(crushAdapter);
        // CommandAdapterRegistry.register(cursorAdapter);
        // CommandAdapterRegistry.register(factoryAdapter);
        // CommandAdapterRegistry.register(geminiAdapter);
        // CommandAdapterRegistry.register(githubCopilotAdapter);
        // CommandAdapterRegistry.register(iflowAdapter);
        // CommandAdapterRegistry.register(kilocodeAdapter);
        // CommandAdapterRegistry.register(opencodeAdapter);
        // CommandAdapterRegistry.register(qoderAdapter);
        // CommandAdapterRegistry.register(qwenAdapter);
        // CommandAdapterRegistry.register(roocodeAdapter);
        // CommandAdapterRegistry.register(windsurfAdapter);
    }
    /**
     * Register a tool command adapter.
     * @param adapter - The adapter to register
     */
    static register(adapter) {
        CommandAdapterRegistry.adapters.set(adapter.toolId, adapter);
    }
    /**
     * Get an adapter by tool ID.
     * @param toolId - The tool identifier (e.g., 'claude', 'cursor')
     * @returns The adapter or undefined if not registered
     */
    static get(toolId) {
        return CommandAdapterRegistry.adapters.get(toolId);
    }
    /**
     * Get all registered adapters.
     * @returns Array of all registered adapters
     */
    static getAll() {
        return Array.from(CommandAdapterRegistry.adapters.values());
    }
    /**
     * Check if an adapter is registered for a tool.
     * @param toolId - The tool identifier
     * @returns True if an adapter exists
     */
    static has(toolId) {
        return CommandAdapterRegistry.adapters.has(toolId);
    }
}
