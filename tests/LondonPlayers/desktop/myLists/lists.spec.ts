import { test, expect, Page } from '@playwright/test';
import { navigateToMyListPage } from '../../utils/navigation';

async function deleteListIfExists(page: Page, listName: string) {
  await selectPick5(page);

  const card = page.locator('.container-cards-web', {
    has: page.getByText(listName),
  });

  const isVisible = await card
    .first()
    .isVisible()
    .catch(() => false);
  if (isVisible) {
    await card.locator('.delete-btn').click();
    await page.locator('#btn-confirm-delete-favorite').click();

    await expect(
      page.locator(`[data-favorite-name="${listName}"]`)
    ).not.toBeVisible();
  }
}

async function writeNumberInInput(page: Page, number: string) {
  await page.getByRole('textbox', { name: 'numbers' }).click();
  await page.getByRole('textbox', { name: 'numbers' }).fill(number);
}

async function writeListName(page: Page, name: string) {
  await expect(page.locator('#container-name-list-group')).toBeVisible();
  await expect(page.locator('#container-name-list-group')).toBeEnabled();

  //Force waitForTimeout because we have a spinner animation :)
  await page.waitForTimeout(1000);
  await page.locator('#container-name-list-group').click();
  await page.locator('#container-name-list-group').fill(name);
}

async function saveList(page: Page) {
  const saveButton = page.getByRole('img').filter({ hasText: /^$/ }).nth(4);
  await expect(saveButton).toBeVisible();
  await saveButton.click();
}

async function selectPick5(page: Page) {
  await page
    .locator('#my-favorite-numbers .container-select-pick-number.pick-select')
    .click();
  await page.getByRole('option').filter({ hasText: /^$/ }).nth(3).click();
}

async function createList(page: Page, listName: string) {
  await selectPick5(page);
  await page
    .locator('#container-favorites-picks .btn-add-new-favorite.numbers')
    .click();
  await writeListName(page, listName);
  await writeNumberInInput(page, '12345');
  await writeNumberInInput(page, '77777');
  await saveList(page);
}

async function expectListVisible(page: Page, listName: string) {
  const card = page.locator('.container-cards-web', {
    has: page.getByText(listName),
  });
  await expect(card).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await navigateToMyListPage(page);
});

test.describe('Lotto Player - My Lists (Pick 5)', () => {
  test('should allow switching between Pick options', async ({ page }) => {
    const dropdown = page.locator(
      '#my-favorite-numbers .container-select-pick-number.pick-select'
    );
    for (let i = 1; i <= 3; i++) {
      await dropdown.click();
      await page.getByRole('option').filter({ hasText: /^$/ }).nth(i).click();
    }
  });

  test('should create a new Pick 5 list', async ({ page }) => {
    const listName = 'Test #1 Add List';
    await selectPick5(page);
    await deleteListIfExists(page, listName);
    await createList(page, listName);
    await expectListVisible(page, listName);
  });

  test('should edit numbers and name in an existing Pick 5 list', async ({
    page,
  }) => {
    const listName = 'Test #2 Edit List';
    await selectPick5(page);
    await deleteListIfExists(page, listName);
    await createList(page, listName);
    await selectPick5(page);

    const card = page.locator('.container-cards-web', {
      has: page.getByText(listName),
    });
    await card.locator('.edit-favorite').first().click();
    await expect(page.locator('#my-favorite-numbers-detail')).toBeVisible();
    await writeListName(page, listName);
    await writeNumberInInput(page, '67890');
    await writeNumberInInput(page, '36924');
    await saveList(page);

    await selectPick5(page);
    await expectListVisible(page, listName);
  });

  test('should delete a Pick 5 list', async ({ page }) => {
    const listName = 'Test #3 Delete List';
    await selectPick5(page);
    await deleteListIfExists(page, listName);
    await createList(page, listName);
    await selectPick5(page);

    const card = page.locator('.container-cards-web', {
      has: page.getByText(listName),
    });

    await card.locator('.delete-btn').click();
    await page.locator('#btn-confirm-delete-favorite').click();
    await expect(
      page.locator(`[data-favorite-name="${listName}"]`)
    ).not.toBeVisible();
  });

  test('should select all numbers from a complete Pick 5 list and playt', async ({
    page,
  }) => {
    const listName = 'Test #4 Complete List';
    await selectPick5(page);
    await deleteListIfExists(page, listName);
    await createList(page, 'Test #4 Complete List');
    await selectPick5(page);

    await page.locator('.align-top').first().click();
    await page.getByRole('button', { name: 'Select to play' }).click();
    await expectListVisible(page, listName);
  });

  test('should select specific numbers from a partial Pick 5 list and play', async ({
    page,
  }) => {
    const listName = 'Test #5 Partial List';
    await selectPick5(page);
    await deleteListIfExists(page, listName);

    await page
      .locator('#container-favorites-picks .btn-add-new-favorite.numbers')
      .click();
    await expect(page.locator('#container-name-list-group')).toBeVisible();
    await expect(page.locator('#my-favorite-numbers-detail')).toBeVisible();
    await writeListName(page, listName);
    await writeNumberInInput(page, '01010');
    await writeNumberInInput(page, '10101');
    await writeNumberInInput(page, '11111');
    await saveList(page);
    expectListVisible(page, listName);

    await selectPick5(page);
    await page.getByText('0 - 1 - 0 - 1 - 0').first().click();
    await page.getByText('1 - 0 - 1 - 0 - 1').first().click();
    await page.getByRole('button', { name: 'Select to play' }).click();
  });
});
