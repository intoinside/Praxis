import fs from 'fs';
import path from 'path';
/**
 * Action for 'praxis intent create <intent-description>'
 */
export async function intentCreateAction(description) {
    const rootDir = process.cwd();
    const templatePath = path.join(rootDir, '.praxis', 'templates', 'intent-template.md');
    if (!fs.existsSync(templatePath)) {
        console.error(`Error: Template not found at ${templatePath}`);
        console.error('Please run `praxis init` first to initialize the project structure.');
        return;
    }
    const templateContent = fs.readFileSync(templatePath, 'utf8');
    // Generate and display the AI prompt
    const prompt = generateAiPrompt(description, templateContent);
    console.log('\n--- IDE AI CHAT PROMPT ---');
    console.log('Copy and paste the following into your IDE chat to complete the intent:');
    console.log('--------------------------');
    console.log(prompt);
    console.log('--------------------------\n');
}
/**
 * Generate a prompt for the AI to complete the intent definition.
 */
function generateAiPrompt(description, templateContent) {
    return `You are an expert product manager and software architect.
I need to create a new Intent in my Praxis project for the following feature:
"${description}"

Please perform the following actions:

1. **Analyze** the request to understand the core intent.
2. **Generate a Short ID**: Create a representative, kebab-case identifier for this intent. 
   - It MUST be concise (max 20 characters).
   - Example: "user-login", "export-pdf", "dark-mode".
3. **Create the Intent File**:
   - Create a new directory: \`.praxis/intents/wip/<your-generated-id>/\`
   - Create a new file: \`.praxis/intents/wip/<your-generated-id>/intent.md\`
4. **Fill the Template**:
   - Use the template content provided below.
   - Smartly fill in ALL placeholders (like [FEATURE NAME], [DATE], etc.) based on the user's description.
   - Write at least one draft User Story based on the description.
   - Define initial Functional Requirements.
   - Set the Status to "Draft".
   - Keep the language used for the intent description.
   
Here is the template content to use:

\`\`\`markdown
${templateContent}
\`\`\`

Now, please generate the file creation tool call and the filled content.`;
}
