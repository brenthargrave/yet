import { eqBy, isEmpty, prop, symmetricDifferenceWith } from "ramda"
import { faker } from "@faker-js/faker"
import { isNotEmpty, join } from "~/fp"
import {
  Conversation as FullConversation,
  Invitee,
  Participant,
} from "../generated"

type LocalConversation = Omit<FullConversation, "status">

type Note = string | null | undefined

export const isValidNote = (note: Note) => isNotEmpty(note)

export const isValidInviteeSet = (invitees: Invitee[]) => isNotEmpty(invitees)

export const isValidConversation = ({ note, invitees }: LocalConversation) =>
  isValidNote(note) || isValidInviteeSet(invitees)

export const isCompleteConversation = ({ note, invitees }: LocalConversation) =>
  isValidNote(note) && isValidInviteeSet(invitees)

export const inviteesDiffer = (current: Invitee[], old: Invitee[]): boolean =>
  isEmpty(
    // @ts-ignore
    symmetricDifferenceWith(eqBy<Invitee>(prop<Invitee>("id")), old, current)
  )

const makeId = () => faker.datatype.uuid()
const makeName = () =>
  join(" ", [faker.name.firstName(), faker.name.lastName()])
const makeDate = () => faker.date.recent()

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

export const makeConversation = (): LocalConversation => {
  return {
    id: makeId(),
    occurredAt: makeDate(),
    creator: makeParticipant(),
    invitees: [makeInvitee(), makeInvitee()],
    note: faker.lorem.paragraph(),
  }
}
