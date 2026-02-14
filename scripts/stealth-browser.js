#!/usr/bin/env node
// Stealth Chromium CDP Server for OpenClaw with advanced stealth settings
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

const PORT = parseInt(process.argv[2] || '9220');
const USER_DATA_DIR = process.argv[3] || '/tmp/chromium-stealth-data';

async function startStealthBrowser() {
    console.log('Starting stealth Chromium on port', PORT);
    
    const browser = await puppeteer.launch({
        executablePath: '/usr/bin/chromium-browser',
        headless: true,
        args: [
            `--remote-debugging-port=${PORT}`,
            '--no-first-run',
            '--no-default-browser-check',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-sandbox',
            '--disable-gpu',
            '--disable-blink-features=AutomationControlled',
            '--disable-features=AutomationControlled',
            '--window-size=1920,1080',
            '--start-maximized',
            '--disable-extensions',
            '--disable-plugins',
            '--disable-default-apps',
            '--allow-pre-commit-input',
            '--disable-background-networking',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-breakpad',
            '--disable-client-side-phishing-detection',
            '--disable-component-extensions-with-background-pages',
            '--disable-component-update',
            '--disable-default-certification-check',
            '--disable-default-plugin-csp',
            '--disable-device-discovery-notifications',
            '--disable-domain-reliability',
            '--disable-features=TranslateUI',
            '--disable-hang-monitor',
            '--disable-ipc-flooding-protection',
            '--disable-popup-blocking',
            '--disable-prompt-on-repost',
            '--disable-renderer-backgrounding',
            '--disable-speech-api',
            '--disable-sync',
            '--disable-translate',
            '--force-color-profile=srgb',
            '--metrics-recording-only',
            '--no-crash-upload',
            '--no-pings',
            '--safebrowsing-disable-auto-update',
        ],
        userDataDir: USER_DATA_DIR,
        defaultViewport: { width: 1920, height: 1080 },
        ignoreDefaultArgs: ['--enable-automation'],
        dumpio: false,
    });

    // Inject additional stealth settings via CDP
    const pages = await browser.pages();
    for (const page of pages) {
        await page.evaluateOnNewDocument(() => {
            // Remove webdriver flag
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined,
                configurable: true
            });
            
            // Add realistic plugins
            Object.defineProperty(navigator, 'plugins', {
                get: () => [1, 2, 3, 4, 5],
                configurable: true
            });
            
            // Add languages
            Object.defineProperty(navigator, 'languages', {
                get: () => ['en-US', 'en'],
                configurable: true
            });
            
            // Remove chrome runtime
            if (window.chrome) {
                window.chrome.runtime = undefined;
            }
            
            // Add permissions
            const originalQuery = window.navigator.permissions.query;
            window.navigator.permissions.query = (parameters) => (
                parameters.name === 'notifications' ?
                    Promise.resolve({ state: Notification.permission }) :
                    originalQuery(parameters)
            );
            
            // Add hardware concurrency
            Object.defineProperty(navigator, 'hardwareConcurrency', {
                get: () => 8,
                configurable: true
            });
            
            // Add device memory
            Object.defineProperty(navigator, 'deviceMemory', {
                get: () => 8,
                configurable: true
            });
        });
    }

    console.log('Stealth Chromium started successfully');
    console.log('CDP available at port', PORT);
    console.log('Stealth settings applied:');
    console.log('  - navigator.webdriver: removed');
    console.log('  - User-Agent: Chrome (realistic)');
    console.log('  - AutomationControlled: disabled');
    console.log('  - Viewport: 1920x1080');
    console.log('  - All stealth evasions: enabled');

    // Keep process alive
    process.on('SIGINT', async () => {
        console.log('Shutting down...');
        await browser.close();
        process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
        console.log('Shutting down...');
        await browser.close();
        process.exit(0);
    });
}

startStealthBrowser().catch(err => {
    console.error('Failed to start:', err);
    process.exit(1);
});
