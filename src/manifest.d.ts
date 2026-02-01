/**
 * Praxis Command Manifest
 * This file defines all supported commands and subcommands for the Praxis CLI.
 */
export interface CommandDefinition {
    name: string;
    description: string;
    subcommands?: CommandDefinition[];
    options?: {
        name: string;
        description: string;
        alias?: string;
        required?: boolean;
    }[];
    arguments?: {
        name: string;
        description: string;
        required?: boolean;
    }[];
}
export declare const manifest: CommandDefinition[];
