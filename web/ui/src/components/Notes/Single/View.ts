import { h } from "@cycle/react"
import { FC } from "react"
import { match } from "ts-pattern"
import { isNotEmpty, pluck } from "~/fp"
import { NoteStatus } from "~/graph"
import { Box } from "~/system"
import {
  NoteViewModel,
  Props as EditViewProps,
  View as EditView,
} from "./Edit/View"
import { View as ShowView, Props as ShowProps } from "./Show/View"

export type { NoteViewModel }

enum State {
  show = "show",
  edit = "edit",
  deleted = "deleted",
}

export type InheritShowProps = Omit<ShowProps, "text" | "status">

export interface Props extends EditViewProps, InheritShowProps {
  readOnly?: boolean
  note: NoteViewModel
}

export const View: FC<Props> = ({
  readOnly,
  note,
  onChangeText,
  onClickDelete,
  onClickPost,
}) => {
  const state = readOnly
    ? State.show
    : match(note.status)
        .with(NoteStatus.Draft, () => State.edit)
        .with(NoteStatus.Deleted, () => State.deleted)
        .with(NoteStatus.Posted, () => State.show)
        .exhaustive()

  const { id } = note
  const key = `/n/${id}`
  return h(
    Box,
    {
      //
      width: "100%",
      className: "note",
      ...(!!id && {
        key,
        id: key,
        // @ts-ignore
        "data-note-id": id,
      }),
    },
    [
      match(state)
        .with(State.edit, () =>
          h(EditView, {
            note,
            onChangeText,
            onClickDelete,
            onClickPost,
          })
        )
        .with(State.deleted, () => null)
        .with(State.show, () => {
          const { text, status } = note
          return h(ShowView, {
            note,
          })
        })
        .exhaustive(),
    ]
  )
}

View.displayName = "Note"
