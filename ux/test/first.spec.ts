import { makeBrowser  } from "~/browser";

it("first touch", async () => {
  const { close, visit, see, tap } = await makeBrowser()

  await visit("/")
  // await see("Lemon.")
  // await tap("Sign in") // TODO: use pitch CTA instead

})
