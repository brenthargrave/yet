import { Box } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { MarkdownView } from "~/system"

interface Props {
  note: string | null | undefined
  maxLines?: number
}

export const View: FC<Props> = ({ note, maxLines, ...rest }) =>
  h(
    Box,
    {
      //
      padding: 4,
      borderWidth: "1px",
      borderRadius: "lg",
      ...rest,
    },
    [h(MarkdownView, { maxLines, md: note ?? "" })]
  )

View.displayName = "NoteView"