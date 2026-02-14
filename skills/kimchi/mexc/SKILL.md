# MEXC Trading Integration

## Description
MEXC exchange integration for price data, market info, and trade execution.

## Price API (No Auth Needed)
```
GET https://api.mexc.com/api/v3/ticker/24hr?symbol=BTC_USDT
GET https://api.mexc.com/api/v3/depth?symbol=BTC_USDT&limit=20
GET https://api.mexc.com/api/v3/klines?symbol=BTC_USDT&interval=1h&limit=50
```

## Available Symbols
- BTC_USDT, ETH_USDT, SOL_USDT, BNB_USDT
- XRP_USDT, ADA_USDT, DOGE_USDT
- And 400+ more

## For Trade Execution
Requires API key with trade permissions. Scot has MEXC account.

## Usage
1. Get 24h ticker: symbol, lastPrice, priceChange, volume
2. Get order book: bids/asks with prices and quantities
3. Get klines: OHLCV data for chart analysis

## Example
```
!mexc btc
!mexc orderbook eth
!mexc klines sol 4h
```
