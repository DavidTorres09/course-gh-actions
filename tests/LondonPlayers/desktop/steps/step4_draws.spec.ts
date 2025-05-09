import { expect, test } from '@playwright/test';
import { navigateToSectionWithHeading } from '../../utils/navigation';

test.describe('Step 4: Draws selection by state, time, and specific selections of draws', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToSectionWithHeading(
      page,
      'shop-picks4',
      'Select your drawings'
    );
  });

  test('should apply "Draws by State" filter and mark it as selected', async ({
    page,
  }) => {
    const filterToSelect = page.locator(`#drawings-filter-label-state`);
    await expect(filterToSelect).toBeVisible();
    await filterToSelect.click();
    await expect(filterToSelect).toHaveCSS(
      'background-image',
      /radiobtn-blue-checked\.svg/
    );
  });

  test('should apply "Draws by Time" filter and mark it as selected', async ({
    page,
  }) => {
    const filterToSelect = page.locator(`#drawings-filter-label-time`);
    await expect(filterToSelect).toBeVisible();
    await filterToSelect.click();
    await expect(filterToSelect).toHaveCSS(
      'background-image',
      /radiobtn-blue-checked\.svg/
    );
  });

  test('should select a specific draw (The first) and mark it as active', async ({
    page,
  }) => {
    const firstDraw = page
      .locator('.container-lotto-draws-by-time .all-container-draws-items')
      .first();
    await firstDraw.click();
    await expect(firstDraw).toHaveClass(/active/);
  });

  test('should select all available draws using "Select All" button', async ({
    page,
  }) => {
    await page.click('.drawings-select-all');

    const checkboxes = page.locator(
      '.container-lotto-draws-by-time input[type="checkbox"]:not([disabled])'
    );
    const count = await checkboxes.count();

    for (let i = 0; i < count; i++) {
      await expect(checkboxes.nth(i)).toBeChecked();
    }
  });
});
