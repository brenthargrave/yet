import { Button, Center, Heading, Text, VStack } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { t } from "~/i18n"

export type OnClickNew = () => void

interface Props {
  onClickNew?: OnClickNew
}

const text = (text: string) =>
  h(Text, { align: "center", size: "md", pt: 0 }, text)

export const EmptyView: FC<Props> = ({ onClickNew }) =>
  h(Center, { height: "100%", width: "100%" }, [
    h(VStack, { alignItems: "center", gap: 4, padding: 4 }, [
      h(
        Heading,
        {
          align: "center",
          size: "md",
        },
        `You haven't noted opportunities yet.`
      ),
      text(
        `Create an opportunity ("opp") to include in your conversation notes.`
      ),
      // text(`Opps that others discuss with you will appear here too.`),
      h(Button, { onClick: onClickNew }, `Create new Opp`),
    ]),
  ])
EmptyView.displayName = "EmptyView"
