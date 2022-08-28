import { Box } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { Opp, oppUrl } from "~/graph"
import { toSentence } from "~/i18n"
import { MarkdownView } from "~/system"

const oppLinkText = ({ org, role }: Opp) => `${role} (${org})`

const oppLink = (opp: Opp) => `[${oppLinkText(opp)}](${oppUrl(opp)})`

const oppsText = (opps: Opp[]) => toSentence(opps.map(oppLink))

export interface Props {
  opps: Opp[]
}

export const MentionsView: FC<Props> = ({ opps }) => {
  const md = `Discussed ${oppsText(opps)}`
  return h(Box, { fontSize: "xs" }, [
    //
    h(MarkdownView, { md }),
  ])
}

MentionsView.displayName = "MentionsView"
