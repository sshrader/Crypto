// Run:  node tests/run-tests.js
// Loads index.html + config.js into Node with a stubbed THREE/DOM and a fake fetch,
// then checks the live-data path, error states, URL-override rules, demo mode and
// the airdrop transaction parser. It cannot check how things LOOK or reach the real
// DexScreener / Solana RPC - open the page in a browser for that.
const fs = require('fs'), path = require('path'), assert = require('assert');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const configSrc = fs.readFileSync(path.join(root, 'config.js'), 'utf8');
const mainJs = html.split('<script>').pop().split('</script>')[0];

const MINT = 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263';
const DEV = '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU';

function mk() { const f = function () {}; return new Proxy(f, { get: (t, k) => k === Symbol.toPrimitive ? () => Math.random() - .5 : k === 'then' ? undefined : mk(), apply: () => mk(), construct: () => mk(), set: () => true }); }
const res = (body, ok = true) => ({ ok, status: ok ? 200 : 500, json: async () => body });

function boot({ cfg = {}, loc = { protocol: 'https:', hostname: 'example.com', search: '' }, hidden = false, fetchImpl, patch } = {}) {
  const win = {}; new Function('window', configSrc)(win);
  Object.assign(win.TRADER_CONFIG, { ca: MINT }, cfg);
  const fetched = [], spoken = [];
  const doc = { createElement: () => mk(), getElementById: () => mk(), body: { insertAdjacentHTML() {} }, hidden, title: '' };
  const g = { THREE: new Proxy({}, { get: () => mk() }), window: win, document: doc, location: loc,
    fetch: async (u, o) => { fetched.push(String(u)); if (!fetchImpl) throw new Error('offline'); return fetchImpl(String(u), o); },
    navigator: { clipboard: { writeText: async () => {} } }, getSelection: () => mk(),
    Audio: class { play() { return Promise.resolve(); } }, SpeechSynthesisUtterance: class { constructor(x) { this.text = x; } }, speechSynthesis: { cancel() {}, speak(u) { spoken.push(u.text); } },
    requestAnimationFrame: () => 0, performance: { now: () => 0 }, innerWidth: 800, innerHeight: 600, devicePixelRatio: 1,
    addEventListener() {}, setInterval: () => 0, setTimeout: () => 0, console: { log() {}, warn() {}, error() {} } };
  let js = mainJs; if (patch) js = patch(js);
  const names = Object.keys(g);
  const exp = `;return {PROPS,get aura(){return aura},setRoom(v){roomForce=v},setSound(v){soundOn=v},say,sfx,startDespair,get DS(){return DS},get PP(){return PP},get FT(){return FT},frame,poll,pollDev,parseAirdrop,hud,fmtMC,mc,queue,MILES,
    get live(){return live},get price(){return price},get statusMsg(){return statusMsg},get mode(){return mode},get stats(){return stats},
    get COIN(){return COIN},get DEMO(){return DEMO},get FAKE(){return FAKE},get CA(){return CA},get mcOK(){return mcOK},get mcScale(){return mcScale},
    get act(){return act},get hasData(){return hasData()},get target(){return target}}`;
  const o = new Function(...names, js + exp)(...names.map(n => g[n]));
  let now = 0;
  o.run = (n, each) => { for (let i = 0; i < n; i++) { now += 33; o.frame(now); if (each) each(i); } };
  o.fetched = fetched; o.spoken = spoken; o.doc = doc;
  return o;
}

const pair = (o = {}) => Object.assign({ chainId: 'solana', dexId: 'raydium', url: 'https://dexscreener.com/solana/PAIR1',
  baseToken: { address: MINT, name: 'Test Coin', symbol: 'TST' }, priceUsd: '0.00001200', marketCap: 12000, fdv: 12000,
  liquidity: { usd: 9000 }, priceChange: { m5: 1.5, h1: 4, h6: 9, h24: 12.34 }, volume: { h24: 50000, h1: 4000 }, txns: { m5: { buys: 5, sells: 3 }, h24: { buys: 400, sells: 380 } },
  info: { imageUrl: 'https://cdn.example/logo.png', socials: [{ type: 'twitter', url: 'https://x.com/testcoin' }] } }, o);

let passed = 0; const t = async (name, fn) => { try { await fn(); passed++; console.log('  ok  ' + name); } catch (e) { console.log('FAIL  ' + name + '\n      ' + (e.stack || e).split('\n').slice(0, 4).join('\n      ')); process.exitCode = 1; } };

(async () => {
  console.log('static / config');
  await t('config.js is valid and the default CA looks like a Solana address', () => {
    const w = {}; new Function('window', configSrc)(w); const c = w.TRADER_CONFIG;
    assert(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(c.ca), 'default ca invalid');
    assert.strictEqual(c.demo, false); assert.strictEqual(c.fakeFeeds, false); assert.strictEqual(c.allowUrlOverrides, false);
    const caps = c.milestones.map(m => m.mc); assert.deepStrictEqual(caps, [...caps].sort((a, b) => a - b), 'milestones not ascending');
    const ok = new Set(['chug', 'scream', 'dance', 'letsgo', 'lockin', 'party']); c.milestones.forEach(m => assert(ok.has(m.act), 'bad act ' + m.act));
  });
  await t('index.html references files that exist; nothing embedded or leftover', () => {
    assert(html.includes('src="config.js"')); assert(fs.existsSync(path.join(root, 'assets/nice.mp3')));
    assert(!html.includes('data:audio'), 'embedded audio left in page'); assert(!/BONKCHAD|YOUR COIN NAME/.test(html));
  });

  await t('room: neon sign default, custom sign text, flicker loop runs', async () => {
    assert(mainJs.includes("||'Trench Trader'"), 'default sign text missing');
    const o = boot({ cfg: { demo: true, signText: 'Custom Sign Text' } });
    o.run(1500);                                  // flicker timer fires several times in this span
    assert(o.hasData);
    const w = {}; new Function('window', configSrc)(w); assert.strictEqual(w.TRADER_CONFIG.signText, 'Trench Trader');
  });

  console.log('live data');
  const live1 = () => res({ pairs: [
    pair({ chainId: 'ethereum', priceUsd: '9', liquidity: { usd: 9e9 } }),                         // wrong chain decoy
    pair({ baseToken: { address: 'Other1111111111111111111111111111111111111', name: 'X', symbol: 'X' }, priceUsd: '5', liquidity: { usd: 9e9 } }), // wrong base token decoy
    pair({ priceUsd: '0.0000050', liquidity: { usd: 100 }, marketCap: 5000 }),                      // valid but thin
    pair() ] });                                                                                     // valid, deepest liquidity
  await t('picks the deepest valid Solana pair, fills name/logo/X, uses real market cap', async () => {
    const o = boot({ fetchImpl: () => live1() });
    assert(!o.hasData && o.fmtMC(o.mc()) === '—', 'should show — before data');
    await o.poll();
    assert(o.live && o.hasData && o.statusMsg === '');
    assert.strictEqual(o.target, 0.000012); assert.strictEqual(o.price, 0.000012);
    assert.strictEqual(Math.round(o.mc()), 12000); assert.strictEqual(o.fmtMC(o.mc()), '$12.0K');
    assert.strictEqual(o.COIN.name, 'Test Coin'); assert.strictEqual(o.COIN.symbol, '$TST'); assert.strictEqual(o.COIN.twitter, '@testcoin');
    assert.strictEqual(o.COIN.logo, 'assets/logo.png', 'DexScreener logo must NOT override the configured logo');
    assert.deepStrictEqual(o.MILES.map(m => m.done), o.MILES.map(m => m.mc <= 12000), 'already-passed milestones must not replay');
    assert.strictEqual(o.queue.length, 0); o.run(300);
  });
  await t('logo: config file wins; DexScreener logo only if opted in', async () => {
    const a = boot({ cfg: { logo: '' }, fetchImpl: () => live1() }); await a.poll();
    assert.strictEqual(a.COIN.logo, '', 'DexScreener logo used without opt-in');
    const b = boot({ cfg: { logo: '', logoFromDexScreener: true }, fetchImpl: () => live1() }); await b.poll();
    assert(b.COIN.logo.startsWith('https://cdn.example/'), 'opt-in should use DexScreener logo');
    const c = boot({ cfg: { logo: 'assets/mine.webp', logoFromDexScreener: true }, fetchImpl: () => live1() }); await c.poll();
    assert.strictEqual(c.COIN.logo, 'assets/mine.webp', 'configured logo must beat DexScreener even when opted in');
  });
  await t('no random price movement without data or demo; real moves drive milestones', async () => {
    const seen = new Set(); const o = boot({ fetchImpl: () => live1() });
    o.run(120); assert.strictEqual(o.price, 0.042, 'price must not move before data');
    await o.poll();
    const p0 = o.price; o.run(60); assert(Math.abs(o.price - p0) < 1e-12, 'live price drifted with no new data');
    const bigger = () => res({ pairs: [pair({ priceUsd: '0.0000250', marketCap: 25000, priceChange: { m5: 40, h1: 40, h6: 40, h24: 55 } })] });
    o.__f = bigger; // new payload for the next poll
    const o2 = boot({ fetchImpl: (() => { let n = 0; return () => (n++ === 0 ? live1() : bigger()); })() });
    await o2.poll(); await o2.poll();
    o2.run(2500, () => { if (o2.act) seen.add(o2.act.name); });
    assert(seen.has('dance') && seen.has('letsgo'), 'expected 15K + 20K milestone acts, saw ' + [...seen]);
    assert.strictEqual(o2.fmtMC(o2.mc()), '$25.0K');
  });
  await t('endpoint fallback: first URL fails, second works', async () => {
    const o = boot({ fetchImpl: u => u.includes('token-pairs') ? res({}, false) : res({ pairs: [pair()] }) });
    for (let i = 0; i < 20; i++) await new Promise(r => setImmediate(r));   // let the page's own startup poll finish
    assert(o.live, 'should be live after fallback');
    assert(o.fetched[0].includes('token-pairs') && o.fetched[1].includes('latest/dex/tokens'), 'wrong order: ' + o.fetched.join(' | '));
    o.fetched.length = 0; await o.poll();
    assert.strictEqual(o.fetched.length, 1); assert(o.fetched[0].includes('latest/dex/tokens'), 'should remember the working endpoint');
  });
  await t('accepts the array response format', async () => {
    const o = boot({ fetchImpl: () => res([pair()]) }); await o.poll(); assert(o.live && Math.round(o.mc()) === 12000);
  });
  await t('no marketCap/fdv: shows USD price, never fires milestones', async () => {
    const o = boot({ fetchImpl: () => res({ pairs: [pair({ marketCap: undefined, fdv: undefined })] }) }); await o.poll();
    assert(o.live && !o.mcOK); assert(o.fmtMC(o.mc()).startsWith('$0.0000'), o.fmtMC(o.mc())); o.run(200); assert.strictEqual(o.queue.length, 0);
  });

  console.log('error states');
  await t('no trading pair', async () => {
    const o = boot({ fetchImpl: () => res({ pairs: [] }) }); await o.poll();
    assert(!o.live && /no trading pair/.test(o.statusMsg) && o.fmtMC(o.mc()) === '—'); o.run(120);
  });
  await t('network failure', async () => { const o = boot({}); await o.poll(); assert(!o.live && /feed error/.test(o.statusMsg)); o.run(60); });
  await t('invalid CA: no request is made', async () => {
    const o = boot({ cfg: { ca: 'abc' }, fetchImpl: () => res({ pairs: [pair()] }) }); await o.poll();
    assert.strictEqual(o.fetched.length, 0); assert(/invalid contract address/.test(o.statusMsg)); o.run(60);
  });
  await t('hidden tab: no request', async () => { const o = boot({ hidden: true, fetchImpl: () => res({ pairs: [pair()] }) }); await o.poll(); assert.strictEqual(o.fetched.length, 0); });
  await t('live feed keeps last price when a later poll fails', async () => {
    let bad = false; const o = boot({ fetchImpl: () => bad ? Promise.reject(new Error('x')) : live1() });
    await o.poll(); bad = true; await o.poll(); await o.poll(); await o.poll(); assert(o.live && /reconnecting/.test(o.statusMsg)); assert.strictEqual(o.target, 0.000012);
  });

  console.log('URL override rules');
  const OTHER = 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm';
  await t('public site ignores ?ca= and ?demo=1', () => {
    const o = boot({ loc: { protocol: 'https:', hostname: 'mysite.com', search: `?ca=${OTHER}&demo=1&fake=1` } });
    assert.strictEqual(o.CA, MINT); assert(!o.DEMO && !o.FAKE);
  });
  await t('localhost and file:// honor overrides', () => {
    assert.strictEqual(boot({ loc: { protocol: 'http:', hostname: 'localhost', search: `?ca=${OTHER}` } }).CA, OTHER);
    const f = boot({ loc: { protocol: 'file:', hostname: '', search: '?demo=1' } }); assert(f.DEMO && f.FAKE);
  });
  await t('allowUrlOverrides:true enables them on a public host', () => {
    assert.strictEqual(boot({ cfg: { allowUrlOverrides: true }, loc: { protocol: 'https:', hostname: 'mysite.com', search: `?ca=${OTHER}` } }).CA, OTHER);
  });

  console.log('demo mode');
  await t('demo simulates price, runs every milestone + airdrop act and rage/party', async () => {
    const o = boot({ cfg: { demo: true }, patch: js => {
      const a = "if(mode===3){}else if(mode===0){if(sc<-.75)mode=1;else if(sc>.9)mode=2}\n else if(mode===1&&sc>-.35)mode=0;else if(mode===2&&sc<.45)mode=0;";
      assert(js.includes(a), 'transition patch target missing');
      return js.replace(a, "if(mode===3){}else if(mode===0&&Math.random()<.004)mode=1+(Math.random()<.5|0);else if(mode!==0&&Math.random()<.01)mode=0;").replace('drinkWait=8', 'drinkWait=1'); } });
    assert(o.DEMO && o.FAKE && o.hasData); const p0 = o.price; o.run(200); assert(o.price !== p0, 'demo price should move');
    o.MILES.forEach(m => o.queue.push(Object.assign({}, m)));
    o.queue.push({ act: 'distribute', label: 'x', info: { sig: 'abc', total: 5000, to: [{ w: 'A'.repeat(44), a: 4990 }, { w: 'B'.repeat(44), a: 10 }] } });
    const seen = new Set(), modes = new Set(); o.run(20000, () => { if (o.act) seen.add(o.act.name); modes.add(o.mode); });
    ['chug', 'scream', 'dance', 'letsgo', 'lockin', 'party', 'distribute'].forEach(a => assert(seen.has(a), 'act never ran: ' + a));
    assert(modes.has(1) && modes.has(2), 'rage/party never ran');
  });


  console.log('meltdown (stand up, cry on the bed / pace, walk back)');
  const meltRun = async (kind) => {
    const o = boot({ cfg: { demo: true, despairMaxSeconds: 12 } });
    o.run(10); assert.strictEqual(o.mode, 0);
    o.startDespair(kind); assert.strictEqual(o.mode, 4);
    const steps = [], fin = v => [v.x, v.y, v.z, v.rx, v.ry, v.rz].every(Number.isFinite);
    let cryPose = null, frames = 0;
    while (o.mode === 4 && frames < 6000) { o.run(1); frames++;
      const s = o.DS && o.DS.plan[o.DS.i][0]; if (s && steps[steps.length - 1] !== s) steps.push(s);
      assert(fin(o.PP), 'pose went NaN in step ' + s); assert(o.FT.every(f => [f.x, f.y, f.z].every(Number.isFinite)), 'foot NaN');
      if (s === 'cry' && o.DS.st > 1) cryPose = Object.assign({}, o.PP); }
    assert.strictEqual(o.mode, 0, 'never returned to his chair'); assert.strictEqual(o.DS, null);
    assert(Math.abs(o.PP.x) < 1e-6 && Math.abs(o.PP.y - .55) < 1e-6 && Math.abs(o.PP.z - 1.2) < 1e-6, 'did not end seated at the desk');
    return { steps, cryPose };
  };
  await t('bed meltdown: stands, walks to the bed, lies down crying, gets up, sits back down', async () => {
    const r = await meltRun('bed');
    assert.deepStrictEqual(r.steps, ['stand', 'walk', 'turn', 'sit', 'lie', 'cry', 'rise', 'unsit', 'walk', 'turn', 'seat']);
    assert(Math.abs(r.cryPose.x - 4) < .01 && r.cryPose.y > .9 && r.cryPose.y < 1, 'not lying on the bed: ' + JSON.stringify(r.cryPose));
    assert(Math.abs(r.cryPose.rx - Math.PI / 2) < .01, 'not on his back');
  });
  await t('pacing meltdown: stands, paces, walks back and sits', async () => {
    const r = await meltRun('pace');
    assert.deepStrictEqual(r.steps, ['stand', 'walk', 'pace', 'walk', 'turn', 'seat']);
  });
  await t('a sustained dump (rage for a few seconds) triggers the meltdown; cooldown stops an immediate repeat', async () => {
    const o = boot({ cfg: { demo: true, despairMaxSeconds: 12, despairAfterSeconds: 3 }, patch: js => {
      const a = 'sc=(rawRate()-5)/8,pm=mode;'; assert(js.includes(a), 'sc patch target missing'); return js.replace(a, 'sc=-2,pm=mode;'); } });
    let first = -1, back = -1, again = -1, f = 0;
    o.run(1); for (; f < 4000; f++) { o.run(1);
      if (o.mode === 4 && first < 0) first = f;
      if (first >= 0 && o.mode !== 4 && back < 0) back = f;
      if (back >= 0 && o.mode === 4 && again < 0) again = f; }
    assert(first > 0 && first * .033 >= 2.5, 'meltdown should start only after ~3s of rage, started at frame ' + first);
    assert(back > first, 'never came back'); assert(again < 0 || (again - back) * .033 >= 24, 'cooldown not honoured');
  });
  await t('despair:false turns the meltdown off', async () => {
    const o = boot({ cfg: { demo: true, despair: false, despairAfterSeconds: 1 }, patch: js => js.replace('sc=(rawRate()-5)/8,pm=mode;', 'sc=-2,pm=mode;') });
    let m4 = false; o.run(900, () => { if (o.mode === 4) m4 = true; }); assert(!m4);
  });


  console.log('build script (CA_KEY)');
  await t('scripts/build.js injects CA_KEY, falls back to config.js, rejects bad values, keeps dev files out', async () => {
    const cp = require('child_process'), os = require('os'), tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'build-'));
    const run = (env, dir) => cp.spawnSync('node', [path.join(root, 'scripts', 'build.js'), path.join(tmp, dir)], { env: Object.assign({}, process.env, { CA_KEY: '', DEV_WALLET: '' }, env), encoding: 'utf8' });
    const a = run({ CA_KEY: MINT }, 'a'); assert.strictEqual(a.status, 0, a.stderr);
    const cfgA = fs.readFileSync(path.join(tmp, 'a', 'config.js'), 'utf8'); assert(cfgA.includes("ca: '" + MINT + "'"), 'CA_KEY not injected');
    const w = {}; new Function('window', cfgA)(w); assert.strictEqual(w.TRADER_CONFIG.ca, MINT); assert(Array.isArray(w.TRADER_CONFIG.milestones), 'rest of config lost');
    ['index.html', 'config.js', '.nojekyll'].forEach(f => assert(fs.existsSync(path.join(tmp, 'a', f)), 'missing ' + f));
    ['tests', 'scripts', '.github', 'README.md'].forEach(f => assert(!fs.existsSync(path.join(tmp, 'a', f)), 'should not publish ' + f));
    const b = run({}, 'b'); assert.strictEqual(b.status, 0); assert.strictEqual(fs.readFileSync(path.join(tmp, 'b', 'config.js'), 'utf8'), configSrc, 'unset CA_KEY must leave config.js unchanged');
    const lc = run({ CA_key: MINT }, 'lc'); assert.strictEqual(lc.status, 0, lc.stderr); assert(fs.readFileSync(path.join(tmp, 'lc', 'config.js'), 'utf8').includes("ca: '" + MINT + "'"), 'CA_key (different capitalisation) not picked up');
    const dw = run({ dev_wallet: DEV }, 'dw'); assert.strictEqual(dw.status, 0, dw.stderr);
    const cfgD = fs.readFileSync(path.join(tmp, 'dw', 'config.js'), 'utf8'); assert(cfgD.includes("devWallet: '" + DEV + "'"), 'DEV_WALLET not injected');
    assert(cfgD.includes("ca: '") && !cfgD.includes("ca: '" + MINT + "'"), 'ca must be untouched when only DEV_WALLET is set');
    const both = run({ CA_KEY: MINT, DEV_WALLET: DEV }, 'both'); const w2 = {}; new Function('window', fs.readFileSync(path.join(tmp, 'both', 'config.js'), 'utf8'))(w2);
    assert.strictEqual(w2.TRADER_CONFIG.ca, MINT); assert.strictEqual(w2.TRADER_CONFIG.devWallet, DEV);
    assert.notStrictEqual(run({ DEV_WALLET: 'nope!' }, 'dbad').status, 0, 'invalid DEV_WALLET must fail the build');
    assert.notStrictEqual(run({ CA_KEY: 'not a real address!' }, 'c').status, 0, 'invalid CA_KEY must fail the build');
    fs.rmSync(tmp, { recursive: true, force: true });
  });


  console.log('room upgrades, aura, voice');
  const calm = js => js.replace('sc=(rawRate()-5)/8,pm=mode;', 'sc=0,pm=mode;');
  const onNames = o => o.PROPS.filter(p => p.on).map(p => p.name);
  await t('room upgrades appear as market cap rises, leave on a dump (with hysteresis), and animate in/out', async () => {
    const o = boot({ cfg: { demo: true }, patch: calm });
    o.setRoom(0); o.run(90);
    assert.deepStrictEqual(onNames(o), ['ramen & pizza box']);
    o.setRoom(120000); o.run(120);
    const on = onNames(o); ['trophy shelf', 'gold chain', 'car poster', 'sunglasses', 'more trophies'].forEach(n => assert(on.includes(n), 'missing ' + n));
    assert(!on.includes('ramen & pizza box') && !on.includes('gold bars') && !on.includes('crown'));
    o.PROPS.forEach(p => assert(p.on ? p.s > .95 : p.s < .05, p.name + ' scale ' + p.s));
    o.setRoom(90000); o.run(30); assert(onNames(o).includes('more trophies'), 'should not drop out until 15% below its level');
    o.setRoom(80000); o.run(30); assert(!onNames(o).includes('more trophies') && onNames(o).includes('gold chain'));
    o.setRoom(2e6); o.run(60); ['gold bars', 'disco ball', 'crown', 'gold chair trim'].forEach(n => assert(onNames(o).includes(n), 'missing ' + n)); assert(!onNames(o).includes('golden rug ring'));
    o.setRoom(6e6); o.run(60); assert(onNames(o).includes('golden rug ring'));
    o.setRoom(0); o.run(120); assert.deepStrictEqual(onNames(o), ['ramen & pizza box'], 'full downgrade');
  });
  await t('room upgrades can be switched off (roomUpgrades:false)', async () => {
    const o = boot({ cfg: { demo: true, roomUpgrades: false } }); assert.strictEqual(o.PROPS.length, 0); o.run(30);
  });
  await t('aura: rises with momentum, falls on dumps, +150 per room upgrade, +500 per milestone', async () => {
    const up = boot({ cfg: { demo: true }, patch: js => js.replace('sc=(rawRate()-5)/8,pm=mode;', 'sc=2,pm=mode;') }); up.run(300);
    assert(up.aura > 250 && up.aura < 700, 'aura after ~10s of pumping: ' + up.aura);
    const dn = boot({ cfg: { demo: true }, patch: js => js.replace('sc=(rawRate()-5)/8,pm=mode;', 'sc=-.5,pm=mode;') }); dn.run(300); assert(dn.aura < 0, 'aura after dumping: ' + dn.aura);
    const o = boot({ cfg: { demo: true }, patch: calm }); o.setRoom(0); o.run(30); assert.strictEqual(o.aura, 0);
    o.setRoom(30000); o.run(30); assert.strictEqual(Math.round(o.aura), 150, 'one upgrade (trophy shelf)');
    o.setRoom(300000); o.run(30); assert.strictEqual(Math.round(o.aura), 150 + 5 * 150, '5 more upgrades');
    o.queue.push({ act: 'dance', mc: 15000, label: ['x'] }); o.run(20); assert(o.aura >= 150 + 750 + 500 - 1, 'milestone +500: ' + o.aura);
  });
  await t('voice: speaks only when Sound is on, strips emoji, throttles chatter, priority lines cut in', async () => {
    const o = boot({ cfg: { demo: true } });
    o.say('Hello'); assert.strictEqual(o.spoken.length, 0, 'must stay silent while Sound is off');
    o.setSound(true); o.say('LET HIM COOK 🔥🔥', true); assert.deepStrictEqual(o.spoken, ['LET HIM COOK']);
    o.say('chatter'); assert.strictEqual(o.spoken.length, 1, 'non-priority line within 7s must be dropped');
    o.say('Milestone!', true); assert.strictEqual(o.spoken.length, 2);
    const off = boot({ cfg: { demo: true, voice: false } }); off.setSound(true); off.say('x', true); assert.strictEqual(off.spoken.length, 0, 'voice:false');
  });
  await t('sound effects never throw (including with no audio support)', async () => {
    const o = boot({ cfg: { demo: true } }); o.setSound(true); ['punch', 'thud', 'crush', 'levelup', 'sad', 'ching', 'aura', 'nope'].forEach(n => o.sfx(n));
  });

  console.log('airdrop parser');
  const o = boot({ cfg: { devWallet: DEV } });
  const tb = (owner, amt, i) => ({ accountIndex: i, mint: MINT, owner, uiTokenAmount: { amount: String(amt), decimals: 6 } });
  const tx = (pre, post, err = null) => ({ meta: { err, preTokenBalances: pre, postTokenBalances: post } });
  await t('detects dev -> holders transfer, totals and ignores unchanged accounts', () => {
    const a = o.parseAirdrop(tx([tb(DEV, 1000e6, 1), tb('R1', 0, 2), tb('R2', 5e6, 3), tb('POOL', 9e6, 4)], [tb(DEV, 400e6, 1), tb('R1', 300e6, 2), tb('R2', 305e6, 3), tb('POOL', 9e6, 4)]), 'sig1');
    assert.strictEqual(a.total, 600); assert.deepStrictEqual(a.to.map(x => x.w).sort(), ['R1', 'R2']);
  });
  await t('ignores transfers not from the dev wallet, failed txs and other mints', () => {
    assert.strictEqual(o.parseAirdrop(tx([tb('X', 5e6, 1)], [tb('X', 1e6, 1), tb('Y', 4e6, 2)]), 's'), null);
    assert.strictEqual(o.parseAirdrop(tx([tb(DEV, 5e6, 1)], [tb(DEV, 1e6, 1), tb('Y', 4e6, 2)], { InstructionError: 1 }), 's'), null);
    const other = b => Object.assign({}, b, { mint: 'OtherMint' });
    assert.strictEqual(o.parseAirdrop(tx([other(tb(DEV, 5e6, 1))], [other(tb(DEV, 1e6, 1)), other(tb('Y', 4e6, 2))]), 's'), null);
  });

  console.log(`\n${passed} checks passed${process.exitCode ? ' — SOME FAILED' : ''}`);
})();
