import { test, expect, Page } from '@playwright/test';
import { navigateToSectionWithHeading } from '../../utils/navigation';

type SelectDigit = (page: Page, order: number, digit: string) => Promise<void>;

type RuleButton = { id: string; name: string };

type ClickAndWaitParameters = (
  page: Page,
  selector: string,
  expectedClass: string,
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

const clickOptionAndExpectActive: ClickAndWaitParameters = async (
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

async function verifyAllPicksPresent(page: Page) {
  const nextButton = page.locator('#next');
  const seenPicks = new Set();

  const maxIterations = picks.length * 2;
  let iterations = 0;

  // We need this explicit wait because using a regular 'expect' causes the test to fail consistently.
  // This is likely due to animation timing issues or delays in rendering.
  await page.waitForTimeout(500);
  while (seenPicks.size < picks.length && iterations < maxIterations) {
    const activePick = await page
      .locator('#pick-options-carousel img.carousel-center')
      .getAttribute('data-pick-name');
    seenPicks.add(activePick);

    await nextButton.click();
    //We need to use the timeout, animations...
    await page.waitForTimeout(500);

    iterations++;
  }

  expect([...seenPicks].sort()).toEqual(picks.sort());
}

const picks = ['Pick 2', 'Pick 3', 'Pick 4', 'Pick 5'];

const gameRules: RuleButton[] = [
  { id: 'btn-straight-img', name: 'Straight' },
  { id: 'btn-boxed-img', name: 'Boxed' },
];

test.describe('Step 1: Numbers selection methods and behavior', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToSectionWithHeading(
      page,
      'shop-picks1',
      'Select your numbers'
    );
  });

  test('should display all picks types in the carrousel', async ({ page }) => {
    await verifyAllPicksPresent(page);
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
    await clickOptionAndExpectActive(
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
    const input = `#inputNumber-mobile`;
    await clickOptionAndExpectActive(
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
        `${id} img.mobile-step-img[src*="step-completed.svg"]`
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
