import { test, expect } from '@playwright/test';
import { adminLogin, SCREENSHOT_PATH } from './utils';

test.beforeEach(async ({ page }) => {
  await adminLogin({ page });
});

test.describe('Help and Logout', () => {
  test('Help', async ({ page }) => {
    await page.getByRole('link', { name: 'Help' }).click();
    await page.screenshot({ path: SCREENSHOT_PATH + 'help.png' });
  });

  test('Logout', async ({ page }) => {
    await page.getByRole('link', { name: 'Logout' }).click();
    await page.screenshot({ path: SCREENSHOT_PATH + 'logout.png' });
  });
});
