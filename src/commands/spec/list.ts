import fs from 'fs';
import path from 'path';
import {
    findAllSpecFiles,
    parseMetadata,
    SPECS_DIR
} from '../../core/utils.js';

/**
 * Action for 'praxis spec list'
 */
export async function specListAction(options: { fromIntent?: string }) {
    const rootDir = process.cwd();
    const specsDir = path.join(rootDir, SPECS_DIR);

    if (!fs.existsSync(specsDir)) {
        console.log('No specifications found (directory .praxis/specs does not exist).');
        return;
    }

    const specFiles = findAllSpecFiles();

    // Filter by intent if provided
    let filteredSpecs = specFiles;
    if (options.fromIntent) {
        filteredSpecs = specFiles.filter(file => {
            const intentId = path.basename(path.dirname(path.dirname(file)));
            return intentId === options.fromIntent;
        });
    }

    // Filter out archived specs (both by directory and status)
    filteredSpecs = filteredSpecs.filter(file => {
        // Skip if in 'archive' directory
        if (file.includes(path.sep + 'archive' + path.sep)) {
            return false;
        }

        const content = fs.readFileSync(file, 'utf8');
        const metadata = parseMetadata(content);

        return metadata.status.toLowerCase() !== 'archived';
    });

    if (filteredSpecs.length === 0) {
        if (options.fromIntent) {
            console.log(`No active specifications found for intent '${options.fromIntent}'.`);
        } else {
            console.log('No active specifications found.');
        }
        return;
    }

    // Print header
    console.log('%-25s %-25s %-15s %s', 'Intent ID', 'Spec ID', 'Status', 'Created');
    console.log('-'.repeat(85));

    for (const file of filteredSpecs) {
        const content = fs.readFileSync(file, 'utf8');
        const specId = path.basename(path.dirname(file));
        const intentId = path.basename(path.dirname(path.dirname(file)));

        // Parse metadata
        const metadata = parseMetadata(content);

        // Column formatting
        console.log(`${intentId.padEnd(25)} ${specId.padEnd(25)} ${metadata.status.padEnd(15)} ${metadata.created}`);
    }
}
