// Sample rows for the interface preview on the Home. Illustrative only, not live and not from facts.js:
// the preview is always captioned as sample data. Strings use en-US separators; AppPreview swaps them for pt.

export const ASSETS = [
  { sym: 'BTC', name: 'Bitcoin', price: '$96,420', chg: 1.9, mcap: '$1.91T', vol: '$31.4B', realized: '$41,200', addr: '1.04M', addrD: 3.1, oi: '$29.8B', oiD: 4.6, liq: '$118M', signal: 'bullish' },
  { sym: 'ETH', name: 'Ethereum', price: '$3,180', chg: -0.9, mcap: '$383B', vol: '$16.2B', realized: '$2,140', addr: '561K', addrD: -0.6, oi: '$12.1B', oiD: 2.3, liq: '$71M', signal: 'neutral' },
  { sym: 'SOL', name: 'Solana', price: '$182.60', chg: 4.7, mcap: '$88B', vol: '$4.3B', realized: '$74.10', addr: '1.7M', addrD: 7.9, oi: '$4.4B', oiD: 10.5, liq: '$33M', signal: 'bullish' },
  { sym: 'XRP', name: 'XRP', price: '$2.31', chg: 3.4, mcap: '$132B', vol: '$3.0B', realized: '$0.86', addr: '95K', addrD: 11.2, oi: '$2.6B', oiD: 7.9, liq: '$22M', signal: 'bullish' },
  { sym: 'BNB', name: 'BNB', price: '$641.20', chg: -0.5, mcap: '$94B', vol: '$1.7B', realized: '$305.30', addr: '1.1M', addrD: 1.4, oi: '$1.0B', oiD: -0.6, liq: '$8M', signal: 'neutral' },
  { sym: 'DOGE', name: 'Dogecoin', price: '$0.241', chg: 3.1, mcap: '$35B', vol: '$2.2B', realized: '$0.079', addr: '108K', addrD: 5.2, oi: '$1.5B', oiD: 3.8, liq: '$17M', signal: 'bullish' },
  { sym: 'ADA', name: 'Cardano', price: '$0.764', chg: -1.4, mcap: '$27B', vol: '$0.6B', realized: '$0.41', addr: '66K', addrD: -2.3, oi: '$0.4B', oiD: -1.9, liq: '$4M', signal: 'bearish' },
]

export const SCREEN = [
  { sym: 'SOL', name: 'Solana', price: '$182.60', chg: 4.7, rsi: 64, macd: 'buy', funding: '0.015%', signal: 'strongBuy', strength: 88 },
  { sym: 'BTC', name: 'Bitcoin', price: '$96,420', chg: 1.9, rsi: 58, macd: 'buy', funding: '0.012%', signal: 'buy', strength: 72 },
  { sym: 'XRP', name: 'XRP', price: '$2.31', chg: 3.4, rsi: 61, macd: 'buy', funding: '0.010%', signal: 'buy', strength: 69 },
  { sym: 'DOGE', name: 'Dogecoin', price: '$0.241', chg: 3.1, rsi: 57, macd: 'buy', funding: '0.022%', signal: 'buy', strength: 61 },
  { sym: 'BNB', name: 'BNB', price: '$641.20', chg: -0.5, rsi: 49, macd: 'neutral', funding: '0.006%', signal: 'neutral', strength: 44 },
  { sym: 'ETH', name: 'Ethereum', price: '$3,180', chg: -0.9, rsi: 46, macd: 'sell', funding: '0.008%', signal: 'neutral', strength: 41 },
  { sym: 'ADA', name: 'Cardano', price: '$0.764', chg: -1.4, rsi: 38, macd: 'sell', funding: '-0.004%', signal: 'sell', strength: 22 },
]

// Same order as t.preview.macro.rows
export const MACRO = [
  { last: '4.31%', prev: '4.26%', chg: '+0.05', d30: '+0.11', ytd: '-0.16', spark: [40, 42, 38, 45, 43, 48, 46, 50, 47, 52, 49, 51] },
  { last: '104.2', prev: '104.6', chg: '-0.38%', d30: '-1.4%', ytd: '+2.5%', spark: [70, 68, 72, 65, 67, 63, 66, 60, 64, 58, 62, 60] },
  { last: '5,910', prev: '5,864', chg: '+0.78%', d30: '+3.0%', ytd: '+12.9%', spark: [30, 35, 32, 40, 38, 45, 42, 50, 48, 55, 52, 58] },
  { last: '$2,948', prev: '$2,931', chg: '+0.58%', d30: '+3.8%', ytd: '+8.9%', spark: [35, 38, 36, 42, 40, 45, 44, 48, 46, 50, 52, 55] },
  { last: '4.50%', prev: '4.75%', chg: '-0.25', d30: '-0.25', ytd: '-0.75', spark: [80, 80, 80, 75, 75, 75, 70, 70, 70, 65, 65, 60] },
  { last: '$21.9T', prev: '$21.7T', chg: '+0.7%', d30: '+1.1%', ytd: '+4.6%', spark: [30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50, 54] },
  { last: '2.8%', prev: '2.9%', chg: '-0.10', d30: '-0.20', ytd: '-0.60', spark: [60, 58, 56, 55, 54, 52, 50, 48, 47, 46, 45, 44] },
  { last: '4.0%', prev: '3.9%', chg: '+0.10', d30: '+0.10', ytd: '+0.30', spark: [30, 30, 32, 32, 34, 33, 35, 34, 36, 37, 38, 39] },
]

export const SENTIMENT = {
  gauge: 72,
  stats: [
    { key: 'dominance', value: '58.1%', delta: '+0.3%', up: true },
    { key: 'funding', value: '0.011%', delta: '+0.002', up: true },
    { key: 'oi', value: '$61.7B', delta: '-1.1%', up: false },
  ],
  social: [
    { sym: 'BTC', bull: 68 },
    { sym: 'ETH', bull: 55 },
    { sym: 'SOL', bull: 74 },
    { sym: 'XRP', bull: 62 },
  ],
  liq: { longs: '$81M', shorts: '$49M', total: '$130M', longPct: 62 },
  venues: [
    { name: 'Binance', ratio: '1.22', longs: '55.0%' },
    { name: 'Bybit', ratio: '0.97', longs: '49.2%' },
    { name: 'OKX', ratio: '1.10', longs: '52.4%' },
  ],
}

// Numbers use en-US separators; swap for pt-BR
export const swapSeparators = (s) => s.replace(/,/g, '\u0000').replace(/\./g, ',').replace(/\u0000/g, '.')
