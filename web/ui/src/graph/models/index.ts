import { isNotEmpty } from "~/fp"
import { Conversation as FullConversation } from "../generated"

type LocalConversation = Omit<FullConversation, "status">

type Note = string | null | undefined

export const isValidNote = (note: Note): boolean => isNotEmpty(note)

export const isValidConversation = ({ note, ...record }: LocalConversation) =>
  isValidNote(note)
