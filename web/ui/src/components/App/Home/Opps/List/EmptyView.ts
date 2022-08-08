import { Button, Center, Heading, Text, VStack } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { t } from "~/i18n"

export type OnClickNew = () => void

interface Props {
  onClickNew?: OnClickNew
}

export const EmptyView: FC<Props> = ({ onClickNew }) =>
  h(Center, { height: "100%", width: "100%" }, [
    h(VStack, { alignItems: "center", gap: 4, padding: 4 }, [
      h(
        Heading,
        {
          align: "center",
          size: "sm",
        },
        `You haven't noted opportunities yet.`
      ),
      h(
        Text,
        { align: "center", size: "md", pt: 0 },
        `Create an opportunity ("opp") to include in your conversation notes.`
      ),
      h(Button, { onClick: onClickNew }, `Create new Opp`),
    ]),
  ])
EmptyView.displayName = "EmptyView"
