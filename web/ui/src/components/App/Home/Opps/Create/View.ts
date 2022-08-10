import { h } from "@cycle/react"
import {
  ChevronLeftIcon,
  SmallCloseIcon,
  CheckIcon,
  PlusSquareIcon,
  DeleteIcon,
} from "@chakra-ui/icons"
import { form } from "@cycle/react-dom"
import {
  Divider,
  Button,
  IconButton,
  AutosizeTextarea,
  BackButton,
  Header,
  Heading,
  Input,
  InputGroup,
  Spacer,
  Stack,
  Text,
} from "~/system"

export interface Props {
  showNav?: boolean
  onChangeOrg?: () => void
  defaultValueOrg?: string
  onChangeRole?: () => void
  defaultValueRole?: string
  onChangeDesc?: () => void
  defaultValueDesc?: string
  isDisabledSubmit?: boolean
  onSubmit?: () => void
}

export const View = ({
  showNav = false,
  onChangeOrg,
  defaultValueOrg,
  onChangeRole,
  defaultValueRole,
  onChangeDesc,
  defaultValueDesc,
  isDisabledSubmit = true,
  onSubmit: _onSubmit,
  ...props
}: Props) => {
  const onSubmit: React.FormEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault()
    if (_onSubmit) _onSubmit()
  }
  return h(
    Stack,
    {
      direction: "column",
      align: "start",
      justifyContent: "flex-start",
    },
    [
      // only display nav from Home
      showNav &&
        h(Header, [
          h(BackButton, {
            onClick: () => null, // onClickBack,
          }),
          h(Spacer),
        ]),
      h(Header, [h(Heading, { size: "md" }, "Opportunity"), h(Spacer)]),
      form({ onSubmit, style: { width: "100%" } }, [
        h(Stack, { direction: "column", width: "100%", padding: 4, gap: 4 }, [
          // TODO: org
          h(Stack, { direction: "column" }, [
            h(Text, "Organization:"),
            h(InputGroup, [
              h(Input, {
                defaultValue: defaultValueOrg,
                onChange: onChangeOrg,
                autoFocus: true,
                placeholder: "Company, school, club, family, etc.",
                required: true,
              }),
            ]),
          ]),
          h(Stack, { direction: "column" }, [
            h(Text, "Role:"),
            h(InputGroup, [
              // TODO: populate placeholder w/ most popular
              h(Input, {
                defaultValue: defaultValueRole,
                onChange: onChangeRole,
                required: true,
                placeholder: "Engineer, etc.",
              }),
            ]),
          ]),
          h(Stack, { direction: "column" }, [
            h(Text, "Description:"),
            h(InputGroup, [
              h(AutosizeTextarea, {
                defaultValue: defaultValueDesc,
                onChange: onChangeDesc,
                minRows: 2,
                placeholder: "Optional",
              }),
            ]),
          ]),
          h(Stack, { direction: "column" }, [
            // h(Divider),
            h(Stack, { direction: "row" }, [
              //
              h(
                Button,
                {
                  leftIcon: h(PlusSquareIcon),
                  size: "md",
                  isDisabled: isDisabledSubmit,
                },
                "Save"
              ),
              h(Spacer),
              h(
                Button,
                {
                  variant: "ghost",
                  // leftIcon: h(DeleteIcon),
                  // leftIcon: h(ChevronLeftIcon),
                  leftIcon: h(SmallCloseIcon),
                  size: "sm",
                },
                "Cancel"
              ),
            ]),
          ]),
        ]),
      ]),
    ]
  )
}
