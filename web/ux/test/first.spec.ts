import { makeBrowser } from "~/browser"

it("Sign up", async () => {
  const { customer, exit } = await makeBrowser()
  const a = await customer("Alice")
  try {
    await a.visit("/")
    await a.click("Create Account")
    await a.see("phone number")
    await a.input("phone number", "9999999998")
    await a.click("Continue")

    await a.type("PIN number", "2222")
    await a.see("name")
    await a.input("name", a.name)
    await a.click("Continue")
    // TODO: drop title/org
    await a.input("org", "Law")
    await a.click("Continue")

    await a.input("role", "Lawyer")
    await a.click("Continue")

    await a.see("Home")
  } catch (error) {
    console.error(error)
    a.screenie()
    throw error
  }

  await exit()
})
