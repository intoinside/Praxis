import fs from 'fs';
import path from 'path';

/**
 * Action for 'praxis spec list'
 */
export async function specListAction(options: { fromIntent?: string }) {
    const rootDir = process.cwd();
    const specsDir = path.join(rootDir, '.praxis', 'specs');

    if (!fs.existsSync(specsDir)) {
        console.log('No specifications found (directory .praxis/specs does not exist).');
        return;
    }

    const specFiles = findAllSpecFiles(specsDir);

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
        const statusMatch = content.match(/\*\*Status\*\*:\s*(.+)/);
        const status = statusMatch ? statusMatch[1].trim() : '';

        return status.toLowerCase() !== 'archived';
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

        // Parse metadata using simple regex
        const statusMatch = content.match(/\*\*Status\*\*:\s*(.+)/);
        const createdMatch = content.match(/\*\*Created\*\*:\s*(.+)/);

        const status = statusMatch ? statusMatch[1].trim() : 'Unknown';
        const created = createdMatch ? createdMatch[1].trim() : 'Unknown';

        // Column formatting
        console.log(`${intentId.padEnd(25)} ${specId.padEnd(25)} ${status.padEnd(15)} ${created}`);
    }
}

function findAllSpecFiles(dir: string): string[] {
    let results: string[] = [];
    try {
        const list = fs.readdirSync(dir);

        for (const file of list) {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);

            if (stat.isDirectory()) {
                // Skip the base archive directory itself to be safe
                if (path.basename(filePath) === 'archive' && path.dirname(filePath) === dir) {
                    continue;
                }
                results = results.concat(findAllSpecFiles(filePath));
            } else if (file === 'spec.md') {
                results.push(filePath);
            }
        }
    } catch (e) {
        // Ignore errors during traversal
    }

    return results;
}
