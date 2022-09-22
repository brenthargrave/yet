import { Alice, Bob, Charlie, David, makeBrowser, Nav } from "~/browser"
import { specConv, specOpp } from "~/models"

it("Opp reward payment", async () => {
  const { customer, exit } = await makeBrowser({ headless: true })

  const d = await customer(David)
  const c = await customer(Charlie)
  const b = await customer(Bob)
  const a = await customer(Alice)
  try {
    await a.visit("/")
    await a.click("Create Account")
    await a.signup()

    // Alice creates Opp with award
    await a.click("Opportunities")
    await a.click("Create Opp")
    const opp = specOpp({
      org: "ACME Corporation",
      role: "Demolition Expert",
      url: "https://acme.com/jobs/1",
      reward: "599",
      // desc: "TBD",
    })
    await a.input("Organization", opp.org)
    await a.input("Role", opp.role)
    // await a.input("Description", opp.desc)
    await a.input("Canonical URL", opp.url)
    await a.input("Reward", opp.reward)
    await a.click("Save")
    await a.seeOpp(opp)

    const aliceWithBob = specConv({
      invitees: [Bob],
      note: "WIP",
      mentions: [opp],
    })
    // // TODO: invitees.foreEach input, select if presnt or hit "enter"
    const aliceWithBobPath = await a.createConversation(aliceWithBob, true)
    // NOTE: assume A sends B url...
    await b.signupAndSignConversationAtPath(aliceWithBobPath)
    // TODO: sign if already auth'd/onboard
    await a.see(`${b.name} cosigned!`)

    await Promise.all([
      a.verifyFirstConversation(aliceWithBob, opp),
      b.verifyFirstConversation(aliceWithBob, opp),
    ])

    const bobWithCharlie = specConv({
      invitees: [Charlie],
      note: "Bob w/ Charlie",
      mentions: [opp],
    })
    const bobWithCharliePath = await b.createConversation(bobWithCharlie)
    await c.signupAndSignConversationAtPath(bobWithCharliePath)

    await Promise.all([
      // alice: in tl, but not pf
      a.accessConversation({
        c: bobWithCharlie,
        show: [Nav.Home],
        hide: [Nav.Profile, Nav.Conversations],
      }),
      // bob & charlie: in their pf, but not in their tls
      ...[b, c].map((p) =>
        p.accessConversation({
          c: bobWithCharlie,
          show: [Nav.Profile, Nav.Conversations],
          hide: [Nav.Home],
        })
      ),
    ])
    // all should see the opp
    await Promise.all([...[a, b, c].map((p) => p.accessOpp(opp))])

    const charlieWithDavid = specConv({
      invitees: [David],
      note: "Charlie / David",
      mentions: [opp],
    })
    const charlieWithDavidPath = await c.createConversation(charlieWithDavid)
    await d.signupAndSignConversationAtPath(charlieWithDavidPath)
    await Promise.all([
      ...[c, d].map((p) =>
        p.accessConversation({
          c: charlieWithDavid,
          show: [Nav.Profile, Nav.Conversations],
          hide: [Nav.Home],
        })
      ),
      ...[b, a].map((p) =>
        p.accessConversation({
          c: charlieWithDavid,
          show: [Nav.Home],
          hide: [Nav.Profile, Nav.Conversations],
        })
      ),
    ])
    await Promise.all([a, b, c, d].map((p) => p.accessOpp(opp)))

    // Payments
    await a.click("Opportunities")
    await a.see("Your Opportunities")
    await a.seeOpp(opp)
    // await a.click("Pay Reward")
    // TODO:
    // (Alice hires David, rewards Charlie for referral)
    // ! others shouldn't see reward button
    // await Promise.all([
    //   ...[b,c,d].map(p => p.?)
    // ])

    // Alice clicks Opp
    // Alice clicks Pay Reward
    // Alice sees modal w/ David, Charlie, Bob in list, nested list of their convs
    // Alice clicks Charlie > pay
    // Alice (pays with Stripe?)
    // ? timeline updates?
    // A, C: profiles, not tls
    // B, D: tls, not profiles
    // all: inspect grapevine between them and recipient
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
