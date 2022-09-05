import { test, expect, Page } from '@playwright/test';
import { routes, Route } from "../../web/ui/src/router"

const visit = (page: Page, route: Route) =>
  page.goto(route.href)

test('Sign up', async ({ page, browser, context }) => {
  await visit(page, routes.root())
  const signUp = page.locator('button', { hasText: "Create Account"});
  await signUp.focus()
  await page.keyboard.press("Enter")
  await expect(page.locator("text=phone number")).toBeVisible()
  await page.locator("#phone-number").fill("9099103449")
  await page.locator("button", { hasText: "Continue"}).focus()
  await page.keyboard.press("Enter")
  await page.screenshot({fullPage: true, path: './scratch/a.png'})

  const b = await browser.newPage()
  // const b = await bc.newPage()
  await b.goto("/")
  await expect(b.locator("text=TBD")).toBeVisible()
  await b.screenshot({fullPage: true, path: './scratch/b.png'})
})
