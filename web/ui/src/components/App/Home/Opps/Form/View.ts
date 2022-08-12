import { h } from "@cycle/react"
import {
  ChevronLeftIcon,
  SmallCloseIcon,
  CheckIcon,
  PlusSquareIcon,
  DeleteIcon,
} from "@chakra-ui/icons"
import { form } from "@cycle/react-dom"
import { match } from "ts-pattern"
import { HStack, InputLeftAddon, VStack } from "@chakra-ui/react"
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
  InputLeftElement,
} from "~/system"
import { MoneyInput } from "./MoneyInput"
import { Money } from "~/graph"

type Callback = (value: string) => void
const makeOnChange =
  (cb?: Callback): React.ChangeEventHandler<HTMLInputElement> =>
  (e) => {
    const { value } = e.currentTarget
    if (cb) cb(value)
  }

export enum Target {
  create = "create",
  edit = "edit",
}

const headerCopy = (target: Target) =>
  match(target)
    .with(Target.create, () => "Opportunity")
    .with(Target.edit, () => "Opportunity")
    .exhaustive()

export interface Props {
  target?: Target
  showNav?: boolean
  onChangeOrg?: () => void
  defaultValueOrg?: string
  onChangeRole?: () => void
  defaultValueRole?: string
  onChangeDesc?: () => void
  defaultValueDesc?: string | null
  onChangeFee?: (money: Money) => void
  defaultValueFee?: Money
  isDisabledSubmit?: boolean
  onSubmit?: () => void
  onCancel?: () => void
}

export const View = ({
  target = Target.create,
  showNav = false,
  onChangeOrg,
  defaultValueOrg,
  onChangeRole,
  defaultValueRole,
  onChangeDesc,
  defaultValueDesc,
  onChangeFee,
  defaultValueFee,
  isDisabledSubmit = true,
  onSubmit: _onSubmit,
  onCancel,
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
      h(Header, [
        //
        h(Heading, { size: "md" }, headerCopy(target)),
        h(Spacer),
      ]),
      form({ onSubmit, style: { width: "100%" } }, [
        h(Stack, { direction: "column", width: "100%", padding: 4, gap: 4 }, [
          // TODO: org
          h(Stack, { direction: "column" }, [
            h(Text, "Organization:"),
            h(InputGroup, [
              h(Input, {
                defaultValue: defaultValueOrg,
                onChange: makeOnChange(onChangeOrg),
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
                onChange: makeOnChange(onChangeRole),
                required: true,
                placeholder: "Engineer, etc.",
              }),
            ]),
          ]),
          h(Stack, { direction: "column" }, [
            h(Text, "Short description:"),
            h(InputGroup, [
              // @ts-ignore
              h(AutosizeTextarea, {
                defaultValue: defaultValueDesc,
                // @ts-ignore
                onChange: makeOnChange(onChangeDesc),
                minRows: 2,
                placeholder: "Optional",
              }),
            ]),
          ]),
          h(Stack, { direction: "column", alignItems: "start" }, [
            h(VStack, { width: "40%", alignItems: "start" }, [
              h(Text, "Finder's fee:"),
              h(MoneyInput, {
                onChange: onChangeFee,
                money: defaultValueFee,
              }),
            ]),
          ]),
          h(Stack, { direction: "column", paddingTop: 2 }, [
            h(Divider),
            h(Stack, { direction: "row", alignItems: "center" }, [
              //
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
              h(
                Button,
                {
                  variant: "ghost",
                  // leftIcon: h(DeleteIcon),
                  leftIcon: h(ChevronLeftIcon),
                  // leftIcon: h(SmallCloseIcon),
                  size: "sm",
                  onClick: onCancel,
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
