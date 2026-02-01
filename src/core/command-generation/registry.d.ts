/**
 * Command Adapter Registry
 *
 * Centralized registry for tool command adapters.
 * Similar pattern to existing SlashCommandRegistry in the codebase.
 */
import type { ToolCommandAdapter } from './types.js';
/**
 * Registry for looking up tool command adapters.
 */
export declare class CommandAdapterRegistry {
    private static adapters;
    /**
     * Register a tool command adapter.
     * @param adapter - The adapter to register
     */
    static register(adapter: ToolCommandAdapter): void;
    /**
     * Get an adapter by tool ID.
     * @param toolId - The tool identifier (e.g., 'claude', 'cursor')
     * @returns The adapter or undefined if not registered
     */
    static get(toolId: string): ToolCommandAdapter | undefined;
    /**
     * Get all registered adapters.
     * @returns Array of all registered adapters
     */
    static getAll(): ToolCommandAdapter[];
    /**
     * Check if an adapter is registered for a tool.
     * @param toolId - The tool identifier
     * @returns True if an adapter exists
     */
    static has(toolId: string): boolean;
}
