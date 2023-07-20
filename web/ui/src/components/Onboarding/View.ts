import { HStack, IconButton, Link, Spinner, Text } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { a, form, span } from "@cycle/react-dom"
import { snakeCase } from "change-case"
import { Ref } from "react"
import { FaFacebook, FaTwitter } from "react-icons/fa"
import { ProfileProp } from "~/graph"
import {
  ariaLabel,
  Button,
  Center,
  Heading,
  Input,
  InputGroup,
  Stack,
  twitterBlue,
  TwitterIcon,
} from "~/system"

const size = "lg"

export interface Props {
  attr: string
  onChangeInput: (text: string) => void
  isSubmitButtonDisabled: boolean
  isInputDisabled: boolean
  onSubmit: () => void
  isLoading: boolean
  headingCopy: string
  inputPlaceholder: string
  submitButtonCopy: string
  formRef?: Ref<HTMLFormElement>
  inputRef?: Ref<HTMLInputElement>
  buttonRef?: Ref<HTMLButtonElement>
  onClickAuthTwitter: () => void
  onClickAuthFacebook: () => void
  authPending?: boolean
}

export const View = ({
  attr,
  onChangeInput,
  isSubmitButtonDisabled,
  isInputDisabled,
  onSubmit: _onSubmit,
  isLoading,
  headingCopy,
  inputPlaceholder,
  submitButtonCopy,
  inputRef,
  formRef,
  buttonRef,
  onClickAuthTwitter,
  onClickAuthFacebook,
  authPending = false,
}: Props) => {
  const key = `input-${attr}`
  const onSubmit: React.FormEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault()
    _onSubmit()
  }
  const onChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const { value } = e.currentTarget
    onChangeInput(value)
  }
  return h(Center, { key, width: "100%", height: "100%" }, [
    form({ onSubmit, ref: formRef }, [
      h(Center, { width: "100vw", height: "100vh" }, [
        h(Stack, { direction: "column", align: "center", gap: 2 }, [
          h(Heading, { size }, headingCopy),
          h(InputGroup, { size, key: `group-${attr}` }, [
            h(Input, {
              ref: inputRef,
              type: attr === ProfileProp.Email ? "email" : null,
              autoFocus: true,
              placeholder: inputPlaceholder,
              isRequired: true,
              onChange,
              isDisabled: isInputDisabled,
              ...ariaLabel(snakeCase(attr)),
            }),
          ]),
          h(
            Button,
            {
              ref: buttonRef,
              isDisabled: isSubmitButtonDisabled,
              size,
              width: "100%",
              isLoading,
              type: "submit",
              ...ariaLabel(submitButtonCopy),
            },
            submitButtonCopy
          ),
          // Twitter auth
          h(
            Stack,
            {
              direction: "column",
              align: "center",
              pt: 4,
              spacing: 4,
              // NOTE: min-height to prevent spinner resizing/moving other eles
              minHeight: "100px",
            },
            [
              h(Text, { fontSize: "md", fontStyle: "italic" }, "or"),
              authPending
                ? h(Spinner, { size: "md", color: twitterBlue })
                : h(HStack, { alignItems: "center" }, [
                    h(Text, { fontSize: "lg" }, "Onboard with "),
                    h(
                      Button,
                      {
                        //
                        leftIcon: h(TwitterIcon),
                        variant: "outline",
                        size: "md",
                        onClick: onClickAuthTwitter,
                      },
                      "Twitter"
                    ),
                    // TODO: add facebook once deletion supported
                    false &&
                      h(
                        Button,
                        {
                          //
                          size: "md",
                          variant: "outline",
                          colorScheme: "facebook",
                          leftIcon: h(FaFacebook),
                          borderColor: "gray.200",
                          onClick: onClickAuthFacebook,
                        },
                        "Facebook"
                      ),
                  ]),
            ]
          ),
        ]),
      ]),
    ]),
  ])
}
