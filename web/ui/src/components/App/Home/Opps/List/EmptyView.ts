import { Heading, Text } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { AriaButton, EmptyViewBase } from "~/system"

export type OnClickNew = () => void

interface Props {
  onClickNew?: OnClickNew
}

const text = (text: string) =>
  h(Text, { align: "center", size: "md", pt: 0 }, text)

export const EmptyView: FC<Props> = ({ onClickNew, ...props }) =>
  h(EmptyViewBase, { ...props }, [
    h(
      Heading,
      {
        align: "center",
        size: "md",
      },
      `You haven't noted any opportunities.`
    ),
    text(
      `Create an opportunity ("opp") to include in your conversation notes.`
    ),
    h(AriaButton, { onClick: onClickNew }, `Create Opp`),
  ])

EmptyView.displayName = "EmptyView"
