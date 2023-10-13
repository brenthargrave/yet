import { expect } from "earl"
import fs from "fs"
import * as puppeteer from "puppeteer"
import { startsWith } from "ramda"
import { first } from "remeda"
import { match } from "ts-pattern"
import {
  ConversationSpec,
  DraftConversationSpec,
  DraftNoteSpec,
  Notification,
  oppAriaLabel,
  OppSpec,
} from "./models"
import { Persona } from "./personas"
import { ClickOptions, LaunchOptions } from "./puppeteer-extras"
export * from "./personas"

export enum Nav {
  Home = "Home",
  Conversations = "Conversations",
  Profile = "Profile",
  Opps = "Opportunities",
}

export enum SelectAttribute {
  ariaLablel = "ariaLabel",
  id = "id",
  class = "class",
  raw = "raw",
}

interface SeeOptions extends puppeteer.WaitForSelectorOptions {
  mjml?: boolean
  attribute?: SelectAttribute
}

const {
  UX_DEBUG_BROWSER,
  PORT_SSL,
  PRODUCT_NAME = "TBD",
  HOST,
  BROWSER_TIMEOUT_SECONDS,
} = process.env

const screenieDir = "scratch/screenies"

// NOTE: node chokes on "localhost" https://github.com/node-fetch/node-fetch/issues/1624#issuecomment-1235826631
// const baseURL = `https://127.0.0.1:${PORT_SSL}`
const baseURL = `https://${HOST}`
// NOTE: node chokes on SSL, https://stackoverflow.com/a/20100521
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0"

const sandboxURL = `${baseURL}/sandbox`

export const checkoutSandbox = async () =>
  await fetch(sandboxURL, { method: "POST" })
    .then(async (response) => {
      const value = await response?.text()
      if (!value) throw new Error("MIA: sandbox value for headers")
      return value
    })
    .catch((err) => {
      console.error(err)
      throw err
    })

export const checkinSandbox = async () =>
  await fetch(sandboxURL, { method: "DELETE" })

const ariaLabelSel = (ariaLabelValue: string) =>
  `[aria-label="${ariaLabelValue}"]`

const classSel = (value: string) => `[class="${value}"]`

const idSel = (value: string) => `[id="${value}"]`

const selector = (attribute: SelectAttribute | undefined, value: string) =>
  match(attribute)
    .with(SelectAttribute.ariaLablel, () => ariaLabelSel(value))
    .with(SelectAttribute.class, () => classSel(value))
    .with(SelectAttribute.id, () => idSel(value))
    .with(SelectAttribute.raw, () => value)
    .otherwise(() => ariaLabelSel(value))

export const makeBrowser = async (globalLaunchOptions: LaunchOptions) => {
  const userAgent = await checkoutSandbox()

  const exits: (() => Promise<void>)[] = []

  const customer = async (p: Persona, launchOptions: LaunchOptions = {}) => {
    const { first_name, last_name, phone, email } = p
    const name = `${first_name} ${last_name}`

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

    const seconds = parseInt(BROWSER_TIMEOUT_SECONDS ?? "20")
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

    const see = async (value: string, opts: SeeOptions = {}) => {
      console.debug(`${p.name} see "${value}"`)
      const sel = selector(opts.attribute, value)
      await page.waitForSelector(sel, { ...opts, visible: true })
    }

    const notSee = async (value: string, opts: SeeOptions = {}) => {
      console.debug(`${p.name} NOT see: "${value}"`)
      const sel = selector(opts.attribute, value)
      await page.waitForSelector(sel, { ...opts, hidden: true })
    }

    const screenie = async (desc?: string) => {
      fs.mkdirSync(screenieDir, { recursive: true })
      const ts = Date.now().toString()
      const pathParts = []
      pathParts.push(ts)
      pathParts.push(p.name)
      if (desc) {
        pathParts.push(desc)
      }
      const filename = pathParts.join("-")
      const path = `${screenieDir}/${filename}.png`
      await page.screenshot({
        path,
        fullPage: true,
      })
    }

    const press = async (key: puppeteer.KeyInput) => {
      console.debug(`${p.name} type: "${key}"`)
      await page.keyboard.press(key)
    }

    const type = async (ariaLabelValue: string, text: string) => {
      console.debug(`${p.name} type: "${text}" in "${ariaLabelValue}"`)
      const sel = ariaLabelSel(ariaLabelValue)
      await page.waitForSelector(sel, { visible: true })
      await page.keyboard.type(text, { delay: 50 })
    }

    const input = async (
      ariaLabelValue: string,
      text?: string,
      opts?: SeeOptions
    ) => {
      if (!text) throw Error("MIA: input text")
      console.debug(`${p.name} type: "${text}" in "${ariaLabelValue}"`)
      const sel = ariaLabelSel(ariaLabelValue)
      await page.waitForSelector(sel, { ...opts, visible: true })
      await page.type(sel, text)
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
      await see("first_name")
      await input("first_name", first_name)
      await click("Continue")
      await see("last_name")
      await input("last_name", last_name)
      await click("Continue")
      await input("email", email)
      await click("Continue")
      await input("org", `${first_name} & Co.`)
      await click("Continue")
      await input("role", `Employee`)
      await click("Continue")
      await see("Home")

      await seeNavOptions({
        show: [Nav.Home, Nav.Conversations, Nav.Profile],
        hide: [],
      })

      // store ID
      p.id = await page.evaluate(() => {
        const ele = document.getElementById("me-id")
        const value = ele?.getAttribute(`data-me-id`)
        if (!value) throw new Error(`MIA: me ID ${value}`)
        return value
      })

      // NOTE: set auth header for non-api HTTP requests (UX tests only ATM)
      const token = await page.evaluate(async () => {
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

    const seeNote = async (note: DraftNoteSpec, opts: SeeOptions = {}) => {
      await see(`/n/${note.id}`, {
        attribute: SelectAttribute.id,
        ...opts,
      })
    }
    const notSeeNote = async (note: DraftNoteSpec, opts: SeeOptions = {}) => {
      await notSee(`/n/${note.id}`, {
        attribute: SelectAttribute.id,
        ...opts,
      })
    }
    const notSeeNotes = async (
      c: DraftConversationSpec,
      opts: SeeOptions = {}
    ) => {
      const sel = `[id="/c/${c.id}"] .note`
      await notSee(sel, {
        attribute: SelectAttribute.raw,
      })
    }
    const seeNotes = async (
      c: DraftConversationSpec,
      opts: SeeOptions = {}
    ) => {
      const sel = `[id="/c/${c.id}"] .note`
      await see(sel, {
        attribute: SelectAttribute.raw,
      })
    }

    const seeConversation = async (
      c: DraftConversationSpec,
      opts: SeeOptions = {}
    ) => {
      await see(`/c/${c.id}`, {
        attribute: SelectAttribute.id,
        ...opts,
      })
      // TODO: invitees, note, status
    }
    const notSeeConversation = async (
      c: DraftConversationSpec,
      opts: SeeOptions = {}
    ) => {
      await notSee(`/c/${c.id}`, {
        attribute: SelectAttribute.id,
        ...opts,
      })
    }

    const seeConversationProfile = async (c: DraftConversationSpec) => {
      await see("Conversation")
      await see("Share") // only on Show, not Edit
      await seeConversation(c)
    }

    const accessOpp = async (o: OppSpec) => {
      await click("Opportunities")
      await see("Your Opportunities")
      await seeOpp(o)
    }

    const verifyFirstConversation = async (
      c: DraftConversationSpec,
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
      if (c.note && c.note.publish) {
        await seeConversation(c)
      } else {
        await notSeeConversation(c)
      }
    }

    const publishNote = async (note: DraftNoteSpec) => {
      // TODO: requires direct nav back to note's conv URL, fixing test-env CORS bug
      // const path = note.conversation?.path
      // if (path) visit(path)
      await click("Publish Note")
      await page.waitForSelector(`[data-note-id]`, { visible: true })
      note.id = await page.evaluate(() => {
        const eles = document.getElementsByClassName("note")
        const ele = eles.item(0)
        const value = ele?.getAttribute(`data-note-id`)
        if (!value) throw new Error(`MIA: note ID ${value}`)
        return value
      })
      await page.waitForSelector(`[id='note-${note.id}-show']`, {
        visible: true,
      })
    }

    const createConversation = async ({
      conversation,
      isInitial = false,
    }: {
      conversation: DraftConversationSpec
      isInitial?: boolean
    }): Promise<ConversationSpec> => {
      console.debug(`${p.name} createConversation ${conversation.note?.text}`)
      await click("Conversations")
      if (isInitial) {
        await see("Welcome!")
        await click("Note a conversation")
      } else {
        await click("New")
      }

      for (const invitee of conversation.invitees ?? []) {
        await input("Who", invitee.name)
        // ID set once signed up
        if (invitee.id) {
          await press("ArrowDown") // assume first search result is correct
          await press("Enter")
        } else {
          await press("Enter")
        }
      }

      await page.waitForSelector(`[data-conversation-id]`, { visible: true })
      conversation.id = await page.evaluate(() => {
        const eles = document.getElementsByClassName("conversation")
        const ele = eles.item(0)
        const value = ele?.getAttribute(`data-conversation-id`)
        if (!value) throw new Error(`MIA: conversation ID ${value}`)
        return value
      })

      const note = conversation.note
      if (note) {
        note.conversation = conversation
        const { text, publish } = note
        await click("Add note")
        await input("Note", text)
        if (publish) {
          await publishNote(note)
        }
      }

      await click("Invite")

      await see("Copy link to clipboard")
      await click("Copy")
      // await notice("Copied!")
      const shareURL = await page.evaluate(() => {
        const value = document.getElementById("shareURL")?.getAttribute("value")
        if (!value) throw new Error("MIA: shareURL value")
        return value
      })

      // await click("Close")
      await press("Escape")
      const url = new URL(shareURL)
      const joinPath = url.pathname
      conversation.joinPath = joinPath
      conversation.path = joinPath.replace("/join", "")
      conversation.url = url.href.replace("/join", "")
      conversation.joinURL = shareURL
      return conversation as ConversationSpec
    }

    const signupAndJoinConversationAtPath = async (path: string) => {
      await visit(path)
      // verify signed-out ux
      await seeNavOptions({
        show: [Nav.Home],
        hide: [Nav.Conversations, Nav.Profile],
      })
      await see("Please sign in to participate.")
      await click("Sign in / Sign up")
      await signup()
    }

    const accessConversation = async (
      {
        c,
        show,
        hide,
      }: {
        c: DraftConversationSpec
        show: Nav[]
        hide: Nav[]
      },
      clickOptions?: ClickOptions
    ) => {
      for (const view of show) {
        await click(view, clickOptions)
        await seeConversation(c)
      }
      for (const view of hide) {
        await click(view, clickOptions)
        await notSeeConversation(c)
      }
    }

    const reload = async () => {
      console.debug(`${p.name}: RELOAD`)
      page.reload({ waitUntil: "domcontentloaded" })
    }

    const receivedSMS = async (body: string) => {
      const baseURL = `https://${HOST}`
      const url = `${baseURL}/api/notifications`
      const response = await fetch(url, {
        headers: {
          ["user-agent"]: userAgent,
        },
      })
      const notifications: Notification[] = await response.json()
      const latest = first(notifications)
      expect(latest?.body).toEqual(body)
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
      seeNote,
      seeNotes,
      notSeeNote,
      notSeeNotes,
      verifyFirstConversation,
      createConversation,
      signupAndJoinConversationAtPath,
      accessConversation,
      accessOpp,
      seeNavOptions,
      reload,
      publishNote,
      receivedSMS,
    }
  }

  const checkinSandbox = async () => {
    console.log("CHECKIN SANDBOX")
    return await fetch(sandboxURL, {
      method: "DELETE",
      headers: {
        ["user-agent"]: userAgent,
      },
    })
  }

  const exit = async () => {
    console.log("EXIT")
    return Promise.all([
      //
      ...exits.map((fn) => fn()),
    ]).then((results) =>
      checkinSandbox()
        .then(async (response) => {
          const { status, statusText } = response
          console.info(`CHECKIN: ${status} ${statusText}`)
        })
        .catch((error) => console.error(error))
        .finally(() => console.log("CHECKIN COMPLETE"))
    )
  }

  return {
    customer,
    exit,
  }
}
