import { PuppeteerLaunchOptions } from "puppeteer"
import {
  Alice,
  Bob,
  Charlie,
  David,
  makeBrowser,
  Nav,
  SelectAttribute,
} from "~/browser"
import { specConv, specNote } from "~/models"

const { BROWSER_SLOWMO } = process.env

it("Digest email", async () => {
  const { customer, exit } = await makeBrowser({ headless: true })

  const debugOpts: PuppeteerLaunchOptions = {
    headless: false,
    devtools: true,
    slowMo: parseInt(BROWSER_SLOWMO ?? "0"),
  }

  const c = await customer(Charlie, {
    // ...debugOpts,
  })

  const b = await customer(Bob, {
    // ...debugOpts,
  })

  const a = await customer(Alice, {
    // ...debugOpts,
  })

  try {
    await a.visit("/")
    await a.click("Create Account")
    await a.signup()

    const aliceWithBob = await a.createConversation({
      conversation: specConv({
        invitees: [Bob],
        note: specNote({ text: "Alice + Bob", publish: true }),
      }),
      isInitial: true,
    })
    await b.signupAndJoinConversationAtPath(aliceWithBob.joinPath)

    for (const p of [a, b]) {
      await p.verifyFirstConversation(aliceWithBob)
    }

    const bobWithCharlie = await b.createConversation({
      conversation: specConv({
        invitees: [Charlie],
        note: specNote({ text: "Bob + Charlie", publish: true }),
      }),
    })
    await c.signupAndJoinConversationAtPath(bobWithCharlie.joinPath)

    // NOTE: A sees B<>C in network feed AND digest email preview
    await a.accessConversation({
      c: bobWithCharlie,
      show: [Nav.Home],
      hide: [Nav.Profile, Nav.Conversations],
    })
    // verify mail digest
    await a.visit("/dev/digest")
    await a.notSeeConversation(aliceWithBob, {
      attribute: SelectAttribute.class,
    })
    await a.seeConversation(bobWithCharlie, {
      attribute: SelectAttribute.class,
    })
    // verify unsubscribe link
    await a.see("Unsubscribe")
    await a.click("Unsubscribe")
    // TODO: opens new tab, blocked by test-only vite CORS issue
    // await a.see("Unsubscribed")
    // TODO: browser-based way to verify unsubscribed? (Perhaps a Settings view)

    // END
  } catch (error) {
    console.error("ERROR!", error)
    await a.screenie()
    await b.screenie()
    await c.screenie()
    throw error
  } finally {
    await exit()
  }
})
