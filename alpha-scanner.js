#!/usr/bin/env node
/**
 * Alpha - Arbitrage Scanner
 * Monitors price differences across exchanges
 */

const EXCHANGES = {
  mexc: 'https://api.mexc.com/api/v3/ticker/24hr?symbol=BTCUSDT',
  binance: 'https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT',
  gate: 'https://api.gateio.ws/api/v4/spot/tickers?currency_pair=BTC_USDT'
};

const STATE = { lastAlert: 0 };

async function getPrice(url, parseFn) {
  try {
    const res = await fetch(url);
    return parseFn(await res.json());
  } catch (e) {
    return null;
  }
}

async function checkArbitrage() {
  const prices = {};
  
  // Fetch from multiple exchanges
  const mexc = await getPrice(EXCHANGES.mexc, d => parseFloat(d.lastPrice));
  const binance = await getPrice(EXCHANGES.binance, d => parseFloat(d.lastPrice));
  
  if (mexc && binance) {
    prices.MEXC = mexc;
    prices.Binance = binance;
    
    const diff = Math.abs(mexc - binance);
    const pct = (diff / Math.min(mexc, binance)) * 100;
    
    console.log(`[${new Date().toISOString()}] MEXC: $${mexc} | Binance: $${binance} | Diff: ${pct.toFixed(3)}%`);
    
    if (pct > 0.2 && Date.now() - STATE.lastAlert > 300000) {
      STATE.lastAlert = Date.now();
      console.log(`🎯 ARBITRAGE OPPORTUNITY: ${pct.toFixed(2)}% difference!`);
    }
  }
}

console.log('🔍 Alpha Arbitrage Scanner running...');
setInterval(checkArbitrage, 30000);
