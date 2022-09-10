import {
  HStack,
  Icon,
  Spacer,
  Tag,
  TagLabel,
  Text,
  VStack,
  StackProps,
  Tooltip,
} from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { TbArrowsSplit2 } from "react-icons/tb"
import { Customer, Maybe, Opp } from "~/graph"
import { formatMoney } from "~/i18n"
import {
  ariaLabel,
  AriaTooltip,
  bold,
  FullWidthVStack,
  i,
  MarkdownView,
} from "~/system"

export interface Props extends StackProps {
  viewer: Maybe<Customer>
  opp: Opp
}

export const OppView: FC<Props> = ({ viewer, opp, ...props }) => {
  const { role, org, desc, fee } = opp
  return h(FullWidthVStack, { ...props }, [
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
          h(AriaTooltip, { label: "Reward" }, [
            h(
              Tag,
              {
                variant: "outline",
                colorScheme: "green",
              },
              [
                h(Icon, { as: TbArrowsSplit2 }),
                h(
                  TagLabel,
                  { pl: 2, ...ariaLabel(formatMoney(fee)) },
                  formatMoney(fee)
                ),
              ]
            ),
          ]),
        ]),
    ]),
    desc && h(Text, { size: "md", noOfLines: 1 }, desc),
  ])
}

OppView.displayName = "OppView"
