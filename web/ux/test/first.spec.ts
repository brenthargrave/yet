import { Alice, Bob, Charlie, makeBrowser } from "~/browser"
import { specConv, specOpp } from "~/models"

it("Opp reward payment", async () => {
  const { customer, exit } = await makeBrowser({ headless: true })

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
      desc: "TBD",
      url: "https://acme.com/jobs/1",
      reward: "599",
    })
    await a.input("Organization", opp.org)
    await a.input("Role", opp.role)
    await a.input("Description", opp.desc)
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
    // TODO: verify signing if already onboard
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

    // TODO:
    // ? what's different timeline/profile
    // bob & charlie should see in their profiles, but not in their timliens
    // alice should see in her timleine, but not in her profile
    // all should see the opp

    // Charlie note w/ David, mentions Opp
    // David cosigns
    // (Alice hires David...)
    // Alice clicks Opp
    // Alice clicks Pay Reward
    // Alice sees modal w/ David, Charlie, Bob in list, nested list of their convs
    // Alice clicks Charlie > pay
    // Alice (pays with Stripe?)
    // ? timeline updates?
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

// TODO: can only run one test at a time for now.
// it("Sign up", async () => {
//   const { customer, exit } = await makeBrowser()
//   const a = await customer(Alice, false)
//   const b = await customer(Bob, false)
//   try {
//     await a.signup()
//     // NOTE: continue verifying mult-user until feature impl.
//     await b.visit("/")
//     await b.see("Create Account")
//   } catch (error) {
//     console.error(error)
//     a.screenie()
//     throw error
//   }
//   await exit()
// })
