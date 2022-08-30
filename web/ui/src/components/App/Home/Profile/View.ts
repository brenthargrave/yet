import { Divider, Heading, Spacer } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { match } from "ts-pattern"
import { ConversationPublishedView } from "~/components/Conversation/View"
import { isEmpty, isNotLastItem } from "~/fp"
import { Conversation, Customer, Maybe, TimelineEvent } from "~/graph"
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
  viewer: Maybe<Customer>
}

export const View: FC<Props> = () =>
  h(FullWidthVStack, { ...containerProps }, [
    h(Nav),
    h(Header, {}, [
      //
      h(Heading, { size: "md" }, "Your Profile"),
      h(Spacer),
      // Edit
    ]),
    h(FullWidthList, [
      // Name
      // Role
      // Org
      // Activity visible to: Your Contacts | Extended Network
      // Contacts see: full conversations
      // Network sees: conversations w/o notes, opps mentioned
      // both see: role/title updates
    ]),
  ])
