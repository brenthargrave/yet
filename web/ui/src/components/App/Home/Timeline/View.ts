import { Heading, Spacer } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import {
  EmptyView,
  Props as EmptyViewProps,
} from "~/components/App/Home/Conversations/List/EmptyView"
import { isEmpty } from "~/fp"
import { ConversationPublished, TimelineEvent } from "~/graph"
import { FullWidthVStack, Header, modalStyleProps, Nav } from "~/system"

// TODO: wat? minHeight?
const { minHeight } = modalStyleProps

export interface Props extends EmptyViewProps {
  events: ConversationPublished[]
}

export const View: FC<Props> = ({ events, onClickNew }) =>
  isEmpty(events)
    ? h(EmptyView, { onClickNew })
    : h(FullWidthVStack, { minHeight }, [
        h(Nav),
        h(Header, {}, [
          //
          h(Heading, { size: "md" }, "Latest"),
          h(Spacer),
        ]),
      ])
