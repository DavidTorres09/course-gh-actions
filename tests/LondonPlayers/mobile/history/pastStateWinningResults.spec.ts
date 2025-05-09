import { test, expect, Page } from '@playwright/test';
import {
  navigateToHistoryPage,
  navigateToPastStateWinningResultsPage,
} from '../../utils/navigation';

test.beforeEach(async ({ page }) => {
  await navigateToHistoryPage(page);
  await navigateToPastStateWinningResultsPage(page);
});

async function openStateDropdown(page: Page) {
  const dropdownBtn = page.locator('#dropdownMenuButton');
  await dropdownBtn.click();
  const dropdown = page.locator('.dropdown-menu.options.state.show');
  await expect(dropdown).toBeVisible();
  return dropdown;
}

async function openCalendar(page: Page) {
  await page.click('#start-date-input');
  const calendar = page.locator(
    '.datepicker-dropdown.datepicker-orient-right.datepicker-orient-bottom'
  );
  await expect(calendar).toBeVisible();
  return calendar;
}

// ⚠️ Note: Requires a graded PR ticket for the selected date
test.describe('🗺️ State Filter UI: Dropdown selection and calendar interaction', () => {
  test('should display list of states when clicking the State filter dropdown', async ({
    page,
  }) => {
    const dropdown = await openStateDropdown(page);
    const optionsCount = await dropdown.locator('span.dropdown-item').count();
    expect(optionsCount).toBeGreaterThan(0);
  });

  test('should select a state (e.g., Puerto Rico) and reflect selection', async ({
    page,
  }) => {
    const state = 'PR';
    await openStateDropdown(page);
    const stateOption = page.locator(`span.dropdown-item[data-id="${state}"]`);
    await stateOption.click();

    const selected = await page.locator('.item-selected').innerText();
    expect(selected).toContain('Puerto Rico');
  });

  test('should open calendar and display active (selectable) days', async ({
    page,
  }) => {
    const calendar = await openCalendar(page);
    const activeDays = await calendar.locator('td.day:not(.disabled)').count();
    expect(activeDays).toBeGreaterThan(0);
  });
  // TODO: Add more tests once mock data is available for this section
});
