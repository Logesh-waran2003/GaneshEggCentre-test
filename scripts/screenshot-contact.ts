import { chromium } from "playwright";
import { join } from "path";

const BASE = "http://localhost:3000";
const OUT = join(import.meta.dir, "../screenshots");

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const page = await context.newPage();

  // Login
  await page.goto(`${BASE}/login`);
  await page.waitForLoadState("networkidle");
  await page.fill('input[type="text"], input[placeholder*="sername" i]', "admin");
  await page.fill('input[type="password"]', "admin123");
  await page.click('button[type="submit"]');
  await page.waitForURL(`${BASE}/`, { timeout: 10000 });

  // Go to contacts, click first contact
  await page.goto(`${BASE}/contacts`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  // Find first contact link
  const contactLink = page.locator('a[href*="/contacts/"]').first();
  const href = await contactLink.getAttribute("href");
  console.log("First contact href:", href);

  await contactLink.click();
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(800);
  await page.screenshot({ path: join(OUT, "12-contact-detail.png"), fullPage: true });
  console.log("✓ 12-contact-detail.png —", page.url());

  await browser.close();
}

main().catch(console.error);
