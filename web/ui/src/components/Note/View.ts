import { Box } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { MarkdownView } from "~/system"

interface Props {
  note: string | null | undefined
  maxLines?: number
  isObscured?: boolean
}

export const View: FC<Props> = ({
  note,
  maxLines,
  isObscured = false,
  ...rest
}) =>
  h(
    Box,
    {
      //
      padding: 4,
      borderWidth: "1px",
      borderRadius: "lg",
      ...(isObscured && {
        borderWidth: "0px",
      }),
      ...rest,
    },
    [h(MarkdownView, { maxLines, md: note })]
  )

View.displayName = "NoteView"
