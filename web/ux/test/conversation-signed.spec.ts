import { Alice, Bob, Charlie, David, makeBrowser, Nav } from "~/browser"
import { specConv } from "~/models"

it.only("Conversation shared and cosigned", async () => {
  const { customer, exit } = await makeBrowser({ headless: true })

  const d = await customer(David)
  const c = await customer(Charlie)
  const b = await customer(Bob)
  const a = await customer(Alice)
  try {
    await a.visit("/")
    await a.click("Create Account")
    await a.signup()

    const aliceWithBob = specConv({
      invitees: [Bob],
      note: "WIP",
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

    // await Promise.all([
    //   // alice: in tl, but not pf
    //   a.accessConversation({
    //     c: bobWithCharlie,
    //     show: [Nav.Home],
    //     hide: [Nav.Profile, Nav.Conversations],
    //   }),
    //   // bob & charlie: in their pf, but not in their tls
    //   ...[b, c].map((p) =>
    //     p.accessConversation({
    //       c: bobWithCharlie,
    //       show: [Nav.Profile, Nav.Conversations],
    //       hide: [Nav.Home],
    //     })
    //   ),
    // ])

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

    // await Promise.all([
    //   ...[c, d].map((p) =>
    //     p.accessConversation({
    //       c: charlieWithDavid,
    //       show: [Nav.Profile, Nav.Conversations],
    //       hide: [Nav.Home],
    //     })
    //   ),
    //   ...[b, a].map((p) =>
    //     p.accessConversation({
    //       c: charlieWithDavid,
    //       show: [Nav.Home],
    //       hide: [Nav.Profile, Nav.Conversations],
    //     })
    //   ),
    // ])

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
