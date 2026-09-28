// Single source of truth for every number on the site (brief §7.1).
// If a number is not here, it is not verified and does not go on the page.
// Verified 28 Jul 2026 unless flagged.

export const FACTS = {
  metrics: 1500, // VERIFICAR: categories sum to ~1,013 — confirm total or hide per-category counts (brief §10 #5)
  models: 23, // VERIFICAR: app docs say 29, code has 28 chart pages (brief §10 #6)
  assetsPaid: 1000,
  assetsFree: 100,
  countries: 130,
  traders: 1800,
  onchainHistoryYears: 14,
  exchanges: 17,
  mcpTools: 47,
  mcpReadTools: 39,
  mcpWriteTools: 8,
  macroPanels: 46,
  founded: 2023,
  updateWindow: '1–5 min',
  mcpEndpoint: 'https://mcp.alphractal.com/mcp',
  appUrl: 'https://app.alphractal.com',
}

// Onboarding survey, n = 1,845 (brief §1). Percentages only.
export const AUDIENCE = {
  n: 1845,
  rows: [
    { key: 'traders', value: 63 },
    { key: 'holders', value: 55 },
    { key: 'goal', value: 59 },
    { key: 'btc', value: 74 },
    { key: 'proprietary', value: 53 },
  ],
}

// ASSUMED (confirm with the Alphractal team): docs, sales, waitlist and the social URLs.
// app.alphractal.com/plans comes from the brief (§5.7).
export const CONTACT = 'hello@alphractal.com'

export const LINKS = {
  docs: 'https://docs.alphractal.com',
  plans: 'https://app.alphractal.com/plans',
  sales: `mailto:${CONTACT}?subject=Alphractal%20Institutional`,
  waitlist: `mailto:${CONTACT}?subject=Alpha%20Terminal%20waitlist`,
  careers: `mailto:${CONTACT}?subject=Careers`,
  login: 'https://app.alphractal.com',
  start: 'https://app.alphractal.com',
  x: 'https://x.com/alphractal',
  telegram: 'https://t.me/alphractal',
  linkedin: 'https://www.linkedin.com/company/alphractal',
}
