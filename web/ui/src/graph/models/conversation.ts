import { capitalCase } from "change-case"
import { match } from "ts-pattern"
import { ulid } from "ulid"
import {
  any,
  descend,
  eqBy,
  head,
  includes,
  isEmpty,
  isNotEmpty,
  prop,
  symmetricDifferenceWith,
} from "~/fp"
import { routes } from "~/router"
import { Conversation, Customer, Invitee, MakeOptional } from ".."
import { ConversationStatus, Participation } from "../generated"

export type DraftConversation = MakeOptional<
  Conversation,
  // Opps
  | "status" // | "mentions"
  | "creator"
  | "notes"
  | "opps"
  | "participations"
>

type Note = string | null | undefined

export const isValidNote = (note: Note) => isNotEmpty(note)

export const isValidInviteeSet = (invitees: Invitee[]) => isNotEmpty(invitees)

export const isValidConversation = ({ invitees }: DraftConversation) =>
  // isValidNote(note) || isValidInviteeSet(invitees)
  isValidInviteeSet(invitees)

// NOTE: used to prevent deletion once circulated for cosign
export const hasBeenShared = (c: DraftConversation) =>
  c.status !== ConversationStatus.Draft

export const inviteesDiffer = (current: Invitee[], old: Invitee[]): boolean =>
  isEmpty(
    // @ts-ignore
    symmetricDifferenceWith(eqBy<Invitee>(prop<Invitee>("id")), old, current)
  )

export const newConversation = (): DraftConversation => ({
  id: ulid(),
  invitees: [],
  notes: [],
  status: ConversationStatus.Draft,
  occurredAt: new Date(),
})

export const isParticipantIn = (
  conversation: Conversation,
  customer: Customer | null
) => {
  if (!customer) return false
  return any(
    ({ participant }) => customer.id === participant.id,
    conversation.participations
  )
}

export const isParticipant = (
  conversation: Conversation,
  customer: Customer | null
) => {
  if (!customer) return false
  return any(
    ({ participant }) => customer.id === participant.id,
    conversation.participations
  )
}

export const isEditable = (status: ConversationStatus): boolean =>
  includes(status, [ConversationStatus.Draft])

export const isStatusClosed = (status: ConversationStatus): boolean =>
  includes(status, [ConversationStatus.Joined, ConversationStatus.Deleted])

export const isCreatedBy = (conversation: Conversation, me: Customer | null) =>
  conversation.creator.id === me?.id

export const statusText = (
  status: ConversationStatus,
  participantList?: string
) => {
  return match(status)
    .with(ConversationStatus.Proposed, () => {
      const pre = "Pending"
      return participantList ? `${pre}: ${participantList}` : pre
      // : capitalCase(status)
    })
    .with(ConversationStatus.Joined, () => "Confirmed")
    .otherwise(() => capitalCase(status))
}

export const justJoinedNotice = (participation: Participation) => {
  return `${participation.participant?.name} joined the conversation`
}

export const ariaLabelValue = (c: Conversation) =>
  routes.conversation({ id: c.id }).href
