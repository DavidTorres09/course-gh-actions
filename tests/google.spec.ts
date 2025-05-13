import { test, expect } from '@playwright/test';

test('Google search shows results', async ({ page }) => {
  await page.goto('https://www.google.com');

  // Aceptar cookies si aparece
  const acceptButton = page.locator('button', { hasText: /accept/i });
  if (await acceptButton.isVisible()) {
    await acceptButton.click();
  }

  await page.fill('input[name="q"]', 'Playwright testing');
  await page.keyboard.press('Enter');
  await page.waitForSelector('#search');

  const results = await page.$$('#search .g');
  expect(results.length).toBeGreaterThan(0);
});
