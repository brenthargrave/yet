import { SmallAddIcon } from "@chakra-ui/icons"
import {
  Heading,
  HStack,
  Icon,
  IconButton,
  List,
  ListItem,
  Spacer,
  Tag,
  TagLabel,
  VStack,
} from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { TbArrowsSplit2 } from "react-icons/tb"
import { isEmpty } from "~/fp"
import { Opp } from "~/graph"
import { formatMoney } from "~/i18n"
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

// TODO: minHeight varies by render target (home vs. modal)
const { minHeight } = modalStyleProps

const isNotLastItem = <T>(idx: number, all: T[]) => !(idx + 1 === all.length)

const bold = (value: string) => `**${value}**`
const i = (value: string) => `*${value}*`

export interface Props {
  onClickCreate?: OnClickNew
  opps: Opp[]
  // viewer: Maybe<Customer>
  onClickAdd?: (opp: Opp) => void
  onClickOpp?: (opp: Opp) => void
}

export const View: FC<Props> = ({
  onClickCreate,
  opps = [],
  onClickAdd = () => null,
  onClickOpp = () => null,
  // viewer,
}) =>
  isEmpty(opps)
    ? h(EmptyOppsView, { minHeight, onClickCreate })
    : h(Stack, { minHeight, direction: "column" }, [
        h(Header, { padding: 0 }, [
          h(Heading, { size: "md" }, "Your opportunities"),
          h(Spacer),
          h(CreateButton, { onClick: onClickCreate, cta: `New opp` }),
        ]),
        h(List, { spacing: 4, paddingTop: 8 }, [
          ...opps.map((opp, idx, all) => {
            const { org, role, desc, fee } = opp
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
                    onClick: () => onClickAdd(opp),
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
                      onClick: () => onClickOpp(opp),
                    },
                    [
                      h(
                        HStack,
                        {
                          width: "100%",
                          alignItems: "start",
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
                          // Fee section
                          fee.amount > 0 &&
                            h(VStack, { alignItems: "center", padding: 2 }, [
                              h(
                                Tag,
                                {
                                  variant: "outline",
                                  colorScheme: "green",
                                },
                                [
                                  h(Icon, { as: TbArrowsSplit2 }),
                                  h(TagLabel, { pl: 2 }, formatMoney(fee)),
                                ]
                              ),
                              // h(
                              //   Badge,
                              //   { variant: "subtle", colorScheme: "green" },
                              //   [formatMoney(fee)]
                              // ),
                              // h(Text, { kfontSize: "xs" }, `Referral reward`),
                              // h(
                              //   Text,
                              //   {
                              //     fontSize: "sm",
                              //     fontStyle: "bold",
                              //     // color: "green",
                              //   },
                              //   formatMoney(fee)
                              // ),
                            ]),
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
