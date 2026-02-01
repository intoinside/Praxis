import fs from 'fs';
import path from 'path';
/**
 * Action for 'praxis spec derive --from <intent-id>'
 */
export async function specDeriveAction(options) {
    const intentId = options.fromIntent;
    const rootDir = process.cwd();
    const intentsDir = path.join(rootDir, '.praxis', 'intents');
    const templatePath = path.join(rootDir, '.praxis', 'templates', 'spec-template.md');
    // 1. Validate environment
    if (!fs.existsSync(intentsDir)) {
        console.error('Error: Intents directory not found (.praxis/intents).');
        return;
    }
    if (!fs.existsSync(templatePath)) {
        console.error(`Error: Spec template not found at ${templatePath}`);
        return;
    }
    // 2. Find intent file
    const intentFile = findIntentFile(intentsDir, intentId);
    if (!intentFile) {
        console.error(`Error: Intent with ID '${intentId}' not found.`);
        return;
    }
    // 3. Read content
    const intentContent = fs.readFileSync(intentFile, 'utf8');
    const templateContent = fs.readFileSync(templatePath, 'utf8');
    // 4. Generate Prompt
    const prompt = generateAiPrompt(intentId, intentContent, templateContent);
    // 5. Output
    console.log('\n--- IDE AI CHAT PROMPT ---');
    console.log('Copy and paste the following into your IDE chat to generate the specification:');
    console.log('--------------------------');
    console.log(prompt);
    console.log('--------------------------\n');
}
function findIntentFile(dir, targetId) {
    try {
        const list = fs.readdirSync(dir);
        // Check if direct match exists (optimization)
        const directPath = path.join(dir, targetId, 'intent.md');
        if (fs.existsSync(directPath)) {
            return directPath;
        }
        // Recursive search
        for (const file of list) {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            if (stat.isDirectory()) {
                // If the directory name *is* the ID, check for intent.md inside
                if (file === targetId) {
                    const potentialIntent = path.join(filePath, 'intent.md');
                    if (fs.existsSync(potentialIntent)) {
                        return potentialIntent;
                    }
                }
                // Otherwise recurse
                const found = findIntentFile(filePath, targetId);
                if (found)
                    return found;
            }
        }
    }
    catch (e) {
        // Ignore permission errors etc during search
    }
    return null;
}
function generateAiPrompt(intentId, intentContent, templateContent) {
    return `You are an expert software architect and product owner.
I need to generate a specific technical specification (Spec) for an Intent in my project.

**Source Intent ID**: ${intentId}

**Context**:
An Intent can result in multiple Specifications (Specs). Each Spec represents a concrete feature or component derived from the Intent.
To keep things organized, every Spec needs a unique identifier.

**Task**:
1.  **Analyze** the Intent provided below. Understand the goal and identify the specific scope for *this* specification.
2.  **Generate a Spec ID**:
    -   Create a concise, kebab-case string (max 20 chars) that represents the content of this specific spec.
    -   Example: If the intent is "create-user-profile", this spec might be "profile-api" or "profile-ui".
3.  **Generate the Specification** using the provided Template.
    -   Fill in ALL sections of the template.
    -   Use the intent information to populate "User Scenarios", "Requirements", etc.
    -   Ensure the Spec is detailed enough for an AI agent to implement the code later.
    -   Do NOT change the structure of the template.
    -   Set Status to "Draft".
4.  **Output** the full Markdown content of the new specification file.
    -   **Important**: The file path MUST be: \`.praxis/specs/<intent-id><your-generated-spec-id>/spec.md\`

---
**INTENT CONTENT**:
\`\`\`markdown
${intentContent}
\`\`\`

---
**SPEC TEMPLATE**:
\`\`\`markdown
${templateContent}
\`\`\`

Please generate the file creation tool call (if available) or the full markdown content with the specified path now.`;
}
