import { ID, MakeOptional } from "~/graph"
import { Persona } from "./personas"

// Opp
//

export interface OppSpec {
  id?: string
  org: string
  role: string
  desc?: string
  url?: string
  reward?: string
}

export const specOpp = (opp: OppSpec): OppSpec => opp

export const oppAriaLabel = (opp: OppSpec) => `${opp.role} @ ${opp.org}`

// Note
//

export interface DraftNoteSpec {
  id?: ID
  conversation?: DraftConversationSpec
  text: string
  publish?: boolean
}

export const specNote = ({
  text,
  publish = true,
}: {
  text: string
  publish?: boolean
}): DraftNoteSpec => {
  return {
    text,
    publish,
  }
}

// Conversation
//

export interface ConversationSpec {
  invitees?: Persona[]
  note?: DraftNoteSpec
  // mentions?: OppSpec[]
  id: ID
  path: string
  url: string
  joinPath: string
  joinURL: string
}

export type DraftConversationSpec = MakeOptional<
  ConversationSpec,
  "id" | "url" | "path" | "joinPath" | "joinURL"
>

export const specConv = (c: DraftConversationSpec) => c

// Notifications
//
export interface Notification {
  body?: string | undefined | null
}
