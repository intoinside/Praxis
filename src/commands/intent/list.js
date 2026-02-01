import fs from 'fs';
import path from 'path';
/**
 * Action for 'praxis intent list'
 */
export async function intentListAction() {
    const rootDir = process.cwd();
    const intentsDir = path.join(rootDir, '.praxis', 'intents');
    if (!fs.existsSync(intentsDir)) {
        console.log('No intents found (directory .praxis/intents does not exist).');
        return;
    }
    const intentFiles = findAllIntentFiles(intentsDir);
    if (intentFiles.length === 0) {
        console.log('No intents found.');
        return;
    }
    // Print header
    console.log('%-25s %-15s %s', 'ID', 'Status', 'Created');
    console.log('-'.repeat(60));
    for (const file of intentFiles) {
        const content = fs.readFileSync(file, 'utf8');
        const id = path.basename(path.dirname(file));
        // Parse metadata using simple regex
        const statusMatch = content.match(/\*\*Status\*\*:\s*(.+)/);
        const createdMatch = content.match(/\*\*Created\*\*:\s*(.+)/);
        const status = statusMatch ? statusMatch[1].trim() : 'Unknown';
        const created = createdMatch ? createdMatch[1].trim() : 'Unknown';
        // Simple column formatting
        console.log(`${id.padEnd(25)} ${status.padEnd(15)} ${created}`);
    }
}
function findAllIntentFiles(dir) {
    let results = [];
    try {
        const list = fs.readdirSync(dir);
        for (const file of list) {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            if (stat.isDirectory()) {
                results = results.concat(findAllIntentFiles(filePath));
            }
            else if (file === 'intent.md') {
                results.push(filePath);
            }
        }
    }
    catch (e) {
        console.error(`Error reading directory ${dir}:`, e);
    }
    return results;
}
