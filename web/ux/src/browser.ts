import * as puppeteer from "puppeteer"
import { startsWith } from "ramda"
import { faker } from "@faker-js/faker"

const { UX_DEBUG_BROWSER, HOST, PORT_SSL } = process.env

const ariaLabelSel = (ariaLabelValue: string) =>
  `[aria-label="${ariaLabelValue}"]`

export const makeBrowser = async () => {
  const exits: (() => Promise<void>)[] = []

  const customer = async (_name?: string) => {
    const browser = await puppeteer.launch({ dumpio: !!UX_DEBUG_BROWSER })
    const context = await browser.createIncognitoBrowserContext()
    const page = await context.newPage()
    page.setDefaultTimeout(10 * 1000)
    page.setDefaultNavigationTimeout(10 * 1000)

    const close = async () => {
      console.debug(`${_name}: close`)
      await page.close()
      await context.close()
      await browser.close()
    }
    exits.push(close)

    const visit = async (path: string): Promise<void> => {
      console.debug(`${_name} visit: ${path}`)
      const host = `https://${HOST}:${PORT_SSL}`
      const url = startsWith(path, "http") ? path : `${host}${path}`
      await page.goto(url)
    }

    const click = async (ariaLabelValue: string) => {
      console.debug(`${_name} click: "${ariaLabelValue}"`)
      const sel = ariaLabelSel(ariaLabelValue)
      await page.waitForSelector(sel)
      await page.click(sel)
    }

    const see = async (ariaLabelValue: string) => {
      console.debug(`${_name} see: "${ariaLabelValue}"`)
      const sel = ariaLabelSel(ariaLabelValue)
      await page.waitForSelector(sel, { visible: true })
    }

    const screenie = async () => {
      const ts = Date.now().toString()
      await page.screenshot({ path: `scratch/${ts}-${_name}.png` })
    }

    const type = async (ariaLabelValue: string, text: string) => {
      console.debug(`${_name} type: "${text}" in "${ariaLabelValue}"`)
      const sel = ariaLabelSel(ariaLabelValue)
      await page.waitForSelector(sel, { visible: true })
      await page.keyboard.type(text)
    }

    const input = async (ariaLabelValue: string, text: string) => {
      console.debug(`${_name} type: "${text}" in "${ariaLabelValue}"`)
      const sel = ariaLabelSel(ariaLabelValue)
      await page.waitForSelector(sel, { visible: true })
      await page.type(sel, text)
    }

    const name = _name ?? faker.name.fullName()

    // NOTE: composite actions

    const signup = async () => {
      await visit("/")
      await click("Create Account")
      // TODO:
    }

    return {
      name,
      close,
      visit,
      click,
      see,
      screenie,
      input,
      type,
      signup,
    }
  }

  const exit = async () => Promise.all(exits.map((fn) => fn()))

  return {
    customer,
    exit,
  }
}
