import { test, expect } from '@playwright/test';
import { adminLogin, SCREENSHOT_PATH } from './utils';

test.beforeEach(async ({ page }) => {
  await adminLogin({ page });
  await page.getByRole('button', { name: 'Manage Transaction' }).click();
});

test.describe('Manage Transaction', () => {
  test('Remove transaction', async ({ page }) => {
    await page.getByRole('link', { name: 'Remove transaction' }).click();
    await page.screenshot({ path: SCREENSHOT_PATH + 'remove-transaction.png' });
  });

  test('Remove subticket', async ({ page }) => {
    await page.getByRole('link', { name: 'Remove subticket' }).click();
    await page.screenshot({ path: SCREENSHOT_PATH + 'remove-subticket.png' });
  });
});
