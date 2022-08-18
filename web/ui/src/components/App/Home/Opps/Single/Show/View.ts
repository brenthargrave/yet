import { Heading, Spacer, Stack } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { OppView } from "~/components/Opp"
import { Opp } from "~/graph"
import { Header } from "~/system"

export interface Props {
  opp: Opp
  onClickBack?: () => void
}

export const View: FC<Props> = ({ opp }) =>
  h(
    Stack,
    {
      direction: "column",
      width: "100%",
    },
    [
      h(Header, {}, [
        // TODO: nav
        h(Heading, { size: "md" }, "Opportunity"),
        h(Spacer),
      ]),
      h(OppView, { opp }),
    ]
  )

View.displayName = "Opps.Show"
