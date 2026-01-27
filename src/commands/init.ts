import fs from 'fs';
import path from 'path';

export async function initCommand() {
    const rootDir = process.cwd();
    const praxisDir = path.join(rootDir, '.praxis');
    const intentsDir = path.join(praxisDir, 'intents');
    const specsDir = path.join(praxisDir, 'specs');

    const dirs = [praxisDir, intentsDir, specsDir];

    for (const dir of dirs) {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`Created directory: ${path.relative(rootDir, dir)}`);

            // Create a .gitkeep file to ensure the directory is tracked by git
            fs.writeFileSync(path.join(dir, '.gitkeep'), '');
        } else {
            console.log(`Directory already exists: ${path.relative(rootDir, dir)}`);
        }
    }

    console.log('\nPraxis project structure initialized successfully!');
    console.log('You can now start defining intents in .praxis/intents/');
}
