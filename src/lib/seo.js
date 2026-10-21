// Single source for per-route metadata and structured data (pacote/SEO/metadata.csv + SEO tecnico.md).
// Pages call useMeta() as before; for any route listed here this table wins, so titles, descriptions and the
// JSON-LD graph stay consistent and the Organization is declared once per page, never duplicated.

export const ORIGIN = 'https://alphractal.com'
const ORG_ID = `${ORIGIN}/#organization`

const ROUTES = {
  '/': {
    og: '/og/home.png',
    title: 'Alphractal | Crypto Analytics, Metrics & Alpha AI',
    description: 'Explore crypto market data, proprietary models, dashboards, research and Alpha AI in one analytics platform.',
    type: 'WebPage',
  },
  '/platform/metrics': {
    og: '/og/metrics.png',
    title: 'Crypto Metrics & Models | Alphractal',
    description: 'Explore on-chain, derivatives, sentiment and macro metrics, proprietary models and coverage across supported assets and exchanges.',
    type: 'SoftwareApplication',
    crumb: 'Metrics & Models',
    app: 'Crypto Metrics & Models',
  },
  '/platform/alpha-ai': {
    og: '/og/alpha-ai.png',
    title: 'Alpha AI | Crypto Market Analysis with Alphractal Data',
    description: 'Explore on-chain, derivatives, sentiment and macro data with Alpha AI. Ask market questions and investigate your thesis.',
    type: 'SoftwareApplication',
    crumb: 'Alpha AI',
    app: 'Alpha AI',
  },
  '/platform/mcp': {
    og: '/og/mcp.png',
    title: 'Alphractal MCP | Crypto Data for AI Assistants & Agents',
    description: 'Connect compatible AI assistants to Alphractal metrics, charts, screening data and research through MCP.',
    type: 'SoftwareApplication',
    crumb: 'MCP',
    app: 'Alphractal MCP',
  },
  '/platform/api': {
    og: '/og/api.png',
    title: 'Crypto Data API | Alphractal',
    description: 'Integrate market, on-chain, derivatives, liquidation, sentiment and macro data through Alphractal REST endpoints.',
    type: 'SoftwareApplication',
    crumb: 'API',
    app: 'Crypto Data API',
  },
  '/platform/dashboards': {
    og: '/og/dashboards.png',
    title: 'Crypto Dashboards, Alerts & Screeners | Alphractal',
    description: 'Build research dashboards, monitor supported metrics and compare assets through Alphractal screeners.',
    type: 'SoftwareApplication',
    crumb: 'Dashboards, Alerts & Screeners',
    app: 'Crypto Dashboards, Alerts & Screeners',
  },
  '/platform/research': {
    og: '/og/research.png',
    title: 'Research & Academy | Alphractal',
    description: 'Explore Alphractal research, inspect the underlying metrics and learn how to interpret crypto market data.',
    type: 'WebPage',
    crumb: 'Research & Academy',
  },
  '/about': {
    og: '/og/about.png',
    title: 'About Alphractal | Our Team, Research & Community',
    description: 'Meet the team behind Alphractal and the global community helping shape the platform through research and feedback.',
    type: 'AboutPage',
    crumb: 'About',
  },
  '/vs/glassnode': {
    og: '/og/vs-glassnode.png',
    title: 'Alphractal vs Glassnode | Crypto Analytics Comparison',
    description: 'Compare Alphractal and Glassnode by data coverage, research, analytics, AI workflows and access.',
    type: 'WebPage',
    crumb: 'Alphractal vs Glassnode',
  },
  '/vs/nansen': {
    og: '/og/vs-nansen.png',
    title: 'Alphractal vs Nansen | Crypto Analytics Comparison',
    description: 'Compare Alphractal and Nansen by data coverage, research, analytics, AI workflows and access.',
    type: 'WebPage',
    crumb: 'Alphractal vs Nansen',
  },
  '/vs/coinglass': {
    og: '/og/vs-coinglass.png',
    title: 'Alphractal vs CoinGlass | Crypto Analytics Comparison',
    description: 'Compare Alphractal and CoinGlass by data coverage, research, analytics, AI workflows and access.',
    type: 'WebPage',
    crumb: 'Alphractal vs CoinGlass',
  },
  '/vs/messari': {
    og: '/og/vs-messari.png',
    title: 'Alphractal vs Messari | Crypto Analytics Comparison',
    description: 'Compare Alphractal and Messari by data coverage, research, analytics, AI workflows and access.',
    type: 'WebPage',
    crumb: 'Alphractal vs Messari',
  },
}

// Routes in the sitemap: only the indexable pages of the final inventory. /terminal and /institutional are
// deferred ("a fechar na revisão da página") and join when their pages are closed.
export const SITEMAP_PATHS = Object.keys(ROUTES)

const norm = (p) => (p.length > 1 ? p.replace(/\/+$/, '') : p)

export const seoFor = (pathname) => ROUTES[norm(pathname)] || null

// 1200×630 share cover of a route (public/og, made in Figma). Absolute URL for og:image / twitter:image.
export const ogImageFor = (pathname) => {
  const r = ROUTES[norm(pathname)]
  return r && r.og ? `${ORIGIN}${r.og}` : null
}

/* One graph per route: the shared Organization + WebSite, the page itself, a SoftwareApplication on product pages
   and a BreadcrumbList (no removed hub). Only facts already on the page; no ratings, offers or prices. */
export function graphFor(pathname) {
  const path = norm(pathname)
  const r = ROUTES[path]
  if (!r) return null
  const url = `${ORIGIN}${path === '/' ? '/' : path}`
  const pageId = `${url}#webpage`
  const graph = [
    {
      '@type': 'Organization',
      '@id': ORG_ID,
      name: 'Alphractal',
      url: `${ORIGIN}/`,
      logo: `${ORIGIN}/brand/logo-icon.svg`,
      foundingDate: '2023',
    },
    { '@type': 'WebSite', '@id': `${ORIGIN}/#website`, url: `${ORIGIN}/`, name: 'Alphractal', inLanguage: 'en', publisher: { '@id': ORG_ID } },
    {
      '@type': r.type === 'AboutPage' ? 'AboutPage' : 'WebPage',
      '@id': pageId,
      url,
      name: r.title,
      description: r.description,
      inLanguage: 'en',
      isPartOf: { '@id': `${ORIGIN}/#website` },
      about: { '@id': ORG_ID },
      ...(path !== '/' ? { breadcrumb: { '@id': `${url}#breadcrumb` } } : {}),
    },
  ]
  if (r.type === 'SoftwareApplication') {
    graph.push({
      '@type': 'SoftwareApplication',
      '@id': `${url}#software`,
      name: r.app,
      url,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      publisher: { '@id': ORG_ID },
    })
  }
  if (path !== '/') {
    const items = [{ '@type': 'ListItem', position: 1, name: 'Home', item: `${ORIGIN}/` }]
    items.push({ '@type': 'ListItem', position: 2, name: r.crumb, item: url })
    graph.push({ '@type': 'BreadcrumbList', '@id': `${url}#breadcrumb`, itemListElement: items })
  }
  return { '@context': 'https://schema.org', '@graph': graph }
}
