/*
 * One-off migration of the live site's legal pages and blog posts into src/content/*.json.
 * The live site only renders these routes on client-side navigation, so we drive its own router.
 *   node scripts/migrate-content.mjs
 * Requires Microsoft Edge (playwright-core, channel "msedge").
 */
import { chromium } from 'playwright-core'
import fs from 'node:fs'

const BASE = 'https://alphractal.com'
const OUT = new URL('../src/content/', import.meta.url)
const slugs = [...(await (await fetch(`${BASE}/sitemap.xml`)).text()).matchAll(/<loc>[^<]*\/blog\/([^<]+)<\/loc>/g)].map((m) => m[1])

const browser = await chromium.launch({ channel: 'msedge', headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
await page.waitForTimeout(1500)

const goto = async (path) => {
  await page.evaluate((p) => window.next.router.push(p), path)
  await page.waitForFunction((p) => location.pathname === p, path, { timeout: 20000 })
  await page.waitForTimeout(900)
}

// Runs inside the page. Only whitelisted tags survive; classes, styles and scripts are dropped.
function extractLegal() {
  const ALLOW = new Set(['h2', 'h3', 'h4', 'p', 'ul', 'ol', 'li', 'strong', 'em', 'b', 'i', 'a', 'hr', 'blockquote', 'code', 'br'])
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const walk = (node) => {
    let out = ''
    node.childNodes.forEach((n) => {
      if (n.nodeType === 3) out += esc(n.textContent)
      else if (n.nodeType === 1) {
        const t = n.tagName.toLowerCase()
        if (!ALLOW.has(t)) return void (out += walk(n))
        if (t === 'hr' || t === 'br') return void (out += `<${t}>`)
        const href = t === 'a' ? n.getAttribute('href') : null
        out += `<${t}${href ? ` href="${href.replace(/"/g, '&quot;')}"` : ''}>${walk(n)}</${t}>`
      }
    })
    return out
  }
  let c = document.querySelector('h1')
  while (c.parentElement && c.parentElement.querySelectorAll('h2').length < 3) c = c.parentElement
  c = c.parentElement || c
  const html = [...c.children]
    .filter((k) => k.tagName !== 'H1')
    .map((k) => walk({ childNodes: [k] }))
    .join('')
  return { title: document.querySelector('h1').innerText, html }
}

function extractPost() {
  const ALLOW = new Set(['h2', 'h3', 'h4', 'p', 'ul', 'ol', 'li', 'strong', 'em', 'b', 'i', 'a', 'hr', 'blockquote', 'code', 'pre', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'br', 'sup', 'sub'])
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const walk = (node) => {
    let out = ''
    node.childNodes.forEach((n) => {
      if (n.nodeType === 3) out += esc(n.textContent)
      else if (n.nodeType === 1) {
        const t = n.tagName.toLowerCase()
        if (!ALLOW.has(t)) return void (out += walk(n))
        if (t === 'hr' || t === 'br') return void (out += `<${t}>`)
        const href = t === 'a' ? n.getAttribute('href') : null
        out += `<${t}${href ? ` href="${href.replace(/"/g, '&quot;')}"` : ''}>${walk(n)}</${t}>`
      }
    })
    return out
  }
  const art = document.querySelector('article')
  const header = art.querySelector('header')
  const title = art.querySelector('h1').innerText
  const lines = header.innerText
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => s && s !== '·' && s !== 'Back to Blog')
  const i = lines.indexOf(title)
  const [author, date, read] = lines.slice(i + 1)
  const html = [...art.children]
    .filter((k) => k !== header)
    .map((k) => walk({ childNodes: [k] }))
    .join('')
  const meta = document.querySelector('meta[name="description"]')
  return { title, tags: lines.slice(0, i), author, date, read, description: meta ? meta.content : '', html }
}

const legal = {}
for (const key of ['privacy', 'terms']) {
  await goto(`/${key}`)
  legal[key] = await page.evaluate(extractLegal)
  console.log('legal', key, legal[key].html.length)
}
fs.writeFileSync(new URL('legal.json', OUT), JSON.stringify(legal, null, 1))

const posts = []
for (const slug of slugs) {
  try {
    await goto(`/blog/${slug}`)
    const post = await page.evaluate(extractPost)
    posts.push({ slug, ...post })
    console.log(String(posts.length).padStart(2), slug, '|', post.date, '|', post.read, '|', post.html.length)
  } catch (e) {
    console.log('FAILED', slug, e.message.split('\n')[0])
  }
}
// The new site has its own back link and CTA, so the old ones are removed; dates become ISO.
for (const p of posts) {
  p.html = p.html
    .replace(/^<a href="\/blog">Back to Blog<\/a>/, '')
    .replace(/<p>Want to explore these metrics yourself\?<\/p><a href="[^"]*">Start Free[^<]*<\/a>$/, '')
  p.iso = new Date(`${p.date} UTC`).toISOString().slice(0, 10)
  p.minutes = parseInt(p.read, 10)
}
posts.sort((a, b) => b.iso.localeCompare(a.iso))
fs.writeFileSync(new URL('blog.json', OUT), JSON.stringify(posts))
console.log('posts', posts.length, 'of', slugs.length)
await browser.close()
