/* Copy for /vs/glassnode, /vs/nansen, /vs/coinglass and /vs/messari.
   Source: pacote/Textos/Comparacao *.md (reviewed 19 October 2026). Do not add numbers, prices or claims that are not in the spec. */

const TERMINAL = ['Alpha Terminal is upcoming. ', { to: '/terminal', label: 'Visit its product page' }, ' for availability.']

const ALPHRACTAL = {
  focus: 'Metrics, market context, AI and research in one analytics workflow.',
  data: 'On-chain, derivatives, sentiment and macro data; coverage varies by metric and asset.',
  models: 'Models including CVDD Channel, Repetition Fractal Cycle and Structural Market Bands.',
  ai: 'Alpha AI in the platform; MCP for compatible external assistants and agents.',
  charts: 'Custom dashboards, saved views and chart exploration.',
  dev: 'REST API and MCP; permissions, credits and limits apply.',
  research: 'Reports connected to the platform’s analytics; Academy for interpretation.',
  pricing: 'Start free; check current plans and feature access in the app.',
  trading: TERMINAL,
  fits: 'Analysts and traders connecting valuation, leverage, sentiment and macro.',
}

const FIT = 'See the workflow guidance below.'

const SRC_ALPHRACTAL = [
  { label: 'Alphractal metrics', href: 'https://alphractal.com/platform/metrics' },
  { label: 'Alphractal API documentation', href: 'https://docs.alphractal.com/' },
]

const COMMON_FAQ = {
  replace: {
    q: 'Do I need to replace every tool at once?',
    a: 'No. Start with the workflows Alphractal covers and compare the results. Keep specialist tools where your process needs them.',
  },
  pricing: {
    q: 'Where can I check pricing and access?',
    a: 'Review the current plans in the Alphractal app and the competitor’s official product pages. API and data permissions may differ from access to the visual platform.',
  },
}

const row = (topic, key, them) => ({ topic, us: ALPHRACTAL[key], them })

const vs = {
  common: {
    eyebrow: 'COMPARISON',
    cta: 'Start free',
    heroMore: 'Compare the workflow',
    comparisonEyebrow: 'Comparison',
    comparisonTitle: 'Where each one wins',
    comparisonIntro: 'Different strengths. Compare the data, tools and access your own workflow needs.',
    tableCaption: 'Alphractal compared with',
    topic: 'Topic',
    guidanceLabel: 'How to choose',
    reviewed: 'Last reviewed: 19 October 2026. Features and access can change. Check the current product documentation and plan terms.',
    sourcesLabel: 'Public sources',
    stepsEyebrow: 'Migration',
    stepsTitle: 'Moving over, in three steps',
    steps: [
      { title: 'Start free', text: 'Explore the platform and check access to the assets and metrics you use.' },
      { title: 'Rebuild the view you rely on', text: 'Bring your key charts into a workspace and compare their definitions, coverage and history.' },
      {
        title: 'Continue the analysis',
        text: 'Ask Alpha AI, explore the research or use the API and MCP in your own workflow, within the access available to your account.',
      },
    ],
    switchEyebrow: 'FAQ',
    switchTitle: 'Before you switch',
    switchIntro:
      'For the parts of your research Alphractal covers, you can bring metrics, dashboards, monitoring, research and AI into one platform. Start with your actual workflow and check what you can consolidate.',
    othersLabel: 'Other comparisons',
    ctaTitle: ['See both, then decide.'],
    ctaSub: 'Test the metrics and workflow that matter to you.',
    ctaSecondary: 'View plans',
    breadcrumbHome: 'Home',
    breadcrumbVs: 'Comparisons',
  },
  order: ['glassnode', 'nansen', 'coinglass', 'messari'],
  pages: {
    glassnode: {
      name: 'Glassnode',
      logoFile: 'public/vs/glassnode-logo.svg',
      support: 'Compare the workflow behind your market view.',
      sub: 'Explore how Alphractal brings metrics, macro context, AI and research into one workflow alongside Glassnode’s digital asset intelligence offering.',
      meta: {
        title: 'Alphractal vs Glassnode | Crypto Analytics Comparison',
        description:
          'Compare Alphractal and Glassnode by data coverage, research, analytics, AI workflows and access. Find the fit for your crypto market research.',
      },
      rows: [
        row('Product focus', 'focus', 'Unified spot, futures, options, ETF and on-chain intelligence.'),
        row('Data and metric coverage', 'data', 'On-chain and broader digital asset datasets.'),
        row('Proprietary analytics', 'models', 'Metric catalogue and analytical tooling; methodology differs.'),
        row('AI and agent workflows', 'ai', 'MCP appears among Studio chart access options; confirm setup and eligibility.'),
        row('Charting and workspace', 'charts', 'Studio, Workbench formulas and dashboards.'),
        row('Developer access', 'dev', 'Documented API with access and usage limits.'),
        row('Research', 'research', 'Market research and educational publications.'),
        row('Pricing and access', 'pricing', 'Compare the current plan and API terms.'),
        row('Trading and execution', 'trading', 'Execution availability was not assessed; analytics are the focus of this comparison.'),
        row('Who it fits', 'fits', FIT),
      ],
      guidance:
        'Choose Glassnode when its metric coverage, Studio and Workbench fit the depth of your on-chain and digital asset research. Explore Alphractal when you want to combine its proprietary models, macro context, Alpha AI and research in your daily workflow.',
      sources: [
        { label: 'Glassnode product', href: 'https://glassnode.com/' },
        { label: 'Glassnode tooling', href: 'https://docs.glassnode.com/' },
        { label: 'Workbench and formulas', href: 'https://studio.glassnode.com/dashboards/workbench-function-examples?a=BTC' },
        { label: 'Studio access options', href: 'https://studio.glassnode.com/charts/workbench-round' },
        ...SRC_ALPHRACTAL,
      ],
      faq: [
        {
          q: 'Is Glassnode only an on-chain platform?',
          a: 'No. Its public offering also includes spot, futures, options and ETF intelligence. Compare the actual datasets and tooling your workflow needs.',
        },
        {
          q: 'Why consider Alphractal?',
          a: 'Evaluate its models and the way metrics, macro, AI and research connect. Test the specific assets and charts you need before changing tools.',
        },
        COMMON_FAQ.replace,
        COMMON_FAQ.pricing,
      ],
    },

    nansen: {
      name: 'Nansen',
      logoFile: 'public/vs/nansen-logo.svg',
      support: 'Compare wallet intelligence with your broader market workflow.',
      sub: 'Explore Alphractal’s metrics, models and macro context alongside Nansen’s wallet, token and Smart Money analytics.',
      meta: {
        title: 'Alphractal vs Nansen | Crypto Analytics Comparison',
        description:
          'Compare Alphractal and Nansen by data coverage, research, analytics, AI workflows and access. Find the fit for your crypto market research.',
      },
      rows: [
        row('Product focus', 'focus', 'Wallet and token analytics, Smart Money activity and an AI-assisted trading experience.'),
        row('Data and metric coverage', 'data', 'Wallet profiling, token screening and Smart Money datasets.'),
        row('Proprietary analytics', 'models', 'Wallet and entity intelligence; methodology differs.'),
        row('AI and agent workflows', 'ai', 'Nansen AI Agent and documented MCP connections.'),
        row('Charting and workspace', 'charts', 'Token, wallet and portfolio interfaces.'),
        row('Developer access', 'dev', 'API covering Smart Money, Profiler and token workflows.'),
        row('Research', 'research', 'Product guides and market intelligence.'),
        row('Pricing and access', 'pricing', 'Check current subscription and API-credit terms.'),
        row(
          'Trading and execution',
          'trading',
          'The AI Agent documentation describes trading-related workflows; availability depends on product and access.',
        ),
        row('Who it fits', 'fits', FIT),
      ],
      guidance:
        'Choose Nansen when wallet behavior, Smart Money activity and token-level investigation drive your research. Explore Alphractal when valuation, market cycles, leverage and macro context are central to the view you want to build.',
      sources: [
        { label: 'Nansen API overview', href: 'https://docs.nansen.ai/api/overview' },
        { label: 'Nansen AI Agent', href: 'https://academy.nansen.ai/en/help/articles/6620481-nansen-agent' },
        { label: 'Nansen MCP', href: 'https://docs.nansen.ai/mcp/connecting' },
        ...SRC_ALPHRACTAL,
      ],
      faq: [
        {
          q: 'Does Nansen have AI or MCP?',
          a: 'Yes. Nansen documents both its AI Agent and MCP connections. The distinction is the workflow and data you need, not an absence of AI.',
        },
        {
          q: 'Can I trade through Alphractal today?',
          a: 'Alpha Terminal is an upcoming product. Keep analysis in the platform separate from the Terminal’s availability, which is explained on its',
          link: { label: 'product page', to: '/terminal' },
          after: '.',
        },
        COMMON_FAQ.replace,
        COMMON_FAQ.pricing,
      ],
    },

    coinglass: {
      name: 'CoinGlass',
      logoFile: 'public/vs/coinglass-logo.svg',
      support: 'Put derivatives into your wider market context.',
      sub: 'Compare the derivatives tools you rely on with a workflow that also connects on-chain behavior, sentiment, macro data and Alphractal models.',
      meta: {
        title: 'Alphractal vs CoinGlass | Crypto Analytics Comparison',
        description:
          'Compare Alphractal and CoinGlass by data coverage, research, analytics, AI workflows and access. Find the fit for your crypto market research.',
      },
      rows: [
        row('Product focus', 'focus', 'Futures, spot, options, ETF and derivatives analytics.'),
        row('Data and metric coverage', 'data', 'Funding, open interest, liquidations and market datasets.'),
        row('Proprietary analytics', 'models', 'Order-flow and liquidation analytics; methodologies differ.'),
        row('AI and agent workflows', 'ai', 'CoinGlass documents an MCP service in beta.'),
        row('Charting and workspace', 'charts', 'Liquidation heatmaps, maps and derivatives views.'),
        row('Developer access', 'dev', 'Documented crypto market API.'),
        row('Research', 'research', 'Data tools support market investigation; editorial scope is not ranked here.'),
        row('Pricing and access', 'pricing', 'Check current product and API plans.'),
        row('Trading and execution', 'trading', 'This comparison assesses data and analytics, not order execution.'),
        row('Who it fits', 'fits', FIT),
      ],
      guidance:
        'Choose CoinGlass when its derivatives datasets and liquidation tools fit your monitoring process. Explore Alphractal when you want to test that positioning against on-chain, sentiment, cycle and macro information in the same research workflow.',
      sources: [
        { label: 'CoinGlass API and data coverage', href: 'https://www.coinglass.com/CryptoApi' },
        { label: 'CoinGlass MCP beta', href: 'https://docs.coinglass.com/reference/mcp-service' },
        ...SRC_ALPHRACTAL,
      ],
      faq: [
        {
          q: 'Does CoinGlass provide liquidation heatmaps and MCP?',
          a: 'Yes. Both are documented publicly. Compare the coverage and methods rather than assuming these features are exclusive to Alphractal.',
        },
        {
          q: 'Can Alphractal cover my derivatives workflow?',
          a: 'Check funding, open interest, long/short and liquidation data for the assets and exchanges you use. Then compare the additional context its other data families provide.',
        },
        COMMON_FAQ.replace,
        COMMON_FAQ.pricing,
      ],
    },

    messari: {
      name: 'Messari',
      logoFile: 'public/vs/messari-logo.svg',
      support: 'Connect research to the data you want to explore.',
      sub: 'Compare Alphractal’s analytics-led research workflow with Messari’s research, diligence and market intelligence offering.',
      meta: {
        title: 'Alphractal vs Messari | Crypto Analytics Comparison',
        description:
          'Compare Alphractal and Messari by data coverage, research, analytics, AI workflows and access. Find the fit for your crypto market research.',
      },
      rows: [
        row('Product focus', 'focus', 'Research, diligence, asset screening and event monitoring.'),
        row('Data and metric coverage', 'data', 'Market, on-chain, research and qualitative intelligence.'),
        row('Proprietary analytics', 'models', 'Research and analytical datasets; methodologies differ.'),
        row('AI and agent workflows', 'ai', 'Copilot, Deep Research and MCP are described publicly.'),
        row('Charting and workspace', 'charts', 'Screeners, portals and research interfaces.'),
        row('Developer access', 'dev', 'API integrations; legacy docs direct new integrations to Blockworks.'),
        row('Research', 'research', 'Research library and institutional diligence workflows.'),
        row('Pricing and access', 'pricing', 'A free entry point is advertised; compare current terms.'),
        row('Trading and execution', 'trading', 'Trading execution is not assessed in this research comparison.'),
        row('Who it fits', 'fits', FIT),
      ],
      guidance:
        'Choose Messari when protocol research, diligence and event monitoring are central to your work. Explore Alphractal when you want to move between market reports, metrics, valuation models, leverage and a workspace for your own analysis.',
      // Spec: the official home says Messari now integrates Blockworks and messari.io will be discontinued. Keep a context note; never say the product ended.
      contextNote:
        'Context: Messari’s official pages mention a transition involving Blockworks. Check the current official destinations before you decide.',
      sources: [
        { label: 'Messari current product', href: 'https://messari.io/' },
        { label: 'API transition and coverage', href: 'https://docs.messari.io/introduction' },
        ...SRC_ALPHRACTAL,
      ],
      faq: [
        {
          q: 'Is Messari only a paid research library?',
          a: 'No. Its current site describes a free entry point, AI research and integrations. Evaluate the current product rather than an older description.',
        },
        {
          q: 'Why explore Alphractal for research?',
          a: 'Use the reports as a starting point, inspect the underlying metrics and continue the analysis with the platform’s charts and models.',
        },
        COMMON_FAQ.replace,
        COMMON_FAQ.pricing,
      ],
    },
  },
}

export default vs
