#!/usr/bin/env ts-node
import { Command } from 'commander';
import { manifest } from './manifest.js';
import { initCommand } from './commands/init.js';
import { intentCreateAction } from './commands/intent/create.js';
import { intentListAction } from './commands/intent/list.js';
import { generateSlashCommandsAction } from './commands/integration/generate.js';

import { specDeriveAction } from './commands/spec/derive.js';
import { specDeleteAction } from './commands/spec/delete.js';
import { specApplyAction } from './commands/spec/apply.js';

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

            if (subCmdDef.arguments) {
                subCmdDef.arguments.forEach(arg => {
                    const argStr = arg.required ? `<${arg.name}>` : `[${arg.name}]`;
                    subCmd.argument(argStr, arg.description);
                });
            }

            if (subCmdDef.options) {
                subCmdDef.options.forEach(opt => {
                    const flag = opt.required ? `<${opt.name}>` : `[${opt.name}]`;
                    subCmd.option(opt.alias ? `-${opt.alias}, --${opt.name} ${flag}` : `--${opt.name} ${flag}`, opt.description);
                });
            }

            subCmd.action(async (...args: any[]) => {
                if (cmdDef.name === 'intent' && subCmdDef.name === 'create') {
                    const [description] = args;
                    await intentCreateAction(description);
                } else if (cmdDef.name === 'intent' && subCmdDef.name === 'list') {
                    await intentListAction();
                } else if (cmdDef.name === 'integration' && subCmdDef.name === 'generate-slash-commands') {
                    const [tool] = args;
                    await generateSlashCommandsAction(tool);
                } else if (cmdDef.name === 'spec' && subCmdDef.name === 'derive') {
                    const [options] = args;
                    await specDeriveAction(options);
                } else if (cmdDef.name === 'spec' && subCmdDef.name === 'delete') {
                    const [specId] = args;
                    await specDeleteAction(specId);
                } else if (cmdDef.name === 'spec' && subCmdDef.name === 'apply') {
                    const [specId] = args;
                    await specApplyAction(specId);
                } else {
                    console.log(`Executing ${cmdDef.name} ${subCmdDef.name}...`);
                    // Implementation will go here
                }
            });
        });
    } else {
        // Top-level command with no subcommands
        if (cmdDef.arguments) {
            cmdDef.arguments.forEach(arg => {
                const argStr = arg.required ? `<${arg.name}>` : `[${arg.name}]`;
                cmd.argument(argStr, arg.description);
            });
        }

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
