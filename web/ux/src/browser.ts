import * as puppeteer from "puppeteer"
import { startsWith } from "ramda"
// import { routes, Route } from "~/router"
// export { routes }

const { UX_DEBUG_BROWSER, HOST, PORT_SSL } = process.env

export const makeBrowser = async () => {
  // TODO: share across invocations
  const browser = await puppeteer.launch({ dumpio: !!UX_DEBUG_BROWSER })

  // NOTE: prefer incognito contexts for isolation across test runs
  // https://git.io/fjLt1
  const context = await browser.createIncognitoBrowserContext()
  const page = await context.newPage()
  page.setDefaultTimeout(10 * 1000)
  page.setDefaultNavigationTimeout(10 * 1000)

  const customer = async (name?: string) => {
    const context = await browser.createIncognitoBrowserContext()
    const page = await context.newPage()
    page.setDefaultTimeout(10 * 1000)
    page.setDefaultNavigationTimeout(10 * 1000)

    const close = async () => {
      console.debug(`close`)
      await page.close()
      await context.close()
      await browser.close()
    }

    const visit = async (path: string): Promise<void> => {
      console.debug(`${name} visit: ${path}`)
      const host = `https://${HOST}:${PORT_SSL}`
      const url = startsWith(path, "http") ? path : `${host}${path}`
      await page.goto(url)
    }

    const click = async (ariaLabelValue: string) => {
      console.debug(`${name} click: ${ariaLabelValue}`)
      const sel = `[aria-label="${ariaLabelValue}"]`
      await page.waitForSelector(sel)
      await page.click(sel)
    }

    const see = async (ariaLabelValue: string) => {
      console.debug(`${name} see: "${ariaLabelValue}"`)
      const sel = `[aria-label="${ariaLabelValue}"]`
      await page.waitForSelector(sel, { visible: true })
    }

    return {
      close,
      visit,
      click,
      see,
    }
  }

  const visit = async (path: string): Promise<void> => {
    const host = `https://${HOST}:${PORT_SSL}`
    const url = startsWith(path, "http") ? path : `${host}${path}`
    try {
      await page.goto(url)
    } catch (err) {
      console.error(err)
    }
  }

  const close = async () => {
    await page.close()
    await context.close()
    await browser.close()
  }

  const see = async (ariaLabelValue: string) => {
    console.debug(`see: "${ariaLabelValue}"`)
    const sel = `[aria-label="${ariaLabelValue}"]`
    await page.waitForSelector(sel, { visible: true })
  }

  const tap = async (ariaLabelValue: string) => {
    console.debug(`tap "${ariaLabelValue}"`)
    const sel = `[aria-label="${ariaLabelValue}"]`
    await page.waitForSelector(sel)
    await page.tap(sel)
  }

  const click = async (ariaLabelValue: string) => {
    const sel = `[aria-label="${ariaLabelValue}"]`
    await page.waitForSelector(sel)
    await page.click(sel)
  }

  return {
    page,
    close,
    visit,
    see,
    tap,
    click,
    //
    customer,
  }
}
