import { Divider, Heading, Spacer, Text } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import {} from "remeda"
import { TimelineEventList } from "~/components/TimelineEvent"
import { Conversation, Customer, Profile } from "~/graph"
import { containerProps, FullWidthVStack, Header, Nav } from "~/system"

export enum State {
  loading = "loading",
  ready = "ready",
}

export interface Props {
  state: State
  viewer: Customer
  profile: Profile
  onClickConversation?: (c: Conversation) => void
}

export const View: FC<Props> = ({
  state,
  viewer,
  profile,
  onClickConversation,
}) => {
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
        h(FullWidthVStack, { gap: 4, pt: 4 }, [
          // Contact
          h(FullWidthVStack, [
            h(Heading, { size: "lg" }, name),
            h(Text, { fontSize: "lg" }, bio),
          ]),
          // Activity
          h(Divider),
          // TODO: profile events preview by persona?
          // Activity visible to: Your Contacts | Extended Network
          // Contacts see: full conversations
          // Network sees: conversations w/o notes, opps mentioned
          // both see: role/title updates
          false &&
            h(FullWidthVStack, [
              h(Heading, { size: "sm" }, `Activity`),
              h(TimelineEventList, { viewer, events, onClickConversation }),
            ]),
        ]),
      ])
}
