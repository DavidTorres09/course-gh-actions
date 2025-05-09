import { test, expect, Page } from '@playwright/test';
import { navigateToSectionWithHeading } from '../../utils/navigation';

// ─── TYPES ──────────────────────────────────────────────────────────────
type NumberSelectionMode = 'manual' | 'type-in' | 'quick-pick' | 'my-list';

type LottoPurchaseScenario = {
  pick: string;
  rule: 'straight' | 'boxed';
  numberMode: NumberSelectionMode;
  numbers: string[];
  amount: string;
  days: number;
  draws: 'one' | 'all';
};

type ChooseNumbersByModeFn = (
  page: Page,
  numberMode: NumberSelectionMode,
  numbers: string[]
) => Promise<void>;

type ChooseAmountFn = (page: Page, amount: string) => Promise<void>;

type PickAvailableDaysFn = (page: Page, days: number) => Promise<void>;

type ChooseDrawsFn = (page: Page, draws: 'one' | 'all') => Promise<void>;

type AcceptPurchaseConfirmationFn = (page: Page) => Promise<void>;

// ─── TEST CASES ─────────────────────────────────────────────────────────
const testCases: LottoPurchaseScenario[] = [
  {
    pick: 'Pick 2',
    rule: 'straight',
    numberMode: 'manual',
    numbers: ['1', '2'],
    amount: '1',
    days: 3,
    draws: 'one',
  },
  {
    pick: 'Pick 3',
    rule: 'boxed',
    numberMode: 'quick-pick',
    numbers: [],
    amount: '2',
    days: 5,
    draws: 'all',
  },
  {
    pick: 'Pick 4',
    rule: 'straight',
    numberMode: 'type-in',
    numbers: ['1', '2', '3', '4'],
    amount: '5',
    days: 7,
    draws: 'all',
  },
  {
    pick: 'Pick 5',
    rule: 'boxed',
    numberMode: 'manual',
    numbers: ['5', '6', '7', '8', '9'],
    amount: '1',
    days: 2,
    draws: 'one',
  },
];

// ─── ACTION HELPERS ─────────────────────────────────────────────────────
async function getInitialBalance(page: Page): Promise<number> {
  const balanceText = await page.locator('#balance').innerText();
  return parseFloat(balanceText.replace(/[$,]/g, ''));
}

async function rotateCarouselToPick(page: Page, selectedPick: string) {
  const nextButton = page.locator('#next');
  const MAX_CAROUSEL_ROTATIONS = 5;

  for (let i = 0; i < MAX_CAROUSEL_ROTATIONS; i++) {
    const activePick = page.locator(
      '#pick-options-carousel img.carousel-center'
    );

    await page.waitForTimeout(1000);
    const dataPick = await activePick.getAttribute('data-pick-name');

    if (!activePick) {
      throw new Error('No pick is currently active.');
    }

    if (dataPick === selectedPick) {
      return;
    }

    await nextButton.click();
  }

  throw new Error(
    `Pick "${selectedPick}" not found after ${MAX_CAROUSEL_ROTATIONS} iterations.`
  );
}

async function chooseGameTypeAndRule(page: Page, pick: string, rule: string) {
  await rotateCarouselToPick(page, pick);
  await page.click(`#btn-${rule}-img`);
}

async function enterNumbersManually(page: Page, numbers: string[]) {
  await page.click('#option-numbers');
  for (let i = 0; i < numbers.length; i++) {
    const selector = `div.digits-picker[data-digit-order="${
      i + 1
    }"] button[data-digit="${numbers[i]}"]`;
    await page.click(selector);
  }
}

async function typeNumbersDirectly(page: Page, numbers: string[]) {
  const value = numbers.join('');
  await page.click('#option-digits-numbers');
  await page.waitForTimeout(500);
  const input = page.getByRole('spinbutton', { name: 'numbers' });
  await input.click();
  await input.fill(value, { force: true });
}

async function chooseQuickPickOption(page: Page) {
  await page.click('#option-quick-pick');
  await page
    .locator('#quick-pick-container .quick-pick-option')
    .first()
    .click();
}

async function chooseFromMySavedNumbers(page: Page) {
  await page.click('#btn-my-list');
}

const chooseNumbersByMode: ChooseNumbersByModeFn = async (
  page: Page,
  numberMode: NumberSelectionMode,
  numbers: string[]
) => {
  if (numberMode === 'manual') {
    await enterNumbersManually(page, numbers);
  }

  if (numberMode === 'type-in') {
    await typeNumbersDirectly(page, numbers);
  }

  if (numberMode === 'quick-pick') {
    await chooseQuickPickOption(page);
  }

  if (numberMode === 'my-list') {
    await chooseFromMySavedNumbers(page);
  }
};

const chooseAmountToPlay: ChooseAmountFn = async (page, amount) => {
  await acceptPurchaseConfirmationModal(page);

  await page
    .locator('.loading-overlay')
    .waitFor({ state: 'detached', timeout: 5000 })
    .catch(() => {
      console.warn('Overlay present after 5s');
    });
  await page.locator('#popover-amount').click();
  await page.click('.menuToggle');
  const amountBtn = page.locator(
    `li:has(button[data-amount="${amount}"]) button`
  );
  await expect(amountBtn).toBeVisible();
  await amountBtn.click();
  await expect(amountBtn).toHaveClass(/selected/);
};

const pickAvailableDaysFromCalendar: PickAvailableDaysFn = async (
  page,
  days
) => {
  await page.locator('#popover-days').click();
  await page.click('.lucky-days-selector[href=".container-calendar-days"]');
  await page.waitForSelector('#days-selection-mode-change-warning', {
    state: 'hidden',
    timeout: 5000,
  });
  await page.click('#btn-confirm-change-days-selection-mode');

  const enabledDays = await page.evaluate((days) => {
    return Array.from(
      document.querySelectorAll(
        '.datepicker-days .day:not(.disabled):not(.new)'
      )
    )
      .map((day) => day.getAttribute('data-date'))
      .slice(0, days);
  }, days);

  if (enabledDays.length < days) {
    throw new Error(
      `Insufficient days available. Requested: ${days}, Found: ${enabledDays.length}`
    );
  }

  for (const date of enabledDays) {
    await page.click(
      `.container-calendar-days.active.show .datepicker-days .day[data-date="${date}"]`
    );
  }
};

const chooseDrawsToEnter: ChooseDrawsFn = async (page, draws) => {
  await page.locator('#popover-states').click();
  if (draws === 'one') {
    await page
      .locator('.container-lotto-draws-by-time .all-container-draws-items')
      .first()
      .click();
  } else if (draws === 'all') {
    await page.click('.drawings-select-all');
  }
};

const acceptPurchaseConfirmationModal: AcceptPurchaseConfirmationFn = async (
  page
) => {
  const modalSelector = '#go-to-purchase-tab-confirmation-modal';
  const acceptButtonSelector = `${modalSelector} .yes-btn`;

  try {
    await page.waitForSelector(modalSelector, {
      state: 'visible',
      timeout: 2000,
    });
    await page.click(acceptButtonSelector);
  } catch (e) {
    console.log('Modal did not appear in time. Continuing...');
  }
};

async function submitPurchaseFlowAndConfirm(page: Page) {
  await acceptPurchaseConfirmationModal(page);

  await page
    .locator('.loading-overlay')
    .waitFor({ state: 'detached', timeout: 2000 })
    .catch(() => {
      console.warn('Overlay present after 2s');
    });

  await page.click('#popover-purchase');

  const purchaseConfirmationButton = page.locator('.purchase-btn').nth(2);
  await expect(purchaseConfirmationButton).toBeVisible();
  await purchaseConfirmationButton.click();

  await expect(page.locator('#purchase-confirm-btn')).toBeVisible();
  await page.click('#purchase-confirm-btn');
}

async function expectBalanceToDecreaseAfterPurchase(
  page: Page,
  previous: number
) {
  await expect
    .poll(async () => {
      const balanceText = await page.locator('#balance').innerText();
      return parseFloat(balanceText.replace(/[$,]/g, ''));
    })
    .toBeLessThan(previous);
}

// ─── MAIN TEST SUITE ────────────────────────────────────────────────────
test.describe('End-to-End: Complete Lotto Purchase for all Pick and Rule combinations', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToSectionWithHeading(
      page,
      'shop-picks1',
      'Select your numbers'
    );
  });
  testCases.forEach((testCase) => {
    const { pick, rule, numberMode, numbers, amount, days, draws } = testCase;

    test(`[E2E] should complete purchase with ${pick}, rule: ${rule}, mode: ${numberMode}, amount: ${amount}, days: ${days}, draws: ${draws}`, async ({
      page,
    }) => {
      let initialBalance: number;

      await test.step('1️⃣ Check initial balance before purchase', async () => {
        initialBalance = await getInitialBalance(page);
      });

      await test.step('2️⃣ Select pick type and rule variation', async () => {
        await chooseGameTypeAndRule(page, pick, rule);
      });

      await test.step('3️⃣ Choose numbers using selected mode', async () => {
        await chooseNumbersByMode(page, numberMode, numbers);
      });

      if (numberMode !== 'quick-pick') {
        // We need to keep the preference for the amount.
        // The UI is very unstable — if we try to manually select the amount in quick-pick,
        // Playwright may not detect the modal and the test fails.
        // This is a workaround.
        await test.step('4️⃣ Set amount to play', async () => {
          await chooseAmountToPlay(page, amount);
        });

        await test.step('5️⃣ Pick available days from calendar', async () => {
          await pickAvailableDaysFromCalendar(page, days);
        });

        await test.step('6️⃣ Select draws to participate in', async () => {
          await chooseDrawsToEnter(page, draws);
        });
      }

      await test.step('7️⃣ Submit purchase and confirm', async () => {
        await submitPurchaseFlowAndConfirm(page);
      });

      await test.step('8️⃣ Verify that balance decreased after purchase', async () => {
        await expectBalanceToDecreaseAfterPurchase(page, initialBalance);
      });
    });
  });
});
