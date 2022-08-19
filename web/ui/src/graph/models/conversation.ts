import { faker } from "@faker-js/faker"
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
  join,
  prop,
  symmetricDifferenceWith,
} from "~/fp"
import { Contact, Conversation, Customer, Invitee, MakeOptional } from ".."
import { ConversationStatus, ConversationInput } from "../generated"

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

const makeId = () => ulid()
const makeName = () =>
  join(" ", [faker.name.firstName(), faker.name.lastName()])
const makeDate = () => faker.date.past()
const makeOrg = () => faker.company.companyName()
const makeRole = () => faker.name.jobTitle()
const makeBool = () => faker.datatype.boolean()

export const makeParticipant = (): Contact => {
  return {
    id: makeId(),
    name: makeName(),
    org: makeOrg(),
    role: makeRole(),
  }
}

export const makeInvitee = (): Invitee => {
  return {
    id: makeId(),
    name: makeName(),
    isContact: makeBool(),
  }
}

export const makeConversation = (): DraftConversation => ({
  id: makeId(),
  occurredAt: makeDate(),
  invitees: [makeInvitee(), makeInvitee()],
  note: faker.lorem.paragraph(),
  status: faker.helpers.arrayElement([
    ConversationStatus.Draft,
    ConversationStatus.Proposed,
    ConversationStatus.Signed,
    ConversationStatus.Deleted,
  ]),
})

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
