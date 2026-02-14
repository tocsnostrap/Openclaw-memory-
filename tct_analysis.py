#!/usr/bin/env python3
"""
TCT (Test of Composite Theory) Integration Module for Pump Fade Bot
Adds Wyckoff/SMC-style market structure analysis to improve entry quality.

Add to main.py:
    from tct_analysis import TCTAnalyzer
    tct = TCTAnalyzer()
    
    # In entry decision:
    if tct.is_bearish_structure(symbol) and tct.has_supply_zone(symbol, current_price):
        # Higher probability short
"""

import ccxt
import pandas as pd
import numpy as np
from datetime import datetime, timedelta


class TCTAnalyzer:
    """
    TCT Market Structure Analyzer
    Analyzes market structure, supply/demand zones, liquidity, and FVG.
    """
    
    def __init__(self, exchange_id='gateio'):
        self.exchange_id = exchange_id
        self.cache = {}  # Cache for analyzed data
        self.cache_ttl = 300  # 5 minutes
        
    def fetch_ohlcv(self, symbol, timeframe='1h', limit=100):
        """Fetch OHLCV data from exchange."""
        if self.exchange_id == 'gateio':
            ex = ccxt.gateio({'enableRateLimit': True, 'options': {'defaultType': 'swap'}})
        elif self.exchange_id == 'bitget':
            ex = ccxt.bitget({'enableRateLimit': True, 'options': {'defaultType': 'swap'}})
        else:
            ex = ccxt.binance({'enableRateLimit': True})
            
        ohlcv = ex.fetch_ohlcv(symbol, timeframe=timeframe, limit=limit)
        df = pd.DataFrame(ohlcv, columns=['timestamp', 'open', 'high', 'low', 'close', 'volume'])
        df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
        return df
    
    def get_market_structure(self, symbol, timeframe='4h'):
        """
        Determine market structure: uptrend, downtrend, or range.
        
        Returns:
            dict: {
                'structure': 'uptrend' | 'downtrend' | 'range',
                'swing_high': float,
                'swing_low': float,
                'trend_strength': 0-100
            }
        """
        df = self.fetch_ohlcv(symbol, timeframe, limit=100)
        closes = df['close'].values
        highs = df['high'].values
        lows = df['low'].values
        
        # Find swing highs and lows (pivot points)
        swing_highs = []
        swing_lows = []
        
        for i in range(2, len(df) - 2):
            # Swing high: highest of 5 candles
            if highs[i] == max(highs[i-2:i+3]):
                swing_highs.append((i, highs[i]))
            # Swing low: lowest of 5 candles
            if lows[i] == min(lows[i-2:i+3]):
                swing_lows.append((i, lows[i]))
        
        if not swing_highs or not swing_lows:
            return {'structure': 'range', 'swing_high': None, 'swing_low': None, 'trend_strength': 0}
        
        # Get last 3 swing points
        recent_highs = swing_highs[-3:]
        recent_lows = swing_lows[-3:]
        
        # Determine structure
        if len(recent_highs) >= 2 and len(recent_lows) >= 2:
            # Lower lows + lower highs = downtrend
            if recent_lows[-1][1] < recent_lows[-2][1] and recent_highs[-1][1] < recent_highs[-2][1]:
                structure = 'downtrend'
                trend_strength = min(100, (recent_highs[-1][1] - recent_lows[-1][1]) / recent_highs[-2][1] * 100)
            # Higher highs + higher lows = uptrend
            elif recent_lows[-1][1] > recent_lows[-2][1] and recent_highs[-1][1] > recent_highs[-2][1]:
                structure = 'uptrend'
                trend_strength = min(100, (recent_highs[-1][1] - recent_lows[-1][1]) / recent_lows[-2][1] * 100)
            else:
                structure = 'range'
                trend_strength = 50
        else:
            structure = 'range'
            trend_strength = 50
            
        return {
            'structure': structure,
            'swing_high': recent_highs[-1][1] if recent_highs else None,
            'swing_low': recent_lows[-1][1] if recent_lows else None,
            'trend_strength': trend_strength,
            'swing_highs': [(h[1]) for h in recent_highs],
            'swing_lows': [(l[1]) for l in recent_lows]
        }
    
    def find_supply_zones(self, symbol, timeframe='4h', lookback=50):
        """
        Find supply zones (resistance areas where price dropped from).
        
        Returns:
            list of dict: [{'zone': float, 'strength': 0-100, 'type': 'supply'}]
        """
        df = self.fetch_ohlcv(symbol, timeframe, limit=lookback)
        
        supply_zones = []
        
        for i in range(3, len(df) - 3):
            # Supply zone: 3+ consecutive candles making lower highs
            if (df['high'].iloc[i] < df['high'].iloc[i-1] and 
                df['high'].iloc[i-1] < df['high'].iloc[i-2]):
                
                # Find the origin (where supply came from)
                origin_idx = i - 3
                if origin_idx >= 0:
                    origin_price = df['high'].iloc[origin_idx]
                    supply_zones.append({
                        'zone': df['high'].iloc[i-1],
                        'origin': origin_price,
                        'strength': min(100, (origin_price - df['low'].iloc[i]) / origin_price * 100),
                        'type': 'supply'
                    })
        
        # Sort by strength and deduplicate
        supply_zones = sorted(supply_zones, key=lambda x: x['strength'], reverse=True)
        
        # Merge overlapping zones
        merged = []
        for zone in supply_zones:
            if not merged or abs(zone['zone'] - merged[-1]['zone']) / merged[-1]['zone'] > 0.02:
                merged.append(zone)
        
        return merged[:5]  # Top 5 supply zones
    
    def find_demand_zones(self, symbol, timeframe='4h', lookback=50):
        """
        Find demand zones (support areas where price bounced from).
        
        Returns:
            list of dict: [{'zone': float, 'strength': 0-100, 'type': 'demand'}]
        """
        df = self.fetch_ohlcv(symbol, timeframe, limit=lookback)
        
        demand_zones = []
        
        for i in range(3, len(df) - 3):
            # Demand zone: 3+ consecutive candles making higher lows
            if (df['low'].iloc[i] > df['low'].iloc[i-1] and 
                df['low'].iloc[i-1] > df['low'].iloc[i-2]):
                
                origin_idx = i - 3
                if origin_idx >= 0:
                    origin_price = df['low'].iloc[origin_idx]
                    demand_zones.append({
                        'zone': df['low'].iloc[i-1],
                        'origin': origin_price,
                        'strength': min(100, (df['high'].iloc[i] - origin_price) / origin_price * 100),
                        'type': 'demand'
                    })
        
        demand_zones = sorted(demand_zones, key=lambda x: x['strength'], reverse=True)
        
        # Merge overlapping
        merged = []
        for zone in demand_zones:
            if not merged or abs(zone['zone'] - merged[-1]['zone']) / merged[-1]['zone'] > 0.02:
                merged.append(zone)
        
        return merged[:5]
    
    def find_fvg(self, symbol, timeframe='15m', lookback=20):
        """
        Find Fair Value Gaps (gaps between candles that price often fills).
        
        FVG = Gap up (bullish) or gap down (bearish) between 3 candles
        - Bullish FVG: candle[i-2] high < candle[i] low
        - Bearish FVG: candle[i-2] low > candle[i] high
        
        Returns:
            list of dict: [{'type': 'bullish'|'bearish', 'high': float, 'low': float}]
        """
        df = self.fetch_ohlcv(symbol, timeframe, limit=lookback)
        
        fvgs = []
        
        for i in range(2, len(df)):
            prev_high = df['high'].iloc[i-2]
            prev_low = df['low'].iloc[i-2]
            current_high = df['high'].iloc[i]
            current_low = df['low'].iloc[i]
            
            # Bullish FVG (potential support)
            if prev_high < current_low:
                fvgs.append({
                    'type': 'bullish',
                    'high': current_low,
                    'low': prev_high,
                    'mid': (current_low + prev_high) / 2
                })
            
            # Bearish FVG (potential resistance)
            if prev_low > current_high:
                fvgs.append({
                    'type': 'bearish',
                    'high': prev_low,
                    'low': current_high,
                    'mid': (prev_low + current_high) / 2
                })
        
        return fvgs[-5:]  # Last 5 FVGs
    
    def find_liquidity_zones(self, symbol, timeframe='4h', lookback=30):
        """
        Find liquidity pools (areas with stop clusters).
        
        Buy-side liquidity (BSL): swing lows below current price
        Sell-side liquidity (SSL): swing highs above current price
        """
        structure = self.get_market_structure(symbol, timeframe)
        df = self.fetch_ohlcv(symbol, timeframe, limit=lookback)
        current_price = df['close'].iloc[-1]
        
        # Find swing points
        highs = df['high'].values
        lows = df['low'].values
        
        liquidity = {'buy_side': [], 'sell_side': []}
        
        for i in range(2, len(df) - 2):
            # Swing high = potential SSL
            if highs[i] == max(highs[i-2:i+3]) and highs[i] > current_price:
                liquidity['sell_side'].append(highs[i])
            # Swing low = potential BSL
            if lows[i] == min(lows[i-2:i+3]) and lows[i] < current_price:
                liquidity['buy_side'].append(lows[i])
        
        return liquidity
    
    def is_bearish_structure(self, symbol, timeframe='4h'):
        """Check if HTF structure is bearish (good for shorts)."""
        structure = self.get_market_structure(symbol, timeframe)
        return structure['structure'] == 'downtrend'
    
    def is_bullish_structure(self, symbol, timeframe='4h'):
        """Check if HTF structure is bullish (avoid shorts)."""
        structure = self.get_market_structure(symbol, timeframe)
        return structure['structure'] == 'uptrend'
    
    def is_near_supply(self, symbol, current_price, timeframe='4h'):
        """Check if price is near a supply zone."""
        supply_zones = self.find_supply_zones(symbol, timeframe)
        
        for zone in supply_zones:
            # Within 2% of supply zone
            if current_price >= zone['zone'] * 0.98 and current_price <= zone['zone'] * 1.02:
                return {
                    'near': True,
                    'zone': zone['zone'],
                    'strength': zone['strength']
                }
        
        return {'near': False, 'zone': None, 'strength': 0}
    
    def is_near_demand(self, symbol, current_price, timeframe='4h'):
        """Check if price is near a demand zone (for TP targets)."""
        demand_zones = self.find_demand_zones(symbol, timeframe)
        
        for zone in demand_zones:
            if current_price >= zone['zone'] * 0.98 and current_price <= zone['zone'] * 1.02:
                return {
                    'near': True,
                    'zone': zone['zone'],
                    'strength': zone['strength']
                }
        
        return {'near': False, 'zone': None, 'strength': 0}
    
    def get_tp_target_from_demand(self, symbol, entry_price, timeframe='4h'):
        """Get take profit target from nearest demand zone below entry."""
        demand_zones = self.find_demand_zones(symbol, timeframe)
        
        for zone in demand_zones:
            if zone['zone'] < entry_price:
                return {
                    'target': zone['zone'],
                    'type': 'demand',
                    'distance_pct': (entry_price - zone['zone']) / entry_price * 100
                }
        
        # Fallback: use swing low
        structure = self.get_market_structure(symbol, timeframe)
        if structure['swing_low']:
            return {
                'target': structure['swing_low'],
                'type': 'swing_low',
                'distance_pct': (entry_price - structure['swing_low']) / entry_price * 100
            }
        
        return None
    
    def analyze_for_short(self, symbol, entry_price, timeframe='4h'):
        """
        Complete TCT analysis for short entry.
        
        Returns:
            dict: {
                'approved': bool,
                'confidence': 0-100,
                'reasons': list,
                'tp_target': float,
                'structure': str
            }
        """
        reasons = []
        confidence = 50  # Base confidence
        
        # 1. Check market structure
        structure = self.get_market_structure(symbol, timeframe)
        if structure['structure'] == 'downtrend':
            reasons.append("✅ Bearish structure (downtrend)")
            confidence += 20
        elif structure['structure'] == 'range':
            reasons.append("⚠️ Range structure (neutral)")
            confidence += 0
        else:
            reasons.append("❌ Bullish structure - AVOID SHORTS")
            return {
                'approved': False,
                'confidence': 0,
                'reasons': reasons,
                'tp_target': None,
                'structure': structure['structure']
            }
        
        # 2. Check supply zone
        supply = self.is_near_supply(symbol, entry_price, timeframe)
        if supply['near']:
            reasons.append(f"✅ Near supply zone at ${supply['zone']:.4f} (strength: {supply['strength']})")
            confidence += 15
        else:
            reasons.append("⚠️ No supply zone nearby")
        
        # 3. Check for bearish FVG
        fvgs = self.find_fvg(symbol, '15m')
        bearish_fvg = [f for f in fvgs if f['type'] == 'bearish']
        if bearish_fvg:
            reasons.append(f"✅ Bearish FVG found at ${bearish_fvg[0]['mid']:.4f}")
            confidence += 10
        
        # 4. Check liquidity
        liquidity = self.find_liquidity_zones(symbol, timeframe)
        if liquidity['sell_side']:
            reasons.append(f"✅ Sell-side liquidity above at ${min(liquidity['sell_side']):.4f}")
            confidence += 5
        
        # Get TP target
        tp_data = self.get_tp_target_from_demand(symbol, entry_price, timeframe)
        
        # Calculate R:R
        if tp_data:
            rr = tp_data['distance_pct'] / 12  # 12% SL assumption
            if rr >= 2:
                reasons.append(f"✅ Good R:R ({rr:.1f}:1) to demand zone")
                confidence += 10
            else:
                reasons.append(f"⚠️ Poor R:R ({rr:.1f}:1)")
        
        approved = confidence >= 70
        
        return {
            'approved': approved,
            'confidence': confidence,
            'reasons': reasons,
            'tp_target': tp_data['target'] if tp_data else None,
            'tp_type': tp_data['type'] if tp_data else None,
            'structure': structure['structure'],
            'supply_zone': supply['zone'],
            'liquidity': liquidity
        }


# === INTEGRATION GUIDE ===

"""
Add to main.py:

1. Import the module:
   from tct_analysis import TCTAnalyzer

2. Initialize (in main or __init__):
   tct = TCTAnalyzer(exchange_id='gateio')

3. Use before entering trade:

   # Get current price
   current_price = get_current_price(symbol)  # Your existing function
   
   # Run TCT analysis
   analysis = tct.analyze_for_short(symbol, current_price, '4h')
   
   print(f"TCT Analysis for {symbol}:")
   print(f"  Approved: {analysis['approved']}")
   print(f"  Confidence: {analysis['confidence']}%")
   for reason in analysis['reasons']:
       print(f"  {reason}")
   
   if analysis['approved'] and analysis['confidence'] >= 75:
       # High confidence - proceed with larger size
       position_size = base_size * 1.5
   elif analysis['approved']:
       # Normal size
       position_size = base_size
   else:
       # Skip - TCT filter rejected
       skip_trade(f"TCT rejected: {analysis['reasons']}")
"""

if __name__ == "__main__":
    # Quick test
    tct = TCTAnalyzer()
    
    # Test on BTC
    symbol = 'BTC/USDT:USDT'
    
    print("=== TCT Analysis for BTC ===\n")
    
    structure = tct.get_market_structure(symbol, '4h')
    print(f"Structure: {structure['structure']}")
    print(f"Trend Strength: {structure['trend_strength']:.1f}%")
    print(f"Swing High: ${structure['swing_high']}")
    print(f"Swing Low: ${structure['swing_low']}")
    
    print("\n--- Supply Zones ---")
    supply = tct.find_supply_zones(symbol, '4h')
    for s in supply[:3]:
        print(f"  ${s['zone']:.2f} (strength: {s['strength']:.0f}%)")
    
    print("\n--- Demand Zones ---")
    demand = tct.find_demand_zones(symbol, '4h')
    for d in demand[:3]:
        print(f"  ${d['zone']:.2f} (strength: {d['strength']:.0f}%)")
    
    print("\n--- Fair Value Gaps (15m) ---")
    fvg = tct.find_fvg(symbol, '15m')
    for f in fvg[-3:]:
        print(f"  {f['type']}: ${f['low']:.2f} - ${f['high']:.2f}")
    
    print("\n--- Liquidity ---")
    liq = tct.find_liquidity_zones(symbol, '4h')
    print(f"  Sell-side (above): {liq['sell_side'][:3]}")
    print(f"  Buy-side (below): {liq['buy_side'][:3]}")
