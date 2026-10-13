// Builds the deployable site into ./dist (or the folder given as argv[2]).
// Environment variables CA_KEY and DEV_WALLET, when set, replace `ca:` and `devWallet:` in the published config.js.
// Unset or empty ones leave config.js unchanged.
// Run:  CA_KEY=<mint address> DEV_WALLET=<wallet> node scripts/build.js
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

// Settings that can come from the host's environment variables. Names are matched ignoring case and underscores
// (CA_KEY, CA_key, ca_key, CAKEY ... and DEV_WALLET, dev_wallet, DevWallet ...), because Linux build machines are case-sensitive.
const VARS = [
  { env: 'CA_KEY', key: 'ca', what: 'a Solana token address' },
  { env: 'DEV_WALLET', key: 'devWallet', what: 'a Solana wallet address' },
];
const norm = n => n.replace(/_/g, '').toUpperCase();
const cfgFile = path.join(out, 'config.js');
let cfgSrc = fs.readFileSync(cfgFile, 'utf8'), changed = false;
for (const v of VARS) {
  const name = Object.keys(process.env).find(k => norm(k) === norm(v.env) && String(process.env[k]).trim());
  const val = name ? String(process.env[name]).trim() : '';
  if (!val) { console.log(v.env + ': not set, using ' + v.key + ' from config.js'); continue; }
  if (!B58.test(val)) { console.error(v.env + ' is not ' + v.what + ' (32-44 base58 characters): ' + JSON.stringify(val)); process.exit(1); }
  const re = new RegExp("(\\b" + v.key + "\\s*:\\s*)(['\"])[^'\"]*\\2");
  if (!re.test(cfgSrc)) { console.error("Could not find the  " + v.key + ": '...'  line in config.js"); process.exit(1); }
  cfgSrc = cfgSrc.replace(re, (_, k) => k + "'" + val + "'"); changed = true;
  console.log(v.env + ': using ' + val + ' (from ' + name + ') for ' + v.key);
}
if (changed) fs.writeFileSync(cfgFile, cfgSrc);
console.log('Built ' + out);
