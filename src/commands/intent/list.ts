import fs from 'fs';
import path from 'path';
import { parseMetadata, INTENTS_DIR } from '../../core/utils.js';

/**
 * Action for 'praxis intent list'
 */
export async function intentListAction(options: { withArchived?: boolean } = {}) {
    const rootDir = process.cwd();
    const intentsDir = path.join(rootDir, INTENTS_DIR);

    if (!fs.existsSync(intentsDir)) {
        console.log('No intents found (directory .praxis/intents does not exist).');
        return;
    }

    const intentFiles = findAllIntentFiles(intentsDir);

    if (intentFiles.length === 0) {
        console.log('No intents found.');
        return;
    }

    // Filter intents by status
    let filteredIntents = intentFiles;
    if (!options.withArchived) {
        filteredIntents = intentFiles.filter(file => {
            const content = fs.readFileSync(file, 'utf8');
            const metadata = parseMetadata(content);
            return metadata.status.toLowerCase() === 'wip';
        });
    }

    if (filteredIntents.length === 0) {
        if (!options.withArchived) {
            console.log('No WIP intents found. Use --with-archived to see all intents.');
        } else {
            console.log('No intents found.');
        }
        return;
    }

    // Print header
    console.log(`${'ID'.padEnd(25)} ${'Status'.padEnd(15)} Created`);
    console.log('-'.repeat(60));

    for (const file of filteredIntents) {
        const content = fs.readFileSync(file, 'utf8');
        const id = path.basename(path.dirname(file));

        // Parse metadata
        const metadata = parseMetadata(content);

        // Simple column formatting
        console.log(`${id.padEnd(25)} ${metadata.status.padEnd(15)} ${metadata.created}`);
    }
}

function findAllIntentFiles(dir: string): string[] {
    let results: string[] = [];
    try {
        const list = fs.readdirSync(dir);

        for (const file of list) {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);

            if (stat.isDirectory()) {
                results = results.concat(findAllIntentFiles(filePath));
            } else if (file === 'intent.md') {
                results.push(filePath);
            }
        }
    } catch (e) {
        console.error(`Error reading directory ${dir}:`, e);
    }

    return results;
}
