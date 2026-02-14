"""
LambdaTest + Playwright script to open TradingView
Run: python lambdatest_tv.py
"""

from playwright.sync_api import sync_playwright
import os

# LambdaTest credentials
LT_USERNAME = "patersonscot3"
LT_ACCESS_KEY = "LT_xlm8AAP4ePQQSqi5uQgUBGZllI7IfQnzQ09FjBJxu8CA4RN"

# LambdaTest WebDriver endpoint
LT_CDP = f"wss://{LT_USERNAME}:{LT_ACCESS_KEY}@cdp.lambdatest.com"

def main():
    with sync_playwright() as p:
        # Connect to LambdaTest
        browser = p.chromium.connect_over_cdp(LT_CDP)
        
        # Create new page and navigate to TradingView
        page = browser.new_page()
        page.goto("https://www.tradingview.com/chart/?symbol=BINANCE:BTCUSDT")
        
        print(f"Page title: {page.title()}")
        print(f"Current URL: {page.url}")
        
        # Take screenshot
        page.screenshot(path="playwright_tv.png")
        print("Screenshot saved to playwright_tv.png")
        
        # Keep browser open for interaction
        print("Browser open - press Ctrl+C to exit")
        
        try:
            page.wait_for_timeout(60000)  # Keep open for 60 seconds
        except KeyboardInterrupt:
            pass
        
        browser.close()

if __name__ == "__main__":
    main()
