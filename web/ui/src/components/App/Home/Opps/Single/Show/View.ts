import { Heading, Spacer, Stack } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { OppView } from "~/components/Opp"
import { Customer, Maybe, Opp } from "~/graph"
import { FullWidthVStack, Header, Nav } from "~/system"
import { Location } from ".."

export interface Props {
  viewer: Maybe<Customer>
  location: Location
  opp: Opp
  onClickBack?: () => void
}

export const View: FC<Props> = ({ viewer, opp, location, onClickBack }) =>
  h(FullWidthVStack, {}, [
    h(Nav, { onClickBack }),
    h(Header, {}, [
      //
      h(Heading, { size: "md" }, "Opportunity"),
      h(Spacer),
    ]),
    h(OppView, { opp, viewer }),
  ])

View.displayName = "Opps.Show"
