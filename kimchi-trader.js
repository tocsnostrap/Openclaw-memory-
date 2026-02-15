#!/usr/bin/env node
/**
 * Kimchi - Fully Autonomous Trading Bot
 * TCT Strategy with Risk Management + Telegram Alerts
 */

const MEXC_API = 'https://api.mexc.com/api/v3';
const TELEGRAM_API = 'https://api.telegram.org/bot';

// Config
const CONFIG = {
  symbol: 'BTCUSDT',
  testnet: true, // Set false for real trading
  entryZoneMin: 69300,
  entryZoneMax: 69400,
  stopLoss: 69100,
  takeProfit: 70000,
  maxPositionSize: 0.001,
  riskPercent: 1,
  telegram: {
    botToken: '812557458:AAHdqTcvxD3j_7aBT2K0p4qxZw+rLZ3-l_g',
    chatId: '6805927112'
  }
};

const state = {
  inPosition: false,
  position: null,
  balance: { USDT: 10000, BTC: 0 },
  lastAlert: 0
};

// Fetch price from MEXC
async function getPrice() {
  try {
    const res = await fetch(`${MEXC_API}/ticker/24hr?symbol=BTCUSDT`);
    const data = await res.json();
    return parseFloat(data.lastPrice);
  } catch (e) {
    console.error('Price fetch error:', e.message);
    return null;
  }
}

// Send Telegram alert
async function telegramAlert(message) {
  const now = Date.now();
  if (now - state.lastAlert < 300000) return; // Max 1 alert per 5 min
  state.lastAlert = now;
  
  try {
    await fetch(`${TELEGRAM_API}${CONFIG.telegram.botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CONFIG.telegram.chatId,
        text: message,
        parse_mode: 'HTML'
      })
    });
  } catch (e) {
    console.log('Telegram alert failed:', e.message);
  }
}

// Execute trade
async function executeTrade(action, price) {
  if (action === 'entry' && !state.inPosition) {
    const priceNum = Number(price);
    const riskAmount = state.balance.USDT * (CONFIG.riskPercent / 100);
    const riskPerBTC = priceNum - CONFIG.stopLoss;
    let size = riskAmount / riskPerBTC;
    if (isNaN(size) || size <= 0) size = CONFIG.maxPositionSize;
    if (size > CONFIG.maxPositionSize) size = CONFIG.maxPositionSize;
    
    state.position = {
      entry: priceNum,
      size: size,
      side: 'long',
      stopLoss: CONFIG.stopLoss,
      takeProfit: CONFIG.takeProfit,
      entryTime: new Date().toISOString()
    };
    state.inPosition = true;
    
    const risk = size * (priceNum - CONFIG.stopLoss);
    const rr = (CONFIG.takeProfit - priceNum) / (priceNum - CONFIG.stopLoss);
    
    const msg = `🎯 <b>ENTRY EXECUTED</b>\n\nSide: LONG\nEntry: $${priceNum}\nSize: ${size.toFixed(6)} BTC\nStop: $${CONFIG.stopLoss}\nTarget: $${CONFIG.takeProfit}\nRR: ${rr.toFixed(2)}:1`;
    console.log(msg);
    await telegramAlert(msg);
    
    return { action: 'entry', price: priceNum, size };
  }
  
  if ((action === 'exit' || action === 'target' || action === 'stop') && state.inPosition) {
    const pnl = (price - state.position.entry) * state.position.size;
    const pnlPercent = ((price - state.position.entry) / state.position.entry) * 100;
    
    const msg = `🚪 <b>POSITION CLOSED</b>\n\n${action === 'stop' ? '🛑 STOP HIT' : '🎯 TARGET HIT'}\nExit: $${price}\nPnL: $${pnl.toFixed(2)} (${pnlPercent.toFixed(2)}%)`;
    console.log(msg);
    await telegramAlert(msg);
    
    state.balance.USDT += pnl;
    state.position = null;
    state.inPosition = false;
    
    return { action: 'exit', price, pnl, pnlPercent };
  }
  
  return null;
}

// Main trading loop
async function tradingLoop() {
  console.log('🔄 Kimchi Auto-Trader Running...');
  console.log(`   Entry Zone: $${CONFIG.entryZoneMin}-${CONFIG.entryZoneMax}`);
  console.log(`   Stop: $${CONFIG.stopLoss} | Target: $${CONFIG.takeProfit}`);
  console.log(`   Mode: ${CONFIG.testnet ? 'PAPER TRADING' : 'LIVE TRADING'}`);
  console.log(`   Balance: $${state.balance.USDT} USDT\n`);
  
  await telegramAlert('🚀 Kimchi Trader Started\nEntry Zone: $69,300-69,400\nTarget: $70,000\nStop: $69,100');
  
  setInterval(async () => {
    const price = await getPrice();
    if (!price) return;
    
    if (!state.inPosition) {
      if (price >= CONFIG.entryZoneMin && price <= CONFIG.entryZoneMax) {
        console.log(`[${new Date().toISOString()}] 🎯 ENTRY SIGNAL - Price: $${price}`);
        await executeTrade('entry', price);
      } else {
        console.log(`[${new Date().toISOString()}] 👀 Watching - $${price} (zone: $${CONFIG.entryZoneMin}-${CONFIG.entryZoneMax})`);
      }
    } else {
      if (price <= state.position.stopLoss) {
        console.log(`[${new Date().toISOString()}] 🛑 STOP HIT - Price: $${price}`);
        await executeTrade('stop', price);
      } else if (price >= state.position.takeProfit) {
        console.log(`[${new Date().toISOString()}] 🎯 TARGET HIT - Price: $${price}`);
        await executeTrade('target', price);
      } else {
        const pnl = (price - state.position.entry) * state.position.size;
        const stopDistance = ((price - state.position.stopLoss) / price * 100).toFixed(2);
        console.log(`[${new Date().toISOString()}] 📊 $${price} | PnL: $${pnl.toFixed(2)} | Stop: ${stopDistance}% away`);
      }
    }
  }, 30000);
}

tradingLoop();
