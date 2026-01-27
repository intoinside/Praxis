#!/usr/bin/env ts-node
import { Command } from 'commander';
import { manifest } from './manifest.js';
import { initCommand } from './commands/init.js';

const program = new Command();

program
    .name('praxis')
    .description('Praxis: Intent-First Development Framework')
    .version('1.0.0');

// Dynamically build commands from manifest
manifest.forEach((cmdDef) => {
    const cmd = program.command(cmdDef.name).description(cmdDef.description);

    if (cmdDef.subcommands) {
        cmdDef.subcommands.forEach((subCmdDef) => {
            const subCmd = cmd.command(subCmdDef.name).description(subCmdDef.description);

            if (subCmdDef.options) {
                subCmdDef.options.forEach(opt => {
                    const flag = opt.required ? `<${opt.name}>` : `[${opt.name}]`;
                    subCmd.option(opt.alias ? `-${opt.alias}, --${opt.name} ${flag}` : `--${opt.name} ${flag}`, opt.description);
                });
            }

            subCmd.action(() => {
                console.log(`Executing ${cmdDef.name} ${subCmdDef.name}...`);
                // Implementation will go here
            });
        });
    } else {
        // Top-level command with no subcommands (e.g., 'model' if it's not nested)
        if (cmdDef.options) {
            cmdDef.options.forEach(opt => {
                const flag = opt.required ? `<${opt.name}>` : `[${opt.name}]`;
                cmd.option(opt.alias ? `-${opt.alias}, --${opt.name} ${flag}` : `--${opt.name} ${flag}`, opt.description);
            });
        }

        cmd.action(async () => {
            if (cmdDef.name === 'init') {
                await initCommand();
            } else {
                console.log(`Executing ${cmdDef.name}...`);
                // Implementation will go here
            }
        });
    }
});

program.parse();
