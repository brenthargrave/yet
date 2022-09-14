import * as puppeteer from "puppeteer"
import { startsWith } from "ramda"
import { Persona } from "./personas"
export * from "./personas"
import { ClickOptions } from "./puppeteer-extras"
import fs, { existsSync } from "fs"
import { OppSpec, oppAriaLabel, ConversationSpec } from "./models"

const { UX_DEBUG_BROWSER, PORT_SSL, PRODUCT_NAME = "TBD" } = process.env

// NOTE: node chokes on "localhost" https://github.com/node-fetch/node-fetch/issues/1624#issuecomment-1235826631
const baseURL = `https://127.0.0.1:${PORT_SSL}`
// NOTE: node chokes on SSL, https://stackoverflow.com/a/20100521
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0"

const sandboxURL = `${baseURL}/sandbox`

export const checkoutSandbox = async () =>
  await fetch(sandboxURL, { method: "POST" }).then((response) => {
    const value = response?.text()
    if (!value) throw new Error("MIA: sandbox value for headers")
    return value
  })

export const checkinSandbox = async () =>
  await fetch(sandboxURL, { method: "DELETE" }).then((res) =>
    console.debug(res.body)
  )

const ariaLabelSel = (ariaLabelValue: string) =>
  `[aria-label="${ariaLabelValue}"]`

export const makeBrowser = async (headless = true) => {
  const userAgent = await checkoutSandbox()

  const exits: (() => Promise<void>)[] = []

  const customer = async (p: Persona) => {
    const { name, phone, email } = p

    const browser = await puppeteer.launch({
      dumpio: !!UX_DEBUG_BROWSER,
      headless,
    })
    const page = await browser.newPage()
    const seconds = 5
    page.setDefaultTimeout(seconds * 1000)
    page.setDefaultNavigationTimeout(seconds * 1000)
    page.setUserAgent(userAgent)

    const close = async () => {
      console.debug(`${p.name}: close`)
      await page.close()
      // await context.close()
      await browser.close()
    }
    exits.push(close)

    const visit = async (urlOrPath: string): Promise<void> => {
      console.debug(`${p.name} visit: ${urlOrPath}`)
      const url = startsWith(urlOrPath, "https")
        ? urlOrPath
        : `${baseURL}${urlOrPath}`
      await page.goto(url)
    }

    const click = async (ariaLabelValue: string, opts?: ClickOptions) => {
      console.debug(`${p.name} click: "${ariaLabelValue}"`)
      const sel = ariaLabelSel(ariaLabelValue).concat(":not([disabled])")
      await page.waitForSelector(sel)
      await page.click(sel, opts)
    }

    const see = async (ariaLabelValue: string, debug = true) => {
      if (debug) console.debug(`${p.name} see: "${ariaLabelValue}"`)
      const sel = ariaLabelSel(ariaLabelValue)
      await page.waitForSelector(sel, { visible: true })
    }
    const notSee = async (ariaLabelValue: string, debug = true) => {
      if (debug) console.debug(`${p.name} NOT see: "${ariaLabelValue}"`)
      const sel = `:not(${ariaLabelSel(ariaLabelValue)})`
      await page.waitForSelector(sel, { visible: true })
    }

    const screenie = async () => {
      const dir = "scratch/screenies"
      fs.mkdirSync(dir, { recursive: true })
      const ts = Date.now().toString()
      await page.screenshot({ path: `${dir}/${ts}-${p.name}.png` })
    }

    const press = async (key: puppeteer.KeyInput) => {
      await page.keyboard.press(key)
    }

    const type = async (ariaLabelValue: string, text: string) => {
      console.debug(`${p.name} type: "${text}" in "${ariaLabelValue}"`)
      const sel = ariaLabelSel(ariaLabelValue)
      await page.waitForSelector(sel, { visible: true })
      await page.keyboard.type(text)
    }

    const input = async (ariaLabelValue: string, text?: string) => {
      if (!text) throw Error("MIA: input text")
      console.debug(`${p.name} type: "${text}" in "${ariaLabelValue}"`)
      const sel = ariaLabelSel(ariaLabelValue)
      await page.waitForSelector(sel, { visible: true })
      await page.type(sel, text)
    }

    // NOTE: composite actions
    //
    const auth = async () => {
      await see("phone number")
      await input("phone number", phone)
      await click("Continue")
      await type("PIN number", "2222") // NOTE: auto-submits on last digit
    }

    const signout = async () => {
      await visit("/out")
      await see(PRODUCT_NAME)
    }

    const signup = async () => {
      await auth()
      await see("name")
      await input("name", name)
      await click("Continue")
      await input("email", email)
      await click("Continue")
      await see("Home")
    }

    const signin = async () => {
      await auth()
      await see("Home")
    }

    const seeOpp = async (opp: OppSpec) => {
      await see(oppAriaLabel(opp))
      await see(`role:${opp.role}`, false)
      await see(`org:${opp.org}`, false)
      if (opp.reward) await see(`reward:$${opp.reward}`, false)
      if (opp.desc) await see(`desc:${opp.desc}`, false)
    }

    const addOpp = async (opp: OppSpec) => {
      await click("Add " + oppAriaLabel(opp))
    }

    const notice = async (copy: string) => {
      await see(copy)
    }

    const seeConversation = async (c: ConversationSpec) => {
      await see(`/c/${c.id}`)
      // TODO: invitees, note, status
    }
    const notSeeConversation = async (c: ConversationSpec) => {
      await notSee(`/c/${c.id}`)
    }
    const seeConversationProfile = async (spec: ConversationSpec) => {
      await see("Conversation")
      await see("Share") // only on Show, not Edit
      await seeConversation(spec)
    }

    return {
      page,
      name,
      phone,
      email,
      close,
      visit,
      click,
      see,
      notSee,
      screenie,
      input,
      press,
      type,
      signup,
      signout,
      signin,
      seeOpp,
      addOpp,
      notice,
      seeConversation,
      seeConversationProfile,
      notSeeConversation,
    }
  }

  const checkinSandbox = async () =>
    await fetch(sandboxURL, { method: "DELETE" })
  //.then((res) => console.debug(res.body))

  const exit = async () =>
    Promise.all([
      //
      ...exits.map((fn) => fn()),
      checkinSandbox(),
    ])

  return {
    customer,
    exit,
  }
}
