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
import { match } from "ts-pattern"
import { OppView } from "~/components/Opp"
import { Customer, Maybe, Opp, TimelineEvent } from "~/graph"
import { FullWidthVStack, Header, Nav } from "~/system"
import { Location } from ".."
import { isNotLastItem } from "~/fp"
import { ConversationView } from "~/components/Conversation"
import { ConversationPublishedView } from "~/components/Conversation/View"

export interface Props {
  viewer: Maybe<Customer>
  location: Location
  opp: Opp
  events: TimelineEvent[]
  onClickBack?: () => void
}

export const View: FC<Props> = ({
  location,
  viewer,
  opp,
  events = [],
  onClickBack,
}) => {
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
        h(Divider, { orientation: "horizontal" }),
        h(FullWidthVStack, { gap: 0, pt: 0 }, [
          h(Header, {}, [h(Heading, { size: "xs" }, "Recent Mentions")]),
          h(List, { width: "100%", spacing: 8, pl: 2, pr: 2, pt: 0 }, [
            // TODO: empty mentions view
            ...events.map((event, idx, all) =>
              match(event)
                .with(
                  { __typename: "ConversationPublished" },
                  ({ conversation, occurredAt }) =>
                    h(ListItem, {}, [
                      h(ConversationPublishedView, {
                        viewer,
                        conversation,
                      }),
                      isNotLastItem(idx, all) && h(Divider, { padding: 4 }),
                    ])
                )
                .with({ __typename: "ContactProfileChanged" }, () => null)
                .exhaustive()
            ),
          ]),
        ]),
      ]
    ),
  ])
}

View.displayName = "Opps.Show"
