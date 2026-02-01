/**
 * Antigravity Command Adapter
 *
 * Formats commands for Antigravity following its frontmatter specification.
 */
import path from 'path';
/**
 * Antigravity adapter for command generation.
 * File path: .agent/workflows/praxis-<id>.md
 * Frontmatter: description
 */
export const antigravityAdapter = {
    toolId: 'antigravity',
    getFilePath(commandId) {
        return path.join('.agent', 'workflows', `praxis-${commandId}.md`);
    },
    formatFile(content) {
        return `---
description: ${content.description}
---

${content.body}
`;
    },
};
