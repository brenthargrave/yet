export const t = (key: string): string => {
  const messages: Record<string, string> = {
    "brand-name": `T.B.D.`,
    "landing.disclaimer": `By tapping Create Account or Sign in you agree to never sue me.`,
  }
  return messages[key]
}
