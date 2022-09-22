import { CheckIcon, ViewIcon } from "@chakra-ui/icons"
import { HStack, Icon, VStack } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { form } from "@cycle/react-dom"
import { FC } from "react"
import { match } from "ts-pattern"
import { Money, Opp, Profile } from "~/graph"
import {
  AutosizeTextarea,
  Button,
  Divider,
  FullWidthVStack,
  Header,
  Heading,
  Input,
  Nav,
  Spacer,
  Stack,
  containerProps,
  ariaLabel,
  AriaButton,
  EditButton,
  Text,
  MarkdownView,
} from "~/system"
import { CancelButton } from "~/system/CancelButton"
import { InputControl } from "~/system/InputControl"
import { MoneyInput } from "~/components/App/Home/Opps/Single/Form/MoneyInput"

export interface Props {
  onChangeAmount?: (money: Money) => void
  opp: Opp
  defaultAmount?: Money
  isAmountInvalid?: boolean
  isDisabledSubmit?: boolean
  payee: Profile
  onChangePayee?: () => void
  onSubmit?: () => void
  // onCancel?: () => void
  onClickBack?: () => void
  // onClickShow?: () => void
}

export const AMOUNT_MIN = 1

export const View: FC<Props> = ({
  opp,
  onChangeAmount,
  defaultAmount,
  payee,
  onChangePayee,
  isAmountInvalid = true,
  isDisabledSubmit = true,
  onSubmit: _onSubmit,
  // onCancel,
  onClickBack,
  // onClickShow,
  ...props
}) => {
  const onSubmit: React.FormEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation()
    // if (_onSubmit) _onSubmit()
  }
  const {
    fee: { amount, currency },
  } = opp
  return h(FullWidthVStack, { ...containerProps }, [
    h(Nav, { onClickBack, backButtonText: "Back" }),
    h(Header, [h(Heading, { size: "md" }, "Payment"), h(Spacer)]),
    h(FullWidthVStack, { isBody: true }, [
      form({ id: "create", onSubmit, style: { width: "100%" } }, [
        h(Stack, { direction: "column", width: "100%", gap: 2 }, [
          h(HStack, { gap: 4 }, [
            h(MarkdownView, { md: `to **${payee.name}**` }),
            h(EditButton, { cta: "Change", onClick: onChangePayee }),
          ]),
          h(MarkdownView, { md: `for **${opp.role} (${opp.org})**` }),
          h(Stack, { direction: "column", gap: 2, paddingTop: 2 }, [
            h(Divider),
            h(VStack, { width: "40%", alignItems: "start" }, [
              h(
                InputControl,
                {
                  label: "Amount ",
                  isRequired: true,
                  // TODO: dynamic currency symbols
                  helperMessage: `Opp advertised: $${amount}`,
                  ...(isAmountInvalid && {
                    errorMessage: `$${AMOUNT_MIN} minimum`,
                  }),
                },
                [
                  h(MoneyInput, {
                    ...ariaLabel("Amount"),
                    onChange: onChangeAmount,
                    money: defaultAmount,
                  }),
                ]
              ),
            ]),
            h(Stack, { direction: "row", alignItems: "center" }, [
              //
              h(
                AriaButton,
                {
                  type: "submit",
                  // leftIcon: h(PlusSquareIcon),
                  // leftIcon: h(CheckIcon),
                  size: "md",
                  isDisabled: isDisabledSubmit,
                },
                "Make Payment"
              ),
              h(Spacer),
              // h(CancelButton, { onCancel }),
            ]),
          ]),
        ]),
      ]),
    ]),
  ])
}
