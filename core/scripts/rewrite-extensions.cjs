const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');

function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const ent of entries) {
        const full = path.join(dir, ent.name);
        if (ent.isDirectory()) {
            walk(full);
        } else if (ent.isFile() && full.endsWith('.js')) {
            rewriteFile(full);
        }
    }
}

function rewriteFile(file) {
    let src = fs.readFileSync(file, 'utf8');
    // Regex to match import/export specifiers like: from './foo' or from "../bar"
    // and append .js when there's no extension present.
    src = src.replace(/(from\s+['"])(\.\.?(?:\/[^'"\n]+?))(\s*['"])/g, (m, p1, p2, p3) => {
        // if already has an extension, leave it
        if (/\.[a-zA-Z0-9]+$/.test(p2)) return m;
        return `${p1}${p2}.js${p3}`;
    });
    // also handle export ... from './module'
    src = src.replace(/(export\s+[^\n]*from\s+['"])(\.\.?(?:\/[^'"\n]+?))(\s*['"])/g, (m, p1, p2, p3) => {
        if (/\.[a-zA-Z0-9]+$/.test(p2)) return m;
        return `${p1}${p2}.js${p3}`;
    });

    fs.writeFileSync(file, src, 'utf8');
}

if (!fs.existsSync(DIST)) {
    console.error('dist directory not found, skipping rewrite');
    process.exit(0);
}

walk(DIST);
console.log('Rewrote relative imports in dist to include .js extensions');
