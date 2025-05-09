import { test, expect } from '@playwright/test';
import { adminLogin, SCREENSHOT_PATH } from './utils';

test.beforeEach(async ({ page }) => {
  await adminLogin({ page });
  await page.getByRole('button', { name: 'Domain Settings' }).click();
});

test.describe('Domain Settings', () => {
  test('Game Type Limits', async ({ page }) => {
    await page.getByRole('link', { name: 'Game Type Limits' }).click();
    await page.screenshot({ path: SCREENSHOT_PATH + 'game-type-limits.png' });
  });

  test('Manage Domain', async ({ page }) => {
    await page.getByRole('link', { name: 'Manage Domain' }).click();
    await page.screenshot({ path: SCREENSHOT_PATH + 'manage-domain.png' });
  });

  test('Manage Days Forward', async ({ page }) => {
    await page.getByRole('link', { name: 'Manage Days Forward' }).click();
    await page.screenshot({
      path: SCREENSHOT_PATH + 'manage-days-forward.png',
    });
  });

  test('Disabled GameType', async ({ page }) => {
    await page.getByRole('link', { name: 'Disabled GameType' }).click();
    await page.screenshot({ path: SCREENSHOT_PATH + 'disabled-game-type.png' });
  });

  test('Draw limits', async ({ page }) => {
    await page.getByRole('link', { name: 'Draw limits' }).click();
    await page.screenshot({ path: SCREENSHOT_PATH + 'draw-limits.png' });
  });
});
