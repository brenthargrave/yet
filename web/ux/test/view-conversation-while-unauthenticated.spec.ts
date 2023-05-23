import { Alice, Bob, Charlie, makeBrowser, Nav } from "~/browser"
import { specConv } from "~/models"

it("View conversation when signed out", async () => {
  const { customer, exit } = await makeBrowser({ headless: true })

  const a = await customer(Alice)
  const b = await customer(Bob)
  const c = await customer(Charlie)
  try {
    await a.visit("/")
    await a.click("Create Account")
    await a.signup()

    // Alice creates a conversation with Bob
    const aliceWithBob = specConv({
      invitees: [Bob],
      note: "WIP",
    })
    const cosignPath = await a.createConversation(aliceWithBob, true)
    // NOTE: verify conversation isn't publicly visible before signed, so skip
    // Bob reciving, signing up and cosigning.

    // Charlie tries to view the conversation
    const conversationPath = cosignPath.replace(/\/sign/, "")
    await c.visit(conversationPath)
    await c.see("Sign in / Sign up")
    await c.seeNavOptions({
      show: [Nav.Home],
      hide: [Nav.Conversations, Nav.Profile, Nav.Opps],
    })
    // TODO: await c.see(`Not found`)
  } catch (error) {
    console.error("ERROR!", error)
    await a.screenie()
    await c.screenie()
    throw error
  } finally {
    await exit()
  }
})
