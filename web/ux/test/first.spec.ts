import { Alice, Bob, makeBrowser } from "~/browser"

it("Opp reward payment", async () => {
  const { customer, exit } = await makeBrowser()
  const a = await customer(Alice, false)
  const b = await customer(Bob, false)
  try {
    await a.signup()
    // Alice creates Opp with award

    await a.click("Opportunities")
    await a.click("Create Opp")
    // await opp = a.createOpp(attrs) // root vs. nested?
    const opp = {
      org: "ACME Corporation",
      role: "Demolition Expert",
      desc: "TBD",
      url: "https://acme.com/jobs/1",
      reward: "599",
    }
    await a.input("Organization", opp.org)
    await a.input("Role", opp.role)
    await a.input("Description", opp.desc)
    await a.input("Canonical URL", opp.url)
    await a.input("Reward", opp.reward)
    await a.click("Save")
    await a.seeOpp(opp)

    await a.click("Conversations")
    await a.see("Welcome!")
    await a.click("Note a conversation")
    await a.input("Who", b.name)
    await a.press("Enter")
    await a.input("Note", "WIP")
    await a.click("Mention Opp")
    await a.seeOpp(opp)

    // TODO:
    // Alice creates conversation w/ Bob, mentoining Opp
    // Bob cosigns
    // ? verify timeline updates?
    //
    // Bob creates converastion w/ Charlie, mentions Opp
    // Charlie cosigns
    // ? timeline updates?

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
    throw error
  }
  await exit()
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
