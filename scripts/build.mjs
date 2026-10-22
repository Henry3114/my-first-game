import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = filename => readFile(path.join(root, filename), 'utf8');
const dataUrl = async filename => `data:image/svg+xml;base64,${Buffer.from(await read(filename)).toString('base64')}`;
const [template, css, engine, art, app, storefront, favicon] = await Promise.all([
  read('scripts/page.html'), read('styles.css'), read('game.js'), read('art.js'), read('app.js'),
  dataUrl('assets/storefront.svg'), dataUrl('assets/favicon.svg'),
]);

// Source modules stay readable and independently testable. The distributed page
// has no imports or network requirements, so it also works as an HTML attachment.
const stripExports = source => source.replace(/^export /gm, '');
const code = [stripExports(engine), stripExports(art), app.replace(/^import .*;\r?\n/gm, '')]
  .join('\n\n')
  .replaceAll('assets/storefront.svg', storefront)
  .replace(/<\/script/gi, '<\\/script');
const html = template
  .replace('href="assets/favicon.svg"', () => `href="${favicon}"`)
  .replace('<link rel="stylesheet" href="styles.css" />', () => `<style>\n${css}\n</style>`)
  .replace('<script type="module" src="app.js"></script>', () => `<script>\n(() => {\n${code}\n})();\n</script>`);
await writeFile(path.join(root, 'index.html'), html);
console.log(`Built standalone index.html (${Buffer.byteLength(html).toLocaleString()} bytes); no external assets required.`);
