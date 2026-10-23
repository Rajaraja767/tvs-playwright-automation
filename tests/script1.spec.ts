import { test, expect } from '@playwright/test';

test.use({ storageState: 'auth.json' });

test.beforeEach(async ({ page }) => {
  await page.goto('https://tvs.algohealthplus.com/app/tms/folders/statutory');
});

test('statutory page loads', async ({ page }) => {
  await expect(page).toHaveURL(/statutory/);
  await expect(page.getByText('No Chat Selected')).toBeVisible();
});

test('open a ticket', async ({ page }) => {
  await page.getByText('7823 - checking').click();
  await expect(page.getByText('No Chat Selected')).toBeHidden();
});

test('switch Mine and Team tabs', async ({ page }) => {
  await page.getByText('Team').click();
  await page.getByText('Mine').click();
  await expect(page).toHaveURL(/statutory/);
});