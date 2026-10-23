import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/app/tms/folders/schedule');
  await expect(page).not.toHaveURL(/login/); // login aagalana inga fail aagum
});

test('TC01 - Schedule page loads with all main controls', async ({ page }) => {
  await expect(page.getByText('Schedule').first()).toBeVisible();
  await expect(page.getByText('Mine')).toBeVisible();
  await expect(page.getByText('Team')).toBeVisible();
  await expect(page.getByText('General Query')).toBeVisible();
});

test('TC02 - Ticket list is displayed with status badges', async ({ page }) => {
  await expect(page.getByText(/Tickets-\d{2}-\d{2}-\d{4}/).first()).toBeVisible();
  await expect(page.getByText(/Active|Open|Closed/).first()).toBeVisible();
});

test('TC03 - Mine and Team tabs can be switched', async ({ page }) => {
  await page.getByText('Team').click();
  await expect(page).toHaveURL(/schedule/);
  await page.getByText('Mine').click();
  await expect(page).toHaveURL(/schedule/);
});

test('TC04 - Clicking a ticket opens its chat', async ({ page }) => {
  await page.getByText(/Tickets-\d{2}-\d{2}-\d{4}/).first().click();
  await expect(page.getByPlaceholder('Type your message...')).toBeVisible();
  await expect(page.getByText('No Chat Selected')).toBeHidden();
});

test('TC05 - Chat shows bot reply and message input works', async ({ page }) => {
  await page.getByText(/Tickets-\d{2}-\d{2}-\d{4}/).first().click();
  const input = page.getByPlaceholder('Type your message...');
  await expect(input).toBeVisible();
  await input.fill('hello test');
  await input.press('Enter');
  await expect(page.getByText('hello test')).toBeVisible();
});

test('TC06 - Closed ticket opens and shows history', async ({ page }) => {
  await page.getByText('Closed').first().click();
  await expect(page.getByText('No Chat Selected')).toBeHidden();
});

test('TC07 - Back arrow returns to folder list', async ({ page }) => {
  await page.locator('[class*="back"], button:has(svg)').first().click(); // codegen-la correct locator edunga
  await expect(page).not.toHaveURL(/schedule$/);
});