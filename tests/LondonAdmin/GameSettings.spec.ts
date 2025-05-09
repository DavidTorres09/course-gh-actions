import { test, expect } from '@playwright/test';
import { adminLogin, SCREENSHOT_PATH } from './utils';

test.beforeEach(async ({ page }) => {
  await adminLogin({ page });
  await page.getByRole('button', { name: 'Game Settings' }).click();
});

test.describe('Game Settings', () => {
  test('Bet Amounts', async ({ page }) => {
    await page.getByRole('link', { name: 'Bet Amounts' }).click();
    await page.screenshot({ path: SCREENSHOT_PATH + 'bet-amounts.png' });
  });

  test('Manage States', async ({ page }) => {
    await page.getByRole('link', { name: 'Manage States' }).click();
    await page.screenshot({ path: SCREENSHOT_PATH + 'manage-states.png' });
  });

  test("Draws' Official Sites", async ({ page }) => {
    await page.getByRole('link', { name: "Draws' Official Sites" }).click();
    await page.screenshot({
      path: SCREENSHOT_PATH + 'draws-official-sites.png',
    });
  });
});
