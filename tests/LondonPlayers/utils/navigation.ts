import { Page, expect } from '@playwright/test';

export type ShopPicksSection =
  | 'shop-picks1'
  | 'shop-picks2'
  | 'shop-picks3'
  | 'shop-picks4'
  | 'shop-picks5';

export type NavigateToBase = (page: Page) => Promise<void>;

export type NavigateToSection = (
  page: Page,
  section: ShopPicksSection
) => Promise<void>;

export type NavigateToSectionWithHeading = (
  page: Page,
  section: ShopPicksSection,
  headingName: string,
  headingLevel?: number
) => Promise<void>;

export type NavigateToPage = (page: Page) => Promise<void>;

const BASE_URL = 'http://localhost:5051';
const CUSTOMER_ID = 'B52366';

export const navigateToBase: NavigateToBase = async (page) => {
  await page.goto(`${BASE_URL}/auth/callback?customerId=${CUSTOMER_ID}&token=`);
};

export const navigateToSection: NavigateToSection = async (page, section) => {
  await navigateToBase(page);
  await page.goto(`${BASE_URL}/lotto#${section}`);
};

export const navigateToSectionWithHeading: NavigateToSectionWithHeading =
  async (page, section, headingName, headingLevel = 3) => {
    await navigateToSection(page, section);
    await expect(
      page.getByRole('heading', { name: headingName, level: headingLevel })
    ).toBeVisible();
  };

export const navigateToProfilePage: NavigateToPage = async (page) => {
  await navigateToBase(page);
  await page.goto(`${BASE_URL}/lotto#shop-picks1`);
  await page.locator('#navbar').getByRole('link').nth(3).click();
};

export const navigateToMyListPage: NavigateToPage = async (page) => {
  await navigateToBase(page);
  await page.goto(`${BASE_URL}/lotto#shop-picks1`);
  await page.locator('#navbar').getByRole('link').nth(2).click();
};

export const navigateToHistoryPage: NavigateToPage = async (page) => {
  await navigateToBase(page);
  await page.goto(`${BASE_URL}/lotto#shop-picks1`);
  await page.locator('#navbar').getByRole('link').nth(1).click();
};

export const navigateToPastPickWinningResultsPage: NavigateToPage = async (page: Page) => {
  const targetItem = page.getByRole('listitem').filter({ hasText: 'Past Pick Winning Results' });
  await expect(targetItem).toBeVisible();
  await targetItem.click();
  await expect(page.locator('button[data-id="filter-select-pick-numbers"]')).toBeVisible();
}

export const navigateToPastStateWinningResultsPage: NavigateToPage = async (page: Page) => {
  const targetItem = page.getByRole('listitem').filter({ hasText: 'Past State Winning Results' });
  await expect(targetItem).toBeVisible();
  await targetItem.click();
}