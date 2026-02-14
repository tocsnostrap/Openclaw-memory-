# TCT Integration Prompt

Use this prompt with an AI coding assistant (Cursor, GitHub Copilot, Claude) to integrate TCT analysis into the pump fade bot.

---

## Context

You have a crypto trading bot that detects pump-and-fade patterns and enters short positions. The bot is written in Python and uses ccxt for exchange connectivity.

## Goal

Add TCT (Test of Composite Theory / Wyckoff-style) market structure analysis to improve entry quality by filtering trades based on:
1. Market structure (only short in downtrends or after range breaks)
2. Supply zones (enter at supply for higher probability)
3. Demand zones (use as take profit targets)
4. Fair Value Gaps (FVG) for entry confirmation
5. Liquidity pools for TP targeting

## Files

- `main.py` - Main bot logic (entry/exit decisions)
- `bot_config.json` - Configuration parameters
- `tct_analysis.py` - New TCT module (attached below)

## What to Do

1. **Import the TCT module** in `main.py`:
```python
from tct_analysis import TCTAnalyzer
```

2. **Initialize** the analyzer in your main setup:
```python
tct = TCTAnalyzer(exchange_id='gateio')  # or 'bitget'
```

3. **Add TCT filter** before entering any trade:
```python
def should_enter_trade_tct(self, symbol, entry_price):
    """TCT analysis before trade entry."""
    analysis = self.tct.analyze_for_short(symbol, entry_price, '4h')
    
    # Log analysis
    self.logger.info(f"TCT Analysis for {symbol}: approved={analysis['approved']}, confidence={analysis['confidence']}%")
    for reason in analysis['reasons']:
        self.logger.info(f"  {reason}")
    
    # Use TP target from demand zone if available
    if analysis['tp_target']:
        self.logger.info(f"  TP from demand zone: ${analysis['tp_target']}")
    
    return analysis['approved'], analysis['confidence'], analysis
```

4. **Integrate into entry logic**:
```python
# In your existing entry function, add:
approved, confidence, tct_analysis = self.should_enter_trade_tct(symbol, current_price)

if not approved:
    self.logger.warning(f"TCT rejected {symbol} - skipping")
    return None

# Adjust position size based on confidence
if confidence >= 80:
    position_size = base_size * 1.5  # High confidence - bigger size
elif confidence >= 70:
    position_size = base_size  # Normal
else:
    position_size = base_size * 0.5  # Lower confidence - smaller size

# Use demand zone for TP
if tct_analysis['tp_target']:
    tp_target = tct_analysis['tp_target']
```

5. **Use demand zones for take profit**:
```python
# Replace hardcoded TP levels with demand zone targets
tp_data = self.tct.get_tp_target_from_demand(symbol, entry_price, '4h')
if tp_data and tp_data['distance_pct'] >= 2.0:  # At least 2:1 R:R
    tp_target = tp_data['target']
else:
    # Fallback to your existing TP logic
    tp_target = self.calculate_fib_tp(entry_price, swing_high)
```

## TCT Module Code

```python
# (See attached tct_analysis.py - contains TCTAnalyzer class with methods:
# - get_market_structure(symbol, timeframe)
# - find_supply_zones(symbol, timeframe)
# - find_demand_zones(symbol, timeframe)
# - find_fvg(symbol, timeframe)
# - find_liquidity_zones(symbol, timeframe)
# - analyze_for_short(symbol, entry_price, timeframe)
# - is_near_supply(), is_near_demand(), get_tp_target_from_demand()
```

## Key Integration Points

| Existing Code | TCT Enhancement |
|---------------|-----------------|
| Entry decision | Add `tct.analyze_for_short()` check |
| Position sizing | Scale based on `confidence` |
| Take profit | Use demand zone as TP target |
| Skip conditions | Add bearish structure requirement |

## Example Entry Point

Find your `check_for_entries()` or similar function and add:

```python
async def check_for_entries(self):
    # ... existing pump detection ...
    
    for symbol in pump_candidates:
        # ... existing filters (RSI, volume, etc.) ...
        
        # NEW: TCT Structure Check
        structure = self.tct.get_market_structure(symbol, '4h')
        if structure['structure'] != 'downtrend':
            self.logger.info(f"{symbol}: Skipping - not bearish structure ({structure['structure']})")
            continue
        
        # TCT Supply Zone Check
        supply = self.tct.is_near_supply(symbol, current_price, '4h')
        if not supply['near']:
            self.logger.info(f"{symbol}: Skipping - not near supply zone")
            continue
        
        # TCT Analysis
        analysis = self.tct.analyze_for_short(symbol, current_price, '4h')
        if not analysis['approved']:
            self.logger.info(f"{symbol}: TCT rejected")
            continue
        
        # All checks passed - enter trade
        # Use adjusted position size and TP
        self.enter_short(symbol, analysis.get('tp_target'))
```

## Testing

After integration:
1. Run in paper mode
2. Monitor TCT analysis output in logs
3. Compare win rate before/after
4. Tune confidence thresholds as needed

---

## Summary of Changes

1. Add `tct_analysis.py` to project
2. Import and initialize `TCTAnalyzer`
3. Add `analyze_for_short()` call before entry
4. Use demand zones for take profit
5. Scale position size by confidence

This should improve win rate by only taking shorts in bearish market structure and using supply/demand zones for better entries and exits.
