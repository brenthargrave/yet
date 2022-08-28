import { Divider, Heading, ListItem, Spacer } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { match } from "ts-pattern"
import { ConversationPublishedView } from "~/components/Conversation/View"
import { OppView } from "~/components/Opp"
import { isNotLastItem } from "~/fp"
import { Customer, Maybe, Opp, TimelineEvent } from "~/graph"
import { FullWidthList, FullWidthVStack, Header, Nav } from "~/system"
import { Location } from ".."

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
      FullWidthVStack,
      {
        pt: 4,
      },
      [
        h(OppView, { opp, viewer }),
        h(Divider, { orientation: "horizontal" }),
        h(FullWidthVStack, { isBody: true }, [
          h(Header, {}, [h(Heading, { size: "xs" }, "Recent Mentions")]),
          // TODO: empty mentions view
          h(FullWidthList, [
            ...events.map((event, idx, all) =>
              match(event)
                .with(
                  { __typename: "ConversationPublished" },
                  ({ conversation }) =>
                    h(ListItem, { key: idx }, [
                      h(ConversationPublishedView, {
                        viewer,
                        conversation,
                      }),
                      isNotLastItem(idx, all) && h(Divider, { padding: 4 }),
                    ])
                )
                .with({ __typename: "ContactProfileChanged" }, () => null)
                .run()
            ),
          ]),
        ]),
      ]
    ),
  ])
}

View.displayName = "Opps.Show"
