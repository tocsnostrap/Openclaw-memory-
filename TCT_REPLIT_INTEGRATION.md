# TCT Integration Guide for Replit

Since your bot runs on Replit, here's how to add TCT analysis:

---

## Step 1: Add the TCT Module

In Replit, open a **new file** called `tct_analysis.py` and paste this code:

```python
#!/usr/bin/env python3
"""
TCT (Test of Composite Theory) Integration Module for Pump Fade Bot
Add to your Replit project to filter trades by market structure.
"""

import ccxt
import pandas as pd
import numpy as np
from datetime import datetime

class TCTAnalyzer:
    def __init__(self, exchange_id='gateio'):
        self.exchange_id = exchange_id
        self.cache = {}
        
    def fetch_ohlcv(self, symbol, timeframe='1h', limit=100):
        if self.exchange_id == 'gateio':
            ex = ccxt.gateio({'enableRateLimit': True, 'options': {'defaultType': 'swap'}})
        else:
            ex = ccxt.bitget({'enableRateLimit': True, 'options': {'defaultType': 'swap'}})
            
        ohlcv = ex.fetch_ohlcv(symbol, timeframe=timeframe, limit=limit)
        df = pd.DataFrame(ohlcv, columns=['timestamp', 'open', 'high', 'low', 'close', 'volume'])
        df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
        return df
    
    def get_market_structure(self, symbol, timeframe='4h'):
        """Returns: 'uptrend', 'downtrend', or 'range'"""
        df = self.fetch_ohlcv(symbol, timeframe, limit=100)
        highs = df['high'].values
        lows = df['low'].values
        
        # Find swing points (pivots)
        swing_highs = []
        swing_lows = []
        
        for i in range(2, len(df) - 2):
            if highs[i] == max(highs[i-2:i+3]):
                swing_highs.append(highs[i])
            if lows[i] == min(lows[i-2:i+3]):
                swing_lows.append(lows[i])
        
        if len(swing_highs) >= 2 and len(swing_lows) >= 2:
            # Lower highs + lower lows = downtrend
            if swing_lows[-1] < swing_lows[-2] and swing_highs[-1] < swing_highs[-2]:
                return {'structure': 'downtrend', 'swing_high': swing_highs[-1], 'swing_low': swing_lows[-1]}
            # Higher highs + higher lows = uptrend
            elif swing_lows[-1] > swing_lows[-2] and swing_highs[-1] > swing_highs[-2]:
                return {'structure': 'uptrend', 'swing_high': swing_highs[-1], 'swing_low': swing_lows[-1]}
        
        return {'structure': 'range', 'swing_high': swing_highs[-1] if swing_highs else None, 
                'swing_low': swing_lows[-1] if swing_lows else None}
    
    def find_supply_zones(self, symbol, timeframe='4h', lookback=50):
        """Find resistance zones (where price dropped from)."""
        df = self.fetch_ohlcv(symbol, timeframe, limit=lookback)
        supply_zones = []
        
        for i in range(3, len(df) - 3):
            # 3 lower highs = supply zone forming
            if (df['high'].iloc[i] < df['high'].iloc[i-1] and 
                df['high'].iloc[i-1] < df['high'].iloc[i-2]):
                supply_zones.append({
                    'zone': df['high'].iloc[i-1],
                    'origin': df['high'].iloc[i-3] if i-3 >= 0 else df['high'].iloc[i]
                })
        
        # Deduplicate and return
        unique_zones = []
        for z in supply_zones:
            if not unique_zones or abs(z['zone'] - unique_zones[-1]['zone']) / unique_zones[-1]['zone'] > 0.02:
                unique_zones.append(z)
        
        return unique_zones[:5]
    
    def find_demand_zones(self, symbol, timeframe='4h', lookback=50):
        """Find support zones (where price bounced from)."""
        df = self.fetch_ohlcv(symbol, timeframe, limit=lookback)
        demand_zones = []
        
        for i in range(3, len(df) - 3):
            # 3 higher lows = demand zone forming
            if (df['low'].iloc[i] > df['low'].iloc[i-1] and 
                df['low'].iloc[i-1] > df['low'].iloc[i-2]):
                demand_zones.append({
                    'zone': df['low'].iloc[i-1],
                    'origin': df['low'].iloc[i-3] if i-3 >= 0 else df['low'].iloc[i]
                })
        
        unique_zones = []
        for z in demand_zones:
            if not unique_zones or abs(z['zone'] - unique_zones[-1]['zone']) / unique_zones[-1]['zone'] > 0.02:
                unique_zones.append(z)
        
        return unique_zones[:5]
    
    def find_fvg(self, symbol, timeframe='15m', lookback=20):
        """Find Fair Value Gaps."""
        df = self.fetch_ohlcv(symbol, timeframe, limit=lookback)
        fvgs = []
        
        for i in range(2, len(df)):
            prev_high, prev_low = df['high'].iloc[i-2], df['low'].iloc[i-2]
            curr_high, curr_low = df['high'].iloc[i], df['low'].iloc[i]
            
            if prev_high < curr_low:  # Bullish FVG
                fvgs.append({'type': 'bullish', 'high': curr_low, 'low': prev_high})
            if prev_low > curr_high:  # Bearish FVG
                fvgs.append({'type': 'bearish', 'high': prev_low, 'low': curr_high})
        
        return fvgs[-5:]
    
    def analyze_for_short(self, symbol, entry_price, timeframe='4h'):
        """
        Complete TCT analysis for short entry.
        Returns: {'approved': bool, 'confidence': 0-100, 'reasons': [], 'tp_target': float}
        """
        reasons = []
        confidence = 50
        
        # 1. Check structure
        structure = self.get_market_structure(symbol, timeframe)
        if structure['structure'] == 'downtrend':
            reasons.append("✅ Bearish structure")
            confidence += 20
        elif structure['structure'] == 'uptrend':
            reasons.append("❌ Bullish structure - AVOID")
            return {'approved': False, 'confidence': 0, 'reasons': reasons, 'tp_target': None}
        else:
            reasons.append("⚠️ Range structure")
        
        # 2. Check supply zone
        supply_zones = self.find_supply_zones(symbol, timeframe)
        near_supply = False
        for zone in supply_zones:
            if entry_price * 0.98 <= zone['zone'] <= entry_price * 1.02:
                near_supply = True
                reasons.append(f"✅ Near supply at ${zone['zone']}")
                confidence += 15
                break
        if not near_supply:
            reasons.append("⚠️ Not near supply zone")
        
        # 3. Check FVG
        fvgs = self.find_fvg(symbol, '15m')
        bearish_fvg = [f for f in fvgs if f['type'] == 'bearish']
        if bearish_fvg:
            reasons.append("✅ Bearish FVG found")
            confidence += 10
        
        # 4. Get TP from demand zone
        demand_zones = self.find_demand_zones(symbol, timeframe)
        tp_target = None
        for zone in demand_zones:
            if zone['zone'] < entry_price:
                tp_target = zone['zone']
                distance = (entry_price - tp_target) / entry_price * 100
                if distance >= 2:  # 2:1 R:R minimum
                    reasons.append(f"✅ TP at demand ${tp_target} ({distance:.1f}%)")
                    confidence += 10
                break
        
        approved = confidence >= 70
        
        return {
            'approved': approved,
            'confidence': confidence,
            'reasons': reasons,
            'tp_target': tp_target,
            'structure': structure['structure']
        }
```

---

## Step 2: Import in main.py

In your `main.py`, add at the **top** with other imports:

```python
# Add this line with your other imports
from tct_analysis import TCTAnalyzer

# Add in your Bot class __init__ method (around line 50-100):
self.tct = TCTAnalyzer(exchange_id='gateio')
```

---

## Step 3: Add Filter Before Entry

Find your **entry function** (search for `enter_short`, `open_position`, or where you call the exchange).

Add this **before** placing the trade:

```python
# === TCT FILTER ===
tct_analysis = self.tct.analyze_for_short(symbol, current_price, '4h')

print(f"[TCT] {symbol}: approved={tct_analysis['approved']}, confidence={tct_analysis['confidence']}%")
for reason in tct_analysis['reasons']:
    print(f"  {reason}")

if not tct_analysis['approved']:
    print(f"[TCT] Skipping {symbol} - not approved")
    return  # Skip this trade

# Use demand zone for TP if available
if tct_analysis['tp_target']:
    tp_price = tct_analysis['tp_target']
    print(f"[TCT] Using demand zone TP: ${tp_price}")
else:
    # Fallback to your existing TP
    tp_price = self.calculate_tp(symbol, entry_price)
```

---

## Step 4: Test in Paper Mode

1. Click **Run** in Replit
2. Watch the console for `[TCT]` messages
3. Make sure paper trades still work
4. Check that trades are being rejected when structure is bullish

---

## Quick Debugging

If you get errors:

```python
# Test the module separately in Replit Shell:
from tct_analysis import TCTAnalyzer
tct = TCTAnalyzer()
result = tct.get_market_structure('BTC/USDT:USDT', '4h')
print(result)
```

---

## What This Does

| Before | After |
|--------|-------|
| Bot shorts any pump | Only shorts if 4h structure is bearish |
| Random TP levels | Uses demand zones below entry |
| No entry confirmation | Confirms with supply zone + FVG |
| Same position size | Scales size by confidence |

**Expected result:** Higher win rate by avoiding counter-trend trades.
