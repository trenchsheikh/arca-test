import { chromium } from '/tmp/arca-smoke/node_modules/playwright/index.mjs';

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('http://127.0.0.1:3100/', { waitUntil: 'networkidle' });
  await page.getByRole('link', { name: 'View Project' }).click();
  await page.waitForURL('**/agents/apollo');
  await page.getByRole('heading', { name: 'Apollo', level: 1 }).waitFor({ state: 'visible' });
  await page.getByText('Upcoming ICO / Deal Terms').waitFor({ state: 'visible' });
  if (errors.length) throw new Error('Browser errors: ' + errors.join('; '));
  console.log('Apollo project page stays visible after navigation and hydration.');
} finally {
  await browser.close();
}
