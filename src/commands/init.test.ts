import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import inquirer from 'inquirer';
import { initCommand } from './init.js';

vi.mock('fs');
vi.mock('inquirer');
vi.mock('../core/agent/config.js', () => ({
    saveConfig: vi.fn(),
    DEFAULT_CONFIG: {
        agent: {
            enabled: true,
            services: { mcp: true, taskPolling: true },
            tasks: {},
            pollIntervalMs: 3000
        }
    }
}));

describe('initCommand', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(fs.existsSync).mockReturnValue(false);
        vi.mocked(inquirer.prompt).mockResolvedValue({
            enableAgent: true,
            enableMcp: true,
            enablePolling: true
        });
    });

    it('should create all required directories and copy templates', async () => {
        vi.mocked(fs.existsSync).mockImplementation((p) => {
            if (p.toString().includes('templates') && !p.toString().includes('.praxis')) return true;
            return false;
        });
        vi.mocked(fs.readdirSync).mockImplementation((p) => {
            if (p.toString().includes('templates') && !p.toString().includes('.praxis')) {
                return ['product-tech-info-template.md', 'template1.md'] as any;
            }
            return [] as any;
        });
        vi.mocked(fs.statSync).mockReturnValue({ isFile: () => true } as any);
        vi.mocked(fs.readFileSync).mockReturnValue('Mocked template content with - **Project name**: placeholder' as any);

        await initCommand('TestProject');

        expect(fs.mkdirSync).toHaveBeenCalled();
        expect(fs.writeFileSync).toHaveBeenCalled();
        expect(fs.readFileSync).toHaveBeenCalled();
        // Check if product-tech-info.md was generated with the correct project name
        expect(fs.writeFileSync).toHaveBeenCalledWith(
            expect.stringContaining('product-tech-info.md'),
            expect.stringContaining('Project name**: TestProject')
        );
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('initialized successfully'));
    });

    it('should skip directory creation if they already exist', async () => {
        vi.mocked(fs.existsSync).mockReturnValue(true);
        vi.mocked(fs.readdirSync).mockReturnValue([]);

        await initCommand();

        expect(fs.mkdirSync).not.toHaveBeenCalled();
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Directory already exists'));
    });
});
