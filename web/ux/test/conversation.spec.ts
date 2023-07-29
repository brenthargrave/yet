import { PuppeteerLaunchOptions } from "puppeteer"
import { Alice, Bob, Charlie, David, makeBrowser, Nav } from "~/browser"
import { specConv, specNote } from "~/models"

const { BROWSER_SLOWMO } = process.env

it("Conversation shared and joined", async () => {
  const { customer, exit } = await makeBrowser({ headless: true })
  const debugOpts: PuppeteerLaunchOptions = {
    headless: false,
    devtools: true,
    slowMo: parseInt(BROWSER_SLOWMO ?? "0"),
  }

  const d = await customer(David)

  const c = await customer(Charlie, {
    // ...debugOpts,
  })

  const b = await customer(Bob, {
    // ...debugOpts,
  })

  const a = await customer(Alice, {
    // ...debugOpts,
  })

  try {
    await a.visit("/")
    await a.click("Create Account")
    await a.signup()

    const note = specNote({ text: "Alice + Bob", publish: false })
    const aliceWithBob = await a.createConversation({
      conversation: specConv({
        invitees: [Bob],
        note: note,
      }),
      isInitial: true,
    })
    await b.signupAndJoinConversationAtPath(aliceWithBob.joinPath)
    await b.notSeeNotes(aliceWithBob)
    await a.see(`${b.name} joined the conversation`)
    await a.receivedSMS(
      `${b.name} joined your conversation ${aliceWithBob.url}`
    )
    // until a note is published, its conversation should not appear in TLs.
    await Promise.all([
      b.verifyFirstConversation(aliceWithBob),
      // TODO: a.accessConversation mirroring B's
      // requires direct nav back to note's conv URL, fixing test-env CORS bug
    ])
    // A. posts draft note, B. sees it + notice
    await a.publishNote(note)
    await a.seeNote(note)
    await b.seeNote(note)
    const aliceAddedNoteNotice = `${a.name} just added a note`
    await a.notSee(aliceAddedNoteNotice) // bug: notice appeared to both A & B
    await b.receivedSMS(`${aliceAddedNoteNotice}: ${aliceWithBob.url}`)
    await b.see(aliceAddedNoteNotice)
    // once note published, conversation should appear in own profile TL
    await Promise.all(
      [a, b].flatMap((p) =>
        p.accessConversation({
          c: aliceWithBob,
          show: [Nav.Conversations, Nav.Profile],
          hide: [Nav.Home],
        })
      )
    )

    const bobWithCharlie = await b.createConversation({
      conversation: specConv({
        invitees: [Charlie, Alice],
        note: specNote({ text: "Bob + Charlie", publish: true }),
      }),
    })
    // NOTE: registered users should recieve SMS
    await a.receivedSMS(
      `${b.name} invited you to a conversation: ${bobWithCharlie.joinURL}`
    )
    await c.signupAndJoinConversationAtPath(bobWithCharlie.joinPath)
    await c.seeNotes(bobWithCharlie)
    await b.see(`${c.name} joined the conversation`)
    await Promise.all(
      [b, c].flatMap((p) =>
        p.accessConversation({
          c: bobWithCharlie,
          show: [Nav.Profile, Nav.Conversations],
          hide: [Nav.Home],
        })
      )
    )
    // extended network access
    await c.accessConversation({
      c: aliceWithBob,
      show: [Nav.Home],
      hide: [Nav.Profile, Nav.Conversations],
    })
    await a.accessConversation({
      c: bobWithCharlie,
      show: [Nav.Home],
      hide: [Nav.Profile, Nav.Conversations],
    })

    const charlieWithDavid = await c.createConversation({
      conversation: specConv({
        invitees: [David],
        note: specNote({ text: "Charlie + David", publish: true }),
      }),
    })
    await d.signupAndJoinConversationAtPath(charlieWithDavid.joinPath)
    await Promise.all(
      [c, d].flatMap((p) =>
        p.accessConversation({
          c: charlieWithDavid,
          show: [Nav.Profile, Nav.Conversations],
          hide: [Nav.Home],
        })
      )
    )
    await a.accessConversation({
      c: charlieWithDavid,
      show: [],
      hide: [Nav.Home, Nav.Profile, Nav.Conversations],
    })
    await b.accessConversation({
      c: charlieWithDavid,
      show: [Nav.Home],
      hide: [Nav.Profile, Nav.Conversations],
    })
    await d.accessConversation({
      c: aliceWithBob,
      show: [],
      hide: [Nav.Home, Nav.Conversations, Nav.Profile],
    })
    await d.accessConversation({
      c: bobWithCharlie,
      show: [Nav.Home],
      hide: [Nav.Conversations, Nav.Profile],
    })

    console.log(`\nVerify drafts unexposed`)
    // NOTE: should remain draft unless/until "Invite" or "Share" clicked
    const aliceDraft = await a.createConversation({
      conversation: specConv({
        invitees: [Bob],
        note: specNote({ text: "draft", publish: false }),
      }),
    })
    await Promise.all([
      ...[b, c, d].flatMap((p) =>
        p.accessConversation({
          c: aliceDraft,
          show: [],
          hide: [Nav.Home, Nav.Conversations, Nav.Profile],
        })
      ),
    ])
    // TODO: A's browser freezes; reload fails on vite CORS error
    /*
    await a.visit("/c")
    await a.accessConversation(
      {
        c: aliceDraft,
        show: [Nav.Conversations],
        hide: [Nav.Home, Nav.Profile],
      },
      { delay: 1000 }
    )
    */
  } catch (error) {
    console.error("ERROR!", error)
    await a.screenie()
    await b.screenie()
    await c.screenie()
    await d.screenie()
    throw error
  } finally {
    await exit()
  }
})
