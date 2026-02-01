import fs from 'fs';
import path from 'path';
/**
 * Action for 'praxis spec delete <spec-id>'
 */
export async function specDeleteAction(specId) {
    const rootDir = process.cwd();
    const specsDir = path.join(rootDir, '.praxis', 'specs');
    // 1. Validate environment
    if (!fs.existsSync(specsDir)) {
        console.error('Error: Specs directory not found (.praxis/specs).');
        return;
    }
    // 2. Find spec directory
    const specDir = findSpecDirectory(specsDir, specId);
    if (!specDir) {
        console.error(`Error: Spec with ID '${specId}' not found.`);
        return;
    }
    // 3. Delete
    try {
        console.log(`Deleting spec '${specId}' at ${specDir}...`);
        fs.rmSync(specDir, { recursive: true, force: true });
        console.log(`Successfully deleted spec '${specId}' and its artifacts.`);
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`Error deleting spec '${specId}': ${error.message}`);
        }
        else {
            console.error(`Error deleting spec '${specId}': Unknown error`);
        }
    }
}
function findSpecDirectory(dir, targetId) {
    try {
        const list = fs.readdirSync(dir);
        // Check if direct match exists
        const directPath = path.join(dir, targetId);
        if (fs.existsSync(directPath) && fs.statSync(directPath).isDirectory()) {
            // Optional: Check if it looks like a spec (has spec.md)?
            // For now, we trust the ID matches the directory name.
            // But to be safer/consistent with derive.ts:
            if (fs.existsSync(path.join(directPath, 'spec.md'))) {
                return directPath;
            }
        }
        // Recursive search
        for (const file of list) {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            if (stat.isDirectory()) {
                // If the directory name matches targetId
                if (file === targetId) {
                    if (fs.existsSync(path.join(filePath, 'spec.md'))) {
                        return filePath;
                    }
                }
                // Recurse
                const found = findSpecDirectory(filePath, targetId);
                if (found)
                    return found;
            }
        }
    }
    catch (e) {
        // Ignore permission errors etc
    }
    return null;
}
