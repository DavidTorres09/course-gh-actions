import { test, expect, Page } from '@playwright/test';

import { navigateToSectionWithHeading } from '../../utils/navigation';

type SelectDigit = (page: Page, order: number, digit: string) => Promise<void>;

type PickButton = { id: string; imgSrc: string };

type RuleButton = { id: string; name: string; imgSrc: string };

type ClickAndWaitParameters = (
  page: Page,
  selector: string,
  expectedSrc: string,
  timeout?: number
) => Promise<void>;

type ClickAndWaitParametersImg = (
  page: Page,
  selector: string,
  timeout?: number
) => Promise<void>;

type ExpectedDigit = (
  page: Page,
  order: number,
  digit: string
) => Promise<void>;

const clickAndWaitForChangeImg: ClickAndWaitParameters = async (
  page: Page,
  selector: string,
  expectedSrc: string,
  timeout: number = 5000
) => {
  const element = page.locator(selector);
  await element.click();
  await expect(element).toHaveAttribute('src', expectedSrc, { timeout });
};

const getBaseNameFromId = (id: string) =>
  id.replace(/^btn-/, '').replace(/-img$/, '');

const clickAndWaitForGameImages: ClickAndWaitParametersImg = async (
  page: Page,
  selector: string,
  timeout = 5000
) => {
  const element = page.locator(selector);
  await element.click();

  const baseName = getBaseNameFromId(selector.slice(1));
  const expectedSrcs = ['2', '3', '4', '5'].map(
    (number) => `images/${baseName}-pick${number}.svg`
  );

  await expect(async () => {
    const actualSrc = await element.getAttribute('src');
    expect(expectedSrcs).toContain(actualSrc);
  }).toPass({ timeout });
};

const clickAndWaitForAddClass: ClickAndWaitParameters = async (
  page: Page,
  selector: string,
  expectedClass: string,
  timeout: number = 5000
) => {
  const element = page.locator(selector);
  await element.click();
  await expect(element).toHaveClass(expectedClass, { timeout });
};

const selectDigit: SelectDigit = async (
  page: Page,
  order: number,
  digit: string
) => {
  const digitBtn = page
    .locator(
      `div.digits-picker[data-digit-order="${order}"] button[data-digit="${digit}"]`
    )
    .first();
  await digitBtn.click();
};

const expectDigitSelected: ExpectedDigit = async (
  page: Page,
  order: number,
  digit: string
) => {
  const digitBtn = page
    .locator(
      `div.digits-picker[data-digit-order="${order}"] button[data-digit="${digit}"]`
    )
    .first();
  await expect(digitBtn).toHaveClass(/selected/);
};

const picks: PickButton[] = [
  { id: 'btn-pick2-img', imgSrc: 'pick2-selected.svg' },
  { id: 'btn-pick3-img', imgSrc: 'pick3-selected.svg' },
  { id: 'btn-pick4-img', imgSrc: 'pick4-selected.svg' },
  { id: 'btn-pick5-img', imgSrc: 'pick5-selected.svg' },
];

const gameRules: RuleButton[] = [
  { id: 'btn-straight-img', name: 'Straight', imgSrc: 'straight-pick2.svg' },
  { id: 'btn-boxed-img', name: 'Boxed', imgSrc: 'boxed-pick2.svg' },
];

test.describe('Step 1: Numbers selection methods and behavior', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToSectionWithHeading(
      page,
      'shop-picks1',
      'Select your numbers'
    );
  });

  picks.forEach(({ id, imgSrc }, index) => {
    test(`Should display all picks type: ${index + 2}`, async ({ page }) => {
      await clickAndWaitForChangeImg(
        page,
        `#${id}`,
        `themes/standardBlue/images/${imgSrc}`
      );
    });
  });

  gameRules.forEach(({ id, name }) => {
    test(`should display correct images when selecting game type: ${name}`, async ({
      page,
    }) => {
      await clickAndWaitForGameImages(page, `#${id}`);
    });
  });

  test('should allow manual number selection and reflect selected digits', async ({
    page,
  }) => {
    await clickAndWaitForAddClass(
      page,
      '#option-numbers',
      'nav-link p-2 active show'
    );
    await selectDigit(page, 1, '3');
    await selectDigit(page, 2, '3');

    await expectDigitSelected(page, 1, '3');
    await expectDigitSelected(page, 2, '3');
  });

  test('should allow typing numbers directly into input field', async ({
    page,
  }) => {
    const input = `.container-numbers-manual #inputNumber`;
    await clickAndWaitForAddClass(
      page,
      '#option-digits-numbers',
      'nav-link p-2 active show'
    );
    await expect(page.locator(input)).toBeVisible();
    await page.fill(input, '09', { force: true });
  });

  test('should display step completed indicators for numbers, days and states when Quick Pick is selected', async ({
    page,
  }) => {
    const quickPickBtn = page.locator('#option-quick-pick');
    await quickPickBtn.click();

    const quickPickOption1 = page
      .locator('.quick-pick-option[data-number="1"]')
      .first();
    await expect(quickPickOption1).toBeVisible();
    await quickPickOption1.click();

    for (const id of ['#popover-numbers', '#popover-days', '#popover-states']) {
      const completedImg = page.locator(
        `${id} img.desktop-step-img[src*="step-completed.svg"]`
      );

      await expect
        .poll(
          async () => {
            return await completedImg.isVisible();
          },
          {
            timeout: 5000,
            message: `${id} step indicator did not become visible`,
          }
        )
        .toBe(true);
    }
  });

  test('should navigate to "My Lucky Numbers" section when selecting My Lists', async ({
    page,
  }) => {
    const optionId = '#favorite-page-numbers';
    await page.click(optionId);
    await expect(
      page.getByRole('heading', { name: 'My Lucky Numbers', level: 3 })
    ).toBeVisible();
  });
});
