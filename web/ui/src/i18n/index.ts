import { format, parse, getYear } from "date-fns"
import { phone as validatePhone } from "phone"
import "@formatjs/intl-listformat/polyfill"
import "@formatjs/intl-listformat/locale-data/en" // locale-data for en
import { Money } from "~/graph"

const shared = {
  continue: `Continue`,
  empty: "",
}

const entryElement = document.getElementById("index")
export const productName = entryElement?.dataset.product || "TBD"

const messages: Record<string, string> = {
  "app.footer.copyright": "© 2022 Hargrave & Co.",
  "app.auth": "Sign in / Sign up",
  "landing.join": `Create Account`,
  "landing.login": `Sign in`,
  "auth.tel.entry.cta": `My phone number is`,
  "auth.tel.entry.placeholder": "(123) 456-7890",
  "auth.tel.entry.submit": shared.continue,
  "auth.tel.verify.head": `We sent you a code.`,
  "auth.tel.verify.cta": `Enter it below to verify $PHONE`,
  "default.error.title": "Oops, a bug!",
  "default.error.description": "We've been notified and will fix it ASAP.",

  "onboarding.first_name.headingCopy": "What's your first name?",
  "onboarding.first_name.inputPlaceholer": shared.empty,
  "onboarding.first_name.submitButtonCopy": shared.continue,

  "onboarding.last_name.headingCopy": "What's your last name?",
  "onboarding.last_name.inputPlaceholer": shared.empty,
  "onboarding.last_name.submitButtonCopy": shared.continue,

  "onboarding.email.headingCopy": "What's your email?",
  "onboarding.email.inputPlaceholer": shared.empty,
  "onboarding.email.submitButtonCopy": shared.continue,

  "onboarding.org.headingCopy": "Where do you work or study?",
  "onboarding.org.inputPlaceholer": shared.empty,
  "onboarding.org.submitButtonCopy": shared.continue,

  "onboarding.role.headingCopy": "What is your title or role there?",
  "onboarding.role.inputPlaceholer": shared.empty,
  "onboarding.role.submitButtonCopy": shared.continue,

  "note.draft.placeholder": [
    `To share a useful note, consider:`,
    `What are they working on, and how can others help?`,
    `Who should they meet?`,
    `What did you learn?`,
    `Include links to people, orgs and opps.`,
  ].join("\n\n"),

  "note.empty.buttonCopy": "Note a conversation",
  "note.empty.cta": `To get started, take some notes on a recent conversation you had with someone.`,
  "conversations.sign.once-signed": `Once cosigned they become visible to your combined networks, and you'll get attribution for any mentioned opportunities, leads, etc.`,
  "unsubscribe.unsubscribed": "Unsubscribed!",
  "unsubscribe.home": "Back to Home",

  "oauth.success.message": "Welcome aboard!",
  "oauth.error.message": "Authorization failed",

  "profles.show.me.heading": "Your Profile",
  "profles.show.other.heading": "Profile",
}

export const t = (key: string): string => messages[key]

export const formatPhone = (e164: string): string => {
  const { isValid } = validatePhone(e164)
  return isValid
    ? `(${e164.slice(2, 5)}) ${e164.slice(5, 8)}-${e164.slice(8, 12)}`
    : ""
}

export const formatDateInput = (date: Date) => format(date, "YYYY-MM-DD")

export const parseDateInput = (value: string) => parse(value)

const today = new Date()
const currentYear = getYear(today)
export const localizeDate = (date: Date) => {
  return getYear(date) < currentYear
    ? format(date, "M/DD/YY")
    : format(date, "MMMM Do")
}

// NOTE: assumes polyfill imports above work
// https://formatjs.io/docs/polyfills/intl-listformat/
// @ts-ignore
const lf = new Intl.ListFormat("en", {
  localeMatcher: "best fit", // other values: "lookup"
  type: "conjunction", // "conjunction", "disjunction" or "unit"
  style: "long", // other values: "short" or "narrow"
})
export const toSentence = (arr: string[]) => lf.format(arr)

export const formatMoney = (money: Money, locale = "en-US"): string =>
  new Intl.NumberFormat(locale, {
    style: "currency",
    currency: money.currency.toString(),
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(money.amount)
