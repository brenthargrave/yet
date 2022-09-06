import { makeBrowser } from "~/browser"

it("first touch", async () => {
  const { customer, exit } = await makeBrowser()
  const a = await customer("alice")
  await a.visit("/")
  await a.click("Create Account")
  await a.see("phone number")

  const b = await customer("bob")
  await b.visit("/")
  await b.see("Yet")

  await exit()
})
