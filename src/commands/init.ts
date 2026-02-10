import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
    PRAXIS_DIR,
    INTENTS_DIR,
    SPECS_DIR,
    TEMPLATES_DIR,
    PRODUCT_TECH_INFO
} from '../core/utils.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function initCommand(projectName?: string) {
    const rootDir = process.cwd();
    const praxisDir = path.join(rootDir, PRAXIS_DIR);
    const templatesDir = path.join(rootDir, TEMPLATES_DIR);
    const intentsDir = path.join(rootDir, INTENTS_DIR);
    const intentsWipDir = path.join(intentsDir, 'wip');
    const intentsArchiveDir = path.join(intentsDir, 'archive');
    const specsDir = path.join(rootDir, SPECS_DIR);

    const dirs = [praxisDir, templatesDir, intentsDir, intentsWipDir, intentsArchiveDir, specsDir];

    for (const dir of dirs) {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`Created directory: ${path.relative(rootDir, dir)}`);

            // Create a .gitkeep file to ensure the directory is tracked by git
            fs.writeFileSync(path.join(dir, '.gitkeep'), '');
        } else {
            console.log(`Directory already exists: ${path.relative(rootDir, dir)}`);
        }
    }

    // Copy templates from package templates/ to .praxis/templates/
    const sourceTemplatesDir = path.resolve(__dirname, '../../templates');
    let techInfoTemplateContent = '';

    if (fs.existsSync(sourceTemplatesDir)) {
        console.log('\nCopying templates...');
        const templateFiles = fs.readdirSync(sourceTemplatesDir);
        for (const file of templateFiles) {
            const sourcePath = path.join(sourceTemplatesDir, file);
            const targetPath = path.join(templatesDir, file);

            if (fs.statSync(sourcePath).isFile()) {
                const content = fs.readFileSync(sourcePath, 'utf8');
                if (file === 'product-tech-info-template.md') {
                    techInfoTemplateContent = content;
                }
                fs.writeFileSync(targetPath, content);
                console.log(`- Copied: ${file}`);
            }
        }
    } else {
        console.log('\nNo source templates directory found at root. Skipping template copy.');
    }

    // Generate product-tech-info.md
    if (techInfoTemplateContent) {
        let content = techInfoTemplateContent;
        if (projectName) {
            content = content.replace(/- \*\*Project name\*\*:/, `- **Project name**: ${projectName}`);
        }
        const techInfoPath = path.join(praxisDir, PRODUCT_TECH_INFO);
        fs.writeFileSync(techInfoPath, content);
        console.log(`\nGenerated product tech info: ${path.relative(rootDir, techInfoPath)}`);
    }

    console.log('\nPraxis project structure initialized successfully!');
    console.log('You can now start defining intents in .praxis/intents/wip/');
}
