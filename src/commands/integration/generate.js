import fs from 'fs';
import path from 'path';
import { manifest } from '../../manifest.js';
import { CommandAdapterRegistry } from '../../core/command-generation/index.js';
import { generateCommand } from '../../core/command-generation/generator.js';
/**
 * Action for 'praxis integration generate-slash-commands <tool>'
 */
export async function generateSlashCommandsAction(toolId) {
    const adapter = CommandAdapterRegistry.get(toolId);
    if (!adapter) {
        console.error(`Error: Adapter for tool '${toolId}' not found.`);
        console.log(`Available tools: ${CommandAdapterRegistry.getAll().map(a => a.toolId).join(', ')}`);
        return;
    }
    console.log(`Generating slash commands for tool: ${toolId}...`);
    const contents = flattenCommands(manifest);
    let count = 0;
    for (const content of contents) {
        const generated = generateCommand(content, adapter);
        const fullPath = path.join(process.cwd(), generated.path);
        // Ensure directory exists
        const dir = path.dirname(fullPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(fullPath, generated.fileContent);
        console.log(`- Generated: ${generated.path}`);
        count++;
    }
    console.log(`\nSuccess! ${count} slash commands generated.`);
}
/**
 * Flattens the command manifest into a tool-agnostic CommandContent array.
 */
function flattenCommands(commands, parentName) {
    let result = [];
    for (const cmd of commands) {
        const fullName = parentName ? `${parentName} ${cmd.name}` : cmd.name;
        const id = fullName.replace(/\s+/g, '-');
        if (cmd.subcommands) {
            result = result.concat(flattenCommands(cmd.subcommands, fullName));
        }
        else {
            // It's a runnable leaf command
            result.push({
                id: id,
                name: `Praxis ${fullName}`,
                description: cmd.description,
                category: 'Praxis',
                tags: ['praxis', cmd.name],
                body: generateBody(fullName, cmd)
            });
        }
    }
    return result;
}
/**
 * Generates the body content for a command workflow.
 */
function generateBody(fullName, cmd) {
    const args = cmd.arguments ? cmd.arguments.map(arg => `"$${arg.name}"`).join(' ') : '';
    const cliCommand = `node --loader ts-node/esm src/index.ts ${fullName} ${args}`.trim();
    let body = `To execute this Praxis command, run:\n\n// turbo\n${cliCommand}\n`;
    if (fullName === 'intent create') {
        body += `\nOnce the command is executed, follow the prompt generated in the output to complete the intent document with the AI.`;
    }
    return body;
}
