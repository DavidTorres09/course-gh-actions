import { test, expect } from '@playwright/test';
import { adminLogin, SCREENSHOT_PATH } from './utils';

test.beforeEach(async ({ page }) => {
  await adminLogin({ page });
  await page.getByRole('button', { name: 'Manage Drawings' }).click();
});

test.describe('Manage Drawings', () => {
  test.describe('Draws Confirmation', () => {
    test('Draws Confirmation - Screenshot', async ({ page }) => {
      await page.getByRole('link', { name: 'Draws Confirmation' }).click();
      await page.screenshot({
        path: SCREENSHOT_PATH + 'draws-confirmation.png',
      });
    });

    test('Check first row, confirm the draw, check the message', async ({
      page,
    }) => {
      await page.getByRole('link', { name: 'Draws Confirmation' }).click();

      await page.waitForSelector('table.table.dataTable tr[role="row"]');

      const tablesRows = page.locator('table.table.dataTable tr');

      const rowsCount = await tablesRows.count();
      expect(rowsCount).toBeGreaterThan(0);

      const firstRow = tablesRows.nth(1);
      const drawText = await firstRow.locator('td:nth-child(2)').innerText();

      await firstRow.getByRole('button', { name: /confirm/i }).click();

      const message = await page
        .locator('#confirmation-admin-modals .modal-body p')
        .innerText();
      const close = page.locator('#confirmation-admin-modals button.close');

      await close.click();
      expect(message).toContain(drawText);
    });
  });

  test.describe('Draws', () => {
    test('Draws - Screenshot', async ({ page }) => {
      await page.getByRole('link', { name: 'Draws', exact: true }).click();
      await page.screenshot({ path: SCREENSHOT_PATH + 'draws.png' });
    });
  });

  test.describe('Draws Definition', () => {
    test('Draws Definition - Screenshot', async ({ page }) => {
      await page.getByRole('link', { name: 'Draws Definition' }).click();
      await page.screenshot({ path: SCREENSHOT_PATH + 'draws-definition.png' });
    });
  });

  test.describe("Draws' Status", () => {
    test("Draws' Status - Screenshot", async ({ page }) => {
      await page.getByRole('link', { name: "Draws' Status" }).click();
      await page.screenshot({ path: SCREENSHOT_PATH + 'draws-status.png' });
    });
  });

  test.describe('Disabled Draws', () => {
    test('Disabled Draws - Screenshot', async ({ page }) => {
      await page.getByRole('link', { name: 'Disabled Draws' }).click();
      await page.screenshot({ path: SCREENSHOT_PATH + 'disabled-draws.png' });
    });
  });
});
