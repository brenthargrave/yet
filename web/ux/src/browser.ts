import * as puppeteer from "puppeteer"
import { startsWith } from "ramda"

const { UX_DEBUG_BROWSER, HOST, PORT_SSL } = process.env

export const makeBrowser = async () => {
  const exits: (() => Promise<void>)[] = []

  const customer = async (name?: string) => {
    const browser = await puppeteer.launch({ dumpio: !!UX_DEBUG_BROWSER })
    const context = await browser.createIncognitoBrowserContext()
    const page = await context.newPage()
    page.setDefaultTimeout(10 * 1000)
    page.setDefaultNavigationTimeout(10 * 1000)

    const close = async () => {
      console.debug(`${name}: close`)
      await page.close()
      await context.close()
      await browser.close()
    }
    exits.push(close)

    const visit = async (path: string): Promise<void> => {
      console.debug(`${name} visit: ${path}`)
      const host = `https://${HOST}:${PORT_SSL}`
      const url = startsWith(path, "http") ? path : `${host}${path}`
      await page.goto(url)
    }

    const click = async (ariaLabelValue: string) => {
      console.debug(`${name} click: "${ariaLabelValue}"`)
      const sel = `[aria-label="${ariaLabelValue}"]`
      await page.waitForSelector(sel)
      await page.click(sel)
    }

    const see = async (ariaLabelValue: string) => {
      console.debug(`${name} see: "${ariaLabelValue}"`)
      const sel = `[aria-label="${ariaLabelValue}"]`
      await page.waitForSelector(sel, { visible: true })
    }

    const screenie = async () => {
      await page.screenshot({ path: `scratch/${name}.png` })
    }

    const signup = async () => {
      await visit("/")
      await click("Create Account")
      // TODO:
    }

    return {
      close,
      visit,
      click,
      see,
      screenie,
      signup,
    }
  }

  const exit = async () => Promise.all(exits.map((fn) => fn()))

  return {
    customer,
    exit,
  }
}
