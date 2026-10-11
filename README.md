# Meme Day Trader — live deploy package

A 3D meme-coin day trader that reacts to a **real Solana coin's market cap**: his typing speeds up or slows down
with price momentum, he rages on dumps, celebrates on pumps, performs actions at market-cap milestones, and (optionally)
hits a DISTRIBUTE button when your dev wallet airdrops tokens.

Plain static files — no build step, no server code. Works on any static host.

```
meme-trader-live/
  index.html        the whole app (Three.js scene + logic)
  config.js         <-- the file you edit: coin address, dev wallet, milestones, switches
  assets/nice.mp3   the "nice" sound
  assets/logo.png   <-- YOUR logo: add this file (not included)
  vendor/           optional: drop three.min.js here to self-host (see vendor/README.txt)
  tests/run-tests.js  node tests/run-tests.js
  .nojekyll         keeps GitHub Pages from reprocessing the files
```

## 1. Try it locally

```bash
cd meme-trader-live
python3 -m http.server 8000        # or:  npx serve .
# open http://localhost:8000
```

Look at the small label next to **MARKET CAP** in the top-left card:

| Label | Meaning |
|---|---|
| `· LIVE` | Real data is flowing. |
| `· connecting…` | Waiting for the first response. |
| `· no trading pair found for this CA` | DexScreener has no Solana pair for that address (wrong address, not on Solana, or too new to be indexed). |
| `· feed error — retrying` | The request failed (offline, blocked by a network/ad-blocker, or DexScreener down). |
| `· invalid contract address in config.js` | `ca` isn't a valid base58 address. |
| `· DEMO (simulated)` | Demo mode is on — the price is fake. |

## 2. Change the coin (the variable)

Open `config.js` and edit one line:

```js
ca: 'CAmp5hUNFvU5UH8BEFzVAsEAfoLi2HxGeoEJriZc7BZ6',
```

To test with any other coin, put its address there — e.g. BONK `DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263`
(confirm any address on dexscreener.com first). While testing on **localhost** (or by opening the file directly) you can also
skip editing the file and use the URL: `http://localhost:8000/?ca=<address>`.

Name, ticker and X link are filled in automatically from the coin's DexScreener listing. Set `name`, `symbol`,
`twitter`, `twitterUrl` in `config.js` only if you want to override them.

**Logo:** the page uses your own file, not DexScreener's. Save your logo as `assets/logo.png` (square works best; it
is shown in a circle and also becomes the browser-tab icon). For a different file name or type (jpg, webp, svg), change `logo:` in
`config.js` to match, e.g. `'assets/mylogo.webp'`. Until the file exists the page shows a letter circle.
Set `logoFromDexScreener: true` only if you ever want DexScreener's logo as a fallback.

## 3. What is real and what is decoration

**Real (from DexScreener, refreshed every `pollSeconds`):** price, market cap (FDV if market cap isn't listed), 24h change,
the left monitor's stats (5m/1h/6h/24h change, volume, buys/sells, liquidity), name/ticker/X link, and everything the trader
does — typing speed, mood, rage, celebration, milestones, the candle chart.

**Not market data:** the character and room, the calendar, the cans, the joke text on the chart ("LEVERAGE 100x…").

**Chart:** DexScreener's free API gives no candle history, so the chart is built from the page's own price samples
(one candle per `candleSeconds`, default 10 s). It starts empty on each page load and fills in from the right.

**Fake feeds are OFF by default.** The made-up trades list, whale alerts and tweets from the earlier previews only appear if you set
`fakeFeeds: true` (or `demo: true`), and they are labelled "SIMULATED FEED". Don't enable them on a real launch — invented
whale buys on a real coin's page are misleading.

Milestones trigger when the real market cap **crosses a level going up**. Levels already passed when the page loads do not replay;
a level re-arms if the cap falls more than 10 % below it.

## 4. Deploy

Any of these is free and gives HTTPS (needed for the double-click-to-copy contract address):

- **Netlify Drop** — app.netlify.com/drop, drag the whole `meme-trader-live` folder in. Live in seconds.
- **Cloudflare Pages** — Workers & Pages → Create → Pages → Upload assets → drop the folder.
- **GitHub Pages** — push the folder to a repo, Settings → Pages → deploy from the branch root.
- **Vercel** — drag the folder into vercel.com/new, or import the repo (framework preset: "Other").

Custom domain: add it in the host's Domains settings and create the DNS records it shows.

**Setting the coin from the host (`CA_KEY`)**

A static page can't read host environment variables at runtime, so the address is written into `config.js` during the build
(`scripts/build.js`). `vercel.json` already sets the build command and output folder.
- **Vercel (this repo):** Project → Settings → Environment Variables → add `CA_KEY` = the mint address (Production, and Preview if you want).
  Then redeploy: Vercel only applies a changed variable to a *new* deployment (Deployments → ⋯ → Redeploy).
- **Netlify / Cloudflare Pages:** add the same `CA_KEY` variable, build command `node scripts/build.js dist`, publish directory `dist`.
- **GitHub Pages:** not used here (it has no environment variables unless you build with GitHub Actions).
- If `CA_KEY` is empty or unset, the `ca:` in `config.js` is used. An invalid value fails the build instead of publishing a broken site.
- Local test: `CA_KEY=<address> node scripts/build.js` writes the site to `dist/`.

**Before you share the link publicly**
1. `allowUrlOverrides: false` (the default). If it's `true`, anyone can craft `yoursite.com/?ca=SOMETHING_ELSE` and your page will
   display — and offer to copy — *that* address. That is a phishing risk on a real domain.
2. `demo: false` and `fakeFeeds: false`.
3. Check the page says `· LIVE` on the deployed URL, not just locally.
4. Try it on a phone — the 3D scene is heavy for older devices.
5. Anything in `config.js` is public. If you use a Helius/QuickNode key in `rpc`, restrict it to your domain in their dashboard.
6. Never put a private key or seed phrase anywhere in these files. The page only *reads* the chain.

## 5. Airdrop watcher (optional)

Set `devWallet` in `config.js`. The page checks that wallet every `devPollSeconds` for new transactions that move your coin
out of it, then the trader slams DISTRIBUTE, coins rain, and a banner shows the total, the receiving wallet (with "+N more"),
and a Solscan link. Wallets already in history when the page loads are ignored.

- Put your liquidity pool and any exchange wallets in `ignoreWallets`, otherwise a dev **sell** into the pool can be announced as an airdrop.
- Use a dedicated RPC URL in `rpc`; the public endpoint rate-limits.
- Sending airdrops is **not** done by this page (it would have to hold a private key). Use a separate server-side bot; the page just reacts.

## 6. Settings reference (all in `config.js`, each commented there)

`ca` · `name` `symbol` `twitter` `twitterUrl` `logo` `logoFromDexScreener` · `pollSeconds` `candleSeconds` `sensitivity` ·
`devWallet` `rpc` `devPollSeconds` `ignoreWallets` · `allowUrlOverrides` `demo` `fakeFeeds` · `signText` · `roomUpgrades` `aura` `voice` `voiceName` `sfx` · `despair` `despairAfterSeconds` `despairMaxSeconds` · `niceSound` · `milestones`

**Room upgrades:** the bedroom fills up as the real market cap climbs: trophy shelf (25K), gold chain (50K), car poster, sunglasses and a second
shelf (100K), gold bars (250K), disco ball (500K), crown and gold chair trim (1M), gold rug ring (5M). Cup noodles and a pizza box sit on the
desk while it is below 50K. If the cap falls 15% below a level, that item goes away again. Needs a coin that has a market cap on DexScreener.
In demo mode the **🏠 Room ⬆ / ⬇** buttons step through the tiers. `roomUpgrades: false` turns it off.

**Aura:** a vibes score under "Trader mood". It drifts up on pumps and down on dumps, jumps on milestones (+500), room upgrades (+150), airdrops
and celebrations, and drops on rage (-120) and meltdowns (-400). It is not market data. `aura: false` hides it.

**Voice and sound:** click **Sound** once (browsers require it). Then he talks (browser speech synthesis; which voice you hear depends on the visitor's
device) and you get synthesized punch, can-crush, level-up, sad-trombone and cash sounds, plus the "nice" clip. `voice`, `voiceName` and `sfx` in `config.js`.

**Meltdown:** if the coin keeps dumping, he rages at the desk first; after `despairAfterSeconds` (default 5) of that he stands up and
either lies on the bed crying (tears, hands over his eyes, pounding the mattress) or paces the room clutching his head, then walks
back and sits down once the price steadies (or after `despairMaxSeconds`). The camera drifts to follow him. Set `despair: false` to
keep him in the chair. In demo mode the **😭 Meltdown** button triggers it (alternating bed / pacing).

`signText` is the words on the neon sign on the back wall of the trader's blacklit bedroom (default "The Trader"). The room is
cut-away: walls and ceiling disappear when you orbit around to the outside, so you can always see in.

`sensitivity`: 1 = default, higher = twitchier (rages/celebrates on smaller moves), lower = calmer.
Meme coins move fast, so if he is raging or celebrating constantly, try `0.5`.

**Demo mode** (`demo: true`, or `?demo=1` on localhost) restores the simulated price and the test buttons (Pump, Dump, Next
milestone, Sim airdrop) so you can preview every animation. It is for testing only.

## 7. Troubleshooting

- **Blank page / "Could not load three.js":** the CDNs are blocked. Save three.js r128 as `vendor/three.min.js` (see `vendor/README.txt`).
- **Stuck on "no trading pair found":** check the address on dexscreener.com. The page only reads Solana pairs where your token is the base token.
- **"feed error" only on the hosted site:** open the browser console (F12) and look at the failed request; ad-blockers and some corporate networks block api.dexscreener.com.
- **Label says "PRICE (USD)" instead of "MARKET CAP":** DexScreener lists no market cap/FDV for that coin, so milestones are disabled.
- **Logo shows a letter instead of my picture:** the file isn't at the path in `config.js` (default `assets/logo.png`). Check the name and
  capitalization exactly — GitHub Pages and most hosts are case-sensitive (`Logo.PNG` is not `logo.png`).
- **No sound:** browsers block audio until the visitor taps the Sound button once. Check `assets/nice.mp3` exists.
- **Airdrop never fires:** confirm `devWallet`, that the tokens leave *that* wallet, the RPC works (console shows errors), and the receiver isn't in `ignoreWallets`.

## 8. Tests

`node tests/run-tests.js` loads the page into Node with a stubbed 3D library and a fake DexScreener response and checks: pair selection,
real market-cap math, no fake price movement without data, milestone behaviour, endpoint fallback, every error state, the URL-override
rules, demo mode (all animations run without errors) and the airdrop parser.

It cannot check how the page **looks**, and it does not contact the real DexScreener or Solana RPC.
The real feed was not exercised end-to-end when this package was built, so do a live check on your first deploy.

## 9. Notes for editing

- One inline `<script>` at the bottom of `index.html`, in this order: config → price state → coin card UI → live feed (`poll`) →
  airdrop watcher (`pollDev`, `parseAirdrop`) → screen drawing (`drawScreen*`) → main loop (`frame`).
- `mode` in the loop: 0 trading, 1 rage, 2 party, 3 scripted act (milestone/airdrop; the `act` object).
- Data source is DexScreener: `GET https://api.dexscreener.com/token-pairs/v1/solana/<CA>` with
  `GET /latest/dex/tokens/<CA>` as automatic fallback.
