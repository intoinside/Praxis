import fs from 'fs';
import path from 'path';

/**
 * Action for 'praxis intent create <intent-description>'
 */
export async function intentCreateAction(description: string) {
    const id = generateId(description);
    const date = new Date().toISOString().split('T')[0];

    console.log(`Creating intent: ${description}`);
    console.log(`Generated ID: ${id}`);

    const rootDir = process.cwd();
    const templatePath = path.join(rootDir, '.praxis', 'templates', 'intent-template.md');

    if (!fs.existsSync(templatePath)) {
        console.error(`Error: Template not found at ${templatePath}`);
        console.error('Please run `praxis init` first to initialize the project structure.');
        return;
    }

    let templateContent = fs.readFileSync(templatePath, 'utf8');

    // Replace placeholders
    const finalContent = templateContent
        .replace(/\[FEATURE NAME\]/g, description)
        .replace(/\[###-feature-name\]/g, id)
        .replace(/\[DATE\]/g, date)
        .replace(/\$ARGUMENTS/g, description);

    const intentBaseDir = path.join(rootDir, '.praxis', 'intent');
    const intentDir = path.join(intentBaseDir, id);
    const intentFile = path.join(intentDir, 'intent.md');

    // Ensure parent directories exist
    if (!fs.existsSync(intentBaseDir)) {
        fs.mkdirSync(intentBaseDir, { recursive: true });
    }

    if (fs.existsSync(intentDir)) {
        console.error(`Error: Intent directory already exists: ${id}`);
        return;
    }

    fs.mkdirSync(intentDir, { recursive: true });
    fs.writeFileSync(intentFile, finalContent);

    console.log(`\nSuccess! Intent created at: ${path.relative(rootDir, intentFile)}`);

    // Generate and display the AI prompt
    const prompt = generateAiPrompt(description, intentFile, templatePath);
    console.log('\n--- IDE AI CHAT PROMPT ---');
    console.log('Copy and paste the following into your IDE chat to complete the intent:');
    console.log('```');
    console.log(prompt);
    console.log('```');
    console.log('--------------------------\n');
}

/**
 * Generate a prompt for the AI to complete the intent definition.
 */
function generateAiPrompt(description: string, intentFile: string, templateFile: string): string {
    const rootDir = process.cwd();
    const relIntentFile = path.relative(rootDir, intentFile);
    const relTemplateFile = path.relative(rootDir, templateFile);

    return `I need to define a new Intent for the feature: "${description}".
I have created a draft file at ${relIntentFile} using the template ${relTemplateFile}.

Please fulfill the content of ${relIntentFile} by following the guidelines and instructions provided in the comments of the template.
Ensure that:
1. User stories are prioritized and testable.
2. Requirements are specific and technology-agnostic.
3. Success criteria are measurable.
4. All placeholders and [NEEDS CLARIFICATION] markers are addressed.

The description provided by the user is: "${description}"`;
}

/**
 * Generate a short, kebab-case identifier from a description.
 */
function generateId(description: string): string {
    return description
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .trim()
        .replace(/\s+/g, '-')        // Replace spaces with hyphens
        .replace(/-+/g, '-')         // Replace multiple hyphens with a single one
        .substring(0, 50);           // Limit length
}
