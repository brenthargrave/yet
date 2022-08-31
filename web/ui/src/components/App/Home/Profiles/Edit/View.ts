import { CheckIcon, ViewIcon } from "@chakra-ui/icons"
import { Icon } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { form } from "@cycle/react-dom"
import { FC } from "react"
import {
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
} from "~/system"
import { CancelButton } from "~/system/CancelButton"
import { InputControl } from "~/system/InputControl"

type Callback = (value: string) => void
const makeOnChange =
  (cb?: Callback): React.ChangeEventHandler<HTMLInputElement> =>
  (e) => {
    const { value } = e.currentTarget
    if (cb) cb(value)
  }

export interface Props {
  isDisabledSubmit?: boolean
  onChangeName?: () => void
  defaultValueName?: string
  onSubmit?: () => void
  onCancel?: () => void
  onClickBack?: () => void
  onClickShow?: () => void
}

export const View: FC<Props> = ({
  onChangeName,
  defaultValueName,
  isDisabledSubmit = true,
  onSubmit: _onSubmit,
  onCancel,
  onClickBack,
  onClickShow,
  ...props
}) => {
  const onSubmit: React.FormEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault()
    if (_onSubmit) _onSubmit()
  }
  return h(FullWidthVStack, { ...containerProps }, [
    h(Nav, { onClickBack, backButtonText: "Opps" }),
    h(Header, [
      h(Heading, { size: "md" }, `Profile`),
      h(Spacer),
      false &&
        h(
          Button,
          {
            leftIcon: h(Icon, { as: ViewIcon }),
            size: "xs",
            onClick: onClickShow,
          },
          `View`
        ),
    ]),
    form({ id: "edit", onSubmit, style: { width: "100%" } }, [
      h(Stack, { direction: "column", width: "100%", gap: 2 }, [
        h(InputControl, { label: "Name", isRequired: true }, [
          h(Input, {
            autoFocus: true,
            defaultValue: defaultValueName,
            onChange: makeOnChange(onChangeName),
            placeholder: "Cofounder, Engineer, Designer, etc.",
          }),
        ]),
        h(Stack, { direction: "column", paddingTop: 2 }, [
          h(Divider),
          h(Stack, { direction: "row", alignItems: "center" }, [
            h(
              Button,
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
            h(CancelButton, { onCancel }),
          ]),
        ]),
      ]),
    ]),
  ])
}
