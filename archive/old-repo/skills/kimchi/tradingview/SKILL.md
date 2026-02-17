# TradingView Chart Analysis

## Description
Open and analyze TradingView charts for technical analysis. Use browser automation to load charts and identify patterns.

## Usage
1. Open TradingView chart: `https://www.tradingview.com/chart/?symbol=BINANCE:BTCUSDT`
2. Take screenshot for analysis
3. Identify: support/resistance, trend lines, chart patterns, indicators

## Supported Exchanges on TradingView
- BINANCE:BTCUSDT
- BINANCE:ETHUSDT
- BINANCE:SOLUSDT
- BINANCE:BNBUSDT
- MEXC:BTCUSDT
- BYBIT:BTCUSDT

## Timeframes
- 1m, 5m, 15m (intraday)
- 1H, 4H (swing)
- 1D (position)

## TCT Analysis Elements
- Supply/Demand zones
- Liquidity pools (buy/sell stops)
- Market structure (HH/HL/LH/LL)
- Order block
- Fair value gaps

## Example
```
!chart btc 4h
!chart eth 1h
```
