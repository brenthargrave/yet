import { Heading, Spacer, Stack } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { OppView } from "~/components/Opp"
import { Opp } from "~/graph"
import { FullWidthVStack, Header, Nav } from "~/system"
import { Location } from ".."

export interface Props {
  location: Location
  opp: Opp
  onClickBack?: () => void
}

export const View: FC<Props> = ({ opp, location, onClickBack }) =>
  h(FullWidthVStack, {}, [
    h(Nav, { onClickBack }),
    h(Header, {}, [
      //
      h(Heading, { size: "md" }, "Opportunity"),
      h(Spacer),
    ]),
    h(OppView, { opp }),
  ])

View.displayName = "Opps.Show"
