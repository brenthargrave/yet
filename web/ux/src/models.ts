export interface Opp {
  org: string
  role: string
  desc?: string
  url?: string
  reward?: string
}

export const oppAriaLabel = (opp: Opp) => `${opp.role} @ ${opp.org}`
