/*
 * Static prerendering. Runs after the client and SSR builds: renders every public route to
 * a real HTML string (via src/entry-server.jsx) and writes it as <route>/index.html inside
 * dist/client, so crawlers and "view source" get full markup with no JavaScript required.
 * See D:\alphractal\Alphractal_Guia_Frontend_Landing_v2.pdf §2 (rendering) and §11 (QA checklist).
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { ORIGIN, SITEMAP_PATHS } from '../src/lib/seo.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const clientDir = join(root, 'dist/client')
const serverEntry = join(root, 'dist/server/entry-server.js')

const FEATURE_SLUGS = ['alpha-ai', 'metrics', 'mcp', 'api', 'dashboards', 'research']
const VS_SLUGS = ['glassnode', 'nansen', 'coinglass', 'messari']

const routes = [
  '/',
  ...FEATURE_SLUGS.map((s) => `/platform/${s}`),
  '/terminal',
  '/institutional',
  '/about',
  ...VS_SLUGS.map((s) => `/vs/${s}`),
  '/privacy',
  '/terms',
]

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function injectHead(html, head) {
  if (!head) return html
  let out = html
  out = out.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(head.title)}</title>`)
  out = out.replace(
    /<meta[^>]*\bname="description"[^>]*>/,
    head.description ? `<meta name="description" content="${esc(head.description)}" />` : '<meta name="description" content="" />',
  )
  out = out.replace(/<meta[^>]*\bproperty="og:title"[^>]*>/, `<meta property="og:title" content="${esc(head.title)}" />`)
  out = out.replace(
    /<meta[^>]*\bproperty="og:description"[^>]*>/,
    head.description ? `<meta property="og:description" content="${esc(head.description)}" />` : '<meta property="og:description" content="" />',
  )
  out = out.replace(/<meta[^>]*\bproperty="og:url"[^>]*>/, `<meta property="og:url" content="${esc(head.url)}" />`)
  out = out.replace(/<link[^>]*\brel="canonical"[^>]*>/, `<link rel="canonical" href="${esc(head.url)}" />`)
  out = out.replace(
    /<meta[^>]*\bname="robots"[^>]*>/,
    `<meta name="robots" content="${head.noindex ? 'noindex' : 'index,follow'}" />`,
  )
  const social = [
    `<meta property="og:site_name" content="Alphractal" />`,
    `<meta name="twitter:card" content="${head.image ? 'summary_large_image' : 'summary'}" />`,
    head.image ? `<meta property="og:image" content="${esc(head.image)}" />` : '',
    head.image ? '<meta property="og:image:width" content="1200" />' : '',
    head.image ? '<meta property="og:image:height" content="630" />' : '',
    head.image ? `<meta property="og:image:alt" content="${esc(head.title)}" />` : '',
    head.image ? `<meta name="twitter:image" content="${esc(head.image)}" />` : '',
    `<meta name="twitter:title" content="${esc(head.title)}" />`,
    head.description ? `<meta name="twitter:description" content="${esc(head.description)}" />` : '',
  ].filter(Boolean)
  out = out.replace('</head>', `${social.join('\n    ')}\n  </head>`)
  if (head.jsonLd) {
    const script = `<script type="application/ld+json" data-page="true">${JSON.stringify(head.jsonLd)}</script>\n  </head>`
    out = out.replace('</head>', script)
  }
  return out
}

function injectBody(html, appHtml) {
  return html.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`)
}

function outPathFor(route) {
  if (route === '/') return join(clientDir, 'index.html')
  return join(clientDir, route.replace(/^\//, ''), 'index.html')
}

async function main() {
  const template = readFileSync(join(clientDir, 'index.html'), 'utf-8')
  const { render } = await import(pathToFileURL(serverEntry))

  const failures = []

  for (const route of [...routes, '__404__']) {
    const url = route === '__404__' ? '/this-page-does-not-exist' : route
    try {
      const { html: appHtml, head } = await render(url)
      let page = injectBody(template, appHtml)
      page = injectHead(page, head)
      const outPath = route === '__404__' ? join(clientDir, '404.html') : outPathFor(route)
      mkdirSync(dirname(outPath), { recursive: true })
      writeFileSync(outPath, page)
      console.log(`  ${route === '__404__' ? '404.html' : route}`)
    } catch (err) {
      failures.push({ route, err })
    }
  }

  // sitemap.xml + robots.txt from the final inventory (lib/seo.js). No lastmod: none is tracked per real content change.
  const urls = SITEMAP_PATHS.map((p) => `  <url><loc>${ORIGIN}${p === '/' ? '/' : p}</loc></url>`).join('\n')
  writeFileSync(
    join(clientDir, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
  )
  writeFileSync(join(clientDir, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${ORIGIN}/sitemap.xml\n`)

  rmSync(join(root, 'dist/server'), { recursive: true, force: true })

  if (failures.length) {
    console.error(`\nPrerender failed for ${failures.length} route(s):`)
    for (const { route, err } of failures) console.error(`  ${route}: ${err?.stack || err}`)
    process.exit(1)
  }

  console.log(`\nPrerendered ${routes.length} routes + 404.html`)
}

main()
