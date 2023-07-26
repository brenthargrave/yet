import { capitalCase } from "change-case"
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
import { ConversationInput, ConversationStatus } from "../generated"

export type DraftConversation = MakeOptional<
  ConversationInput,
  "status" | "mentions"
>

type Note = string | null | undefined

export const isValidNote = (note: Note) => isNotEmpty(note)

export const isValidInviteeSet = (invitees: Invitee[]) => isNotEmpty(invitees)

export const isValidConversation = ({ note, invitees }: DraftConversation) =>
  isValidNote(note) || isValidInviteeSet(invitees)

export const isCompleteConversation = ({ note, invitees }: DraftConversation) =>
  isValidNote(note) && isValidInviteeSet(invitees)

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
  note: null,
  status: ConversationStatus.Draft,
  occurredAt: new Date(),
})

export const isSignedBy = (
  conversation: Conversation,
  customer: Customer | null
) => {
  if (!customer) return false
  return any(({ signer }) => customer.id === signer.id, conversation.signatures)
}

export const isReviewedBy = (
  conversation: Conversation,
  customer: Customer | null
) => {
  if (!customer) return false
  return any(
    ({ reviewer }) => customer.id === reviewer.id,
    conversation.reviews
  )
}

export const allStatusesList = [
  ConversationStatus.Draft,
  ConversationStatus.Proposed,
  ConversationStatus.Signed,
  ConversationStatus.Deleted,
]

export const isSignableStatus = (status: ConversationStatus): boolean =>
  includes(status, [ConversationStatus.Proposed, ConversationStatus.Signed])

export const isStatusEditable = (status: ConversationStatus): boolean =>
  includes(status, [ConversationStatus.Draft, ConversationStatus.Proposed])

export const isStatusClosed = (status: ConversationStatus): boolean =>
  includes(status, [ConversationStatus.Signed, ConversationStatus.Deleted])

export const isCreatedBy = (conversation: Conversation, me: Customer | null) =>
  conversation.creator.id === me?.id

export const statusText = (
  status: ConversationStatus,
  participantList?: string
) =>
  // eslint-disable-next-line no-nested-ternary
  status === ConversationStatus.Proposed
    ? participantList
      ? `Pending cosign by ${participantList}`
      : `Pending cosign`
    : capitalCase(status)

export const justSignedNotice = ({ signatures }: Conversation) => {
  const latest = head(signatures.sort(descend(prop("signedAt"))))
  return `${latest?.signer?.name} cosigned!`
}

export const ariaLabelValue = (c: Conversation) =>
  routes.conversation({ id: c.id }).href
