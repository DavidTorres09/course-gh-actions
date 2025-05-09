import { test, expect, Page } from '@playwright/test';
import { navigateToHistoryPage } from '../../utils/navigation';

async function viewAllTicketsLastMonth(page: Page, state: string) {
  await page.selectOption('.select-status-ticket', state);
  await page.selectOption('.select-date', { label: 'Last 30 days' });
  // Needed to wait for the API response before proceeding
  await page.waitForTimeout(2500);
}

test.beforeEach(async ({ page }) => {
  await navigateToHistoryPage(page);
});

test.describe('🎟️ Filters of tickets in History', () => {
  test('should enable "By State" radio filter', async ({ page }) => {
    await page.click('label[for="by-state-ticket"]');
    await expect(page.locator('#by-state-ticket')).toBeChecked();
    //Maybe a validation with a specific data?
  });

  test('should enable "By Hour" radio filter', async ({ page }) => {
    await page.click('label[for="by-time-ticket"]');
    await expect(page.locator('#by-time-ticket')).toBeChecked();
  });

  test('should display initial tickets when filtering by "All" states and last 30 days', async ({
    page,
  }) => {
    await viewAllTicketsLastMonth(page, 'all');
    const tickets = page.locator('.card-ticket');
    const count = await tickets.count();
    //Waiting fot the API response
    await page.waitForTimeout(3000);
    expect(count).toBeGreaterThan(0);
  });

  test('should enable "Lotto Bonus Play" filter', async ({ page }) => {
    await page.click('label[for="checkbox-withlrfilter"]');
    await expect(page.locator('#checkbox-withlrfilter')).toBeChecked();
  });

  test('should filter tickets by date: Last 30 days', async ({ page }) => {
    await viewAllTicketsLastMonth(page, 'all');

    const totalText = await page.locator('#total-tickets').innerText();
    const expectedTotal = parseInt(totalText.trim());

    const tickets = page.locator('.card-ticket');
    const count = await tickets.count();

    expect(count).toBeLessThanOrEqual(expectedTotal);

    if (count === 0) {
      console.warn(`⚠️ This account doesn't have tickets in the last 30 days.`);
    }
    // TODO: Validate ticket dates once specific date data is available
  });

  test('should show only pending tickets when filtering by state: Pending', async ({
    page,
  }) => {
    await viewAllTicketsLastMonth(page, 'pending');

    const tickets = page.locator('.card-ticket');
    const count = await tickets.count();

    if (count > 0) {
      const allPending = await tickets.evaluateAll((nodes) =>
        nodes.every((el) => el.className.includes('pending'))
      );
      expect(allPending).toBe(true);
    } else {
      console.warn(`This account don't have pending tickets.`);
    }
  });

  test('should show only winning tickets when filtering by state: Won', async ({
    page,
  }) => {
    await viewAllTicketsLastMonth(page, 'won');

    const tickets = page.locator('.card-ticket');
    const count = await tickets.count();

    if (count > 0) {
      const allWon = await tickets.evaluateAll((nodes) =>
        nodes.every((el) => el.className.includes('winner'))
      );
      expect(allWon).toBe(true);
    } else {
      console.warn(`This account don't have winner tickets.`);
    }
  });

  //We need to implement the mock
  test('should search tickets by visible numbers', async ({ page }) => {
    await viewAllTicketsLastMonth(page, 'all');

    let input = '.container-searchbar-mobile .search-tickets-input';
    await expect(page.locator(input).first()).toBeVisible();

    //For now, default numbers
    await page.fill(input, '1234');
    await page.keyboard.press('Enter');

    const tickets = page.locator('.card-ticket');
    const count = await tickets.count();

    if (count > 0) {
      await expect(tickets.first()).toContainText('1234');
    } else {
      console.warn('Not found tickets with the number "1234".');
    }
  });

  test('should show correct total of tickets matching the visible ones', async ({
    page,
  }) => {
    await viewAllTicketsLastMonth(page, 'all');

    const visibleTickets = await page.locator('.card-ticket').count();
    const totalText = await page.locator('#total-tickets').innerText();
    const totalFromUI = parseInt(totalText.trim(), 10);
    expect(visibleTickets).toBe(totalFromUI);
  });

  test('should allow repurchasing a ticket using the "Buy Again" button', async ({
    page,
  }) => {
    await viewAllTicketsLastMonth(page, 'all');

    const button = page.locator('.history-buy-again-btn').first();

    if (await button.isVisible()) {
      await button.click();
    } else {
      console.warn(`Repurchase Buttton it's no visible.`);
    }
  });

  test('should show ticket details when clicking the "View Details" button', async ({
    page,
  }) => {
    await viewAllTicketsLastMonth(page, 'all');

    const button = page.locator('.btn-view-details').first();

    if (await button.isVisible()) {
      await button.click();
    } else {
      console.warn(`View Details Button it's no visible.`);
    }
  });
});
