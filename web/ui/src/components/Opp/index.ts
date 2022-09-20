import {
  HStack,
  Icon,
  Spacer,
  StackProps,
  Tag,
  TagLabel,
  Text,
  VStack,
} from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { TbArrowsSplit2 } from "react-icons/tb"
import { Customer, Maybe, Opp, oppAriaLabel } from "~/graph"
import { formatMoney } from "~/i18n"
import {
  ariaLabel,
  AriaTooltip,
  bold,
  Button,
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
  const isOwner = opp.owner.id === viewer?.id
  const feeFormatted = formatMoney(fee)
  return h(FullWidthVStack, { ...props }, [
    h(
      HStack,
      {
        width: "100%",
        alignItems: "start",
        ...ariaLabel(oppAriaLabel(opp)),
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
            h(MarkdownView, {
              md: `${bold(role)}`,
              ...ariaLabel(`role:${role}`),
            }),
            h(MarkdownView, { md: `${i(org)}`, ...ariaLabel(`org:${org}`) }),
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
                    { pl: 2, ...ariaLabel(`reward:${feeFormatted}`) },
                    feeFormatted
                  ),
                ]
              ),
            ]),
            isOwner &&
              h(
                Button,
                {
                  ...ariaLabel("Pay Reward"),
                  size: "sm",
                  colorScheme: "green",
                },
                `Reward referrer`
              ),
          ]),
      ]
    ),
    desc &&
      h(Text, { ...ariaLabel(`desc:${desc}`), size: "md", noOfLines: 1 }, desc),
  ])
}

OppView.displayName = "OppView"
