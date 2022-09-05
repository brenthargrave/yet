import { makeBrowser } from "~/browser"

it("first touch", async () => {
  const { customer } = await makeBrowser()
  const a = await customer("alice")
  await a.visit("/")
  await a.click("Create Account")
  await a.see("phone number")
  return await a.close()
})
