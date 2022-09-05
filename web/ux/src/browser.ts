import * as puppeteer from "puppeteer"


import { isEmpty, startsWith } from "ramda";

const { UX_DEBUG_BROWSER } = process.env
const dumpio = !!process.env.UX_DEBUG_BROWSER

export const makeBrowser = async () => {

  // TODO: share across invocations
  const browser = await puppeteer.launch({ dumpio })

  // NOTE: prefer incognito contexts for isolation across test runs
  // https://git.io/fjLt1
  const context = await browser.createIncognitoBrowserContext()
  const page = await context.newPage()
  page.setDefaultTimeout(1 * 1000)

  const visit = async (path: string): Promise<void> => {
    const { HOST, PORT_SSL } = process.env
    const host = `https://${HOST}:${PORT_SSL}`
    const url = startsWith(path, "http") ? path : `${host}${path}`
    console.debug(url)
    await page.goto(url)
  }

  const close = async () => {
    await page.close()
    await context.close()
    await browser.close()
  }

  // TODO: extract page txt, substring match
  const see = async (ariaLabelValue: string) => {
    const sel = `[aria-label="${ariaLabelValue}"]`
    await page.waitForSelector(sel, { visible: true })
  }

  const tap = async (ariaLabelValue: string) => {
    const sel = `[aria-label="${ariaLabelValue}"]`
    await page.tap(sel)
  }

  return {
    close,
    visit,
    see,
    tap,
  }
}
