import { Button, Center, Heading, Text, VStack } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { t } from "~/i18n"

export type OnClickNew = () => void

interface Props {
  minHeight?: string
  onClickCreate?: OnClickNew
}

const text = (text: string) =>
  h(Text, { align: "center", size: "md", pt: 0 }, text)

export const EmptyOppsView: FC<Props> = ({
  onClickCreate: onClickNew,
  minHeight = "100%",
}) =>
  h(Center, { minHeight, width: "100%" }, [
    h(VStack, { alignItems: "center", gap: 4, padding: 4 }, [
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
    ]),
  ])
EmptyOppsView.displayName = "EmptyView"
