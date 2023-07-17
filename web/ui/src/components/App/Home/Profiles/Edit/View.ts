import { CheckIcon, ViewIcon } from "@chakra-ui/icons"
import { Icon } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { form } from "@cycle/react-dom"
import { FC, ReactNode } from "react"
import {
  Button,
  containerProps,
  Divider,
  FullWidthVStack,
  Header,
  Heading,
  Nav,
  Spacer,
  Stack,
} from "~/system"
import { CancelButton } from "~/system/CancelButton"

export interface Props {
  isDisabledSubmit?: boolean
  onSubmit?: () => void
  onCancel?: () => void
  onClickShow?: () => void
  isSaving?: boolean
  firstNameInput: ReactNode
  lastNameInput: ReactNode
}

export const View: FC<Props> = ({
  isDisabledSubmit = true,
  onSubmit: _onSubmit,
  onCancel,
  onClickShow,
  isSaving = false,
  firstNameInput,
  lastNameInput,
  ...props
}) => {
  const onSubmit: React.FormEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault()
    if (_onSubmit) _onSubmit()
  }
  return h(FullWidthVStack, { ...containerProps }, [
    h(Nav, {
      /* onClickBack, backButtonText: "Home" */
    }),
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
    h(FullWidthVStack, { isBody: true }, [
      form({ id: "edit", onSubmit, style: { width: "100%" } }, [
        h(Stack, { direction: "column", width: "100%", gap: 2 }, [
          firstNameInput,
          lastNameInput,
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
                  isLoading: isSaving,
                },
                "Save"
              ),
              h(Spacer),
              h(CancelButton, { onCancel, isDisabled: isSaving }),
            ]),
          ]),
        ]),
      ]),
    ]),
  ])
}
