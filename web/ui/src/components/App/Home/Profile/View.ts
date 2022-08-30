import { Divider, Heading, Spacer, Text } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import {} from "remeda"
import { match } from "ts-pattern"
import { ConversationPublishedView } from "~/components/Conversation/View"
import { isNotLastItem } from "~/fp"
import { Customer, Profile } from "~/graph"
import {
  containerProps,
  FullWidthList,
  FullWidthVStack,
  Header,
  LinkedListItem,
  Nav,
} from "~/system"

export enum State {
  loading = "loading",
  ready = "ready",
}

export interface Props {
  state: State
  viewer: Customer
  profile: Profile
}

export const View: FC<Props> = ({ state, viewer, profile }) => {
  const { contact, events } = profile
  const { name, role, org } = contact
  const bio = [role, org].join(" at ")

  return state === State.loading
    ? null
    : h(FullWidthVStack, { ...containerProps }, [
        h(Nav),
        h(Header, {}, [
          //
          h(Heading, { size: "md" }, "Your Profile"),
          h(Spacer),
          // Edit
        ]),
        h(FullWidthVStack, { gap: 4 }, [
          // Contact
          h(FullWidthVStack, [
            h(Heading, { size: "lg" }, name),
            h(Text, { fontSize: "lg" }, bio),
          ]),
          // Activity
          h(Divider),
          h(FullWidthVStack, [
            h(Heading, { size: "sm" }, `Activity`),
            // TODO:
            // Activity visible to: Your Contacts | Extended Network
            // Contacts see: full conversations
            // Network sees: conversations w/o notes, opps mentioned
            // both see: role/title updates
            h(FullWidthList, [
              events.map((event, idx, all) =>
                match(event)
                  .with(
                    { __typename: "ConversationPublished" },
                    ({ conversation }) =>
                      h(
                        LinkedListItem,
                        {
                          key: idx,
                          // onClick: () => onClickConversation(conversation),
                        },
                        [
                          h(ConversationPublishedView, {
                            viewer,
                            conversation,
                          }),
                          isNotLastItem(idx, all) && h(Divider, { padding: 4 }),
                        ]
                      )
                  )
                  .with({ __typename: "ContactProfileChanged" }, () => null)
                  .run()
              ),
            ]),
          ]),
        ]),
      ])
}
