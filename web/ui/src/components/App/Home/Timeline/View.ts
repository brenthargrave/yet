import { Heading, Spacer } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { TimelineEventList } from "~/components/TimelineEvent"
import { isEmpty } from "~/fp"
import { Conversation, Customer, TimelineEvent } from "~/graph"
import { containerProps, FullWidthVStack, Header, Nav } from "~/system"
import { EmptyView, Props as EmptyViewProps } from "./EmptyView"
// import {
//   EmptyView,
//   Props as EmptyViewProps,
// } from "../Conversations/List/EmptyView"

export enum State {
  loading = "loading",
  ready = "ready",
}

export interface Props extends EmptyViewProps {
  state: State
  viewer: Customer
  events: TimelineEvent[]
  onClickConversation?: (c: Conversation) => void
}

export const View: FC<Props> = ({
  state,
  viewer,
  events,
  onClickNew,
  onClickConversation,
}) =>
  state === State.loading
    ? null
    : isEmpty(events)
    ? h(EmptyView, { onClickNew, ...containerProps })
    : h(FullWidthVStack, { ...containerProps }, [
        h(Nav),
        h(Header, {}, [
          //
          h(Heading, { size: "md" }, "Latest"),
          h(Spacer),
        ]),
        h(TimelineEventList, { viewer, events, onClickConversation }),
      ])
