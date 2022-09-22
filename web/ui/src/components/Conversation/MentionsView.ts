import { Box } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { Opp, oppsLinkList } from "~/graph"
import { MarkdownView } from "~/system"

export interface Props {
  opps: Opp[]
}

export const MentionsView: FC<Props> = ({ opps }) => {
  const md = `Discussed ${oppsLinkList(opps)}`
  return h(Box, { fontSize: "xs" }, [
    //
    h(MarkdownView, { md }),
  ])
}

MentionsView.displayName = "MentionsView"
