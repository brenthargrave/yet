import { Alice, Bob, Charlie, David, makeBrowser, Nav } from "~/browser"
import { specConv } from "~/models"

it("Digest email", async () => {
  const { customer, exit } = await makeBrowser({ headless: true })

  const c = await customer(Charlie)
  const b = await customer(Bob)
  // const a = await customer(Alice, { headless: false, devtools: true })
  const a = await customer(Alice)
  try {
    await a.visit("/")
    await a.click("Create Account")
    await a.signup()

    const aliceWithBob = specConv({
      invitees: [Bob],
      note: "Alice w/ Bob",
    })

    const aliceWithBobPath = await a.createConversation(aliceWithBob, true)

    // NOTE: assume A sends B url...
    await b.signupAndSignConversationAtPath(aliceWithBobPath)
    await a.see(`${b.name} cosigned!`)

    await Promise.all([
      a.verifyFirstConversation(aliceWithBob),
      b.verifyFirstConversation(aliceWithBob),
    ])

    const bobWithCharlie = specConv({
      invitees: [Charlie],
      note: "Bob w/ Charlie",
    })
    const bobWithCharliePath = await b.createConversation(bobWithCharlie)
    await c.signupAndSignConversationAtPath(bobWithCharliePath)

    // NOTE: A sees B<>C in network feed AND digest email preview
    await a.accessConversation({
      c: bobWithCharlie,
      show: [Nav.Home],
      hide: [Nav.Profile, Nav.Conversations],
    })
    // verify mail digest
    await a.visit("/dev/digest")
    await a.notSeeConversation(aliceWithBob, { mjml: true })
    await a.seeConversation(bobWithCharlie, { mjml: true })
    // verify unsubscribe link
    await a.see("Unsubscribe")
    await a.click("Unsubscribe")
    // NOTE: for some reason, clicking link that opens new tab loses auth,
    // eg, page takes forever to load (strange) and sees landing page, not Home
    // await new Promise((r) => setTimeout(r, 20000))
    // await a.see("Yet")
    await a.see("Unsubscribed")
    // TODO: browser-based way to verify unsubscribed? (Perhaps a Settings view)

    // pre-signup convos
    await c.accessConversation({
      c: aliceWithBob,
      show: [Nav.Home],
      hide: [Nav.Profile, Nav.Conversations],
    })

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
