import { test, expect } from '@playwright/test';
import { navigateToSectionWithHeading } from '../../utils/navigation';

test.describe('Step 2: Amount selection options and behavior', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToSectionWithHeading(
      page,
      'shop-picks2',
      'Select Amount to play'
    );
  });

  test('should allow entering an custom amount manually', async ({ page }) => {
    const input = page.locator('#manual-amount-input');
    await expect(input).toBeVisible();
    await input.fill('1');
    await expect(input).toHaveValue('1');
  });

  test('should select an amount from the preset list and mark it as active', async ({
    page,
  }) => {
    await page.locator('.menuToggle').click();
    const amountBtn = page.locator('li:has(button[data-amount="1"]) button');
    await amountBtn.click();
    await expect(amountBtn).toHaveClass(/selected/);
  });
});
