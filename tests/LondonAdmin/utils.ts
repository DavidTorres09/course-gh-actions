const ADMIN_LOGIN_URL = 'http://localhost:5051/admin/login';
const USER = 'admin';
const PASSWORD = 'Test123!';

export async function adminLogin({ page }) {
  await page.goto(ADMIN_LOGIN_URL);
  await page.getByRole('textbox', { name: 'Username' }).fill(USER);
  await page.getByRole('textbox', { name: 'Password' }).fill(PASSWORD);
  await page.getByRole('button', { name: 'Log in' }).click();
}

export const SCREENSHOT_PATH = 'screenshots/admin/';
