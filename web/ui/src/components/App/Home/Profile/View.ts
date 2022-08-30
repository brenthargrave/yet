import { Divider, Heading, Spacer, Text } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { match } from "ts-pattern"
import { ConversationPublishedView } from "~/components/Conversation/View"
import { isEmpty, isNotLastItem } from "~/fp"
import { Customer, Maybe, Profile } from "~/graph"
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

export const View: FC<Props> = ({ state, profile }) => {
  const { contact } = profile
  const { name, role, org } = contact

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
        h(FullWidthList, [
          h(Text, name),
          h(Text, role),
          h(Text, org),
          // Activity visible to: Your Contacts | Extended Network
          // Contacts see: full conversations
          // Network sees: conversations w/o notes, opps mentioned
          // both see: role/title updates
        ]),
      ])
}
