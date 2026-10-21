// Single source of truth for every number on the site (brief §7.1).
// If a number is not here, it is not verified and does not go on the page.
// Verified 28 Jul 2026 unless flagged.

export const FACTS = {
  metrics: 1500, // VERIFICAR: categories sum to ~1,013 — confirm total or hide per-category counts (brief §10 #5)
  models: 23, // VERIFICAR: app docs say 29, code has 28 chart pages (brief §10 #6)
  assetsPaid: 1000,
  assetsFree: 100,
  countries: 130,
  traders: 30000, // Home trust strip (Guia 20 Oct 2026): "30,000 Traders & Analysts"
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
  plans: 'https://app.alphractal.com/plans?site_referrer=direct',
  sales: `mailto:${CONTACT}?subject=Alphractal%20Institutional`,
  waitlist: `mailto:${CONTACT}?subject=Alpha%20Terminal%20waitlist`,
  careers: `mailto:${CONTACT}?subject=Careers`,
  login: 'https://app.alphractal.com',
  start: 'https://app.alphractal.com',
  x: 'https://x.com/alphractal',
  telegram: 'https://t.me/alphractal',
  linkedin: 'https://www.linkedin.com/company/alphractal',
  // PENDING Gustavo (final link review): community group and the ambassador chat. Placeholders until he sends them.
  community: 'https://t.me/alphractal',
  ambassador: 'https://t.me/alphractal',
}

// The ten approved posts, in the order of the brief (public/proof/*.webp). Never linked from the site.
export const PROOF_POSTS = [
  { file: '01-coin-bureau', by: 'Coin Bureau' },
  { file: '02-james-bitcoin', by: 'James' },
  { file: '03-james-baleias', by: 'James' },
  { file: '04-whale-factor', by: 'Whale Factor' },
  { file: '05-killa', by: 'Killa' },
  { file: '06-mignolet-sentimento', by: 'Mignolet' },
  { file: '07-mignolet-analise', by: 'Mignolet' },
  { file: '08-rafaela', by: 'Rafaela Romano' },
  { file: '09-catalina', by: 'Catalina' },
  { file: '10-timpar', by: 'Timpar' },
]

// Alpha Squad: 14 people, profile photo + name + one public network each (Textos/Alpha Squad materiais.md).
// X for everyone except Orlando on Crypto (YouTube). Never Telegram.
export const SQUAD = [
  { name: 'Ziz Crypto', net: 'X', url: 'https://x.com/_Crypto_glass', photo: 'ziz-crypto' },
  { name: 'Timpar', net: 'X', url: 'https://x.com/Timpar8', photo: 'timpar' },
  { name: 'Crazzy Blockk', net: 'X', url: 'https://x.com/Crazzyblockk', photo: 'crazzy-blockk' },
  { name: 'Rei (Satou rei)', net: 'X', url: 'https://x.com/Satoureireal', photo: 'rei' },
  { name: 'Boris (FundingVest)', net: 'X', url: 'https://x.com/Fundingvest', photo: 'boris-fundingvest' },
  { name: 'Killa', net: 'X', url: 'https://x.com/KillaXBT', photo: 'killa' },
  { name: 'Ali Charts', net: 'X', url: 'https://x.com/alicharts', photo: 'ali-charts' },
  { name: 'Gaah', net: 'X', url: 'https://x.com/gaah_im', photo: 'gaah' },
  { name: 'Abram Chart', net: 'X', url: 'https://x.com/abramchart', photo: 'abram-chart' },
  { name: 'Alex Crypto', net: 'X', url: 'https://x.com/AlexCryptoPT', photo: 'alex-crypto' },
  { name: 'victor__alfa', net: 'X', url: 'https://x.com/victor__alfa', photo: 'victor-alfa' },
  { name: 'Mignolet', net: 'X', url: 'https://x.com/mignoletkr', photo: 'mignolet' },
  { name: 'Rafaela Romano', net: 'X', url: 'https://x.com/hi_disruptivas', photo: 'rafaela-romano' },
  { name: 'Orlando on Crypto', net: 'YouTube', url: 'https://www.youtube.com/@orlandooncrypto', photo: 'orlando-on-crypto' },
]
