import { AddIcon, EditIcon, SmallAddIcon } from "@chakra-ui/icons"
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
import { ImEmbed } from "react-icons/im"
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
  Button,
  IconButton,
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
    : h(Stack, { minHeight, direction: "column", pt: 8 }, [
        h(Header, { padding: 0 }, [
          h(Heading, { size: "md" }, "Your opportunities"),
          h(Spacer),
          h(CreateButton, { onClick: onClickCreate, cta: `New opp` }),
        ]),
        h(List, { spacing: 4, paddingTop: 8 }, [
          ...opps.map(({ org, role, desc }, idx, all) => {
            return h(
              ListItem,
              {
                // style: { cursor: "pointer" },
                onClick: console.debug,
              },
              [
                h(
                  Stack,
                  {
                    direction: "row",
                    alignItems: "center",
                    gap: 3,
                  },
                  [
                    // h(ListIcon, { as: SmallAddIcon }),
                    h(IconButton, {
                      icon: h(SmallAddIcon),
                      variant: "ghost",
                      size: "lg",
                    }),
                    h(
                      Stack,
                      {
                        direction: "column",
                        alignItems: "start",
                        width: "100%",
                      },
                      [
                        h(Stack, { direction: "row", alignItems: "center" }, [
                          h(
                            VStack,
                            { alignItems: "start", gap: 0, spacing: 0 },
                            [
                              h(MarkdownView, { md: `${bold(role)}` }),
                              h(MarkdownView, { md: `${i(org)}` }),
                            ]
                          ),
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
                    h(VStack, {}, [
                      h(
                        Button,
                        {
                          // variant: "ghost",
                          variant: "outline",
                          leftIcon: h(ImEmbed),
                          size: "xs",
                        },
                        `Add to conversation`
                      ),
                      h(
                        Button,
                        {
                          variant: "outline",
                          leftIcon: h(EditIcon),
                          size: "xs",
                        },
                        `Edit`
                      ),
                    ]),
                  ]
                ),
                // TODO: redesign divider, right margin
                isNotLastItem(idx, all) &&
                  h(Divider, { padding: 2, width: "100%" }),
              ]
            )
          }),
        ]),
      ])

View.displayName = "Conversation.List.View"
