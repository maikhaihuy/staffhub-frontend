import { chromium } from "playwright";

const BASE = "http://localhost:3016";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });

async function shot(name) {
  await page.screenshot({ path: `screenshots/${name}.png`, fullPage: true });
  console.log("screenshot:", name);
}

// --- Login ---
await page.goto(`${BASE}/login`);
await page.waitForLoadState("networkidle");
await page.fill('input[name="username"], input[type="text"]', "settings");
await page.fill('input[name="password"], input[type="password"]', "ChangeMe!123");
await page.click('button[type="submit"]');
await page.waitForURL(`${BASE}/`, { timeout: 15000 });
console.log("logged in");

// --- Create a template via the real admin form (regression test for the time-format bug) ---
await page.goto(`${BASE}/shifts`);
await page.waitForLoadState("networkidle");
await shot("01-shifts-page");

await page.getByRole("button", { name: /thêm mới/i }).first().click();
await page.waitForTimeout(500);
await shot("02-template-form-open");

await page.fill('input[name="name"]', "Ca Sang E2E");
const timeInputs = page.locator('input[type="time"]');
await timeInputs.nth(0).fill("08:00");
await timeInputs.nth(1).fill("16:00");
await shot("03-template-form-filled");

await page.getByRole("button", { name: /lưu|save|submit|create/i }).last().click();
await page.waitForTimeout(1500);
await shot("04-template-created");

const bodyText = await page.textContent("body");
if (bodyText.includes("Ca Sang E2E")) {
  console.log("PASS: template created and visible");
} else {
  console.log("WARN: template name not found in page text");
}
if (bodyText.includes("08:00") && bodyText.includes("16:00")) {
  console.log("PASS: time displays correctly as 08:00 - 16:00");
} else {
  console.log("WARN: expected time strings not found");
}

await browser.close();
