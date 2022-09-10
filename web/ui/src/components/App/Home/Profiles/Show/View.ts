import { Divider, Heading, Spacer, Text } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import {} from "remeda"
import { TimelineEventList } from "~/components/TimelineEvent"
import { isEmpty } from "~/fp"
import { Conversation, Customer, Profile } from "~/graph"
import {
  containerProps,
  EditButton,
  FullWidthVStack,
  Header,
  Nav,
} from "~/system"
import { EmptyView } from "../../Timeline/EmptyView"

export enum State {
  loading = "loading",
  ready = "ready",
}

export interface Props {
  state: State
  viewer: Customer
  profile: Profile
  onClickEdit?: () => void
  onClickConversation?: (c: Conversation) => void
  onClickNewConversation?: () => void
}

export const View: FC<Props> = ({
  state,
  viewer,
  profile,
  onClickEdit,
  onClickConversation,
  onClickNewConversation,
}) => {
  const { name, role, org, events = [] } = profile

  return state === State.loading
    ? null
    : h(FullWidthVStack, { ...containerProps }, [
        h(Nav),
        h(Header, {}, [
          //
          h(Heading, { size: "md" }, "Your Profile"),
          h(Spacer),
          h(EditButton, {
            onClick: () => {
              if (onClickEdit) onClickEdit()
            },
          }),
        ]),
        h(FullWidthVStack, { gap: 4, isBody: true }, [
          // Contact
          h(FullWidthVStack, [
            h(Heading, { size: "lg" }, name),
            role && org && h(Text, { fontSize: "lg" }, `${role} at ${org}`),
          ]),
          h(Divider),
          // TODO: TimelineEventList component?
          // Activity
          isEmpty(events)
            ? h(EmptyView, { onClickNew: onClickNewConversation })
            : h(FullWidthVStack, [
                h(Heading, { size: "sm" }, `Activity`),
                h(TimelineEventList, { viewer, events, onClickConversation }),
              ]),
        ]),
      ])
}
