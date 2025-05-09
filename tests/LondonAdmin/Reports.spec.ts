import { test, expect } from '@playwright/test';
import { adminLogin, SCREENSHOT_PATH } from './utils';

test.beforeEach(async ({ page }) => {
  await adminLogin({ page });
  await page.getByRole('button', { name: 'Reports' }).click();
});

test.describe('Reports', () => {
  test('Financial Report', async ({ page }) => {
    await page.getByRole('link', { name: 'Financial Report' }).click();
    await page.screenshot({ path: SCREENSHOT_PATH + 'financial-report.png' });
  });

  test('Winners Report', async ({ page }) => {
    await page.getByRole('link', { name: 'Winners Report' }).click();
    await page.screenshot({ path: SCREENSHOT_PATH + 'winners-report.png' });
  });

  test('Drawings Report', async ({ page }) => {
    await page.getByRole('link', { name: 'Drawings Report' }).click();
    await page.screenshot({ path: SCREENSHOT_PATH + 'drawings-report.png' });
  });

  test('Grading Report', async ({ page }) => {
    await page.getByRole('link', { name: 'Grading Report' }).click();
    await page.screenshot({ path: SCREENSHOT_PATH + 'grading-report.png' });
  });

  test('Ticket Report', async ({ page }) => {
    await page.getByRole('link', { name: 'Ticket Report' }).click();
    await page.screenshot({ path: SCREENSHOT_PATH + 'ticket-report.png' });
  });

  test('Transactions Report', async ({ page }) => {
    await page.getByRole('link', { name: 'Transactions Report' }).click();
    await page.screenshot({
      path: SCREENSHOT_PATH + 'transactions-report.png',
    });
  });
});
