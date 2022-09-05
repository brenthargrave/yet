import { makeBrowser  } from "~/browser";

it("first touch", async () => {
  const { close, visit, see, tap, page } = await makeBrowser()
  await visit("/")
  await tap("Create Account")
  await see("phone number")
  return close()
})
