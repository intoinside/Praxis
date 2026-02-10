import fs from 'fs';
import path from 'path';

/**
 * Constants for Praxis directories and files
 */
export const PRAXIS_DIR = '.praxis';
export const INTENTS_DIR = path.join(PRAXIS_DIR, 'intents');
export const SPECS_DIR = path.join(PRAXIS_DIR, 'specs');
export const TEMPLATES_DIR = path.join(PRAXIS_DIR, 'templates');
export const PRODUCT_TECH_INFO = 'product-tech-info.md';

/**
 * Metadata parsed from a markdown file
 */
export interface FileMetadata {
    status: string;
    created: string;
    [key: string]: string;
}

/**
 * Find an intent file by ID recursively.
 * @param intentId The ID of the intent (kebab-case)
 * @returns The absolute path to the intent.md file or null if not found
 */
export function findIntentFile(intentId: string): string | null {
    const rootDir = process.cwd();
    const baseIntentsDir = path.join(rootDir, INTENTS_DIR);

    if (!fs.existsSync(baseIntentsDir)) return null;

    return searchForFile(baseIntentsDir, intentId, 'intent.md');
}

/**
 * Find all specification files in the project.
 * @returns Array of absolute paths to spec.md files
 */
export function findAllSpecFiles(): string[] {
    const rootDir = process.cwd();
    const baseSpecsDir = path.join(rootDir, SPECS_DIR);

    if (!fs.existsSync(baseSpecsDir)) return [];

    return searchForAllFiles(baseSpecsDir, 'spec.md');
}

/**
 * Parse metadata from markdown content (looking for **Key**: Value).
 * @param content The markdown content
 * @returns Metadata object
 */
export function parseMetadata(content: string): FileMetadata {
    const metadata: FileMetadata = {
        status: 'Unknown',
        created: 'Unknown'
    };

    const lines = content.split('\n');
    for (const line of lines) {
        const match = line.match(/\*\*(.+?)\*\*:\s*(.+)/);
        if (match) {
            const key = match[1].trim().toLowerCase();
            const value = match[2].trim();
            metadata[key] = value;
        }
    }

    return metadata;
}

/**
 * Recursive search for a specific file in a directory structure
 */
function searchForFile(dir: string, targetId: string, fileName: string): string | null {
    try {
        const list = fs.readdirSync(dir);

        // Optimization: Check if direct match exists
        const directPath = path.join(dir, targetId, fileName);
        if (fs.existsSync(directPath)) {
            return directPath;
        }

        for (const file of list) {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);

            if (stat.isDirectory()) {
                if (file === targetId) {
                    const potential = path.join(filePath, fileName);
                    if (fs.existsSync(potential)) return potential;
                }
                const found = searchForFile(filePath, targetId, fileName);
                if (found) return found;
            }
        }
    } catch (e) {
        // Ignore errors
    }
    return null;
}

/**
 * Recursive search for all files with a given name
 */
function searchForAllFiles(dir: string, fileName: string): string[] {
    let results: string[] = [];
    try {
        const list = fs.readdirSync(dir);

        for (const file of list) {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);

            if (stat.isDirectory()) {
                // Skip base archive directory to match current logic
                if (path.basename(filePath) === 'archive' && path.dirname(filePath).endsWith(SPECS_DIR)) {
                    continue;
                }
                results = results.concat(searchForAllFiles(filePath, fileName));
            } else if (file === fileName) {
                results.push(filePath);
            }
        }
    } catch (e) {
        // Ignore errors
    }
    return results;
}
