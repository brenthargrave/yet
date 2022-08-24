import {
  Stack,
  HStack,
  Spacer,
  Tag,
  VStack,
  Icon,
  TagLabel,
  Text,
  Divider,
  Heading,
  List,
  ListItem,
} from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { TbArrowsSplit2 } from "react-icons/tb"
import { Customer, Maybe, Opp } from "~/graph"
import { MarkdownView, bold, i, Header, FullWidthVStack } from "~/system"
import { formatMoney } from "~/i18n"
import { ConversationView } from "../Conversation"
import { isNotLastItem } from "~/fp"

export interface Props {
  viewer: Maybe<Customer>
  opp: Opp
}

export const OppView: FC<Props> = ({ viewer, opp }) => {
  const { role, org, desc, fee, conversations } = opp
  return h(
    Stack,
    {
      direction: "column",
      alignItems: "start",
      width: "100%",
      // spacing: 1,
      gap: 4,
    },
    [
      h(FullWidthVStack, {}, [
        h(HStack, { width: "100%", alignItems: "start" }, [
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
            ]),
        ]),
        desc && h(Text, { size: "md", noOfLines: 1 }, desc),
      ]),
      // mention history
      h(Divider, { orientation: "horizontal" }),
      h(FullWidthVStack, { gap: 4, pt: 0 }, [
        h(Header, {}, [h(Heading, { size: "sm" }, "Mentions")]),
        h(List, { width: "100%", spacing: 8, pl: 2, pr: 2, pt: 0 }, [
          ...conversations.map((conversation, idx, all) => {
            return h(
              ListItem,
              {
                /* padding? */
              },
              [
                h(ConversationView, {
                  viewer,
                  conversation,
                  maxLines: 10,
                  showStatus: false,
                }),
                isNotLastItem(idx, all) && h(Divider, { padding: 4 }),
              ]
            )
          }),
        ]),
      ]),
    ]
  )
}

OppView.displayName = "OppView"
