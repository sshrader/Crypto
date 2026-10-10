// Builds the deployable site into ./dist (or the folder given as argv[2]).
// If the CA_KEY environment variable is set, it replaces the `ca:` value in the
// published config.js. If it is empty or unset, config.js is published unchanged.
// Run:  CA_KEY=<mint address> node scripts/build.js
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const out = path.resolve(process.argv[2] || path.join(root, 'dist'));
const SKIP = new Set(['.git', '.github', 'node_modules', 'tests', 'scripts', 'dist']);
const B58 = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

fs.rmSync(out, { recursive: true, force: true });
(function copy(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const name of fs.readdirSync(src)) {
    if (SKIP.has(name) || name.endsWith('.zip') || name === 'README.md') continue;
    const s = path.join(src, name), d = path.join(dst, name);
    fs.statSync(s).isDirectory() ? copy(s, d) : fs.copyFileSync(s, d);
  }
})(root, out);

const ca = (process.env.CA_KEY || '').trim();
if (ca) {
  if (!B58.test(ca)) { console.error('CA_KEY is not a valid Solana address (32-44 base58 characters): ' + JSON.stringify(ca)); process.exit(1); }
  const file = path.join(out, 'config.js'), src = fs.readFileSync(file, 'utf8');
  const re = /(\bca\s*:\s*)(['"])[^'"]*\2/;
  if (!re.test(src)) { console.error("Could not find the  ca: '...'  line in config.js"); process.exit(1); }
  fs.writeFileSync(file, src.replace(re, (_, k) => k + "'" + ca + "'"));
  console.log('Built ' + out + ' with CA from CA_KEY: ' + ca);
} else {
  console.log('Built ' + out + ' (CA_KEY not set, using ca from config.js)');
}
