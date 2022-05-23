import { phone as validatePhone } from "phone"
import { share } from "rxjs"

const shared = {
  continue: `Continue`,
  empty: "",
}

const messages: Record<string, string> = {
  "brand-name": `T.B.D.`,
  "landing.disclaimer": `By tapping Create Account or Sign in you agree to never sue me.`,
  "landing.join": `Create Account`,
  "landing.login": `Sign in`,
  "auth.tel.entry.cta": `My phone number is`,
  "auth.tel.entry.placeholder": "(123) 456-7890",
  "auth.tel.entry.submit": shared.continue,
  "auth.tel.verify.head": `We sent you a code.`,
  "auth.tel.verify.cta": `Enter it below to verify $PHONE`,
  "default.error.title": "Oops, a bug!",
  "default.error.description": "We've been notified and will fix it ASAP.",
  "onboarding.name.headingCopy": "What's your name?",
  "onboarding.name.inputPlaceholer": shared.empty,
  "onboarding.name.submitButtonCopy": shared.continue,
  "onboarding.org.headingCopy": "Where do you work or study?",
  "onboarding.org.inputPlaceholer": shared.empty,
  "onboarding.org.submitButtonCopy": shared.continue,
  "onboarding.role.headingCopy": "What is your title or role there?",
  "onboarding.role.inputPlaceholer": shared.empty,
  "onboarding.role.submitButtonCopy": shared.continue,
}

// TODO: typesafe selection
export const t = (key: string): string => messages[key]
export const formatPhone = (e164: string): string => {
  const { isValid } = validatePhone(e164)
  return isValid
    ? `(${e164.slice(2, 5)}) ${e164.slice(5, 8)}-${e164.slice(8, 12)}`
    : ""
}
