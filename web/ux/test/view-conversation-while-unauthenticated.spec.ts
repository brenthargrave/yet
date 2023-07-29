import { Alice, Bob, Charlie, makeBrowser, Nav } from "~/browser"
import { specConv, specNote } from "~/models"

it.skip("View conversation when signed out", async () => {
  const { customer, exit } = await makeBrowser({ headless: true })

  const a = await customer(Alice)
  const b = await customer(Bob)
  const c = await customer(Charlie)
  try {
    await a.visit("/")
    await a.click("Create Account")
    await a.signup()

    const aliceWithBob = await a.createConversation({
      conversation: specConv({
        invitees: [Bob],
        note: specNote({ text: "Alice + Bob", publish: true }),
      }),
      isInitial: true,
    })
    await b.signupAndJoinConversationAtPath(aliceWithBob.joinPath)

    // NOTE: to verify conversation isn't publicly visible before joined, skip
    // Bob receiving, signing up and cosigning.

    // Charlie tries to view the conversation
    const conversationPath = aliceWithBob.path
    await c.visit(conversationPath)
    await c.see("Sign in / Sign up")
    await c.seeNavOptions({
      show: [Nav.Home],
      hide: [Nav.Conversations, Nav.Profile, Nav.Opps],
    })
    // TODO: await c.see(`Not found`)

    //
  } catch (error) {
    console.error("ERROR!", error)
    await a.screenie()
    await c.screenie()
    throw error
  } finally {
    await exit()
  }
})
