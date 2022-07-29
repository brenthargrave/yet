import { faker } from "@faker-js/faker"
import { capitalCase } from "change-case"
import { eqBy, isEmpty, prop, symmetricDifferenceWith } from "ramda"
import { includes, isNotEmpty, join, any } from "~/fp"
import { Conversation, Customer, Invitee, MakeOptional, Participant } from ".."
import { ConversationStatus } from "../generated"

export type DraftConversation = MakeOptional<
  Conversation,
  "status" | "creator" | "signatures" | "reviews"
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

const makeId = () => faker.datatype.uuid()
const makeName = () =>
  join(" ", [faker.name.firstName(), faker.name.lastName()])
const makeDate = () => faker.date.past()

export const makeParticipant = (): Participant => {
  return {
    id: makeId(),
    name: makeName(),
  }
}

export const makeInvitee = (): Invitee => {
  return {
    id: makeId(),
    name: makeName(),
  }
}

export const makeConversation = (): DraftConversation => {
  return {
    id: makeId(),
    occurredAt: makeDate(),
    creator: makeParticipant(),
    invitees: [makeInvitee(), makeInvitee()],
    note: faker.lorem.paragraph(),
    signatures: [],
    reviews: [],
    status: faker.helpers.arrayElement([
      ConversationStatus.Draft,
      ConversationStatus.Proposed,
      ConversationStatus.Signed,
      ConversationStatus.Deleted,
    ]),
  }
}

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

const signableStatuses = [
  ConversationStatus.Proposed,
  ConversationStatus.Signed,
]

export const isSignableStatus = (status: ConversationStatus): boolean =>
  includes(status, signableStatuses)

export const editableStatusList = [
  ConversationStatus.Draft,
  ConversationStatus.Proposed,
]

export const isStatusEditable = (status: ConversationStatus): boolean =>
  includes(status, editableStatusList)

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
