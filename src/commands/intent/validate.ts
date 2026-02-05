import fs from 'fs';
import path from 'path';

/**
 * Action for 'praxis intent validate <intent-id>'
 */
export async function intentValidateAction(intentId: string) {
    const rootDir = process.cwd();
    const intentsDir = path.join(rootDir, '.praxis', 'intents');
    const templatePath = path.join(rootDir, '.praxis', 'templates', 'intent-template.md');

    if (!fs.existsSync(intentsDir)) {
        console.log('No intents found (directory .praxis/intents does not exist).');
        return;
    }

    // 1. Find intent directory
    const intentDirectory = findIntentDirectory(intentsDir, intentId);
    if (!intentDirectory) {
        console.error(`Error: Intent with ID "${intentId}" not found.`);
        return;
    }

    // 2. Read template
    let templateContent = 'No intent template found.';
    if (fs.existsSync(templatePath)) {
        templateContent = fs.readFileSync(templatePath, 'utf8');
    }

    // 3. Collect artifacts
    const intentFile = path.join(intentDirectory, 'intent.md');
    let intentContent = '';
    if (fs.existsSync(intentFile)) {
        intentContent = fs.readFileSync(intentFile, 'utf8');
    }

    const otherArtifacts: { name: string, content: string }[] = [];
    const files = fs.readdirSync(intentDirectory);
    for (const file of files) {
        if (file === 'intent.md' || file === '.gitkeep') continue;
        const filePath = path.join(intentDirectory, file);
        if (fs.statSync(filePath).isFile()) {
            otherArtifacts.push({
                name: file,
                content: fs.readFileSync(filePath, 'utf8')
            });
        }
    }

    // 4. Generate Prompt
    const prompt = generateValidatePrompt(intentId, intentContent, templateContent, otherArtifacts);

    // 5. Output
    console.log('\n--- IDE AI CHAT PROMPT ---');
    console.log('Copy and paste the following into your IDE chat to validate the intent:');
    console.log('--------------------------');
    console.log(prompt);
    console.log('--------------------------\n');
}

export function findIntentDirectory(dir: string, targetId: string): string | null {
    try {
        const list = fs.readdirSync(dir);

        // Check if direct match exists
        const directPath = path.join(dir, targetId);
        if (fs.existsSync(directPath) && fs.statSync(directPath).isDirectory()) {
            if (fs.existsSync(path.join(directPath, 'intent.md'))) {
                return directPath;
            }
        }

        // Recursive search
        for (const file of list) {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);

            if (stat.isDirectory()) {
                if (file === targetId) {
                    if (fs.existsSync(path.join(filePath, 'intent.md'))) {
                        return filePath;
                    }
                }
                const found = findIntentDirectory(filePath, targetId);
                if (found) return found;
            }
        }
    } catch (e) {
        // Ignore errors
    }
    return null;
}

export function generateValidatePrompt(intentId: string, intentContent: string, templateContent: string, artifacts: { name: string, content: string }[]): string {
    let artifactsSection = '';
    if (artifacts.length > 0) {
        artifactsSection = '\n**Additional Artifacts found in intent directory**:\n';
        artifacts.forEach(art => {
            artifactsSection += `\n- **${art.name}**:\n\`\`\`\n${art.content}\n\`\`\`\n`;
        });
    }

    return `You are an expert software architect and quality assurance engineer.
I need to validate the Intent with ID: **${intentId}**.

The validation MUST take into account:
1. The **Intent Content** against the **Intent Template**.
2. Any **Additional Artifacts** related to this intent.
3. The overall consistency and completeness of the intent definition.

**INTENT TEMPLATE**:
\`\`\`markdown
${templateContent}
\`\`\`

**INTENT CONTENT**:
\`\`\`markdown
${intentContent || 'No intent.md content found.'}
\`\`\`
${artifactsSection}

Please perform a thorough validation and suggest any necessary modifications to the artifacts to improve clarity, completeness, or alignment with the template and project goals. 
Your output must result in a modification of the artifacts if any issues are found.`;
}
