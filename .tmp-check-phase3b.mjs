import { chromium } from "playwright";

const BASE = "http://localhost:3016";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });

async function shot(name) {
  await page.screenshot({ path: `screenshots/${name}.png`, fullPage: true });
  console.log("screenshot:", name);
}

// --- Login as the dev employee account (phone/password) ---
await page.goto(`${BASE}/login`);
await page.waitForLoadState("networkidle");
await page.fill('input[name="username"], input[type="text"]', "0900000001");
await page.fill('input[name="password"], input[type="password"]', "DevLogin!123");
await page.click('button[type="submit"]');
await page.waitForURL(`${BASE}/`, { timeout: 15000 });
console.log("logged in as dev employee");

// --- My Availability page for employee id 1 ---
await page.goto(`${BASE}/my-availabilities/1`);
await page.waitForLoadState("networkidle");
await page.waitForTimeout(1000);
await shot("05-my-availability-initial");

let bodyText = await page.textContent("body");
console.log(bodyText.includes("Ca Sang E2E") ? "PASS: template row visible" : "WARN: template row not visible");
console.log(bodyText.includes("08:00") && bodyText.includes("16:00") ? "PASS: sub-shift time visible" : "WARN: sub-shift time not visible");

// --- Register ---
const registerBtn = page.getByRole("button", { name: /register/i }).first();
await registerBtn.click();
await page.waitForTimeout(1200);
await shot("06-after-register");

bodyText = await page.textContent("body");
console.log(bodyText.includes("Unregister") ? "PASS: shows Unregister after registering" : "WARN: Unregister button not found");
console.log(bodyText.includes("SCHEDULED") ? "PASS: status shows SCHEDULED" : "WARN: SCHEDULED status not found");

// --- Unregister ---
const unregisterBtn = page.getByRole("button", { name: /unregister/i }).first();
await unregisterBtn.click();
await page.waitForTimeout(1200);
await shot("07-after-unregister");

bodyText = await page.textContent("body");
console.log(bodyText.includes("Register") && !bodyText.includes("Unregister") ? "PASS: back to Register state" : "WARN: still shows Unregister");

await browser.close();
