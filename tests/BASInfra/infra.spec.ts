import { test, expect } from '@playwright/test';

test.describe('BAS Infra', () => {
  test('Login to BAS test frontend', async ({ page }) => {
    await page.goto('https://sports-london-dev.5050.ag/sports#/');

    await page.getByPlaceholder('Customer Id').fill('BA8');
    await page.getByPlaceholder('Password').fill('Test123!');
    await page.getByRole('button', { name: 'Log In' }).click();
    await page.waitForLoadState('domcontentloaded');
    const balanceText = await page
      .getByRole('link', { name: 'Balance: $' })
      .innerText();
    console.log('Balance:', balanceText);
    const balance = parseFloat(balanceText.replace(/[^0-9.-]+/g, ''));
    expect(balance).toBeGreaterThan(0);
  });

  // BALANCE TESTS
  const BalanceData = {
    systemID: 'LottoLux', //'Lotto',
    systemPassword: '07l8zXguUysU', //'1sl@d31c@c@',
    customerId: 'BA8',
  };

  test('get balance from api-bas-lotto.5050.ag', async ({ request }) => {
    const url = 'https://api-bas-lotto.5050.ag/api/Lotto/GetCustomerBalance';

    const resp = await request.post(url, {
      data: JSON.stringify(BalanceData),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const json = await resp.json();
    console.log('Response:', json);
    expect(json).toBeGreaterThan(0);
  });

  test('get balance from api-gbs-london.betanysports.eu', async ({
    request,
  }) => {
    const url =
      'https://api-gbs-london.betanysports.eu/api/Lotto/GetCustomerBalance';

    const resp = await request.post(url, {
      data: JSON.stringify(BalanceData),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const json = await resp.json();
    console.log('Response:', json);
    expect(json).toBeGreaterThan(0);
  });

  // TOKEN TESTS

  const TokenData = {
    method: 'get',
    argumentlist: [{ systemId: 'LottoLux', customerId: 'BA8' }],
  };

  test('get token from api-bas-lotto.5050.ag', async ({ request }) => {
    const url = 'https://api-bas-lotto.5050.ag/api/Lotto/Token';

    const resp = await request.get(url, {
      data: JSON.stringify(TokenData),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const json = await resp.json();
    console.log('Response:', json);
  });

  test('get token from api-gbs-london.betanysports.eu', async ({ request }) => {
    const url = 'https://api-gbs-london.betanysports.eu/api/Lotto/Token';
    const resp = await request.get(url, {
      data: JSON.stringify(TokenData),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const json = await resp.json();
    console.log('Response:', json);
  });

  // NonPosted

  const nonPostedData = {
    systemID: 'LottoLux',
    systemPassword: '07l8zXguUysU',
    customerId: 'BA8',
    Amount: '100',
    TranCode: 'C',
    TranType: 'X',
    Description: 'Lotto Win for Tckt#1',
  };

  test('NonPosted request from api-bas-lotto.5050.ag', async ({ request }) => {
    const url = 'https://api-bas-lotto.5050.ag/api/Lotto/NonPosted';
    const resp = await request.post(url, {
      data: JSON.stringify(nonPostedData),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const json = await resp.json();
    console.log('Response:', json);
  });

  // validateCustomer

  const validateCustomer = {
    systemID: 'LottoLux',
    systemPassword: '07l8zXguUysU',
    customerId: 'BA8',
    ClerkId: 'mesosolly',
    Token: '9af0c369-9142-4926-a0c3-49b9827565b0',
  };

  test('validateCustomer request from api-bas-lotto.5050.ag', async ({
    request,
  }) => {
    const url = 'https://api-bas-lotto.5050.ag/api/Lotto/SvcValidateCustomer';
    const resp = await request.post(url, {
      data: JSON.stringify(validateCustomer),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const json = await resp.json();
    console.log('Response:', json);
  });
});
