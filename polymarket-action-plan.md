# POLYMARKET BOT TRADING - ACTIONABLE PLAN
## Build & Execute Guide for Scot

---

## PHASE 1: SETUP (Do First)

### 1.1 Create Polymarket Account
1. Go to polymarket.com
2. Connect MetaMask wallet
3. Deposit USDC to Polygon network
4. Get your Safe address from Settings

### 1.2 Get Builder Program (Gasless Trading)
- Apply at polymarket.com/settings?tab=builder
- Eliminates gas fees (critical for bot trading)
- Takes ~1-2 days to approve

### 1.3 VPS Setup (Required for 24/7 Trading)
```
Recommended VPS Options:
- DigitalOcean: $20/mo (Basic)
- AWS EC2: $15-25/mo  
- QuantVPS: $50+/mo (lowest latency)

Minimum specs: 4GB RAM, 2 vCPU, 100GB SSD
Location: Near Polygon nodes (NYC, Amsterdam, Singapore)
```

---

## PHASE 2: INSTALL BOT SOFTWARE

### 2.1 Clone the Bot
```bash
git clone https://github.com/discountry/polymarket-trading-bot.git
cd polymarket-trading-bot
pip install -r requirements.txt
```

### 2.2 Configure Credentials
```bash
export POLY_PRIVATE_KEY=your_64_char_hex_private_key
export POLY_SAFE_ADDRESS=0xYourPolymarketSafeAddress

# Optional (for gasless):
export POLY_BUILDER_API_KEY=your_key
export POLY_BUILDER_API_SECRET=your_secret
export POLY_BUILDER_API_PASSPHRASE=your_passphrase
```

### 2.3 Test Connection
```bash
python examples/quickstart.py
```

---

## PHASE 3: STRATEGY - 5 MINUTE MARKETS

### Strategy A: Flash Crash (Beginner Friendly)
Monitors for sudden price drops, buys the dip, exits at profit/loss targets.

```python
# Run flash crash strategy
python strategies/flash_crash_strategy.py --coin BTC --drop 0.30 --size 10

# Parameters:
# --coin: BTC, ETH, SOL, XRP
# --drop: Probability drop threshold (0.30 = 30%)
# --size: Trade size in USDC
# --lookback: Detection window in seconds
# --take-profit: Exit at $ profit
# --stop-loss: Exit at $ loss
```

**How it works:**
1. Monitors 15-min market via WebSocket in real-time
2. Detects when probability drops 30%+ in 10 seconds
3. Buys the "crashed" side automatically
4. Takes profit at +$0.10 or stops at -$0.05

### Strategy B: Latency Arbitrage (Advanced)
Exploit lag between CEX price moves and Polymarket adjustment.

```python
# Pseudocode for latency arb
from src.websocket_client import MarketWebSocket
import asyncio

async def latency_arb():
    ws = MarketWebSocket()
    
    # Get CEX price (Binance API)
    btc_price = get_binance_price("BTCUSDT")
    
    # Get Polymarket price
    poly_price = await ws.get_mid_price(btc_token_id)
    
    # If Binance moved up 1%+ but Poly hasn't adjusted
    if btc_price.change_1m > 0.01 and poly_price < 0.52:
        # Buy "UP" on Polymarket
        await bot.place_order(
            token_id=up_token_id,
            price=poly_price,
            size=100,
            side="BUY"
        )
        
    # If spread > 3%, arbitrage opportunity
    # Buy both sides on different exchanges, pocket the difference
```

### Strategy C: Trend Following
```python
# Simple trend strategy
if price_5min_change > 0.05:  # 5% up in 5min
    buy("UP", size=10)
elif price_5min_change < -0.05:
    buy("DOWN", size=10)
```

---

## PHASE 4: DEPLOYMENT

### 4.1 Run Bot 24/7 with Screen/tmux
```bash
# Install tmux
apt install tmux

# Create session
tmux new -s polymarket

# Run bot
python strategies/flash_crash_strategy.py --coin BTC --size 20

# Detach: Ctrl+B, then D
# Reattach: tmux attach -t polymarket
```

### 4.2 Run Multiple Bots (Different Coins)
```bash
# Terminal 1: BTC
python strategies/flash_crash_strategy.py --coin BTC --size 10

# Terminal 2: ETH  
python strategies/flash_crash_strategy.py --coin ETH --size 10

# Terminal 3: SOL
python strategies/flash_crash_strategy.py --coin SOL --size 10
```

### 4.3 Auto-Restart Script
```bash
#!/bin/bash
# run_bot.sh
while true; do
    python strategies/flash_crash_strategy.py --coin BTC --size 10
    echo "Bot crashed, restarting in 5 seconds..."
    sleep 5
done
```

---

## PHASE 5: RISK MANAGEMENT

### Position Sizing
- Start with $10-20 per trade
- Max 5% of capital per position
- Never risk more than 20% total

### Recommended Initial Capital
- Minimum: $500 USDC
- Recommended: $2,000-5,000 USDC

### Stop Loss Rules
- Always use stop loss (-$0.05 default)
- Take profit at +$0.10 to +$0.20
- Exit if spread > 3% (not profitable)

### Monitoring
- Check bot every few hours
- Monitor gas fees on polygon.io
- Watch for unusual latency

---

## EXECUTION CHECKLIST

- [ ] Create Polymarket account
- [ ] Deposit USDC to Polygon
- [ ] Apply for Builder Program
- [ ] Set up VPS (or use local 24/7)
- [ ] Clone bot repo
- [ ] Configure private key
- [ ] Test with $10 trade
- [ ] Run flash crash strategy
- [ ] Monitor for 24 hours
- [ ] Adjust parameters based on results
- [ ] Scale up slowly

---

## QUICK START COMMANDS

```bash
# Full setup in order:
git clone https://github.com/discountry/polymarket-trading-bot.git
cd polymarket-trading-bot
pip install -r requirements.txt

# Configure:
export POLY_PRIVATE_KEY=your_key
export POLY_SAFE_ADDRESS=your_address

# Run:
python examples/quickstart.py  # Test connection
python strategies/flash_crash_strategy.py --coin BTC --size 10  # Start trading
```

---

## KEY RESOURCES

- Docs: docs.polymarket.com
- Bot Repo: github.com/discountry/polymarket-trading-bot
- API: docs.polymarket.com/api
- Gas Tracker: polygon.io/gas
- Builder Program: polymarket.com/settings?tab=builder
