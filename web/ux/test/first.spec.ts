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
