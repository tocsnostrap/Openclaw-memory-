import Steel from 'steel-sdk';
import { chromium } from 'playwright';

async function main() {
  const steelApiKey = process.env.STEEL_API_KEY;
  
  if (!steelApiKey) {
    console.log('Please set STEEL_API_KEY environment variable');
    return;
  }

  console.log('Creating Steel browser session...');
  
  const client = new Steel({ steelAPIKey: steelApiKey });
  
  try {
    const session = await client.sessions.create();
    console.log('Session created:', session.id);
    console.log('View at:', session.sessionViewerUrl);
    
    // Connect via Playwright
    const browser = await chromium.connectOverCDP(session.websocketUrl);
    const context = browser.contexts()[0];
    const page = await context.newPage();
    
    await page.goto('https://www.tradingview.com/chart/?symbol=BINANCE:BTCUSDT.P');
    console.log('Navigated to TradingView');
    
    // Take screenshot
    await page.screenshot({ path: 'tradingview.png' });
    console.log('Screenshot saved to tradingview.png');
    
    await browser.close();
    
    // Release session
    client.sessions.release(session.id);
    console.log('Session released');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
