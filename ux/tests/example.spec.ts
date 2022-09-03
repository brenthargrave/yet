import { test, expect } from '@playwright/test';

// test('homepage has Playwright in title and get started link linking to the intro page', async ({ page, }) => {
//   await page.goto('https://playwright.dev/');

//   // Expect a title "to contain" a substring.
//   await expect(page).toHaveTitle(/Playwright/);

//   // create a locator
//   const getStarted = page.locator('text=Get Started');

//   // Expect an attribute "to be strictly equal" to the value.
//   await expect(getStarted).toHaveAttribute('href', '/docs/intro');

//   // Click the get started link.
//   await getStarted.click();

//   // Expects the URL to contain intro.
//   await expect(page).toHaveURL(/.*intro/);
// });

test('Sign up', async ({ page, browser }) => {
  // const a = await browser.newPage()
  // a.goto("https://localhost:6443/")
  // a.goto("/in")
  page.goto("/")
  const signUp = page.locator('text=Create Account');
  await signUp.click()
  const screenie = await  page.screenshot({fullPage: true, path: 'screenshot.png'})
  // page.locator("text=phone")
  // expect(a.locator("text=phone number")).toHaveText()
  // expect(a.
})
