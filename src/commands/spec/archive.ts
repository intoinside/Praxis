import fs from 'fs';
import path from 'path';
import { queueTask } from '../../core/agent/persistence.js';

/**
 * Action for 'praxis spec archive <spec-id>'
 */
export async function specArchiveAction(specId: string) {
    const rootDir = process.cwd();
    const specsDir = path.join(rootDir, '.praxis', 'specs');
    const archiveDirBase = path.join(specsDir, 'archive');

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

    // Ensure we don't try to archive something already archived (though findSpecDirectory might exclude archive subfolder if implemented carefully)
    if (specDir.includes(path.sep + 'archive' + path.sep)) {
        console.error(`Error: Spec '${specId}' is already archived.`);
        return;
    }

    // 3. Update status to Archived in spec.md
    const specMdPath = path.join(specDir, 'spec.md');
    if (fs.existsSync(specMdPath)) {
        try {
            let content = fs.readFileSync(specMdPath, 'utf-8');
            // Simple regex to replace Status: ... with Status: Archived
            // Supporting both "Status: Draft" and "Status:Draft"
            const newState = 'Status: Archived';
            if (content.match(/^\*\*Status\*\*:\s*.*$/m)) {
                content = content.replace(/^\*\*Status\*\*:\s*.*$/m, newState);
            } else {
                // If no state found, maybe just append it or warn?
                // Most specs should have a state. Let's prepend it if it looks like frontmatter.
                content = newState + '\n' + content;
            }
            fs.writeFileSync(specMdPath, content, 'utf-8');
            console.log(`Updated status to '${newState}' in ${specMdPath}`);
        } catch (error) {
            console.error(`Warning: Could not update status in spec.md: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    // 4. Archive
    try {
        if (!fs.existsSync(archiveDirBase)) {
            fs.mkdirSync(archiveDirBase, { recursive: true });
        }

        const targetDir = path.join(archiveDirBase, specId);

        // Handle collision in archive
        if (fs.existsSync(targetDir)) {
            const timestamp = new Date().getTime();
            const collisionDir = path.join(archiveDirBase, `${specId}_${timestamp}`);
            console.warn(`Warning: Archive for '${specId}' already exists. Moving to ${collisionDir} instead.`);
            fs.renameSync(specDir, collisionDir);
            console.log(`Successfully archived spec '${specId}' to ${collisionDir}.`);
        } else {
            console.log(`Archiving spec '${specId}' from ${specDir} to ${targetDir}...`);
            fs.renameSync(specDir, targetDir);
            console.log(`Successfully archived spec '${specId}'.`);
        }

        // Trigger background documentation update
        queueTask('documentation-update', { specId });

    } catch (error) {
        if (error instanceof Error) {
            console.error(`Error archiving spec '${specId}': ${error.message}`);
        } else {
            console.error(`Error archiving spec '${specId}': Unknown error`);
        }
    }
}

function findSpecDirectory(dir: string, targetId: string): string | null {
    try {
        // Skip the archive directory itself during search
        if (path.basename(dir) === 'archive') {
            return null;
        }

        const list = fs.readdirSync(dir);

        // Check if direct match exists
        const directPath = path.join(dir, targetId);
        if (fs.existsSync(directPath) && fs.statSync(directPath).isDirectory()) {
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
                if (found) return found;
            }
        }
    } catch (e) {
        // Ignore permission errors etc
    }
    return null;
}
