import {
  Divider,
  Heading,
  Spacer,
  Stack,
  List,
  ListItem,
} from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { OppView } from "~/components/Opp"
import { Customer, Maybe, Opp } from "~/graph"
import { FullWidthVStack, Header, Nav } from "~/system"
import { Location } from ".."
import { isNotLastItem } from "~/fp"
import { ConversationView } from "~/components/Conversation"

export interface Props {
  viewer: Maybe<Customer>
  location: Location
  opp: Opp
  onClickBack?: () => void
}

export const View: FC<Props> = ({ viewer, opp, location, onClickBack }) => {
  const { conversations } = opp
  return h(FullWidthVStack, {}, [
    h(Nav, { onClickBack }),
    h(Header, {}, [
      //
      h(Heading, { size: "md" }, "Opportunity"),
      h(Spacer),
    ]),
    h(
      Stack,
      {
        direction: "column",
        alignItems: "start",
        width: "100%",
        // spacing: 1,
        gap: 4,
      },
      [
        h(OppView, { opp, viewer }),
        // mention history
        h(Divider, { orientation: "horizontal" }),
        h(FullWidthVStack, { gap: 4, pt: 0 }, [
          h(Header, {}, [h(Heading, { size: "sm" }, "Mentions")]),
          h(List, { width: "100%", spacing: 8, pl: 2, pr: 2, pt: 0 }, [
            ...conversations.map((conversation, idx, all) => {
              return h(
                ListItem,
                {
                  /* padding? */
                },
                [
                  h(ConversationView, {
                    viewer,
                    conversation,
                    maxLines: 10,
                    showStatus: false,
                  }),
                  isNotLastItem(idx, all) && h(Divider, { padding: 4 }),
                ]
              )
            }),
          ]),
        ]),
      ]
    ),
  ])
}

View.displayName = "Opps.Show"
