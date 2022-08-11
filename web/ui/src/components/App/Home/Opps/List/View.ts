import { AddIcon, SmallAddIcon } from "@chakra-ui/icons"
import {
  Heading,
  List,
  ListIcon,
  ListItem,
  Spacer,
  VStack,
} from "@chakra-ui/react"
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
  MarkdownView,
} from "~/system"
import { ParticipantsView } from "~/system/ParticipantsView"
import { EmptyOppsView, OnClickNew } from "./EmptyView"

const { minHeight } = modalStyleProps

type OnClickConversation = (c: Conversation) => void

const isNotLastItem = <T>(idx: number, all: T[]) => !(idx + 1 === all.length)

const bold = (value: string) => `**${value}**`
const i = (value: string) => `*${value}*`

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
    : h(Stack, { minHeight, direction: "column", pt: 4 }, [
        h(Header, [
          h(Heading, { size: "md" }, "Your opportunities"),
          h(Spacer),
          h(CreateButton, { onClick: onClickCreate, cta: `New opp` }),
        ]),
        h(List, { spacing: 4, paddingTop: 4 }, [
          ...opps.map(({ org, role, desc }, idx, all) => {
            return h(
              ListItem,
              {
                padding: 0,
                style: { cursor: "pointer" },
                onClick: console.debug,
              },
              [
                h(Stack, { direction: "row", alignItems: "center", gap: 3 }, [
                  h(ListIcon, { as: SmallAddIcon }),
                  h(
                    Stack,
                    { direction: "column", alignItems: "start", width: "100%" },
                    [
                      h(Stack, { direction: "row", alignItems: "center" }, [
                        h(VStack, { alignItems: "start", gap: 0, spacing: 0 }, [
                          h(MarkdownView, { md: `${bold(role)}` }),
                          h(MarkdownView, { md: `${i(org)}` }),
                        ]),
                        // h(Text, { size: "md" }, `${role} @ ${org}`),
                        // h(VStack, { alignItems: "start" }, [
                        //   h(Heading, { fontSize: "md" }, role),
                        //   h(Text, { fontSize: "md" }, org),
                        // ]),
                        h(Spacer),
                        // TODO: reward $
                      ]),
                      desc && h(Text, { size: "md" }, desc),
                    ]
                  ),
                ]),
                // TODO: redesign divider, right margin
                isNotLastItem(idx, all) &&
                  h(Divider, { padding: 2, width: "100%" }),
              ]
            )
          }),
        ]),
      ])

View.displayName = "Conversation.List.View"
