import fs from 'fs';
import path from 'path';

/**
 * Action for 'praxis spec apply <spec-id>'
 */
export async function specApplyAction(specId: string) {
    const rootDir = process.cwd();
    const specsDir = path.join(rootDir, '.praxis', 'specs');

    // 1. Validate environment
    if (!fs.existsSync(specsDir)) {
        // As requested: "Se la spec specificata con l'id non esiste, il comando non deve fare niente."
        return;
    }

    // 2. Find spec directory
    const specDir = findSpecDirectory(specsDir, specId);
    if (!specDir) {
        // As requested: "Se la spec specificata con l'id non esiste, il comando non deve fare niente."
        return;
    }

    // 3. Collect artifacts
    const specFile = path.join(specDir, 'spec.md');
    let specContent = '';
    if (fs.existsSync(specFile)) {
        specContent = fs.readFileSync(specFile, 'utf8');
    }

    const otherArtifacts: { name: string, content: string }[] = [];
    const files = fs.readdirSync(specDir);
    for (const file of files) {
        if (file === 'spec.md' || file === '.gitkeep') continue;
        const filePath = path.join(specDir, file);
        if (fs.statSync(filePath).isFile()) {
            otherArtifacts.push({
                name: file,
                content: fs.readFileSync(filePath, 'utf8')
            });
        }
    }

    // 4. Generate Prompt
    const prompt = generateApplyPrompt(specId, specContent, otherArtifacts);

    // 5. Output
    console.log('\n--- IDE AI CHAT PROMPT ---');
    console.log('Copy and paste the following into your IDE chat to implement the specification:');
    console.log('--------------------------');
    console.log(prompt);
    console.log('--------------------------\n');
}

function findSpecDirectory(dir: string, targetId: string): string | null {
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

function generateApplyPrompt(specId: string, specContent: string, artifacts: { name: string, content: string }[]): string {
    let artifactsSection = '';
    if (artifacts.length > 0) {
        artifactsSection = '\n**Additional Artifacts found in spec directory**:\n';
        artifacts.forEach(art => {
            artifactsSection += `\n- **${art.name}**:\n\`\`\`\n${art.content}\n\`\`\`\n`;
        });
    }

    return `I want to implement the specification with ID: **${specId}**.

Please carefully review the specification content and any associated artifacts provided below. 
Your task is to proceed with the implementation in the codebase, following the requirements and design decisions documented in these files.

**SPECIFICATION CONTENT**:
\`\`\`markdown
${specContent || 'No spec.md content found.'}
\`\`\`
${artifactsSection}

Please start the implementation now.`;
}
