import { test, expect } from '@playwright/test';

test('Verify chatbot response to ticket query', async ({ page }) => {
  // 1. Navigate to the application URL
  await page.goto('https://tvs.algohealthplus.com/');

  // 2. Select a statutory ticket from the left panel
  await page.click('text=10 - Reporting of Issue of Shares');

  // 3. Locate the chat input field, type a query, and press Enter
  const chatInput = page.locator('placeholder=Type your message...');
  await chatInput.fill('list the subject');
  await chatInput.press('Enter');

  // 4. Assert that the bot's response bubble appears containing expected text
  const botResponse = page.locator('text=The Subject field is a free-text field');
  await expect(botResponse).toBeVisible({ timeout: 10000 });
});