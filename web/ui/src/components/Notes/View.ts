import { VStack } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { reject, sort, pipe, reverse, sortBy, values } from "remeda"
import { isEmpty } from "~/fp"
import { Customer, ID, Maybe, NoteStatus } from "~/graph"
import {
  NoteViewModel,
  Props as NoteViewProps,
  View as NoteView,
} from "./Single/View"

export type { NoteViewModel }

export interface Props extends Omit<NoteViewProps, "note"> {
  viewer: Maybe<Customer>
  readOnly?: boolean
  notes: NoteViewModel[]
  conversationID: ID
}

export const View: FC<Props> = ({
  viewer,
  readOnly = false,
  conversationID,
  notes,
  onChangeText,
  onClickDelete,
  onClickPost,
}) => {
  const key = `/c/${conversationID}/n`

  const filteredNotes = reject(notes, (note) => {
    const { creator } = note
    const viewerIsOwner = creator?.id === viewer?.id
    const textIsEmpty = isEmpty(note.text?.trim())
    return (
      (readOnly && viewerIsOwner && textIsEmpty) ||
      (!viewerIsOwner && note.status === NoteStatus.Draft)
    )
  })

  const sortedNotes = pipe(
    filteredNotes,
    sortBy((n: NoteViewModel) => n.postedAt)
  )

  return h(
    VStack,
    {
      //
      key,
      id: key,
      className: "notes",
      paddingTop: 2,
      spacing: 4,
    },
    [
      ...sortedNotes.map((note) =>
        h(NoteView, {
          //
          readOnly,
          note,
          onChangeText,
          onClickDelete,
          onClickPost,
        })
      ),
    ]
  )
}

View.displayName = "Notes"
