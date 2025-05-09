import { test, expect, Page } from '@playwright/test';
import { navigateToProfilePage } from '../../utils/navigation';

// ─── ACTION HELPERS ─────────────────────────────────────────────────────
async function acceptChangesModal(page: Page) {
  await page.locator('#save-profile').click();
  await page.getByRole('button', { name: 'Yes' }).click();
}

async function writeCustomFeedback(page: Page, message: string) {
  await page.locator('ul.navs-tabs-feedback-option > li').nth(2).click();
  const feedbackBox = page.getByRole('textbox', {
    name: 'Write your feedback here',
  });
  await feedbackBox.click();
  await feedbackBox.fill(message);
  await page.getByRole('button', { name: 'Confirm' }).click();
  await page.getByRole('button', { name: "You're welcome" }).click();
}

async function giveFeedback(
  page: Page,
  type: 'positive' | 'negative',
  presetOrMessage: string,
  isCustom = false
) {
  const selector =
    type === 'positive'
      ? '#popover-positive-feedback-1'
      : '#popover-negative-feedback-1';
  await page.locator(selector).click();

  if (isCustom) {
    await writeCustomFeedback(page, presetOrMessage);
  } else {
    await page
      .getByRole('listitem')
      .filter({ hasText: presetOrMessage })
      .click();
    const button = page.getByRole('button', { name: "You're welcome" });
    await expect(button).toBeVisible();
    await button.click();
  }
}

// ─── MAIN TEST SUITE ────────────────────────────────────────────────────
test.describe('Lotto Player Profile End-to-End', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToProfilePage(page);
  });

  test('should update avatar image', async ({ page }) => {
    await test.step('Upload new avatar image', async () => {
      await page.locator('.col-12 > div > .col-12 > img').click();
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles('tests/images/harold.png');
    });

    await test.step('Confirm changes', async () => {
      await page.locator('#save-profile').click();
      await page.getByRole('button', { name: 'Understood' }).click();
      await page.getByRole('button', { name: 'Yes' }).click();
    });
  });

  test('should update nickname and persist after reload', async ({ page }) => {
    let input = page.locator('#profile #profile-nickname');

    await test.step('Change Nickname', async () => {
      await expect(input).toBeVisible();
      await input.click();
      await input.fill('London');
    });

    await test.step('Save Changes', async () => {
      await acceptChangesModal(page);
    });

    await test.step('Check result', async () => {
      await navigateToProfilePage(page);
      await expect(input).toHaveValue('London');
    });
  });

  test('should submit positive feedback using a preset message', async ({
    page,
  }) => {
    await giveFeedback(page, 'positive', 'Easy to use.');
  });

  test('should submit negative feedback using a preset mesage', async ({
    page,
  }) => {
    await giveFeedback(page, 'negative', 'I had a glitch.');
  });

  test('should submit positive feedback with a custom message', async ({
    page,
  }) => {
    await giveFeedback(page, 'positive', 'Happy Test :D', true);
  });

  test('should submit negative feedback with a custom message', async ({
    page,
  }) => {
    await giveFeedback(page, 'negative', 'Sad Test :(', true);
  });

  test('should set favorite pick mode from carousel and reflects in selection', async ({
    page,
  }) => {
    const clicks = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < clicks; i++) {
      //Animations of the carrousels :D
      await page.waitForTimeout(1000);
      await page
        .locator('.container-profile #profile-pick-next')
        .click({ force: true });
    }

    const frontPickLocator = page.locator(
      '#profile-pick-options-carousel img.carousel-center'
    );
    const pickOption = await frontPickLocator.getAttribute('data-pick-option');

    await acceptChangesModal(page);

    const pick = pickOption?.toLowerCase();
    const selector = `#btn-${pick}-img`;
    await page.waitForSelector(
      `${selector}[src="themes/standardBlue/images/${pick}-selected.svg"]`,
      { timeout: 5000 }
    );
  });

  test('should select QuickPick as preferred pick type', async ({ page }) => {
    const quickPickButton = 'div[data-type="QuickPick"]';
    await page.locator(quickPickButton).click();
    await acceptChangesModal(page);
    await page.waitForTimeout(500);
    await navigateToProfilePage(page);
    await expect(page.locator(`${quickPickButton} img`)).toHaveAttribute(
      'src',
      'images/profile/btn-auto-pick-selected.svg?_v=2'
    );
  });

  test('should select default auto pick behavior: one combination to different', async ({
    page,
  }) => {
    await page
      .getByRole('radio', { name: 'One combination to different' })
      .check();
    await acceptChangesModal(page);
    await expect(
      page.getByRole('radio', { name: 'One combination to different' })
    ).toBeChecked();
  });

  test('should choose "Boxed" as favorite play style', async ({ page }) => {
    await page
      .locator('div:nth-child(8) > .col > .row > div:nth-child(2) > .img-fluid')
      .click();
    await acceptChangesModal(page);
    await expect(page.locator('#btn-boxed-img')).toHaveAttribute(
      'src',
      /boxed.*\.svg$/
    );
  });

  test('should set default ticket amount to 0.25 and persist', async ({
    page,
  }) => {
    const amountInput = page.locator('.profile-amount-text .form-control');
    await amountInput.fill('0.25');
    await acceptChangesModal(page);
    await expect(amountInput).toHaveValue('0.25');
  });

  test('should add "PA 1:05 PM"  to favorite draw times', async ({ page }) => {
    const timeInput = page.getByRole('textbox', { name: 'TX 1:00 PM' });

    await timeInput.fill('pa');
    await page.getByText('PA 1:05 PM').first().click();

    await acceptChangesModal(page);

    const pill = page.locator('.draws-pills-container .draw-pill', {
      hasText: 'PA',
    });
    await expect(pill).toContainText('1:05 PM');
    await expect(pill.locator('.remove-draw')).toHaveAttribute(
      'data-state',
      'PA'
    );
    await expect(pill.locator('.remove-draw')).toHaveAttribute(
      'data-hour',
      '1:05 PM'
    );
  });
});
