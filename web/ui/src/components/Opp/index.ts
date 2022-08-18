import {
  Stack,
  HStack,
  Spacer,
  Tag,
  VStack,
  Icon,
  TagLabel,
  Text,
} from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { TbArrowsSplit2 } from "react-icons/tb"
import { Opp } from "~/graph"
import { MarkdownView, bold, i } from "~/system"
import { formatMoney } from "~/i18n"

export interface Props {
  opp: Opp
}

export const OppView: FC<Props> = ({ opp }) => {
  const { role, org, desc, fee } = opp
  return h(
    Stack,
    {
      direction: "column",
      alignItems: "start",
      width: "100%",
      spacing: 1,
    },
    [
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
      ]),
      desc && h(Text, { size: "md", noOfLines: 1 }, desc),
    ]
  )
}

OppView.displayName = "OppView"
