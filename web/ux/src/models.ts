import { Persona } from "./personas"

export interface OppSpec {
  org: string
  role: string
  desc?: string
  url?: string
  reward?: string
}

export const specOpp = (opp: OppSpec): OppSpec => opp

export const oppAriaLabel = (opp: OppSpec) => `${opp.role} @ ${opp.org}`

export interface ConversationSpec {
  invitees?: Persona[]
  note?: string
  mentions?: OppSpec[]
}
