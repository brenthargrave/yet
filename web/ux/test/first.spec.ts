import { makeBrowser, Alice, Bob } from "~/browser"

it("Sign up", async () => {
  const { customer, exit } = await makeBrowser()
  const a = await customer(Alice)
  const b = await customer(Bob)
  try {
    // auth
    await a.visit("/")
    await a.click("Create Account")
    await a.see("phone number")
    await a.input("phone number", a.phone)
    await a.click("Continue")
    // onboarding
    await a.type("PIN number", "2222")
    await a.see("name")
    await a.input("name", a.name)
    await a.click("Continue")
    await a.input("email", a.email)
    await a.click("Continue")
    await a.see("Home")

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
