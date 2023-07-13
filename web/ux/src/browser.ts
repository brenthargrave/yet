import fs from "fs"
import * as puppeteer from "puppeteer"
import { startsWith } from "ramda"
import { first } from "remeda"
import { ConversationSpec, oppAriaLabel, OppSpec } from "./models"
import { Persona } from "./personas"
import { ClickOptions, LaunchOptions } from "./puppeteer-extras"
import { extractULIDs } from "./ulid"
export * from "./personas"

export enum Nav {
  Home = "Home",
  Conversations = "Conversations",
  Profile = "Profile",
  Opps = "Opportunities",
}

interface SeeOptions {
  mjml?: boolean
}

const { UX_DEBUG_BROWSER, PORT_SSL, PRODUCT_NAME = "TBD", HOST } = process.env

const screenieDir = "scratch/screenies"

// NOTE: node chokes on "localhost" https://github.com/node-fetch/node-fetch/issues/1624#issuecomment-1235826631
// const baseURL = `https://127.0.0.1:${PORT_SSL}`
const baseURL = `https://${HOST}`
// NOTE: node chokes on SSL, https://stackoverflow.com/a/20100521
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0"

const sandboxURL = `${baseURL}/sandbox`

export const checkoutSandbox = async () =>
  await fetch(sandboxURL, { method: "POST" })
    .then((response) => {
      const value = response?.text()
      if (!value) throw new Error("MIA: sandbox value for headers")
      return value
    })
    .catch((err) => {
      console.error(err)
      throw err
    })

export const checkinSandbox = async () =>
  await fetch(sandboxURL, { method: "DELETE" }).then((res) =>
    console.debug(res.body)
  )

const ariaLabelSel = (ariaLabelValue: string) =>
  `[aria-label="${ariaLabelValue}"]`

const classSel = (value: string) => `[class="${value}"]`

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

    const seconds = 5
    page.setDefaultTimeout(seconds * 1000)
    page.setDefaultNavigationTimeout(seconds * 1000)
    page.setUserAgent(userAgent)
    // clear out screenies
    if (fs.existsSync(screenieDir))
      fs.rmdirSync(screenieDir, { recursive: true })

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
      // NOTE: puppeteer behaves strangely when new tabs spawned by "_blank";
      // for tests only, alter links to always open in current tab.
      // https://github.com/puppeteer/puppeteer/issues/386#issuecomment-354574199
      const link = await page.waitForSelector(sel)
      await page.evaluateHandle((el) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (el) el.target = "_self"
      }, link)
      await page.click(sel, opts)
    }
    const focusAndPressEnter = async (ariaLabelValue: string) => {
      console.debug(`${p.name} click: "${ariaLabelValue}"`)
      const sel = ariaLabelSel(ariaLabelValue).concat(":not([disabled])")
      await page.waitForSelector(sel)
      await page.focus(sel)
      await press("Enter")
    }

    const see = async (ariaLabelValue: string, opts: SeeOptions = {}) => {
      console.debug(`${p.name} see: "${ariaLabelValue}"`)
      const sel = opts.mjml
        ? classSel(ariaLabelValue)
        : ariaLabelSel(ariaLabelValue)
      await page.waitForSelector(sel, { visible: true })
    }
    const notSee = async (ariaLabelValue: string, opts: SeeOptions = {}) => {
      console.debug(`${p.name} NOT see: "${ariaLabelValue}"`)
      const sel = opts.mjml
        ? classSel(ariaLabelValue)
        : ariaLabelSel(ariaLabelValue)
      await page.waitForSelector(sel, { hidden: true })
    }

    const screenie = async () => {
      fs.mkdirSync(screenieDir, { recursive: true })
      const ts = Date.now().toString()
      await page.screenshot({
        path: `${screenieDir}/${ts}-${p.name}.png`,
        fullPage: true,
      })
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

      // NOTE: clear Auth header
      await page.setExtraHTTPHeaders({})
    }

    const signup = async () => {
      await auth()
      await see("name")
      await input("name", name)
      await click("Continue")
      await input("email", email)
      await click("Continue")
      await see("Home")

      // NOTE: set auth header for non-api HTTP requests (UX tests only ATM)
      const token = await page.evaluate(async () => {
        // TODO: dedupe; import from ui/graph
        const token = localStorage.getItem("token")
        return token
      })
      const headers = {
        Authorization: `Bearer ${token}`,
      }
      await page.setExtraHTTPHeaders(headers)
    }

    const signin = async () => {
      await auth()
      await see("Home")
    }

    const seeOpp = async (opp: OppSpec) => {
      await see(oppAriaLabel(opp))
      await see(`role:${opp.role}`)
      await see(`org:${opp.org}`)
      if (opp.reward) await see(`reward:$${opp.reward}`)
      if (opp.desc) await see(`desc:${opp.desc}`)
    }

    const addOpp = async (opp: OppSpec) => {
      await click("Add " + oppAriaLabel(opp))
    }

    const notice = async (copy: string) => {
      await see(copy)
    }

    const seeConversation = async (
      c: ConversationSpec,
      opts: SeeOptions = {}
    ) => {
      await see(`/c/${c.id}`, opts)
      // TODO: invitees, note, status
    }
    const notSeeConversation = async (
      c: ConversationSpec,
      opts: SeeOptions = {}
    ) => {
      await notSee(`/c/${c.id}`, opts)
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

    const verifyFirstConversation = async (
      c: ConversationSpec,
      o?: OppSpec
    ) => {
      console.log(`${p.name} verify first convo`)
      await seeConversationProfile(c)
      if (o) {
        await accessOpp(o)
      }
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
        await click("New note")
      }
      // TODO: invitees.foreEach input, select if presnt or hit "enter"
      const invitee = first(c.invitees ?? [])
      await input("Who", invitee?.name)
      await press("Enter")
      await input("Note", c.note)
      const opps = c.mentions
      if (opps) {
        await click("Mention Opp")
        for (const opp of opps) {
          await seeOpp(opp)
          await addOpp(opp)
        }
      }
      // TODO: pressing Publish button fails?
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
      const cosignPath = new URL(shareURL).pathname
      // update conversation object w/ ids UUID
      const ulids = extractULIDs(cosignPath)
      const cid = first(ulids)
      c.id = cid
      console.log(`${p.name} created: ${c.id}`)
      return cosignPath
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

    const seeNavOptions = async ({
      show,
      hide,
    }: {
      show: Nav[]
      hide: Nav[]
    }) => {
      for (const view of show) {
        await see(view)
      }
      for (const view of hide) {
        await notSee(view)
      }
    }

    const reload = async () => {
      page.reload({ waitUntil: "domcontentloaded" })
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
      seeNavOptions,
      reload,
    }
  }

  const checkinSandbox = async () => {
    console.log("CHECKIN SANDBOX")
    return await fetch(sandboxURL, { method: "DELETE" })
    //.then((res) => console.debug(res.body))
  }

  const exit = async () => {
    console.log("EXIT")
    return Promise.all([
      //
      ...exits.map((fn) => fn()),
      checkinSandbox(),
    ])
  }

  return {
    customer,
    exit,
  }
}
