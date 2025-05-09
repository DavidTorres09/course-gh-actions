import { test, expect } from '@playwright/test';
import { adminLogin, SCREENSHOT_PATH } from './utils';

test.beforeEach(async ({ page }) => {
  await adminLogin({ page });
  await page.getByRole('button', { name: 'Users' }).click();
});

test.describe('Users', () => {
  test('Notifications', async ({ page }) => {
    await page.getByRole('link', { name: 'Notifications' }).click();
    await page.screenshot({ path: SCREENSHOT_PATH + 'notifications.png' });
  });

  test('Avatars Approval', async ({ page }) => {
    await page.getByRole('link', { name: 'Avatars Approval' }).click();
    await page.screenshot({ path: SCREENSHOT_PATH + 'avatars-approval.png' });
  });

  test("Avatar's Report", async ({ page }) => {
    await page.getByRole('link', { name: "Avatar's Report" }).click();
    await page.screenshot({ path: SCREENSHOT_PATH + 'avatars-report.png' });
  });

  test('Users', async ({ page }) => {
    await page.getByRole('link', { name: 'Users' }).click();
    await page.screenshot({ path: SCREENSHOT_PATH + 'users.png' });
  });

  test('Lotto Bonus Play', async ({ page }) => {
    await page.getByRole('link', { name: 'Lotto Bonus Play' }).click();
    await page.screenshot({ path: SCREENSHOT_PATH + 'lotto-bonus-play.png' });
  });

  test('Resend Winners', async ({ page }) => {
    await page.getByRole('link', { name: 'Resend Winners' }).click();
    await page.screenshot({ path: SCREENSHOT_PATH + 'resend-winners.png' });
  });

  test('Active Player Report', async ({ page }) => {
    await page.getByRole('link', { name: 'Active Player Report' }).click();
    await page.screenshot({
      path: SCREENSHOT_PATH + 'active-player-report.png',
    });
  });
});
