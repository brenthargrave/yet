import { checkinSandbox, checkoutSandbox, makeBrowser } from "~/browser"
import { Alice, Bob } from "~/browser"

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

it("Opp reward payment", async () => {
  const { customer, exit } = await makeBrowser()
  const a = await customer(Alice, false)
  try {
    await a.signup()
    // Alice creates Opp with award
    await a.click("Opportunities")
    await a.click("Create Opp")
    await a.input("Organization", "ACME Corporation")
    await a.input("Role", "Demolition Expert")
    await a.input("Description", "TBD")
    await a.input("Canonical URL", "https://acme.com/jobs/1")
    await a.input("Reward", "599")
    await a.click("Save")
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
