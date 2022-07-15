import { h } from "@cycle/react"
import { CreatableSelect } from "chakra-react-select"
import { FC } from "react"
import { InputGroup, Stack } from "~/system"

export interface Option {
  value: string
  label: string
  __isNew__?: boolean
}

export type SelectedOption = Omit<Option, "__isNew__">

export interface Props {
  options: Option[]
  onSelect: (option: Option) => void
  selectedOptions: SelectedOption[]
}

export const View: FC<Props> = ({ options, selectedOptions, onSelect }) =>
  h(Stack, { direction: "row", alignItems: "center", width: "100%" }, [
    h(InputGroup, [
      h(CreatableSelect, {
        placeholder: "With whom?",
        autoFocus: true,
        size: "md",
        chakraStyles: {
          container: (provided, state) => ({
            ...provided,
            width: "100%",
          }),
        },
        isClearable: true,
        isMulti: true,
        createOptionPosition: "first",
        formatCreateLabel: (inputValue) => `Add contact: "${inputValue}"`,
        // @ts-ignore
        onChange: (newValue, _meta) => onSelect(newValue),
        options,
        noOptionsMessage: (_inputValue) => "No results.",
        value: selectedOptions,
      }),
    ]),
  ])

View.displayName = "Who"
