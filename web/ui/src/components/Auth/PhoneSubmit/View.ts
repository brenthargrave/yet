import { Flex, Select } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { form, option } from "@cycle/react-dom"
import { countryPhoneData } from "phone"
import { pluck, uniq } from "ramda"
import { useMemo, ChangeEventHandler } from "react"
import { useEffectOnce } from "react-use"
import RestrictedInput from "restricted-input"
import { t } from "~/i18n"
import {
  ariaLabel,
  Button,
  Center,
  Heading,
  Input,
  InputAddon,
  InputGroup,
  Stack,
} from "~/system"

const size = "lg"
export const COUNTRY_CODE_DEFAULT = "1"

export interface Props {
  onChangePhoneInput: (text: string) => void
  onChangeCountryCode: (text: string) => void
  isSubmitButtonDisabled: boolean
  isPhoneInputDisabled: boolean
  onSubmit: () => void
  isLoading: boolean
}

export const View = ({
  onChangePhoneInput,
  onChangeCountryCode,
  isSubmitButtonDisabled,
  isPhoneInputDisabled,
  onSubmit: _onSubmit,
  isLoading,
}: Props) => {
  const onSubmit: React.FormEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault()
    _onSubmit()
  }

  const phoneInputId = "phone-number"
  const phoneInputHandler: ChangeEventHandler<HTMLInputElement> = (e) => {
    const { value } = e.currentTarget
    onChangePhoneInput(value)
  }

  const countryCodeHandler: ChangeEventHandler<HTMLInputElement> = (e) => {
    const { value } = e.currentTarget
    onChangeCountryCode(value)
  }

  useEffectOnce(() => {
    // TODO: extract react-compat format function from RestrictedInput
    // eslint-disable-next-line
    const element = document.querySelector(`#${phoneInputId}`)!
    // eslint-disable-next-line
    const input = new RestrictedInput({
      // @ts-ignore
      element,
      pattern: "({{999}}) {{999}}-{{9999}}",
    })
    // @ts-ignore
    element.addEventListener("input", phoneInputHandler, false)
  })

  const countryCodes = useMemo(() => {
    let codes = pluck("country_code", countryPhoneData).map(Number)
    codes = uniq(codes)
    codes = codes.sort((a, b) => a - b)
    return codes.map(String)
  }, [countryPhoneData])

  return h(Center, { width: "100vw", height: "100vh" }, [
    form({ onSubmit }, [
      h(Stack, { direction: "column", align: "center", gap: 2 }, [
        h(Heading, { size }, t("auth.tel.entry.cta")),
        h(Flex, { direction: "row" }, [
          h(
            InputGroup,
            {
              //
              size,
              flexShrink: 2,
            },
            [
              h(InputAddon, {
                //
                width: "40px",
                children: "+",
                // border: "none",
                // backgroundColor: "white",
              }),
              h(
                Select,
                {
                  selected: COUNTRY_CODE_DEFAULT,
                  onChange: countryCodeHandler,
                  width: "90px",
                },
                [...countryCodes.map((code) => h(option, code))]
              ),
            ]
          ),
          h(Input, {
            size,
            grow: 2,
            id: "phone-number",
            ...ariaLabel("phone number"),
            autoFocus: true,
            isRequired: true,
            onChange: phoneInputHandler,
            isDisabled: isPhoneInputDisabled,
          }),
        ]),
        h(
          Button,
          {
            isDisabled: isSubmitButtonDisabled,
            size,
            width: "100%",
            isLoading,
            type: "submit",
            ...ariaLabel(t(`auth.tel.entry.submit`)),
          },
          t(`auth.tel.entry.submit`)
        ),
      ]),
    ]),
  ])
}
