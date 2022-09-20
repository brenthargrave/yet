import { Divider, Heading, ListItem, Spacer } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { match } from "ts-pattern"
import { ConversationPublishedView } from "~/components/Conversation/View"
import { OppView } from "~/components/Opp"
import { isEmpty, isNotLastItem } from "~/fp"
import { Customer, Maybe, OppProfile } from "~/graph"
import {
  EditButton,
  FullWidthList,
  FullWidthVStack,
  Header,
  MarkdownView,
  Nav,
} from "~/system"
import { Location } from ".."

export interface Props {
  viewer: Maybe<Customer>
  location: Location
  oppProfile: OppProfile
  onClickBack?: () => void
  onClickEdit?: () => void
}

export const View: FC<Props> = ({
  location,
  viewer,
  oppProfile,
  onClickBack,
  onClickEdit,
}) => {
  const { events, opp } = oppProfile
  return h(FullWidthVStack, {}, [
    h(Nav, { onClickBack, backButtonText: "Opps" }),
    h(Header, {}, [
      //
      h(Heading, { size: "md" }, "Opportunity"),
      h(Spacer),
      h(EditButton, { onClick: onClickEdit }),
    ]),
    h(
      FullWidthVStack,
      {
        pt: 4,
        gap: 6,
      },
      [
        h(OppView, { opp, viewer, pb: 2 }),
        h(Divider, { orientation: "horizontal" }),
        h(FullWidthVStack, { isBody: true, pt: 0, mt: 0 }, [
          h(Header, { padding: 0 }, [
            h(Heading, { size: "xs" }, "Recent Mentions"),
          ]),
          isEmpty(events)
            ? h(FullWidthVStack, { fontSize: "sm" }, [
                h(MarkdownView, {
                  md: `No mentions in anyone's conversations just yet.

                  Be sure to bring it up in conversation, then add it to your notes for others to share.`,
                }),
              ])
            : h(FullWidthList, [
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
