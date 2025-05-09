import { test, expect, Page } from '@playwright/test';
import {
  navigateToHistoryPage,
  navigateToPastPickWinningResultsPage,
} from '../../utils/navigation';

test.beforeEach(async ({ page }) => {
  await navigateToHistoryPage(page);
  await navigateToPastPickWinningResultsPage(page);
});

async function selectPick(page: Page, pickType: 'pick2' | 'pick3' | 'pick4') {
  await page.selectOption('#filter-select-pick-numbers', pickType);
}

async function fillPickInputs(page: Page, digits: string[]) {
  const inputs = page.locator('.container-numbers-selected input');
  for (let i = 0; i < digits.length; i++) {
    await inputs.nth(i).fill(digits[i]);
    await expect(inputs.nth(i)).toHaveValue(digits[i]);
  }
}

async function checkResultsBtn(page: Page) {
  const btn = page.locator('.btn-check-results');
  await expect(btn).toBeEnabled();
  await btn.click();
}

test.describe('🎟️ Pick Number Filter: Dropdown behavior, input handling, and result rendering', () => {
  test('should open Pick Number dropdown and display available options', async ({
    page,
  }) => {
    await page.click('button[data-id="filter-select-pick-numbers"]');
    const dropdownInner = page.locator('.dropdown-menu .inner').first();
    await expect(dropdownInner).toHaveAttribute('aria-expanded', 'true');
  });

  //For now we use the pick 4
  test('should select "Pick 4" option from dropdown', async ({ page }) => {
    await page.click('button[data-id="filter-select-pick-numbers"]');

    const pickOptions = page.locator('.dropdown-menu.show .dropdown-item');
    const pickOptionsCount = await pickOptions.count();
    expect(pickOptionsCount).toBeGreaterThan(0);
    await page.selectOption('#filter-select-pick-numbers', 'pick4');
  });

  //For now we use the pick 4
  test('should display 4 input fields for selected Pick 4', async ({
    page,
  }) => {
    await selectPick(page, 'pick4');
    const inputs = page.locator('.container-numbers-selected input:visible');
    await expect(inputs).toHaveCount(4);
  });

  test('should fill Pick 4 input fields with correct digits', async ({
    page,
  }) => {
    const inputs = page.locator('.container-numbers-selected input');
    await selectPick(page, 'pick4');

    await fillPickInputs(page, ['1', '2', '3', '4']);

    const expected = ['1', '2', '3', '4'];
    for (let i = 0; i < expected.length; i++) {
      await expect(inputs.nth(i)).toHaveValue(expected[i]);
    }
  });

  test('should click "Check Results" button', async ({ page }) => {
    await checkResultsBtn(page);
  });

  test('should display correct results for Pick 4 selection (mock pending)', async ({
    page,
  }) => {
    await selectPick(page, 'pick4');
    await fillPickInputs(page, ['1', '2', '3', '4']);
    await checkResultsBtn(page);

    const resultContainer = page.locator('.container-ticket-detail');
    await expect(resultContainer).toBeVisible();

    const digits = resultContainer.locator('.digits-winner span.digit');
    await expect(digits).toHaveCount(4);

    const expected = ['1', '2', '3', '4'];
    for (let i = 0; i < expected.length; i++) {
      expect(await digits.nth(i).innerText()).toBe(expected[i]);
    }

    await expect(resultContainer.locator('.info-type')).toHaveText(/Straight/i);
    await expect(resultContainer.locator('.info-state')).toContainText('PR');
  });
});
