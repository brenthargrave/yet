import { ap, join, pipe, pipeK, split, take } from "ramda"
import { Alice, Bob, makeBrowser } from "~/browser"
import { specConv, specOpp } from "~/models"
import { extractULIDs } from "~/ulid"
import { first } from "remeda"

it("Opp reward payment", async () => {
  const { customer, exit } = await makeBrowser(false)
  const b = await customer(Bob)
  const a = await customer(Alice)
  try {
    await a.visit("/")
    await a.click("Create Account")
    await a.signup()
    // Alice creates Opp with award
    await a.click("Opportunities")
    await a.click("Create Opp")
    const opp = specOpp({
      org: "ACME Corporation",
      role: "Demolition Expert",
      desc: "TBD",
      url: "https://acme.com/jobs/1",
      reward: "599",
    })
    await a.input("Organization", opp.org)
    await a.input("Role", opp.role)
    await a.input("Description", opp.desc)
    await a.input("Canonical URL", opp.url)
    await a.input("Reward", opp.reward)
    await a.click("Save")
    await a.seeOpp(opp)

    await a.click("Conversations")
    await a.see("Welcome!")
    await a.click("Note a conversation")
    const aliceWithBob = specConv({
      invitees: [Bob],
      note: "WIP",
      mentions: [opp],
    })
    // TODO: invitees.foreEach input, select if presnt or hit "enter"
    await a.input("Who", Bob.name)
    await a.press("Enter")
    await a.input("Note", aliceWithBob.note)
    await a.click("Mention Opp")
    // TODO: opps.each seeOpp, addOpp
    await a.seeOpp(opp)
    await a.addOpp(opp)
    await a.click("Publish", { clickCount: 2, delay: 900 })
    await a.see("Copy share link to clipboard")
    await a.click("Copy")
    await a.notice("Copied!")
    const shareURL = await a.page.evaluate(() => {
      const value = document.getElementById("shareURL")?.getAttribute("value")
      if (!value) throw new Error("MIA: shareURL value")
      return value
    })
    const path = new URL(shareURL).pathname
    const ulids = extractULIDs(path)
    const cid = first(ulids)
    aliceWithBob.id = cid
    // NOTE: assume A sends B url...
    await b.visit(path)
    await b.see("Please sign in to review them.")
    await b.click("Sign in / Sign up")
    await b.signup()
    await b.click("Cosign")

    await a.see(`${b.name} cosigned!`)

    await a.seeConversationProfile(aliceWithBob)
    await a.click("Opportunities")
    await a.see("Your Opportunities")
    await a.seeOpp(opp)
    await a.click("Home")
    await a.see(`No network activity just yet.`)
    await a.notSeeConversation(aliceWithBob)
    await a.click("Conversations")
    await a.see("Your Conversations")
    await a.seeConversation(aliceWithBob)
    await a.click("Profile")
    await a.see("Your Profile")
    await a.seeConversation(aliceWithBob)

    // consolidate w/ promise.all
    await b.seeConversationProfile(aliceWithBob)
    await b.click("Opportunities")
    await b.see("Your Opportunities")
    await b.seeOpp(opp)
    await b.click("Home")
    await b.see(`No network activity just yet.`)
    await b.notSeeConversation(aliceWithBob)
    await b.click("Conversations")
    await b.see("Your Conversations")
    await b.seeConversation(aliceWithBob)
    await b.click("Profile")
    await b.see("Your Profile")
    // TODO: might I have a race-condition?
    await b.seeConversation(aliceWithBob)

    // Bob creates converastion w/ Charlie, mentions Opp
    // Charlie cosigns
    // ? timeline updates?

    // Charlie note w/ David, mentions Opp
    // David cosigns
    // (Alice hires David...)
    // Alice clicks Opp
    // Alice clicks Pay Reward
    // Alice sees modal w/ David, Charlie, Bob in list, nested list of their convs
    // Alice clicks Charlie > pay
    // Alice (pays with Stripe?)
    // ? timeline updates?
  } catch (error) {
    console.error("ERROR!", error)
    await a.screenie()
    await b.screenie()
    throw error
  } finally {
    await exit()
  }
})

// TODO: can only run one test at a time for now.
// it("Sign up", async () => {
//   const { customer, exit } = await makeBrowser()
//   const a = await customer(Alice, false)
//   const b = await customer(Bob, false)
//   try {
//     await a.signup()
//     // NOTE: continue verifying mult-user until feature impl.
//     await b.visit("/")
//     await b.see("Create Account")
//   } catch (error) {
//     console.error(error)
//     a.screenie()
//     throw error
//   }
//   await exit()
// })
