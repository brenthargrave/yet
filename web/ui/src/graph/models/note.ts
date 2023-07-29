import { ulid } from "ulid"
import { Note, MakeOptional, ID } from ".."
import { NoteStatus } from "../generated"

export type DraftNote = MakeOptional<Note, "createdAt" | "creator">

export const newNote = (conversationId: ID): DraftNote => ({
  id: ulid(),
  createdAt: new Date(),
  status: NoteStatus.Draft,
  conversationId,
})

export const noteAddedNotice = (note: DraftNote) => {
  return `${note.creator?.name} just added a note`
}
