# Crypto Price Monitor

## Description
Real-time cryptocurrency price monitoring using CoinGecko API. Track prices, 24h changes, volume, and market cap for any coin.

## Usage
When user asks for crypto prices or to monitor prices:
1. Use CoinGecko API (free, no key needed)
2. Call: `https://api.coingecko.com/api/v3/simple/price?ids={coins}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true`
3. Format results in a table

## Supported Coins
- bitcoin, ethereum, solana, cardano, ripple, polygon, chainlink, avalanche, Polkadot, dogecoin

## Output Format
| Coin | Price | 24h % | Volume |
|------|-------|-------|--------|
| BTC | $69,xxx | +x.xx% | $xxB |

## Example
```
!price btc eth sol
```
