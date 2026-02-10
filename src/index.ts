#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Command } from 'commander';
import { manifest, CommandDefinition } from './manifest.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageJsonPath = path.resolve(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

const program = new Command();

program
    .name('praxis')
    .description('Praxis: Intent-First Development Framework')
    .version(packageJson.version);

/**
 * Registers a command and its subcommands recursively from a definition.
 */
function registerCommand(parent: Command, def: CommandDefinition) {
    const cmd = parent.command(def.name).description(def.description);

    // Register arguments
    if (def.arguments) {
        def.arguments.forEach(arg => {
            const argStr = arg.required ? `<${arg.name}>` : `[${arg.name}]`;
            cmd.argument(argStr, arg.description);
        });
    }

    // Register options
    if (def.options) {
        def.options.forEach(opt => {
            const flag = opt.required ? `<${opt.name}>` : `[${opt.name}]`;
            cmd.option(opt.alias ? `-${opt.alias}, --${opt.name} ${flag}` : `--${opt.name} ${flag}`, opt.description);
        });
    }

    // Register subcommands
    if (def.subcommands) {
        def.subcommands.forEach(subDef => registerCommand(cmd, subDef));
    }

    // Register action
    if (def.action) {
        cmd.action(async (...args: any[]) => {
            try {
                await def.action!(...args);
            } catch (error) {
                console.error(`Error executing command '${def.name}':`, error instanceof Error ? error.message : error);
                process.exit(1);
            }
        });
    } else if (!def.subcommands) {
        cmd.action(() => {
            console.log(`Command '${def.name}' is not yet implemented.`);
        });
    }
}

// Dynamically build commands from manifest
manifest.forEach(cmdDef => registerCommand(program, cmdDef));

program.parse();
