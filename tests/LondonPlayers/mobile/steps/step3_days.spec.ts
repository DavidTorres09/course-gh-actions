import { test, expect } from '@playwright/test';
import { navigateToSectionWithHeading } from '../../utils/navigation';

test.describe('Step 3: Day selection via slider and calendar', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToSectionWithHeading(
      page,
      'shop-picks3',
      'Select your lucky days'
    );
  });

  test('should update day selection using the day slider', async ({ page }) => {
    const swiperContainer = page.locator('.days-swiper-container');
    await expect(swiperContainer).toBeVisible();

    await page.waitForFunction(() => {
      const container = document.querySelector('.days-swiper-container') as any;
      return (
        container &&
        container.swiper &&
        typeof container.swiper.slideTo === 'function'
      );
    });

    await page.evaluate(() => {
      const container = document.querySelector('.days-swiper-container') as any;
      container.swiper.slideTo(2); // 2 is the index
    });

    const value = page.locator('#days-swiper-value');
    await expect(value).toHaveText('3 days', { timeout: 5000 });
  });

  test('should allow selecting up to 5 days using the calendar picker', async ({
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
        .slice(0, 5);
    });

    if (enabledDays.length < 5) {
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
