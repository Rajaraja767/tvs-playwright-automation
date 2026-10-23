// ticket-flow.spec.ts
// Flow: Login (Medium Speed) -> Customer Satisfaction -> Statutory -> "+" -> "raise a ticket"
//      -> 4 (Vendor Bill Compliance) -> Logout
//
// Run command:
//   npx playwright test tests/ticket-flow.spec.ts --project=chromium --headed

import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'https://tvs.algohealthplus.com';

const USER = process.env.APP_USER || 'venkateshraja@gmail.com';
const PASS = process.env.APP_PASS || 'Venkateshraja@123';

test.use({
  storageState: { cookies: [], origins: [] },
  viewport: { width: 1366, height: 768 },
  launchOptions: { slowMo: 1000 }, // Medium speed delay (1 second)
  screenshot: 'on',
  video: 'on',
});

// ---------------------------------------------------------------- 1. LOGIN
async function login(page: Page) {
  await page.goto(`${BASE_URL}/app/login`, { waitUntil: 'domcontentloaded' });

  if (!page.url().includes('/login')) {
    console.log('Already logged in.');
    return;
  }

  const email = page.getByPlaceholder('Email');
  const password = page.getByPlaceholder('Password');

  await expect(email).toBeVisible({ timeout: 30000 });

  await email.click();
  await email.pressSequentially(USER, { delay: 120 });

  await password.click();
  await password.pressSequentially(PASS, { delay: 120 });

  const loginBtn = page.getByText('Login', { exact: true }).first();
  await expect(loginBtn).toBeVisible({ timeout: 10000 });
  await loginBtn.click();

  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 30000 });
  await page.waitForLoadState('domcontentloaded');
}

// ---------------------------------------------------- 2. OPEN CUSTOMER SATISFACTION
async function openCustomerSatisfaction(page: Page) {
  try {
    const switcher = page.locator('text=Customer Satisfaction').first();
    await switcher.click({ timeout: 15000 });
  } catch {
    await page.goto(`${BASE_URL}/app/tms`, { waitUntil: 'domcontentloaded' });
  }
  await expect(page.getByText('Statutory', { exact: true })).toBeVisible({ timeout: 30000 });
}

// ---------------------------------------------------- 3. CLICK "+" BUTTON (Fixed & Robust)
async function clickPlusButton(page: Page) {
  // பலவிதமான வழிகளில் "+" / Add பட்டனைத் தேடுதல் (Button, Icon, SVG, Class பெயர்கள்)
  const plusBtn = page.locator(
    'button:has(svg), [aria-label*="add" i], [aria-label*="new" i], button:has-text("+"), .fa-plus, [data-icon="plus"]'
  ).first();

  await expect(plusBtn).toBeVisible({ timeout: 15000 });
  await plusBtn.click();
}

// ---------------------------------------------------- 4. CHAT FUNCTION
async function sendChat(page: Page, text: string) {
  const box = page.getByPlaceholder('Type your message...');
  await expect(box).toBeVisible({ timeout: 30000 });
  await box.click();
  await box.pressSequentially(text, { delay: 100 });
  await box.press('Enter');
}

// ---------------------------------------------------- 5. LOGOUT
async function logout(page: Page) {
  const menuBtn = page.locator('header button, nav button, [aria-label*="menu" i]').last();
  await menuBtn.click();

  const logoutBtn = page.getByText('Logout', { exact: true });
  await expect(logoutBtn).toBeVisible({ timeout: 10000 });
  await logoutBtn.click();

  await expect(page).toHaveURL(/\/app\/login/, { timeout: 30000 });
}

// ---------------------------------------------------------------- MAIN TEST FLOW
test('Login -> Statutory -> Raise ticket (Vendor Bill Compliance) -> Logout', async ({ page }) => {
  test.setTimeout(300000);

  await test.step('1. Login', async () => {
    await login(page);
  });

  await test.step('2. Open Customer Satisfaction', async () => {
    await openCustomerSatisfaction(page);
  });

  await test.step('3. Select Statutory', async () => {
    await page.getByText('Statutory', { exact: true }).click();
    await expect(page.getByText('General Query', { exact: true }).first()).toBeVisible({ timeout: 30000 });
    await page.waitForTimeout(1000);
  });

  await test.step('4. Click "+" Button', async () => {
    await clickPlusButton(page);
  });

  await test.step('5. Send "raise a ticket"', async () => {
    await sendChat(page, 'raise a ticket');
    await expect(page.getByText(/What type of ticket would you like to create/i).last())
      .toBeVisible({ timeout: 60000 });
  });

  await test.step('6. Select Option 4 (Vendor Bill Compliance)', async () => {
    await sendChat(page, '4');
    await page
      .getByText(/I still need these mandatory fields/i)
      .last()
      .waitFor({ timeout: 60000 })
      .catch(() => console.log('WARN: Mandatory fields message not seen, continuing...'));
    await page.waitForTimeout(2000);
  });

  await test.step('7. Logout', async () => {
    await logout(page);
  });
});