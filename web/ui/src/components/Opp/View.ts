import {
  HStack,
  Icon,
  Spacer,
  Stack,
  StackProps,
  Tag,
  TagLabel,
  Text,
  VStack,
} from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { TbArrowsSplit2 } from "react-icons/tb"
import { BiDollar } from "react-icons/bi"
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
import { Location } from "~/components/App/Home/Opps"

const { VITE_FF_PAYMENT: isEnabledPayment } = process.env

export type OnClickPay = (opp: Opp) => void

export interface Props extends StackProps {
  location: Location
  viewer: Maybe<Customer>
  opp: Opp
  onClickPay?: OnClickPay
}

export const OppView: FC<Props> = ({
  location,
  viewer,
  opp,
  onClickPay,
  ...props
}) => {
  const { role, org, desc, fee } = opp
  const isOwner = opp.owner.id === viewer?.id
  const feeFormatted = formatMoney(fee)
  const onClickPayReward = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    if (onClickPay) onClickPay(opp)
  }
  const notModal = location !== Location.modal
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
          h(
            Stack,
            { alignItems: "end", padding: 2, direction: "row-reverse" },
            [
              isOwner &&
                notModal &&
                isEnabledPayment &&
                h(
                  Button,
                  {
                    onClick: onClickPayReward,
                    ...ariaLabel("Payout Reward"),
                    size: "xs",
                    colorScheme: "green",
                    variant: "solid",
                    leftIcon: h(Icon, { as: BiDollar }),
                  },
                  `Pay Reward`
                ),
              h(AriaTooltip, { label: "Reward", placement: "left" }, [
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
            ]
          ),
      ]
    ),
    desc &&
      h(Text, { ...ariaLabel(`desc:${desc}`), size: "md", noOfLines: 1 }, desc),
  ])
}

OppView.displayName = "OppView"
