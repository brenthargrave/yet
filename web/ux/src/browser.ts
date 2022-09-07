import * as puppeteer from "puppeteer"
import { startsWith } from "ramda"
import { faker } from "@faker-js/faker"

const { UX_DEBUG_BROWSER, PORT_SSL } = process.env

// NOTE: node chokes on "localhost" https://github.com/node-fetch/node-fetch/issues/1624#issuecomment-1235826631
const baseURL = `https://127.0.0.1:${PORT_SSL}`
// NOTE: node chokes on SSL, https://stackoverflow.com/a/20100521
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0"

const ariaLabelSel = (ariaLabelValue: string) =>
  `[aria-label="${ariaLabelValue}"]`

export const makeBrowser = async () => {
  const sandboxURL = `${baseURL}/sandbox`
  const checkoutSandbox = await fetch(sandboxURL, { method: "POST" }).then(
    (response) => {
      const value = response?.text()
      if (!value) throw new Error("MIA: sandbox value for headers")
      return value
    }
  )

  const exits: (() => Promise<void>)[] = []

  const customer = async (_name?: string) => {
    const browser = await puppeteer.launch({ dumpio: !!UX_DEBUG_BROWSER })
    const context = await browser.createIncognitoBrowserContext()
    const page = await context.newPage()
    page.setDefaultTimeout(10 * 1000)
    page.setDefaultNavigationTimeout(10 * 1000)
    page.setUserAgent(checkoutSandbox)

    const close = async () => {
      console.debug(`${_name}: close`)
      await page.close()
      await context.close()
      await browser.close()
    }
    exits.push(close)

    const visit = async (path: string): Promise<void> => {
      console.debug(`${_name} visit: ${path}`)
      const url = startsWith(path, "http") ? path : `${baseURL}/${path}`
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

  const checkinSandbox = await fetch(sandboxURL, { method: "DELETE" })
  const exit = async () =>
    Promise.all([...exits.map((fn) => fn()), checkinSandbox])
  // TODO: use single browser instance?
  // const exit = async () =>
  //   Promise.all([...exits.map((fn) => fn()), await browser.close()])

  return {
    customer,
    exit,
  }
}
