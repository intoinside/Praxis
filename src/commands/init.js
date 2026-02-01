import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
export async function initCommand() {
    const rootDir = process.cwd();
    const praxisDir = path.join(rootDir, '.praxis');
    const templatesDir = path.join(praxisDir, 'templates');
    const intentsDir = path.join(praxisDir, 'intents');
    const intentsWipDir = path.join(praxisDir, 'intents', 'wip');
    const intentsArchiveDir = path.join(praxisDir, 'intents', 'archive');
    const specsDir = path.join(praxisDir, 'specs');
    const dirs = [praxisDir, templatesDir, intentsDir, intentsWipDir, intentsArchiveDir, specsDir];
    for (const dir of dirs) {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`Created directory: ${path.relative(rootDir, dir)}`);
            // Create a .gitkeep file to ensure the directory is tracked by git
            fs.writeFileSync(path.join(dir, '.gitkeep'), '');
        }
        else {
            console.log(`Directory already exists: ${path.relative(rootDir, dir)}`);
        }
    }
    // Copy templates from package templates/ to .praxis/templates/
    const sourceTemplatesDir = path.resolve(__dirname, '../../templates');
    if (fs.existsSync(sourceTemplatesDir)) {
        console.log('\nCopying templates...');
        const templateFiles = fs.readdirSync(sourceTemplatesDir);
        for (const file of templateFiles) {
            const sourcePath = path.join(sourceTemplatesDir, file);
            const targetPath = path.join(templatesDir, file);
            if (fs.statSync(sourcePath).isFile()) {
                fs.copyFileSync(sourcePath, targetPath);
                console.log(`- Copied: ${file}`);
            }
        }
    }
    else {
        console.log('\nNo source templates directory found at root. Skipping template copy.');
    }
    console.log('\nPraxis project structure initialized successfully!');
    console.log('You can now start defining intents in .praxis/intents/wip/');
}
