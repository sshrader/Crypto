/* ============================================================
   MEME DAY TRADER — SETTINGS
   This is the only file you normally need to edit.
   Save it next to index.html and refresh the page.
   ============================================================ */
window.TRADER_CONFIG = {

  /* ---------- 1. THE COIN ---------------------------------------------
     ca = the token's contract address (mint address) on Solana.
     Change this to your real coin, or to ANY other Solana coin to test.
     Test idea: BONK  DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263
     (check the address on dexscreener.com before relying on it)        */
  ca: 'CAmp5hUNFvU5UH8BEFzVAsEAfoLi2HxGeoEJriZc7BZ6',

  /* Optional branding. Leave '' to auto-fill from DexScreener
     (name, ticker, logo and X link are read from the coin's listing). */
  name: '',            // e.g. 'Bonk Chad'
  symbol: '',          // e.g. '$BCHAD'
  twitter: '',         // e.g. '@bonkchad'
  twitterUrl: '',      // e.g. 'https://x.com/bonkchad'  (must start with https://)
  logo: '',            // image URL (https://...) or a data: URL

  /* ---------- 2. LIVE DATA --------------------------------------------
     Prices and market cap come from the DexScreener public API.
     pollSeconds    how often to refresh (min 2). 4 is fine.
     candleSeconds  length of one candle on the chart.
     sensitivity    how strongly price moves drive his typing speed and
                    rage / celebration. 1 = default, 2 = twitchier,
                    0.5 = calmer.                                        */
  pollSeconds: 4,
  candleSeconds: 10,
  sensitivity: 1,

  /* ---------- 3. AIRDROP WATCHER (optional) ---------------------------
     Paste the dev wallet address. When it sends your coin out, the
     trader slams the DISTRIBUTE button and the page announces the
     amount and receiving wallet(s). Leave '' to turn it off.
     rpc            a Solana RPC URL. The public one is rate-limited;
                    a free Helius / QuickNode URL is more reliable.
                    NOTE: anything in this file is visible to visitors.
                    Restrict the key to your domain in the provider's
                    dashboard.
     ignoreWallets  wallets that should NOT count as airdrop receivers
                    (liquidity pool, exchange, burn address...). Also add
                    them so a dev SELL isn't announced as an airdrop.    */
  devWallet: '',
  rpc: 'https://api.mainnet-beta.solana.com',
  devPollSeconds: 10,
  ignoreWallets: [],

  /* ---------- 4. SAFETY / TEST SWITCHES -------------------------------
     allowUrlOverrides  false (recommended for the public site).
        When true, anyone can open  yoursite.com/?ca=OTHER_ADDRESS  and the
        page shows (and offers to copy) THAT address — a phishing risk on
        a real domain. These overrides always work on localhost / file://
        so you can test freely there:
          ?ca=<address>   use another coin
          ?dev=<address>  watch another dev wallet
          ?demo=1         simulated price + test buttons
          ?fake=1         add decorative fake feeds to the side monitors
     demo       true = SIMULATED price and test buttons (for previewing
                the animations). Never leave on for a real launch.
     fakeFeeds  true = side monitors show made-up trades / whale alerts /
                tweets (clearly labelled "SIMULATED FEED"). false = real
                DexScreener stats and coin info instead.                 */
  allowUrlOverrides: false,
  demo: false,
  fakeFeeds: false,

  /* ---------- 5. SOUNDS ------------------------------------------------
     niceSound  the "nice" clip (path or URL). Visitors must click the
                Sound button once before any audio can play.            */
  niceSound: 'assets/nice.mp3',

  /* ---------- 6. MILESTONES (market cap in USD) -------------------------
     act   chug | scream | dance | letsgo | lockin | party
     label one text, or a list to pick from at random
     sound optional audio path/URL played when it triggers               */
  milestones: [
    { mc: 8000,   act: 'chug',   label: ['🥤 HYDRATE OR DIEDRATE', '🥤 CHUG CHUG CHUG!', '🥤 FUEL UP — LET HIM COOK'], sound: '' },
    { mc: 10000,  act: 'scream', label: ['📣 SHEEEESH!!!', '📣 NO CAP, WE ARE UP!', '📣 WHOOWHO!!!'], sound: '' },
    { mc: 15000,  act: 'dance',  label: ["🕺 IT'S GIVING MILLIONAIRE", '🕺 AURA +1000', '🕺 W RIZZ DANCE'], sound: '' },
    { mc: 20000,  act: 'letsgo', label: ['🔥 LET HIM COOK!!!', "🔥 WE'RE SO BACK!!!", "🔥 BIG W — LET'S GOOO"], sound: '' },
    { mc: 30000,  act: 'lockin', label: ['🔒 LOCKED IN', '🔒 GRIND MODE: ON', '🔒 MAIN CHARACTER MODE'], sound: '' },
    { mc: 50000,  act: 'party',  label: ['🎉 50K — ABSOLUTELY GOATED 🐐', '🎉 50K — EATING GOOD'], sound: '' },
    { mc: 100000, act: 'party',  label: ['🚀 100K — WE ATE, NO CRUMBS', '🚀 100K — HUGE W IN THE CHAT'], sound: '' }
  ]
};
