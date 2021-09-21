// TODO: typesafe selection
export const t = (key: string): string => {
  const shared = {
    continue: `Continue`,
  }
  const messages: Record<string, string> = {
    "brand-name": `T.B.D.`,
    "landing.disclaimer": `By tapping Create Account or Sign in you agree to never sue me.`,
    "landing.join": `Create Account`,
    "landing.login": `Sign in`,
    "auth.tel.entry.cta": `My phone number is`,
    "auth.tel.entry.placeholder": "123-456-7890",
    "auth.tel.entry.submit": shared.continue,
  }
  return messages[key]
}
