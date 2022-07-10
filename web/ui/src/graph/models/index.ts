import { empty, eqBy, isEmpty, prop, symmetricDifferenceWith } from "ramda"
import { isNotEmpty } from "~/fp"
import { Conversation as FullConversation, Invitee } from "../generated"

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
