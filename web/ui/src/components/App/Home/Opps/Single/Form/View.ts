import { CheckIcon } from "@chakra-ui/icons"
import { FormControl, FormLabel, VStack } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { form } from "@cycle/react-dom"
import { FC } from "react"
import { match } from "ts-pattern"
import { Money } from "~/graph"
import {
  AutosizeTextarea,
  BackButton,
  Button,
  Divider,
  FullWidthVStack,
  Header,
  Heading,
  Input,
  Nav,
  Spacer,
  Stack,
} from "~/system"
import { CancelButton } from "./CancelButton"
import { InputControl } from "./InputControl"
import { MoneyInput } from "./MoneyInput"
import { UrlInput } from "./UrlInput"
import { Location } from ".."

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

const isHome = (location: Location) => location === Location.home

export interface Props {
  location: Location
  target?: Target
  onChangeOrg?: () => void
  defaultValueOrg?: string
  onChangeRole?: () => void
  defaultValueRole?: string
  onChangeDesc?: () => void
  defaultValueDesc?: string | null
  onChangeUrl?: () => void
  defaultValueUrl?: string | null
  onChangeFee?: (money: Money) => void
  defaultValueFee?: Money
  isDisabledSubmit?: boolean
  onSubmit?: () => void
  onCancel?: () => void
  onClickBack?: () => void
}

export const View: FC<Props> = ({
  location = Location.home,
  target = Target.create,
  onChangeOrg,
  defaultValueOrg,
  onChangeRole,
  defaultValueRole,
  onChangeDesc,
  defaultValueDesc,
  onChangeUrl,
  defaultValueUrl,
  onChangeFee,
  defaultValueFee,
  isDisabledSubmit = true,
  onSubmit: _onSubmit,
  onCancel,
  onClickBack,
  ...props
}) => {
  const onSubmit: React.FormEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault()
    if (_onSubmit) _onSubmit()
  }
  return h(FullWidthVStack, {}, [
    h(Nav, { onClickBack, backButtonText: "Opps" }),
    h(Header, [
      h(Heading, { size: "md" }, headerCopy(target)),
      h(Spacer),
      // h(Button),
      //
    ]),
    form({ id: "edit", onSubmit, style: { width: "100%" } }, [
      h(Stack, { direction: "column", width: "100%", gap: 2 }, [
        h(InputControl, { label: "Organization", isRequired: true }, [
          h(Input, {
            defaultValue: defaultValueOrg,
            onChange: makeOnChange(onChangeOrg),
            placeholder: "Company, school, club, family, etc.",
            autoFocus: true,
          }),
        ]),
        h(InputControl, { label: "Role", isRequired: true }, [
          h(Input, {
            defaultValue: defaultValueRole,
            onChange: makeOnChange(onChangeRole),
            placeholder: "Cofounder, Engineer, Designer, etc.",
          }),
        ]),
        h(InputControl, { label: "Description" }, [
          // @ts-ignore
          h(AutosizeTextarea, {
            defaultValue: defaultValueDesc,
            // @ts-ignore
            onChange: makeOnChange(onChangeDesc),
            minRows: 2,
          }),
        ]),
        h(InputControl, { label: "Canonical URL" }, [
          h(UrlInput, {
            onChange: onChangeUrl,
            defaultValue: defaultValueUrl,
          }),
        ]),
        h(VStack, { width: "40%", alignItems: "start" }, [
          h(InputControl, { label: "Finder's Fee" }, [
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
            h(CancelButton, { onCancel }),
          ]),
        ]),
      ]),
    ]),
  ])
}
