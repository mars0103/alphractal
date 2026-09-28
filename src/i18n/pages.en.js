// Copy for every page beyond the home. Source: 01-PRODUTO-FEATURES (COPY EN blocks) and the brief §5.
// Numbers that appear here must exist in lib/facts.js or in the features doc.
export default {
  common: {
    startFree: 'Start free',
    noCard: 'No credit card',
    seePlatform: 'See the platform',
    illustrative: 'Illustrative',
    disclaimer: 'Educational only. Not financial advice.',
    problem: 'THE PROBLEM',
    how: 'HOW IT WORKS',
    gains: 'WHAT YOU GET',
    proof: 'PROOF',
    keepGoing: 'KEEP GOING',
    keepGoingTitle: 'Related in the platform.',
    live: 'Live',
    copy: 'Copy',
    copied: 'Copied',
    explore: 'Explore',
    ctaTitle: ['Start with the', 'free plan.'],
    ctaSub: 'Free forever. No credit card. Cancel paid plans anytime.',
  },

  hub: {
    eyebrow: 'PLATFORM',
    title: ['See what the', 'market can’t hide.'],
    sub: 'Everything Alphractal ships today, in one place. Free to start, no credit card.',
    listEyebrow: '7 RESOURCES, ONE LINE EACH',
    terminalEyebrow: 'IN TESTNET',
    terminalTitle: 'Alpha Terminal',
    terminalText: 'The execution surface. Not open yet: join the waitlist.',
    rows: [
      { key: 'metrics', to: '/platform/metrics', title: 'Metrics & Models', text: '1,500+ metrics across four domains. 23 of them are ours.' },
      { key: 'alpha-ai', to: '/platform/alpha-ai', title: 'Alpha AI', text: 'An analyst that cites every number it uses.' },
      { key: 'mcp', to: '/platform/mcp', title: 'MCP', text: '47 tools your own agent can call.' },
      { key: 'api', to: '/platform/api', title: 'API', text: '1,000+ endpoints, including on the free tier.' },
      { key: 'dashboards', to: '/platform/dashboards', title: 'Dashboards, Alerts & Screeners', text: 'Your layouts, your rules, one composed alert.' },
      { key: 'macro', to: '/platform/metrics#macro', title: 'Macro Terminal', text: '46 panels beside your on-chain charts.' },
      { key: 'research', to: '/platform/research', title: 'Research & Academy', text: 'Reports that update while you read them.' },
    ],
  },

  features: {
    /* ------------------------------------------------------------------ Alpha AI */
    'alpha-ai': {
      hero: {
        eyebrow: 'ALPHA AI',
        title: 'An analyst that has to show its work.',
        sub: 'Ask in plain English. Every answer cites the metrics it used — click a citation and the chart opens underneath.',
        primary: 'Start free',
        secondary: 'See the four modes',
        secondaryHref: '#how',
      },
      problem: {
        title: 'Fine for a summary. Dangerous for a position.',
        text: [
          'A general model will answer anything you ask about Bitcoin. It will also answer confidently when it has no data.',
          'Alpha AI can only cite from a whitelist of platform metrics. No citation, no claim. When the data isn’t there, it says so.',
        ],
      },
      how: {
        title: 'Four ways to ask.',
        steps: [
          { title: 'Quick Ask', text: 'Direct question, streaming answer, grounded in live data.' },
          { title: 'Deep Research', text: 'Multi-step analysis across on-chain, derivatives and macro, returned as a long-form report with sources.' },
          { title: 'Chart copilot', text: 'Ask about the chart in front of you, without leaving it.' },
          { title: 'Voice', text: 'Ask out loud. Listen to the answer back.' },
        ],
      },
      gains: {
        title: 'What you get',
        items: [
          { title: 'A citation on every claim', text: 'Each claim carries a metric_id from a whitelist, rendered as a pill that opens the underlying chart.' },
          { title: 'Live data, not cached answers', text: 'It reads the same data the platform runs on, right now.' },
          { title: 'Research credits', text: '3 on Starter, 20 a month on Pro, 50 a month on Max. Unlimited chat on Pro.' },
          { title: 'It says when it doesn’t know', text: 'If the metric isn’t there, you get that answer instead of an invention.' },
        ],
      },
      examples: {
        title: 'Questions worth asking',
        chips: [
          'What’s driving ETH funding right now?',
          'Which cohorts have been accumulating BTC for the last 30 days?',
          'How does this drawdown compare to previous cycles?',
          'Is on-chain confirming the derivatives positioning here?',
        ],
      },
      proof: {
        big: 'No citation,',
        big2: 'no claim.',
        text: 'What a paying subscriber says it does to their research workflow.',
        quote: 'Currently, Alphractal covers 90% of my research workflow. Alpha AI is becoming hard to replace. It acts like a 24/7 analyst that helps check my thesis.',
        quoteBy: 'Paying subscriber, survey response',
      },
      related: ['metrics', 'mcp', 'research'],
      legal: 'Educational only. Not financial advice.',
    },

    /* ------------------------------------------------------------------ Metrics */
    metrics: {
      hero: {
        eyebrow: 'DATA',
        title: 'Four data domains. One definition of each.',
        sub: 'On-chain, derivatives, sentiment and macro — 1,500+ metrics with consistent definitions, 14 years of on-chain history and 17+ exchanges behind them.',
        primary: 'Start free',
        secondary: 'Browse the models',
        secondaryHref: '#models',
      },
      problem: {
        title: 'Two numbers, two subscriptions.',
        text: [
          'A funding spike during a DXY move is not the same trade as a funding spike during ETF inflows. Most desks can’t tell the difference, because the two numbers live in two different subscriptions.',
          'Here they sit on the same screen, on the same timeline, with the same definitions.',
        ],
      },
      how: {
        title: 'One screen, one timeline, one definition.',
        steps: [
          { title: 'Same screen', text: 'On-chain, derivatives, sentiment and macro side by side, not in four tabs.' },
          { title: 'Same timeline', text: 'Every series shares one time axis, so a move in rates lines up with a move in funding.' },
          { title: 'Same definitions', text: 'A metric means one thing wherever it appears, in a chart, an alert or an AI answer.' },
        ],
      },
      domains: {
        title: 'What is in each domain',
        items: [
          { name: 'On-chain', text: 'Supply, cohorts, exchange flows, realized prices.' },
          { name: 'Derivatives', text: 'Funding, open interest, long/short, liquidations.' },
          { name: 'Sentiment', text: 'Social volume, fear & greed, funding sentiment.' },
          { name: 'Macroeconomy', text: 'Liquidity, rates, recession signals, policy uncertainty.' },
          { name: 'Market data', text: 'Price, volume, dominance, correlations.' },
          { name: 'Proprietary models', text: '23 computed in-house, nowhere else.' },
        ],
      },
      gains: {
        title: 'What you get',
        items: [
          { title: '1,000+ assets', text: '1,000+ on paid plans, 100+ on the free plan.' },
          { title: '14 years of on-chain history', text: 'Behind 17+ exchanges.' },
          { title: 'Fresh in 1–5 minutes', text: 'Data refreshes every 1–5 minutes.' },
          { title: '23 proprietary models', text: 'Computed in-house from raw on-chain and derivatives data.' },
        ],
      },
      proof: {
        big: '53%',
        label: 'of new users ask for the proprietary metrics by name',
        text: 'Onboarding survey, n = 1,845. That is the whole product in one data point.',
      },
      models: {
        eyebrow: 'PROPRIETARY',
        title: '23 charts you can’t open anywhere else.',
        sub: 'Not resold vendor data. Models computed in-house from raw on-chain and derivatives data — and the ones our users ask for by name.',
        body: 'When we ask people what brought them here, more than half name a specific chart. The value isn’t the count. It’s that a handful of these have no substitute.',
        cta: 'Browse the models',
        hint: 'A selection of the models',
        list: [
          'CVDD Channel',
          'Fractal Cycle',
          'Liquidation Levels',
          'Whale vs Retail Delta Heatmap',
          'Structural Market Bands',
          'Reserve Risk Indicators',
          'Pi Cycle',
          'Halving Cycle Comparison',
          'STH/LTH Market Signal',
          'SOPR Trend Signal',
          'Accumulation Cohort Heatmap',
          'Long/Short Ratio Heatmap',
        ],
      },
      macro: {
        eyebrow: 'MACRO',
        title: '46 macro panels, next to your on-chain charts.',
        sub: 'Global liquidity, rates, recession signals, policy uncertainty and risk regime — on the same screen and the same timeline as the crypto data.',
        body: 'Crypto has spent a decade pretending it trades independently of rates and liquidity. The desks that outperform stopped pretending. Reorder the panels, resize them, and drop any of them into a dashboard beside a funding chart.',
        hint: 'Independent panels you can reorder',
      },
      related: ['alpha-ai', 'dashboards', 'api'],
    },

    /* ------------------------------------------------------------------ MCP */
    mcp: {
      hero: {
        eyebrow: 'MODEL CONTEXT PROTOCOL',
        title: 'The crypto data layer your AI can actually read.',
        sub: '47 tools over MCP. Connect Claude, Cursor or your own agent, and Alphractal’s metrics, charts, screeners and research become callable inside that conversation.',
        primary: 'Connect your client',
        secondary: 'Browse the 47 tools',
        secondaryHref: '#tools',
      },
      endpointLabel: 'Endpoint',
      credits: '10,000 starter credits, free, no card.',
      problem: {
        title: 'An agent that reads, and one that deletes your alerts.',
        text: [
          'Point your client at one URL. 39 read tools that never touch your account. 8 write tools that can create and edit alerts and favourites — separated on purpose, and off by default.',
          'The read/write split is the most important thing in the catalog. It’s the difference between an agent that reads your data and one that deletes your alerts.',
        ],
      },
      how: {
        title: 'Three steps to a connected agent.',
        steps: [
          { title: 'Point your client at one URL', text: 'Claude, Cursor or your own agent. Streamable HTTP, a single endpoint.' },
          { title: 'Ask inside the conversation', text: 'Metrics, charts, screeners and research become tools your agent can call while it answers.' },
          { title: 'Read by default, write on purpose', text: 'Write tools are separate from read tools and off by default.' },
        ],
      },
      gains: {
        title: 'What you get',
        items: [
          { title: '47 tools', text: '39 for reading, 8 for writing.' },
          { title: '7 categories', text: 'Market data, Metrics, Charts, Alerts, Account, Research & Academy, Screener.' },
          { title: 'Read-only by default', text: 'Nothing changes on your account until you allow it.' },
          { title: '10,000 starter credits', text: 'Once, free, no card.' },
        ],
      },
      proof: { big: '47', label: 'tools · 39 read + 8 write', text: 'Almost no one in crypto analytics has shipped an MCP server. This one answers at the URL above.' },
      tools: {
        eyebrow: 'THE CATALOG',
        title: 'All 47 tools.',
        read: 'Read',
        write: 'Write',
        readNote: 'Never touch your account',
        writeNote: 'Create, edit, delete',
        readList: [
          'Alert allowance', 'Alert trigger history', 'Asset details', 'Asset market summary', 'Backtest a metric',
          'Categories for an asset', 'Chart details', 'Charts for an asset', 'Charts in a category', 'Compare charts',
          'Compare metrics', 'Latest reports', 'Liquidation clusters', 'Metric data', 'Metric details',
          'Metric parameters', 'Metrics on a chart', 'My alerts', 'My favorites', 'My plan',
          'My screener views', 'Price history', 'Purchase plan', 'Rank assets by metric', 'Report key insights',
          'Reports on an asset', 'Screener ranking', 'Screener rows', 'Search assets', 'Search charts',
          'Search metrics', 'Search research reports', 'Search the academy', 'Signal data availability', 'Spot candles',
          'Suggest charts', 'Trading indicator series', 'Trending assets', 'What moved today',
        ],
        writeList: [
          'Add a favorite asset', 'Create the staged alert', 'Delete an alert', 'Delete a screener view',
          'Edit an alert', 'My usage and limits', 'Remove a favorite asset', 'Stage an alert',
        ],
      },
      client: {
        label: 'Your AI client',
        question: 'What moved today, and which alerts do I have on it?',
        calling: 'Calling tools',
      },
      related: ['api', 'alpha-ai'],
    },

    /* ------------------------------------------------------------------ API */
    api: {
      hero: {
        eyebrow: 'API',
        title: '1,000+ endpoints. Including on the free tier.',
        sub: 'REST access to the full metric library, with pay-per-call credits on every plan — no paid tier required to make your first call.',
        primary: 'Read the docs',
        secondary: 'See API tiers',
        secondaryHref: '#tiers',
      },
      problem: {
        title: 'Not a stripped-down copy.',
        text: [
          'Rate limits from 30 to 800 requests per minute. Full history and webhooks on the top tiers. CSV and JSON export.',
          'Documented, versioned, and the same data the platform runs on.',
        ],
      },
      how: {
        title: 'From first call to production.',
        steps: [
          { title: 'Make your first call on Free', text: 'Pay-per-call credits on the Starter plan, 30 requests a minute, 7 days of history.' },
          { title: 'Scale by credits and rate', text: '500k credits a month on Pro, 2M on Max, 5M+ on Institutional.' },
          { title: 'Export and hook up', text: 'CSV and JSON export from Pro. Webhooks from Max.' },
        ],
      },
      gains: {
        title: 'What you get',
        items: [
          { title: '1,000+ endpoints', text: 'The full metric library over REST.' },
          { title: '30 → 800 requests per minute', text: '30 on Starter, 200 on Pro, 500 on Max, up to 800 on Institutional.' },
          { title: 'History that grows with the plan', text: '7 days on Starter, 12 months on Pro, complete on Max and Institutional.' },
          { title: 'CSV and JSON export', text: 'From the Pro plan.' },
        ],
      },
      proof: { big: '800', label: 'requests per minute on Institutional', text: 'Up from 30 on the free plan. Same data at every level.' },
      ladder: { title: 'Requests per minute', plans: ['Starter', 'Pro', 'Max', 'Institutional'], up: 'up to' },
      tiers: {
        eyebrow: 'API BY PLAN',
        title: 'What each plan gives the API.',
        cols: ['Plan', 'Credits', 'Rate', 'History', 'Also'],
        rows: [
          ['Starter', 'Pay-per-call', '30 / min', '7 days', '—'],
          ['Pro', '500k a month', '200 / min', '12 months', 'CSV / JSON export'],
          ['Max', '2M a month', '500 / min', 'Complete', 'Webhooks'],
          ['Institutional', '5M+', 'Up to 800 / min', 'Complete', 'Custom endpoints'],
        ],
        commercial: {
          title: 'Commercial API tiers',
          text: 'For teams building on the data.',
          items: [
            { name: 'Startup', price: '$59/mo' },
            { name: 'Growth', price: '$299/mo' },
            { name: 'Corporate', price: '$699/mo' },
            { name: 'Institutional', price: 'On request' },
          ],
        },
      },
      related: ['mcp', 'metrics', 'dashboards'],
    },

    /* ------------------------------------------------------------------ Dashboards */
    dashboards: {
      hero: {
        eyebrow: 'DASHBOARDS',
        title: 'Your screen, not ours.',
        sub: 'Compose the charts and metrics your process actually uses. Drag, resize, save. Share the layout with a URL.',
        primary: 'Start free',
        secondary: 'See alerts and screeners',
        secondaryHref: '#alerts',
      },
      problem: {
        title: 'A layout that fits how you work.',
        text: [
          'Six starter templates if you want a fast beginning. A no-code chart builder if you want to compose a metric that doesn’t exist yet.',
          'And a public share link, so the read you built can travel to someone who doesn’t have an account.',
        ],
      },
      how: {
        title: 'Build it once, keep it.',
        steps: [
          { title: 'Start from a template', text: 'Six ready-made layouts, or an empty canvas.' },
          { title: 'Compose your own chart', text: 'A no-code builder for the metric that doesn’t exist yet. The Macro Terminal can be added too.' },
          { title: 'Share it with a URL', text: 'A public link sends the read to your team or a client without asking them for an account.' },
        ],
      },
      gains: {
        title: 'What you get',
        items: [
          { title: 'Dashboards by plan', text: '10 on Pro, 25 on Max, unlimited on Institutional.' },
          { title: '6 templates', text: 'Drag-and-drop layouts that persist.' },
          { title: 'A no-code chart builder', text: 'Compose from any metric.' },
          { title: 'Public share links', text: 'Send a live read without an account.' },
        ],
      },
      proof: { big: '6', label: 'templates · drag, resize, save', text: 'Layouts persist. Change them once and they stay that way.' },
      workbench: { hint: 'Drag the panels', illustrative: 'Try it: the panels move' },
      alerts: {
        eyebrow: 'ALERTS',
        title: 'One rule. Two domains. One notification.',
        sub: 'Funding above the 99th percentile AND DXY rising. Most tools make you watch that in two tabs and connect it yourself.',
        body: [
          'Threshold, cross and percentage-move conditions on any metric, composed with AND/OR across on-chain, derivatives and macro. Delivered by email, Telegram, webhook or in-app.',
          'The public marketplace lists curated alert templates with honest 30, 90 and 365-day hit rates — including the ones that don’t fire often. Subscribe in one click.',
        ],
        rule: {
          when: 'When',
          a: 'funding rate',
          aOp: 'is above',
          aVal: '99th percentile',
          and: 'AND',
          b: 'DXY',
          bOp: 'is',
          bVal: 'rising',
          then: 'Notify me',
        },
        channels: ['Email', 'Telegram', 'Webhook', 'In-app'],
        limitsTitle: 'Alerts by plan',
        limits: [
          ['Starter', '1'],
          ['Pro', '20'],
          ['Max', '100'],
          ['Institutional', '500+'],
        ],
        historic: 'Marketplace hit rates are historical and shown as history.',
      },
      screeners: {
        eyebrow: 'SCREENERS',
        title: 'Rank the market, not one asset.',
        sub: 'Altseason index, buy/sell pressure, correlation heatmap, risk and trend scores — with saved presets for the screens you run every morning.',
        illustrative: 'Illustrative ranking',
      },
      related: ['metrics', 'research', 'alpha-ai'],
    },

    /* ------------------------------------------------------------------ Research */
    research: {
      hero: {
        eyebrow: 'RESEARCH',
        title: 'Research that updates while you read it.',
        sub: 'In-house reports with live charts embedded in the article, voice narration by chapter, and a visible version history.',
        primary: 'Start free',
        secondary: 'See the Academy',
        secondaryHref: '#academy',
      },
      problem: {
        title: 'A static PDF is out of date the moment it’s published.',
        text: [
          'Our reports carry the chart, not a picture of the chart — so the number in paragraph three is the number right now.',
          'There is also a Daily Brief, and any report can live at a public URL.',
        ],
      },
      how: {
        title: 'Three things a normal report can’t do.',
        steps: [
          { title: 'Live charts inside the article', text: 'The data updates while you read.' },
          { title: 'Voice narration by chapter', text: 'Listen on your commute, and skip sections from the keyboard.' },
          { title: 'A visible version history', text: 'Every report shows what changed and when.' },
        ],
      },
      gains: {
        title: 'What you get',
        items: [
          { title: 'Reports written by the team', text: 'With embedded live charts.' },
          { title: 'A Daily Brief', text: 'The short version of the day.' },
          { title: 'Public URLs', text: 'Share a report with someone who has no account.' },
          { title: 'Research credits', text: '3 on Starter, 20 a month on Pro, 50 a month on Max.' },
        ],
      },
      proof: { big: '5', label: 'levels in the Academy · Apprentice to Alpha', text: 'Learn the metric on the screen where you use it.' },
      report: { title: 'Illustrative report', chapter: 'Chapter', live: 'Live chart', version: 'v3 · updated', narration: 'Narration' },
      academy: {
        eyebrow: 'ACADEMY',
        title: 'Five levels, inside the platform.',
        sub: 'And the Academy runs where the data does, from Apprentice to Alpha. Learn the metric on the screen where you use it.',
        levels: ['Apprentice', 'Analyst', 'Trader', 'Quant', 'Alpha'],
      },
      related: ['alpha-ai', 'metrics', 'dashboards'],
    },
  },

  /* ---------------------------------------------------------------------- Terminal */
  terminal: {
    eyebrow: 'IN TESTNET',
    title: 'Research is where the decision starts. Not where it ends.',
    body: [
      'Alphractal tells you what the market is doing. Today you carry that read somewhere else to act on it.',
      'Alpha Terminal closes the gap: a non-custodial trading surface on Hyperliquid, with our proprietary overlays drawn inside the trading chart, and entry, stop and target levels read from live order-book depth.',
    ],
    promise: 'Suggestions fill the order field. Nothing submits until you do.',
    status: 'Status',
    statusValue: 'In testnet. No public screens yet.',
    cta: 'Join the waitlist',
    disclaimer: 'Directional, not a commitment. Timelines can change. Nothing here is financial advice.',
    factsTitle: 'What it is',
    facts: [
      ['Non-custodial', 'Your wallet, your keys.'],
      ['On Hyperliquid', 'The trading venue.'],
      ['Our overlays', 'Proprietary models drawn inside the trading chart.'],
      ['You decide', 'Nothing submits until you do.'],
    ],
    directionEyebrow: 'DIRECTION',
    direction:
      'Further out, the same ladder goes from notifying you, to asking you to confirm, to acting only under a mandate you set and can revoke: allowed pairs, maximum size, daily loss limit, a kill switch and an audit log. A person stays in the loop by design. This is direction, not a product.',
    directionTag: 'Directional. Not available today.',
  },

  /* ---------------------------------------------------------------------- Institutional */
  institutional: {
    eyebrow: 'INSTITUTIONAL',
    title: 'The data your desk already reads, with an SLA behind it.',
    sub: 'For funds, trading desks, research firms, OTC and market makers, and crypto companies. Dedicated API access, enterprise SLA and priority support.',
    primary: 'Talk to sales',
    secondary: 'See API tiers',
    numbers: [
      { value: 1000, suffix: '+', label: 'endpoints' },
      { value: 800, suffix: '', label: 'requests / min, up to' },
      { value: 5, suffix: 'M+', label: 'API credits a month' },
      { value: 1, suffix: 'h', label: 'SLA on Institutional' },
    ],
    structureEyebrow: 'BY WHAT YOUR TEAM DOES',
    structureTitle: 'Understand. Operationalize. Build.',
    columns: [
      {
        key: 'understand',
        title: 'Understand',
        who: 'Research teams and analysts',
        items: [
          'Research reports with live charts and a visible version history',
          'Research dashboards, shareable by URL',
          'Alpha AI that cites every metric it uses',
        ],
      },
      {
        key: 'operationalize',
        title: 'Operationalize',
        who: 'Trading desks, OTC and market makers',
        items: [
          'Composed alerts across on-chain, derivatives and macro',
          'Email, Telegram, webhook and in-app delivery',
          'Priority support and a dedicated account manager',
        ],
      },
      {
        key: 'build',
        title: 'Build',
        who: 'Crypto companies and engineers',
        items: [
          'Dedicated API access, 1,000+ endpoints, full history',
          'CSV and JSON export, custom endpoints',
          'White-label and private data pipelines',
        ],
      },
    ],
    tiersEyebrow: 'API TIERS',
    tiersTitle: 'Commercial API tiers.',
    tiers: [
      { name: 'Startup', price: '$59', per: '/mo' },
      { name: 'Growth', price: '$299', per: '/mo' },
      { name: 'Corporate', price: '$699', per: '/mo' },
      { name: 'Institutional', price: 'On request', per: '' },
    ],
    ctaTitle: ['Talk to', 'our team.'],
    ctaSub: 'Dedicated API access, enterprise SLA and priority support.',
    tiersNote: 'Prices for the commercial API tiers are stable. Plan prices for the app are shown in the app.',
    trustEyebrow: 'SLA AND COMPLIANCE',
    trust: [
      ['Uptime SLA', 'Enterprise SLA, with priority support.'],
      ['TLS 1.3', 'In transit.'],
      ['GDPR', 'Data handling under GDPR.'],
      ['Read-only', 'We never touch funds, wallets or accounts.'],
    ],
  },

  /* ---------------------------------------------------------------------- About */
  about: {
    eyebrow: 'THE STORY',
    title: 'Five people, no advertising budget, 1,800 traders.',
    body: [
      'Alphractal started inside an on-chain research community, building the charts its own members kept asking for. It has never paid for a user.',
      'Everything on the platform — 1,500+ metrics, 14 years of on-chain history, 23 models computed in-house — was built by a team of five, with almost no outside funding.',
      'That constraint shaped the product. When you can’t buy attention, the only thing that grows you is being genuinely useful to people who already know the subject.',
    ],
    timelineEyebrow: 'TIMELINE',
    timelineTitle: 'From 2023 to today.',
    timeline: [
      { when: '2023', title: 'Foundation', text: 'Inside an on-chain research community.' },
      { when: '', title: 'Platform launch', text: 'The charts members kept asking for, in one place.' },
      { when: '', title: 'API and Institutional', text: 'Dedicated access for desks and teams.' },
      { when: '', title: 'V2 and the Macro Terminal', text: '46 macro panels next to the on-chain data.' },
      { when: 'Now', title: 'Alpha Terminal in testnet', text: 'The execution surface, not open yet.' },
    ],
    teamEyebrow: 'THE TEAM',
    teamTitle: 'The people who built it.',
    teamHint: 'Hover a person',
    team: [
      { name: 'João Wedson', role: 'Founder & CEO', line: 'Built the metrics base and the 14 years of on-chain history across 17+ exchanges. Sets the product’s research direction.' },
      { name: 'Pablo Mani', role: 'Co-Founder & COO', line: 'Operations, platform and growth. Leads the commercial build and the operating base in Australia.' },
      { name: 'Eduardo de Abreu', role: 'Co-Founder & Board Member', line: 'Governance and corporate structure.' },
      { name: 'Luan Silveira', role: 'CTO', line: 'Technical execution of the platform.' },
      { name: 'Rafael Teles', role: 'Research Lead, PhD (Physics)', line: 'Leads the modelling that maps which signal matters in which market regime. PhD in atomic and molecular physics from USP, postdoctoral work at Rice University, joined in February 2025.' },
    ],
    researchEyebrow: 'RESEARCH',
    research:
      'Behind the models is about three years of internal research on which signal is informative in which market regime. A metric that predicts well in a trend can be actively harmful in a range; the value isn’t in the metric, it’s in the map. It is the team’s research story, not a product claim.',
    directionEyebrow: 'DIRECTION',
    direction:
      'Where we want to go: from research, to a terminal you act in, to workflows you set and supervise. Directional, not a commitment.',
    careersEyebrow: 'CAREERS',
    careersTitle: 'Work with us.',
    careersText: 'We are a small team. If you know on-chain data, quantitative research or product engineering, say hello.',
    careersCta: 'Get in touch',
    photoLabel: 'The whole team, together',
    stats: [
      { value: 5, suffix: '', label: 'people on the team' },
      { value: 1800, suffix: '+', label: 'traders onboarded' },
      { value: 130, suffix: '+', label: 'countries' },
      { value: 0, suffix: '', label: 'users acquired with paid media' },
    ],
  },

  /* ---------------------------------------------------------------------- Pricing */
  pricing: {
    eyebrow: 'PRICING',
    title: 'Free to start. Priced by what you actually use.',
    sub: 'Plan prices are shown in the app because they change with promotions. What each plan includes is stable, and it is below.',
    seePricing: 'See current pricing',
    plans: [
      { key: 'starter', name: 'Starter', price: 'Free forever', note: 'No card', cta: 'Start free', href: 'start' },
      { key: 'pro', name: 'Pro', price: 'See in the app', note: '3-day free trial · cancel anytime', cta: 'See current pricing', href: 'plans', featured: true },
      { key: 'max', name: 'Max', price: 'See in the app', note: 'Cancel anytime', cta: 'See current pricing', href: 'plans' },
      { key: 'institutional', name: 'Institutional', price: 'Custom', note: 'Talk to us', cta: 'Talk to sales', href: 'sales' },
    ],
    rowsTitle: 'What each plan includes',
    cols: ['', 'Starter', 'Pro', 'Max', 'Institutional'],
    rows: [
      ['Metrics', '70 core', 'Full library, incl. proprietary', 'Same as Pro', 'Same as Pro'],
      ['Assets', '100+', '1,000+', '1,000+', '1,000+'],
      ['Alerts', '1', '20', '100', '500+'],
      ['Dashboards', '—', '10', '25', 'Unlimited'],
      ['Alpha AI', 'On free metrics', 'Unlimited chat', 'Same as Pro', 'Same as Pro'],
      ['Research credits', '3', '20 / month', '50 / month', 'Unlimited'],
      ['History', '7 days', '12 months', 'Complete', 'Complete'],
      ['API', 'Pay-per-call · 30/min', '500k credits · 200/min', '2M · 500/min · webhooks', '5M+ · custom endpoints'],
      ['Export', '—', 'CSV / JSON', 'CSV / JSON', 'CSV / JSON'],
      ['SLA', '—', '24h', '4h', '1h + dedicated manager'],
    ],
    note: 'The price of paid plans comes from the app and is never fixed on this page.',
  },

  /* ---------------------------------------------------------------------- Compare (/vs/*) */
  blog: {
    eyebrow: 'RESEARCH & INSIGHTS',
    title: 'Research & Insights.',
    sub: 'In-depth crypto analytics, on-chain research and market insights from our team.',
    search: 'Search articles',
    all: 'All',
    count: (n) => `${n} ${n === 1 ? 'article' : 'articles'}`,
    empty: 'No article matches that search.',
    langNote: '',
    back: 'Research & Insights',
    keepReading: 'KEEP READING',
    keepReadingTitle: 'More from the research team.',
    ctaTitle: 'Want to explore these metrics yourself?',
    ctaText: 'The free plan needs no credit card.',
    ctaButton: 'Start free',
    minutes: 'min read',
    progress: 'Reading progress',
  },

  legal: {
    updated: 'Legal',
    contents: 'On this page',
    langNote: '',
    privacy: { meta: 'How Alphractal collects, uses, shares and protects personal information.' },
    terms: { meta: 'The terms that govern the use of the Alphractal website, platform, APIs and services.' },
  },

  vs: {
    heroEyebrow: 'COMPARISON',
    titleFn: (name) => `Alphractal vs ${name}`,
    matrixEyebrow: 'HONEST CAPABILITY MATRIX',
    matrixTitle: 'Where each one wins.',
    winner: 'Wins here',
    tie: 'Different focus',
    migrationEyebrow: 'MIGRATION',
    migrationTitle: 'Moving over, in three steps.',
    migration: [
      { title: 'Start free', text: 'No credit card. 100+ assets and 70 core metrics from day one.' },
      { title: 'Rebuild the charts you rely on', text: 'Start from a template, or compose your own chart with the no-code builder.' },
      { title: 'Ask Alpha AI, or call the API', text: 'Answers that cite their metrics, or REST access with pay-per-call credits on the free plan.' },
    ],
    faqEyebrow: 'FAQ',
    faqTitle: 'Before you switch.',
    priceNote: 'Prices for paid plans are shown in the app. API access with pay-per-call credits is available on the free plan.',
    cta: 'Start free',
    ctaTitle: ['See both,', 'then decide.'],
    all: 'Other comparisons',
    // VERIFICAR: rows below use only claims documented in the brief and the features doc.
    // Confirm each row against comparisonLandings.ts before launch, especially Coinglass and Messari.
    pages: {
      glassnode: {
        name: 'Glassnode',
        sub: 'Glassnode is the deepest on-chain catalogue in the market. Alphractal puts on-chain, derivatives, sentiment and macro on one screen.',
        rows: [
          { topic: 'Depth of on-chain metrics', winner: 'them', note: 'Glassnode’s on-chain catalogue is the deepest in the market.' },
          { topic: 'Macro next to on-chain', winner: 'us', note: 'Glassnode has no macro. Alphractal has a 46-panel macro terminal on the same timeline.' },
          { topic: 'API on the free tier', winner: 'us', note: 'Alphractal API access exists on every plan through pay-per-call credits. Glassnode’s API needs a paid plan.' },
          { topic: 'Proprietary models', winner: 'us', note: '23 models computed in-house, the ones users ask for by name.' },
        ],
        faq: [
          ['Is Alphractal as deep as Glassnode on on-chain data?', 'No. Glassnode is deeper on pure on-chain. Alphractal’s case is having on-chain, derivatives, sentiment and macro together.'],
          ['Can I use the API without paying?', 'Yes. Starter includes API access with pay-per-call credits, 30 requests a minute and 7 days of history.'],
        ],
      },
      nansen: {
        name: 'Nansen',
        sub: 'Nansen’s label graph is deeper. Alphractal adds macro and 23 proprietary models to the same screen.',
        rows: [
          { topic: 'Depth of the wallet label graph', winner: 'them', note: 'Nansen’s label graph is deeper.' },
          { topic: 'Trading from the same product', winner: 'them', note: 'Nansen positions signal-to-trade today. Alphractal’s Alpha Terminal is in testnet and not open yet.' },
          { topic: 'Macro next to on-chain', winner: 'us', note: 'Nansen has no macro. Alphractal has a 46-panel macro terminal.' },
          { topic: 'Proprietary models', winner: 'us', note: '23 models computed in-house.' },
        ],
        faq: [
          ['Does Alphractal let me trade?', 'Not today. Alphractal is read-only. Alpha Terminal is in testnet.'],
          ['Does Alphractal have wallet labels?', 'Nansen’s label graph is deeper. Alphractal’s focus is metrics, models, macro and cited AI.'],
        ],
      },
      coinglass: {
        name: 'Coinglass',
        sub: 'Coinglass is built around derivatives. Alphractal keeps derivatives and adds deep on-chain, sentiment and macro.',
        rows: [
          { topic: 'Derivatives-focused data', winner: 'tie', note: 'Coinglass is built around derivatives. Alphractal covers derivatives alongside the other domains.' },
          { topic: 'Deep on-chain', winner: 'us', note: 'Coinglass does not have deep on-chain. Alphractal has 14 years of on-chain history.' },
          { topic: 'Macro', winner: 'us', note: 'Coinglass has no macro. Alphractal has 46 macro panels.' },
          { topic: 'Composed alerts in one rule', winner: 'us', note: 'A single rule combining domains with AND/OR, such as funding above the 99th percentile and DXY rising.' },
        ],
        faq: [
          ['Can Alphractal replace Coinglass for derivatives?', 'For many workflows, yes: funding, open interest, long/short and liquidations are in the library. Check the depth you need on the free plan first.'],
          ['What is a composed alert?', 'One rule that combines conditions across domains, for example funding and a macro series, and sends one notification.'],
        ],
      },
      messari: {
        name: 'Messari',
        sub: 'Messari is known for research coverage. Alphractal’s reports carry live charts, and the terminal is one click away.',
        rows: [
          { topic: 'Long-form research coverage', winner: 'tie', note: 'Messari is known for research. Alphractal publishes in-house reports with live charts embedded.' },
          { topic: 'Live charts inside reports', winner: 'us', note: 'Our reports carry the chart, not a picture of it, so the number is the number right now.' },
          { topic: 'Macro next to on-chain', winner: 'us', note: 'A 46-panel macro terminal on the same timeline.' },
          { topic: 'Proprietary models', winner: 'us', note: '23 models computed in-house.' },
        ],
        faq: [
          ['Does Alphractal publish research?', 'Yes, in-house reports with live charts, voice narration by chapter and a visible version history.'],
          ['Is there a free plan?', 'Yes. Starter is free forever, with no credit card.'],
        ],
      },
    },
  },
}
