================================================================================
POLYMARKET TRADING BOTS & ARBITRAGE BRIEFING
Prepared for Scot | Saturday, February 14, 2026
================================================================================

1. WHAT IS POLYMARKET & HOW IT WORKS
================================================================================

Polymarket is a decentralized prediction market protocol where users trade shares 
representing the likelihood of real-world event outcomes. Key basics:

• Binary outcomes: YES/NO shares for events (e.g., "Will BTC > $100K by March?")
• Price = implied probability: Share price ($0.01-$1.00) reflects market's probability
• Platform: Built on Polygon blockchain, uses USDC for deposits
• Hybrid system: Off-chain order matching + on-chain settlement
• Most markets have NO fees (except special taker-fee markets)

NEW: 5-MINUTE CRYPTO MARKETS JUST LAUNCHED (Feb 13, 2026)
- Uses Chainlink Data Streams for low-latency, verifiable price data
- Covers BTC, SOL, ETH, XRP "Up/Down" markets
- Instant settlement after 5-min intervals
- Designed specifically for bot trading


2. TYPES OF TRADING BOTS USED ON POLYMARKET
================================================================================

A) ARBITRAGE BOTS (Most Popular)
--------------------------------
• Cross-exchange arbitrage: Exploit price differences between Polymarket and 
  competitors like Kalshi
• Synthetic arbitrage: Buy YES on one platform, NO on another when probabilities diverge
• Example: If Polymarket shows 60% YES and Kalshi shows 55% on same event, bot 
  buys both sides to lock in risk-free profit
• Tools: Many open-source bots on GitHub (e.g., polymarket-kalshi-btc-arbitrage-bot)

B) SPIKE DETECTION BOTS
-----------------------
• Monitor real-time price movements
• Detect sudden spikes and execute trades instantly
• Use advanced threading for optimal performance
• Python + Web3 based

C) HIGH-FREQUENCY TRADING (HFT) BOTS
-------------------------------------
• Front-run thin liquidity orders
• Buy contracts just before market-buy orders push prices up
• Require co-located servers and low-latency connections

D) AI AGENT BOTS
----------------
• Polymarket's official AI Agent framework
• Retrieve news, analyze data, execute trades autonomously
• GitHub: github.com/Polymarket/agents


3. 5-MINUTE MARKET ARBITRAGE OPPORTUNITIES
================================================================================

These are the NEW high-frequency markets. Here's what to watch:

OPPORTUNITIES:
• Latency arbitrage: Price moves on CEXs (Binance, Coinbase) happen faster than 
  Polymarket 5-min markets can adjust. Bot catches the lag.
• Trend following: Predict direction based on recent price action in the 5-min window
• Liquidity gaps: Early in market life, spreads are wider = more arb opportunity

TECHNICAL REQUIREMENTS:
• Real-time data feeds (WebSocket connections)
• Sub-second execution speed
• Low-latency VPS (ideally near Polygon nodes)
• Capital to absorb slippage in thin markets

KEY PAIRS AVAILABLE:
- BTC/USD, SOL/USD, ETH/USD, XRP/USD (with more coming)


4. RISKS & CONSIDERATIONS
================================================================================

⚠️ LEGAL/REGULATORY
• Prediction markets exist in gray area in some jurisdictions
• Polymarket US is CFTC-regulated (DCM), but international access varies
• Crypto betting may be restricted in Saudi Arabia - CHECK LOCAL LAWS

⚠️ FINANCIAL RISKS
• Slippage: Exceeding liquidity depth wipes out arb advantages
• Need 2.5-3%+ spreads to be profitable after fees
• Polymarket charges 2% winner fee on some markets
• Gas fees on Polygon can spike during congestion

⚠️ OPERATIONAL RISKS
• Latency: You compete with HFT bots with co-located servers
• Front-running: Bigger bots can see your mempool transactions
• Technical failure: Bots can miss execution windows
• 75% of orders settle within ~1 hour - slow for time-sensitive arb

⚠️ MARKET RISKS
• 5-min markets are VERY short - more volatile, harder to predict
• Bot-dominated = thin margins for manual traders
• Liquidity still building on new 5-min markets


5. PRACTICAL TIPS FOR GETTING STARTED
================================================================================

STEP 1: SETUP
□ Create Polymarket account + deposit USDC to Polygon wallet
□ Set up MetaMask or other Web3 wallet
□ Get private key (for bot automation) - SECURE THIS WELL

STEP 2: START WITH READING
□ Explore Polymarket API: docs.polymarket.com
□ Study existing open-source bots:
  - github.com/discountry/polymarket-trading-bot (beginner-friendly)
  - github.com/Trust412/Polymarket-spike-bot-v1 (advanced)
  - github.com/CarlosIbCu/polymarket-kalshi-btc-arbitrage-bot

STEP 3: BOT DEVELOPMENT
□ Use Python (most resources available)
□ Set up WebSocket connection for real-time prices
□ Implement: price monitoring → signal detection → order execution
□ Start with paper trading / small amounts

STEP 4: INFRASTRUCTURE
□ Use a low-latency VPS (DigitalOcean, AWS, or specialized Quant VPS)
□ Consider co-location for HFT strategies
□ Monitor gas fees and network congestion

STEP 5: RISK MANAGEMENT
□ Never risk more than you can afford to lose
□ Start with tiny position sizes
□ Set stop-losses and profit targets
□ Diversify across multiple markets, not just arb


QUICK START CODE SNIPPET (Python):
----------------------------------
pip install requests websockets

from polymarket import Polymarket

pm = Polymarket()
markets = pm.get_markets()  # Fetch active markets
print(market['description'], market['clobTokenIds'])


KEY RESOURCES:
• Docs: docs.polymarket.com
• Bot Templates: GitHub (search "polymarket bot")
• Discord: join Polymarket community for real-time signals
• QuantVPS: quantvps.com (infrastructure provider)


================================================================================
SUMMARY: Is it worth it?
================================================================================

The 5-minute markets JUST launched (Feb 13, 2026) - meaning there's potentially 
early-mover advantage as liquidity builds. However:

✓ Arbitrage opportunities exist but margins are thin
✓ Competition is fierce (established HFT bots)
✓ Requires technical setup and capital

FOR SOMEONE LEARNING TCT: This is a different skill set entirely. TCT is 
technical chart analysis for directional trading. Bot trading is algorithmic 
execution. They complement each other - you could use TCT signals to inform 
bot entries, but the execution is mechanical.

Start small. Paper trade first. Understand the technology before committing capital.

================================================================================
