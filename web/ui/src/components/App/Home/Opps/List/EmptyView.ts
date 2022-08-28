import { Button, Heading, Text } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { EmptyViewBase } from "~/system"

export type OnClickNew = () => void

interface Props {
  onClickCreate?: OnClickNew
}

const text = (text: string) =>
  h(Text, { align: "center", size: "md", pt: 0 }, text)

export const EmptyView: FC<Props> = ({ onClickCreate: onClickNew, ...props }) =>
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
    // text(`Opps that others discuss with you will appear here too.`),
    h(Button, { onClick: onClickNew }, `Create opp`),
  ])

EmptyView.displayName = "EmptyView"
