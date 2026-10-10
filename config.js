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
  ca: 'GnLb3Rvt81YAQazRw1A7vu9LTwedLEFXBhhXMTxupump',

  /* Optional branding. Leave '' to auto-fill name, ticker and X link
     from DexScreener's listing. */
  name: '',            // e.g. 'Bonk Chad'
  symbol: '',          // e.g. '$BCHAD'
  twitter: '',         // e.g. '@bonkchad'
  twitterUrl: '',      // e.g. 'https://x.com/bonkchad'  (must start with https://)

  /* Latest post from X shown under "Trader mood" (X's own embedded timeline).
     tweetUser  the account to show, e.g. '@bonkchad'. Leave '' to use the
                coin's X account (twitter / twitterUrl above, or the one
                DexScreener lists).
     showTweet  false = hide the box and never load anything from X.
     Note: this loads a script from platform.twitter.com, and X sometimes
     shows an older or empty timeline to logged-out visitors. If it can't
     load, a plain "Open @user on X" link is shown instead.                */
  tweetUser: '',
  showTweet: true,

  /* LOGO: your own file. Save it as assets/logo.png (square works best -
     it is shown in a circle and also used as the browser-tab icon).
     To use a different file name or type, change the path here, e.g.
     'assets/mylogo.webp'. If the file is missing, the page shows a
     letter circle instead. DexScreener's logo is NOT used unless you
     set logoFromDexScreener: true.                                      */
  logo: 'assets/logo.png',
  logoFromDexScreener: false,

  /* ---------- 2. LIVE DATA --------------------------------------------
     Prices and market cap come from the DexScreener public API.
     pollSeconds    how often to refresh (min 2). 4 is fine.
     candleSeconds  length of one candle on the chart.
     sensitivity    how strongly price moves drive his typing speed and
                    rage / celebration. 1 = default, 2 = twitchier,
                    0.5 = calmer.                                        */
  pollSeconds: 2,
  candleSeconds: 3,
  sensitivity: .5,

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

  /* ---------- 4b. ROOM --------------------------------------------------
     signText  the words on the neon sign on the back wall. The first word
               glows cyan and the rest pink. Keep it short (about 14
               characters or fewer) so it fits.                            */
  signText: 'The Trader',

  /* ---------- 4c. MELTDOWN -----------------------------------------------
     When the coin keeps dumping, he first rages at his desk. If it goes on
     long enough he gets up and either lies on his bed crying or paces the
     room clutching his head, then walks back to his chair once things calm
     down (or after despairMaxSeconds).
     despair               false = never leave the chair (rage only)
     despairAfterSeconds   seconds of rage before he breaks down (default 5)
     despairMaxSeconds     longest he stays away from the desk (min 12, default 40) */
  despair: true,
  despairAfterSeconds: 5,
  despairMaxSeconds: 10,

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
    { mc: 100000, act: 'party',  label: ['🚀 100K — WE ATE, NO CRUMBS', '🚀 100K — HUGE W IN THE CHAT'], sound: '' },
    { mc: 125000,  act: 'dance', label: ['🕺 W RIZZ ACTIVATED', '🕺 SLAY, TRADER, SLAY', '🕺 SKIBIDI BULLISH'], sound: '' },
    { mc: 150000,  act: 'letsgo', label: ['🔥 NO CAP, WE ARE COOKING', '🔥 ABSOLUTE CINEMA', '🔥 IT\'S SO BACK'], sound: '' },
    { mc: 200000,  act: 'scream', label: ['📣 WE\'RE ALL GONNA MAKE IT', '📣 BIG BACK ENERGY', '📣 SHEEEESH, PART 2'], sound: '' },
    { mc: 250000,  act: 'lockin', label: ['🔒 SIGMA GRINDSET', '🔒 MAIN CHARACTER ENERGY', '🔒 ZERO DISTRACTIONS, ALL GAINS'], sound: '' },
    { mc: 300000,  act: 'dance', label: ['🕺 AURA +5000', '🕺 IT\'S GIVING GENERATIONAL WEALTH', '🕺 FANUM TAX THE GAINS'], sound: '' },
    { mc: 400000,  act: 'party', label: ['🎉 W STREAK UNLOCKED', '🎉 EATING GOOD TONIGHT', '🎉 CERTIFIED HOOD CLASSIC'], sound: '' },
    { mc: 500000,  act: 'letsgo', label: ['🔥 HALF A MIL — NO CRUMBS', '🔥 HALFWAY TO A MILLY, BESTIE', '🔥 DIAMOND HANDS PAID OFF'], sound: '' },
    { mc: 600000,  act: 'chug', label: ['🥤 HYDRATE, CHAMP', '🥤 ENERGY DRINK FOR THE GRIND', '🥤 SIP SIP, WE\'RE UP BIG'], sound: '' },
    { mc: 700000,  act: 'scream', label: ['📣 LOCK IN, FAM', '📣 THIS IS NOT A DRILL', '📣 WE\'RE IN THE ENDGAME'], sound: '' },
    { mc: 800000,  act: 'dance', label: ['🕺 CERTIFIED BANGER', '🕺 RIZZ OF THE CENTURY', '🕺 THE VIBES ARE IMMACULATE'], sound: '' },
    { mc: 900000,  act: 'lockin', label: ['🔒 SO CLOSE I CAN TASTE IT', '🔒 DON\'T BLINK. DON\'T SELL.', '🔒 FINAL BOSS MODE'], sound: '' },
    { mc: 1000000, act: 'party', label: ['🏆 MILLIONAIRE ARC COMPLETE', '🏆 1M — THE PRIME OF OUR LIVES', '🏆 WE\'RE SO BACK IT\'S ILLEGAL'], sound: '' },
    { mc: 2000000, act: 'party', label: ['🚀 2M — GENERATIONAL, NO CAP', '🚀 2M — CALL IT A BIG W, BESTIE'], sound: '' },
    { mc: 5000000, act: 'party', label: ['👑 5M — LEGENDARY STATUS', '👑 5M — HISTORY IS BEING MADE'], sound: '' },
    { mc: 10000000, act: 'party', label: ['🌕 10M — WE ARE SO BACK, HE IS THE GOAT', '🌕 10M — TELL MY GRANDKIDS'], sound: '' }
  ]
};
