import { chromium } from "playwright";
import { mkdir } from "fs/promises";
import { join } from "path";

const BASE = "http://localhost:3000";
const OUT = join(import.meta.dir, "../screenshots");

const ROUTES = [
  { file: "01-login", path: "/login", auth: false },
  { file: "02-dashboard", path: "/", auth: true },
  { file: "03-setup", path: "/setup", auth: true },
  { file: "04-sales", path: "/sales", auth: true },
  { file: "05-sales-new", path: "/sales/new", auth: true },
  { file: "06-intake", path: "/intake", auth: true },
  { file: "07-intake-new", path: "/intake/new", auth: true },
  { file: "08-trips", path: "/trips", auth: true },
  { file: "09-trips-new", path: "/trips/new", auth: true },
  { file: "10-ledger", path: "/ledger", auth: true },
  { file: "11-contacts", path: "/contacts", auth: true },
  { file: "12-expenses", path: "/expenses", auth: true },
  { file: "13-inventory", path: "/inventory", auth: true },
  { file: "14-products", path: "/products", auth: true },
  { file: "15-users", path: "/users", auth: true },
  { file: "16-settings", path: "/settings", auth: true },
  { file: "17-admin-trips", path: "/admin-trips", auth: true },
];

async function main() {
  await mkdir(OUT, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  // Login first
  console.log("Logging in...");
  await page.goto(`${BASE}/login`);
  await page.waitForLoadState("networkidle");
  await page.screenshot({ path: join(OUT, "01-login.png"), fullPage: true });
  console.log("✓ 01-login.png");

  // Fill login form
  await page.fill('input[type="text"], input[name="username"], input[placeholder*="sername" i]', "admin");
  await page.fill('input[type="password"]', "admin123");
  await page.click('button[type="submit"]');
  await page.waitForURL(`${BASE}/`, { timeout: 10000 });
  await page.waitForLoadState("networkidle");

  // Save auth state
  const storage = await context.storageState();

  const results: { file: string; status: string }[] = [];

  for (const route of ROUTES.slice(1)) {
    try {
      await page.goto(`${BASE}${route.path}`, { waitUntil: "networkidle", timeout: 15000 });
      await page.waitForTimeout(800); // let animations settle
      await page.screenshot({ path: join(OUT, `${route.file}.png`), fullPage: true });
      console.log(`✓ ${route.file}.png`);
      results.push({ file: route.file, status: "ok" });
    } catch (e) {
      console.log(`✗ ${route.file} — ${(e as Error).message.split("\n")[0]}`);
      results.push({ file: route.file, status: "failed" });
    }
  }

  await browser.close();

  console.log("\n--- Summary ---");
  results.forEach(r => console.log(`${r.status === "ok" ? "✓" : "✗"} ${r.file}`));
}

main().catch(console.error);
