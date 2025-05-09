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
    pick: 'pick2',
    rule: 'straight',
    numberMode: 'manual',
    numbers: ['1', '2'],
    amount: '1',
    days: 3,
    draws: 'one',
  },
  {
    pick: 'pick3',
    rule: 'boxed',
    numberMode: 'quick-pick',
    numbers: [],
    amount: '2',
    days: 5,
    draws: 'all',
  },
  {
    pick: 'pick4',
    rule: 'straight',
    numberMode: 'type-in',
    numbers: ['1', '2', '3', '4'],
    amount: '5',
    days: 3,
    draws: 'all',
  },
  {
    pick: 'pick5',
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
async function chooseGameTypeAndRule(page: Page, pick: string, rule: string) {
  await page.click(`#btn-${pick}-img`);
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
  const input = '.container-numbers-manual #inputNumber';
  await page.click(input);
  await page.fill(input, value, { force: true });
}

async function chooseQuickPickOption(page: Page) {
  await page.click('#option-quick-pick');
  await page
    .locator('#quick-pick-container .quick-pick-option')
    .first()
    .click();
}

async function chooseFromMyList(page: Page) {
  await page.click('#btn-my-list');
}

const chooseNumberByMode: ChooseNumbersByModeFn = async (
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
    await chooseFromMyList(page);
  }
};

const chooseAmountToPlay: ChooseAmountFn = async (page, amount) => {
  await page.locator('#popover-amount').click();
  await page.click('.menuToggle');
  await page.click(`li:has(button[data-amount="${amount}"]) button`);
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
  const acceptButtonSelector =
    '#go-to-purchase-tab-confirmation-modal .yes-btn';

  if (await page.isVisible(modalSelector)) {
    await page.click(acceptButtonSelector);
  }
};

async function SubmitPurchaseFlowAndConfirm(page: Page) {
  await page.click('#popover-purchase');
  await page.waitForTimeout(1000);
  await acceptPurchaseConfirmationModal(page);

  const confirmButtons = page.getByRole('button').filter({ hasText: /^$/ });
  await expect(confirmButtons.nth(1)).toBeVisible();
  await confirmButtons.nth(1).click();

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

      await test.step('1️⃣ Get Initial Balance', async () => {
        initialBalance = await getInitialBalance(page);
      });

      await test.step('2️⃣ Select Pick and Rule', async () => {
        await chooseGameTypeAndRule(page, pick, rule);
      });

      await test.step('3️⃣ Select Numbers', async () => {
        await chooseNumberByMode(page, numberMode, numbers);
      });

      await test.step('4️⃣ Select Amount', async () => {
        await chooseAmountToPlay(page, amount);
      });

      if (numberMode !== 'quick-pick') {
        await test.step('5️⃣ Select Days', async () => {
          await pickAvailableDaysFromCalendar(page, days);
        });

        await test.step('6️⃣ Select Draws', async () => {
          await chooseDrawsToEnter(page, draws);
        });
      }

      await test.step('7️⃣ Purchase and Confirm', async () => {
        await SubmitPurchaseFlowAndConfirm(page);
      });

      await test.step('8️⃣ Verify Balance Updated', async () => {
        await expectBalanceToDecreaseAfterPurchase(page, initialBalance);
      });
    });
  });
});
