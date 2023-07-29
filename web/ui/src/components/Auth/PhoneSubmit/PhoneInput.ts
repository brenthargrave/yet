// https://github.com/goveo/react-international-phone/blob/master/src/stories/UiLibsExample/components/ChakraPhone.tsx
import { Button, ChakraProvider, Input } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { div } from "@cycle/react-dom"
import { FC } from "react"
import { CountrySelector, usePhoneInput } from "react-international-phone"
import { ariaLabel } from "~/system"

interface Props {
  value: string | undefined
  onChange: (phone: string) => void
  isPhoneInputDisabled?: boolean
}

export const PhoneInput: FC<Props> = ({
  // value,
  onChange,
  isPhoneInputDisabled = true,
}) => {
  const phoneInput = usePhoneInput({
    defaultCountry: "us",
    // value,
    onChange: (data) => {
      onChange(data.phone)
    },
  })
  return h(ChakraProvider, [
    div(
      {
        style: {
          display: "flex",
          alignItems: "center",
        },
      },
      [
        h(CountrySelector, {
          selectedCountry: phoneInput.country,
          onSelect: (country) => phoneInput.setCountry(country.iso2),
          renderButtonWrapper: ({ children, rootProps }) =>
            h(
              Button,
              {
                ...rootProps,
                variant: "outline",
                px: "4px",
                mr: "8px",
              },
              [children]
            ),
        }),
        h(Input, {
          placeholder: "Phone",
          type: "tel",
          color: "primary",
          value: phoneInput.phone,
          onChange: phoneInput.handlePhoneValueChange,
          width: 200,
          ref: phoneInput.inputRef,
          // additions
          id: "phone-number",
          ...ariaLabel("phone number"),
          autoFocus: true,
          isRequired: true,
          isDisabled: isPhoneInputDisabled,
        }),
      ]
    ),
  ])
}
