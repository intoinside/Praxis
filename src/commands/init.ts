import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import inquirer from 'inquirer';
import {
    PRAXIS_DIR,
    INTENTS_DIR,
    SPECS_DIR,
    TEMPLATES_DIR,
    PRODUCT_TECH_INFO
} from '../core/utils.js';
import { saveConfig, DEFAULT_CONFIG } from '../core/agent/config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const LOGO = `
 ███████████                                   ███         
░░███░░░░░███                                 ░░░          
 ░███    ░███ ████████   ██████   █████ █████ ████   █████ 
 ░██████████ ░░███░░███ ░░░░░███ ░░███ ░░███ ░░███  ███░░  
 ░███░░░░░░   ░███ ░░░   ███████  ░░░█████░   ░███ ░░█████ 
 ░███         ░███      ███░░███   ███░░░███  ░███  ░░░░███
 █████        █████    ░░████████ █████ █████ █████ ██████ 
░░░░░        ░░░░░      ░░░░░░░░ ░░░░░ ░░░░░ ░░░░░ ░░░░░░  
`;

export async function initCommand(projectName?: string) {
    const rootDir = process.cwd();
    const praxisDir = path.join(rootDir, PRAXIS_DIR);

    // ... (rest of the directory initialization remains the same but moved inside)

    console.log(LOGO);
    console.log('Welcome to Praxis Initialization!\n');

    const answers = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'enableAgent',
            message: 'Do you want to enable the background agent?',
            default: true
        },
        {
            type: 'list',
            name: 'brokerType',
            message: 'What type of MQTT broker do you want to use?',
            choices: [
                { name: 'Internal (embedded in Praxis)', value: 'internal' },
                { name: 'External (requires a broker URL)', value: 'external' }
            ],
            default: 'internal',
            when: (ans) => ans.enableAgent
        },
        {
            type: 'input',
            name: 'brokerUrl',
            message: 'What is the MQTT broker URL?',
            default: 'mqtt://127.0.0.1:1883',
            when: (ans) => ans.enableAgent && ans.brokerType === 'external'
        },
        {
            type: 'number',
            name: 'concurrency',
            message: 'How many concurrent tasks should each agent handle?',
            default: 1,
            when: (ans) => ans.enableAgent
        }
    ]);

    const config = { ...DEFAULT_CONFIG };
    config.agent.enabled = answers.enableAgent;
    if (answers.enableAgent) {
        config.agent.broker = answers.brokerType;
        config.agent.brokerUrl = answers.brokerUrl || config.agent.brokerUrl;
        config.agent.concurrency = answers.concurrency || 1;
    }

    // Initialize directories
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
            fs.writeFileSync(path.join(dir, '.gitkeep'), '');
        } else {
            console.log(`Directory already exists: ${path.relative(rootDir, dir)}`);
        }
    }

    // Save configuration
    saveConfig(config);
    console.log(`\nGenerated configuration: .praxisrc.json`);

    // Copy templates ...

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
