import { Divider, Heading, Spacer, Text } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import {} from "remeda"
import { TimelineEventList } from "~/components/TimelineEvent"
import { Conversation, Customer, Profile } from "~/graph"
import {
  containerProps,
  EditButton,
  FullWidthVStack,
  Header,
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
  onClickEdit?: () => void
  onClickConversation?: (c: Conversation) => void
}

export const View: FC<Props> = ({
  state,
  viewer,
  profile,
  onClickEdit,
  onClickConversation,
}) => {
  const { name, role, org, events = [] } = profile
  const bio = [role, org].join(" at ")

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
            h(Text, { fontSize: "lg" }, bio),
          ]),
          h(Divider),
          // Activity
          h(FullWidthVStack, [
            h(Heading, { size: "sm" }, `Activity`),
            h(TimelineEventList, { viewer, events, onClickConversation }),
          ]),
        ]),
      ])
}
