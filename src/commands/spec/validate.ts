import fs from 'fs';
import path from 'path';

/**
 * Action for 'praxis spec validate <spec-id>'
 */
export async function specValidateAction(specId: string) {
    const rootDir = process.cwd();
    const specsDir = path.join(rootDir, '.praxis', 'specs', 'wip');
    const intentsDir = path.join(rootDir, '.praxis', 'intents', 'wip');
    const specTemplatePath = path.join(rootDir, '.praxis', 'templates', 'spec-template.md');

    if (!fs.existsSync(specsDir)) {
        console.log('No specs found (directory .praxis/specs does not exist).');
        return;
    }

    // 1. Find spec directory
    const specDirectory = findSpecDirectory(specsDir, specId);
    if (!specDirectory) {
        console.error(`Error: Spec with ID "${specId}" not found.`);
        return;
    }

    // 2. Read spec template
    let templateContent = 'No spec template found.';
    if (fs.existsSync(specTemplatePath)) {
        templateContent = fs.readFileSync(specTemplatePath, 'utf8');
    }

    // 3. Read spec content and artifacts
    const specFile = path.join(specDirectory, 'spec.md');
    let specContent = '';
    if (fs.existsSync(specFile)) {
        specContent = fs.readFileSync(specFile, 'utf8');
    }

    const otherArtifacts: { name: string, content: string }[] = [];
    const files = fs.readdirSync(specDirectory);
    for (const file of files) {
        if (file === 'spec.md' || file === '.gitkeep') continue;
        const filePath = path.join(specDirectory, file);
        if (fs.statSync(filePath).isFile()) {
            otherArtifacts.push({
                name: file,
                content: fs.readFileSync(filePath, 'utf8')
            });
        }
    }

    // 4. Extract intent-id and find intent content
    const intentId = extractIntentId(specContent);
    let intentContent = 'No associated intent found.';
    if (intentId) {
        const intentDir = findIntentDirectory(intentsDir, intentId);
        if (intentDir) {
            const intentFile = path.join(intentDir, 'intent.md');
            if (fs.existsSync(intentFile)) {
                intentContent = fs.readFileSync(intentFile, 'utf8');
            }
        }
    }

    // 5. Generate Prompt
    const prompt = generateSpecValidatePrompt(specId, specContent, templateContent, intentContent, otherArtifacts);

    // 6. Output
    console.log('\n--- IDE AI CHAT PROMPT ---');
    console.log('Copy and paste the following into your IDE chat to validate the specification:');
    console.log('--------------------------');
    console.log(prompt);
    console.log('--------------------------\n');
}

export function findSpecDirectory(dir: string, targetId: string): string | null {
    try {
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
                if (file === targetId) {
                    if (fs.existsSync(path.join(filePath, 'spec.md'))) {
                        return filePath;
                    }
                }
                const found = findSpecDirectory(filePath, targetId);
                if (found) return found;
            }
        }
    } catch (e) {
        // Ignore errors
    }
    return null;
}

export function findIntentDirectory(dir: string, targetId: string): string | null {
    try {
        if (!fs.existsSync(dir)) return null;
        const list = fs.readdirSync(dir);

        const directPath = path.join(dir, targetId);
        if (fs.existsSync(directPath) && fs.statSync(directPath).isDirectory()) {
            if (fs.existsSync(path.join(directPath, 'intent.md'))) {
                return directPath;
            }
        }

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

export function extractIntentId(specContent: string): string | null {
    const match = specContent.match(/\*\*Intent\*\*:\s*([^\s\r\n]+)/);
    return match ? match[1] : null;
}

export function generateSpecValidatePrompt(
    specId: string,
    specContent: string,
    templateContent: string,
    intentContent: string,
    artifacts: { name: string, content: string }[]
): string {
    let artifactsSection = '';
    if (artifacts.length > 0) {
        artifactsSection = '\n**Additional Artifacts found in spec directory**:\n';
        artifacts.forEach(art => {
            artifactsSection += `\n- **${art.name}**:\n\`\`\`\n${art.content}\n\`\`\`\n`;
        });
    }

    return `You are an expert software architect and quality assurance engineer.
I need to validate the Specification with ID: **${specId}**.

The validation MUST take into account:
1. The **Specification Content** against the **Specification Template**.
2. The **Specification Content** against its parent **Intent Content** (to ensure traceability and alignment).
3. Any **Additional Artifacts** related to this specification.
4. The overall internal consistency and completeness of the specification.

**SPECIFICATION TEMPLATE**:
\`\`\`markdown
${templateContent}
\`\`\`

**PARENT INTENT CONTENT**:
\`\`\`markdown
${intentContent}
\`\`\`

**SPECIFICATION CONTENT**:
\`\`\`markdown
${specContent || 'No spec.md content found.'}
\`\`\`
${artifactsSection}

Please perform a thorough validation and suggest any necessary modifications to the artifacts to improve clarity, completeness, or alignment with the template and the parent intent. 
Your output must result in a modification of the artifacts if any issues are found.`;
}
