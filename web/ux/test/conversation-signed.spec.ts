import { Alice, Bob, Charlie, David, makeBrowser, Nav } from "~/browser"
import { specConv } from "~/models"

it("Conversation shared and cosigned", async () => {
  const { customer, exit } = await makeBrowser({ headless: true })

  const d = await customer(David)
  // const d = await customer(David, { headless: false, devtools: true })
  const c = await customer(Charlie)
  const b = await customer(Bob)
  const a = await customer(Alice)
  // const a = await customer(Alice, { headless: false, devtools: true })
  try {
    await a.visit("/")
    await a.click("Create Account")
    await a.signup()

    const aliceWithBob = specConv({
      invitees: [Bob],
      note: "Alice w/ Bob",
    })
    const aliceWithBobPath = await a.createConversation(aliceWithBob, true)

    // TODO: verify draft visiblity
    // console.log("\nVerify draft-only visibility")
    // // await a.visit("/c")
    // // await a.reload()
    // await a.click("Back")
    // await a.seeConversation(aliceWithBob)
    // await a.accessConversation({
    //   c: aliceWithBob,
    //   show: [Nav.Conversations],
    //   hide: [Nav.Home, Nav.Profile],
    // })

    console.log("\nVerify signed visibility")
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

    for (const p of [b, c]) {
      await p.accessConversation({
        c: bobWithCharlie,
        show: [Nav.Profile, Nav.Conversations],
        hide: [Nav.Home],
      })
    }
    await a.accessConversation({
      c: bobWithCharlie,
      show: [Nav.Home],
      hide: [Nav.Profile, Nav.Conversations],
    })
    // pre-signup convos
    await c.accessConversation({
      c: aliceWithBob,
      show: [Nav.Home],
      hide: [Nav.Profile, Nav.Conversations],
    })

    const charlieWithDavid = specConv({
      invitees: [David],
      note: "Charlie / David",
    })
    const charlieWithDavidPath = await c.createConversation(charlieWithDavid)
    await d.signupAndSignConversationAtPath(charlieWithDavidPath)

    for (const p of [c, d]) {
      await p.accessConversation({
        c: charlieWithDavid,
        show: [Nav.Profile, Nav.Conversations],
        hide: [Nav.Home],
      })
    }
    await a.accessConversation({
      c: charlieWithDavid,
      show: [],
      hide: [Nav.Home, Nav.Profile, Nav.Conversations],
    })
    await b.reload() // TODO: fails w/o a reload, but ONLY for Bob, only here. (!?)
    await b.accessConversation({
      c: charlieWithDavid,
      show: [Nav.Home],
      hide: [Nav.Profile, Nav.Conversations],
    })

    // pre-signup conversations
    await d.accessConversation({
      c: aliceWithBob,
      show: [],
      hide: [Nav.Home, Nav.Conversations, Nav.Profile],
    })
    await d.accessConversation({
      c: bobWithCharlie,
      show: [Nav.Home],
      hide: [Nav.Conversations, Nav.Profile],
    })

    console.log(`\nVerify drafts unexposed to network`)

    const aliceWithCharlie = specConv({
      invitees: [Charlie],
      note: "Alice w/ Charlie",
    })
    const _path = await a.createConversation(aliceWithCharlie)

    // TODO: verify draft visiblity
    // console.log("\nVerify draft-only visibility")
    // await a.visit("/c")
    // await a.reload()
    // await a.accessConversation({
    //   c: aliceWithCharlie,
    //   show: [Nav.Conversations],
    //   hide: [Nav.Home, Nav.Profile],
    // })
    // await c.accessConversation({
    //   c: aliceWithCharlie,
    //   show: [Nav.Conversations],
    //   hide: [Nav.Home, Nav.Profile],
    // })
    // await b.accessConversation({
    //   c: aliceWithCharlie,
    //   show: [],
    //   hide: [Nav.Home, Nav.Profile, Nav.Conversations],
    // })
    // await d.accessConversation({
    //   c: aliceWithCharlie,
    //   show: [],
    //   hide: [Nav.Home, Nav.Profile, Nav.Conversations],
    // })

    //
  } catch (error) {
    console.error("ERROR!", error)
    await a.screenie()
    await b.screenie()
    await c.screenie()
    await d.screenie()
    throw error
  } finally {
    await exit()
  }
})
