import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();
const logs = [];
page.on('console', msg => logs.push(`[${msg.type()}] ${msg.text()}`));
page.on('pageerror', err => logs.push(`[pageerror] ${err.message}`));

await page.goto('http://localhost:9002/reports/new');
await page.waitForTimeout(1000);

// open dataset select
await page.getByLabel('Dataset').click();
await page.waitForTimeout(300);
await page.screenshot({ path: '/tmp/1-dataset-open.png' });

// pick first non-group option
const options = await page.locator('.q-item').allTextContents();
console.log('OPTIONS:', JSON.stringify(options));

await page.locator('.q-item').filter({ hasText: /trips|routes|drivers/i }).first().click();
await page.waitForTimeout(800);
await page.screenshot({ path: '/tmp/2-dataset-picked.png' });

// select a column checkbox
const checkboxCount = await page.locator('.q-checkbox').count();
console.log('CHECKBOX COUNT:', checkboxCount);
await page.locator('.q-checkbox').first().click();
await page.waitForTimeout(500);
await page.screenshot({ path: '/tmp/3-column-selected.png', fullPage: true });

console.log('LOGS:', logs.join('\n'));
await browser.close();
