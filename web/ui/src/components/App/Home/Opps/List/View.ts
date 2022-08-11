import { Heading, List, ListItem, Spacer } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { NoteView } from "~/components/Note"
import { isEmpty, join, map, prop } from "~/fp"
import { Conversation, Customer, Maybe, Opp } from "~/graph"
import { localizeDate } from "~/i18n"
import {
  CreateButton,
  Divider,
  Header,
  Stack,
  Text,
  Status,
  modalStyleProps,
} from "~/system"
import { ParticipantsView } from "~/system/ParticipantsView"
import { EmptyOppsView, OnClickNew } from "./EmptyView"

const { minHeight } = modalStyleProps

type OnClickConversation = (c: Conversation) => void

const isNotLastItem = <T>(idx: number, all: T[]) => !(idx + 1 === all.length)

export interface Props {
  onClickCreate?: OnClickNew
  opps: Opp[]
  // viewer: Maybe<Customer>
  // onClickConversation: OnClickConversation
}

export const View: FC<Props> = ({
  onClickCreate,
  opps = [],
  // viewer,
  // conversations,
  // onClickConversation,
  // TODO: minHeight varies by render target (home vs. modal)
}) =>
  isEmpty(opps)
    ? h(EmptyOppsView, { minHeight, onClickCreate })
    : h(Stack, { minHeight, direction: "column" }, [
        h(Header, [
          // TODO: vary by render target: `Your Opportunities
          h(Heading, { size: "md" }, "Select Opportunity"),
          h(Spacer),
          h(CreateButton, { onClick: onClickCreate, cta: `New opp` }),
        ]),
        h(List, { spacing: 8, padding: 4 }, [
          ...opps.map(({ org, role, desc }, idx, all) => {
            return h(
              ListItem,
              {
                padding: 0,
                style: { cursor: "pointer" },
                onClick: console.debug,
              },
              [
                h(Stack, { direction: "row", alignItems: "center" }, [
                  h(
                    Stack,
                    { direction: "column", alignItems: "start", width: "100%" },
                    [
                      h(Stack, { direction: "row", alignItems: "center" }, [
                        h(Text, { size: "md" }, `${role} @ ${org}`),
                        h(Spacer),
                        // TODO: reward $
                      ]),
                      desc && h(Text, { size: "md" }, desc),
                    ]
                  ),
                ]),
                // TODO: redesign divider, right margin
                isNotLastItem(idx, all) &&
                  h(Divider, { padding: 4, width: "100%" }),
              ]
            )
          }),
        ]),
      ])

View.displayName = "Conversation.List.View"
