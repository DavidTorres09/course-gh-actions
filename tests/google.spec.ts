import { test } from '@playwright/test';

test('Google search shows results', async ({ page }) => {
  await page.goto('https://www.google.com');

  const acceptButton = page.locator('button', { hasText: /accept/i });
  if (await acceptButton.isVisible()) {
    await acceptButton.click();
  }

  await page.fill('textarea[id="APjFqb"]', 'Playwright testing');
  await page.keyboard.press('Enter');
});
