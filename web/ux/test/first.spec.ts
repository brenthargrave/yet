import { makeBrowser, Alice, Bob } from "~/browser"

it("Sign up", async () => {
  const { customer, exit } = await makeBrowser()
  const a = await customer(Alice)
  const b = await customer(Bob)
  try {
    await a.signup()

    // NOTE: continue verifying mult-user until feature impl.
    await b.visit("/")
    await b.see("Create Account")
  } catch (error) {
    console.error(error)
    a.screenie()
    throw error
  }
  await exit()
})

it("Opp reward payment", async () => {
  const { customer, exit } = await makeBrowser()
  const a = await customer(Alice)
  try {
    await a.signup()
    await a.click("Conversations")
    // TODO
    // Alice create Opp with award
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
    console.error(error)
    a.screenie()
    throw error
  }
  await exit()
})
