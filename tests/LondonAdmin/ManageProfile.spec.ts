import { test, expect } from '@playwright/test';
import { adminLogin, SCREENSHOT_PATH } from './utils';

test.beforeEach(async ({ page }) => {
  await adminLogin({ page });
  await page.getByRole('button', { name: 'Manage Profile' }).click();
});

test.describe('Manage Profile', () => {
  test('Profiles', async ({ page }) => {
    await page.getByRole('link', { name: 'Profiles' }).click();
    await page.screenshot({ path: SCREENSHOT_PATH + 'profiles.png' });
  });

  test('Player Profile', async ({ page }) => {
    await page.getByRole('link', { name: 'Player Profile' }).click();
    await page.screenshot({ path: SCREENSHOT_PATH + 'player-profile.png' });
  });
});
