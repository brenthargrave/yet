import * as puppeteer from "puppeteer"
import { startsWith } from "ramda"
import { Persona } from "./personas"
export * from "./personas"
import { ClickOptions, LaunchOptions } from "./puppeteer-extras"
import fs, { existsSync } from "fs"
import { OppSpec, oppAriaLabel, ConversationSpec } from "./models"
import { first } from "remeda"
import { extractULIDs } from "./ulid"

export enum Nav {
  Home = "Home",
  Conversations = "Conversations",
  Profile = "Profile",
}

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

export const makeBrowser = async (globalLaunchOptions: LaunchOptions) => {
  const userAgent = await checkoutSandbox()

  const exits: (() => Promise<void>)[] = []

  const customer = async (p: Persona, launchOptions: LaunchOptions = {}) => {
    const { name, phone, email } = p

    const browser = await puppeteer.launch({
      dumpio: !!UX_DEBUG_BROWSER,
      headless: true,
      ...globalLaunchOptions,
      ...launchOptions,
    })
    const context = await browser.createIncognitoBrowserContext()
    const page = await context.newPage()
    // NOTE: https://github.com/puppeteer/puppeteer/issues/1030#issuecomment-336495331
    page.on("error", (error) => {
      console.error("error", name, error)
    })
    page.on("pageerror", (error) => {
      console.error("pageerror", name, error, error.cause)
    })

    const seconds = 6
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
    const focusAndPressEnter = async (ariaLabelValue: string) => {
      console.debug(`${p.name} click: "${ariaLabelValue}"`)
      const sel = ariaLabelSel(ariaLabelValue).concat(":not([disabled])")
      await page.waitForSelector(sel)
      await page.focus(sel)
      await press("Enter")
    }

    const see = async (ariaLabelValue: string, debug = true) => {
      if (debug) console.debug(`${p.name} see: "${ariaLabelValue}"`)
      const sel = ariaLabelSel(ariaLabelValue)
      await page.waitForSelector(sel, { visible: true })
    }
    const notSee = async (ariaLabelValue: string, debug = true) => {
      if (debug) console.debug(`${p.name} NOT see: "${ariaLabelValue}"`)
      const sel = ariaLabelSel(ariaLabelValue)
      await page.waitForSelector(sel, { hidden: true })
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
      await page.keyboard.type(text, { delay: 50 })
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

    const accessOpp = async (o: OppSpec) => {
      await click("Opportunities")
      await see("Your Opportunities")
      await seeOpp(o)
    }

    const verifyFirstConversation = async (c: ConversationSpec, o: OppSpec) => {
      await seeConversationProfile(c)
      await accessOpp(o)
      await click("Home")
      await see(`No network activity just yet.`)
      await notSeeConversation(c)
      await click("Conversations")
      await see("Your Conversations")
      await seeConversation(c)
      await click("Profile")
      await see("Your Profile")
      await seeConversation(c)
    }

    const createConversation = async (c: ConversationSpec, isFirst = false) => {
      await click("Conversations")
      if (isFirst) {
        await see("Welcome!")
        await click("Note a conversation")
      } else {
        await click("New conversation")
      }
      // TODO: invitees.foreEach input, select if presnt or hit "enter"
      const invitee = first(c.invitees ?? [])
      await input("Who", invitee?.name)
      await press("Enter")
      await input("Note", c.note)
      await click("Mention Opp")
      // TODO: opps.each seeOpp, addOpp
      const opp = first(c.mentions ?? [])
      if (!opp) throw new Error(`MIA: opp`)
      await seeOpp(opp)
      await addOpp(opp)
      // await click("Publish", { delay: 2000 })

      await page.keyboard.down("Control")
      await page.keyboard.press("p")
      await page.keyboard.up("Control")

      await see("Copy share link to clipboard")
      await click("Copy")
      // await notice("Copied!")
      const shareURL = await page.evaluate(() => {
        const value = document.getElementById("shareURL")?.getAttribute("value")
        if (!value) throw new Error("MIA: shareURL value")
        return value
      })
      const path = new URL(shareURL).pathname
      const ulids = extractULIDs(path)
      const cid = first(ulids)
      c.id = cid
      return path
    }

    const signupAndSignConversationAtPath = async (path: string) => {
      await visit(path)
      await see("Please sign in to review them.")
      await click("Sign in / Sign up")
      await signup()
      await click("Cosign")
    }

    const accessConversation = async ({
      c,
      show,
      hide,
    }: {
      c: ConversationSpec
      show: Nav[]
      hide: Nav[]
    }) => {
      for (const view of show) {
        await click(view)
        await seeConversation(c)
      }
      for (const view of hide) {
        await click(view)
        await notSeeConversation(c)
      }
    }

    return {
      page,
      name,
      phone,
      email,
      close,
      visit,
      click,
      focusAndPressEnter,
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
      verifyFirstConversation,
      createConversation,
      signupAndSignConversationAtPath,
      accessConversation,
      accessOpp,
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
