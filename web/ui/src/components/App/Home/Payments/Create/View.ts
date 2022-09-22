import { CheckIcon, ViewIcon } from "@chakra-ui/icons"
import { Icon, VStack } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { form } from "@cycle/react-dom"
import { FC } from "react"
import { match } from "ts-pattern"
import { Money } from "~/graph"
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
} from "~/system"
import { CancelButton } from "~/system/CancelButton"
import { InputControl } from "~/system/InputControl"
import { MoneyInput } from "../../Opps/Single/Form/MoneyInput"

type Callback = (value: string) => void
const makeOnChange =
  (cb?: Callback): React.ChangeEventHandler<HTMLInputElement> =>
  (e) => {
    const { value } = e.currentTarget
    if (cb) cb(value)
  }

export interface Props {
  onChangeAmount?: (money: Money) => void
  defaultAmount?: Money
  isDisabledSubmit?: boolean
  onSubmit?: () => void
  // onCancel?: () => void
  onClickBack?: () => void
  // onClickShow?: () => void
}

export const View: FC<Props> = ({
  onChangeAmount,
  defaultAmount,
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
  return h(FullWidthVStack, { ...containerProps }, [
    h(Nav, { onClickBack, backButtonText: "Opps" }),
    h(Header, [h(Heading, { size: "md" }, "Payment"), h(Spacer)]),
    h(FullWidthVStack, { isBody: true }, [
      form({ id: "edit", onSubmit, style: { width: "100%" } }, [
        h(Stack, { direction: "column", width: "100%", gap: 2 }, [
          h(VStack, { width: "40%", alignItems: "start" }, [
            h(InputControl, { label: "Reward ", isRequired: true }, [
              h(MoneyInput, {
                ...ariaLabel("Reward"),
                onChange: onChangeAmount,
                money: defaultAmount,
              }),
            ]),
          ]),
          h(Stack, { direction: "column", paddingTop: 2 }, [
            h(Divider),
            h(Stack, { direction: "row", alignItems: "center" }, [
              //
              h(
                AriaButton,
                {
                  type: "submit",
                  // leftIcon: h(PlusSquareIcon),
                  leftIcon: h(CheckIcon),
                  size: "md",
                  isDisabled: isDisabledSubmit,
                },
                "Save"
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
