import { test, expect } from '@playwright/test';
import { navigateToSectionWithHeading } from '../../utils/navigation';

test.describe('Step 3: Day selection via dropdown and calendar', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToSectionWithHeading(
      page,
      'shop-picks3',
      'Select your lucky days'
    );
  });

  test('should update day selection using the dropdown', async ({ page }) => {
    await page.click('#new-view-container .datepicker-days .active.day');
    await expect(page.locator('#days-dropdown')).toBeVisible();
    await page.selectOption('#days-dropdown', '7');
  });

  test('Should allow selecting up to 3 days using the calendar picker', async ({
    page,
  }) => {
    await page.click('.lucky-days-selector[href=".container-calendar-days"]');

    await page.addLocatorHandler(
      page.getByText(
        'Switching your type of date selection will clear all current date preferences.'
      ),
      async () =>
        await page.locator('#btn-confirm-change-days-selection-mode').click()
    );

    const enabledDays = await page.evaluate(() => {
      return Array.from(
        document.querySelectorAll(
          '.datepicker-days .day:not(.disabled):not(.new)'
        )
      )
        .map((day) => day.getAttribute('data-date'))
        .slice(0, 3);
    });

    if (enabledDays.length < 3) {
      throw new Error('Dont have the available the amount of days to select.');
    }

    for (const date of enabledDays) {
      const dayLocator = page.locator(
        `.container-calendar-days.active.show .datepicker-days .day[data-date="${date}"]`
      );
      await dayLocator.click();
      await expect(dayLocator).toHaveClass(/active/);
    }
  });
});
