import { Box } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { DraftNote, NoteStatus } from "~/graph"
import { gray, MarkdownView, roundedCorners } from "~/system"

export interface Props {
  note: DraftNote
  maxLines?: number
  isObscured?: boolean
  isPreview?: boolean
}

export const View: FC<Props> = ({
  note,
  maxLines,
  isObscured = false,
  isPreview = false,
  ...rest
}) => {
  const { id, text, status, creator } = note
  const isDraft = status === NoteStatus.Draft
  const md = `${text}\n\n- ${creator?.firstName}`
  return h(
    Box,
    {
      fontSize: "sm",
      ...roundedCorners,
      ...(isPreview && {
        border: 0,
        paddingTop: 0,
      }),
      ...(isObscured && {
        borderWidth: "0px",
      }),
      ...(!isPreview &&
        isDraft && {
          color: gray,
        }),
      // NOTE: used to verify shown in UX tests
      ...(!isPreview && {
        id: `note-${id}-show`,
      }),
      ...rest,
    },
    [
      //
      h(MarkdownView, { maxLines, md }),
    ]
  )
}

View.displayName = "NoteView"
