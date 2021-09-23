import { h } from "@cycle/react"
import React from "react"
import {
  InputAddon,
  Button,
  Center,
  Stack,
  Heading,
  Input,
  InputGroup,
} from "~/system"
import { t } from "~/i18n"

const size = "lg"

interface Props {
  phone: string
  onChangePhone: React.ChangeEventHandler<HTMLInputElement>
  isDisabled: boolean
  onSubmit: React.FormEventHandler<HTMLButtonElement>
  isLoading: boolean
}
export const View = ({
  phone,
  onChangePhone,
  isDisabled,
  onSubmit,
  isLoading,
}: Props) =>
  h(Center, { width: "100vw", height: "100vh" }, [
    h(Stack, { direction: "column", align: "center", margin: "4" }, [
      // TODO: back button? nav?
      h(Heading, { size }, t("auth.tel.entry.cta")),
      // TODO: focus on first render
      h(InputGroup, { size }, [
        // TODO: support int'l country codes
        h(InputAddon, { children: "+1" }),
        h(Input, {
          type: "tel",
          placeholder: t("auth.tel.entry.placeholder"),
          isRequired: true,
          pattern: "[0-9]{3}-[0-9]{3}-[0-9]{4}",
          value: phone,
          onChange: onChangePhone,
        }),
      ]),
      h(
        Button,
        { isDisabled, size, width: "100%", onSubmit, isLoading },
        t(`auth.tel.entry.submit`)
      ),
    ]),
  ])
