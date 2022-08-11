import { SmallAddIcon } from "@chakra-ui/icons"
import {
  Heading,
  HStack,
  IconButton,
  List,
  ListItem,
  Spacer,
  VStack,
} from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { isEmpty } from "~/fp"
import { Opp } from "~/graph"
import {
  CreateButton,
  Divider,
  Header,
  MarkdownView,
  modalStyleProps,
  Stack,
  Text,
} from "~/system"
import { EmptyOppsView, OnClickNew } from "./EmptyView"

const { minHeight } = modalStyleProps

const isNotLastItem = <T>(idx: number, all: T[]) => !(idx + 1 === all.length)

const bold = (value: string) => `**${value}**`
const i = (value: string) => `*${value}*`

export interface Props {
  onClickCreate?: OnClickNew
  opps: Opp[]
  // viewer: Maybe<Customer>
}

export const View: FC<Props> = ({
  onClickCreate,
  opps = [],
  // viewer,
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
            return h(ListItem, {}, [
              h(
                Stack,
                {
                  direction: "row",
                  alignItems: "center",
                  gap: 3,
                },
                [
                  h(IconButton, {
                    icon: h(SmallAddIcon),
                    variant: "ghost",
                    size: "lg",
                  }),
                  h(Divider, {
                    //
                    orientation: "vertical",
                    h: "40px",
                  }),
                  h(
                    Stack,
                    {
                      direction: "column",
                      alignItems: "start",
                      width: "100%",
                      spacing: 1,
                      style: { cursor: "pointer" },
                    },
                    [
                      h(
                        HStack,
                        {
                          width: "100%",
                        },
                        [
                          h(
                            VStack,
                            {
                              alignItems: "start",
                              gap: 0,
                              spacing: 1,
                            },
                            [
                              h(MarkdownView, { md: `${bold(role)}` }),
                              h(MarkdownView, { md: `${i(org)}` }),
                            ]
                          ),
                          h(Spacer),
                          // TODO: reward $
                        ]
                      ),
                      desc && h(Text, { size: "md", noOfLines: 1 }, desc),
                    ]
                  ),
                ]
              ),
              // TODO: redesign divider, right margin
              isNotLastItem(idx, all) &&
                h(Divider, { padding: 2, width: "100%" }),
            ])
          }),
        ]),
      ])

View.displayName = "Conversation.List.View"
