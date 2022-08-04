import { h } from "@cycle/react"
import { CreatableSelect } from "chakra-react-select"
import { FC } from "react"
import { InputGroup, Stack, lightGray } from "~/system"

export interface Option {
  value: string
  label: string
  __isNew__?: boolean
}

export type SelectedOption = Omit<Option, "__isNew__">

export interface Props {
  autoFocus?: boolean
  options?: Option[]
  onSelect: (option: Option) => void
  selectedOptions?: SelectedOption[]
  isDisabled?: boolean
}

export const View: FC<Props> = ({
  autoFocus = true,
  options = [],
  selectedOptions = [],
  onSelect,
  isDisabled = false,
}) =>
  h(Stack, { direction: "row", alignItems: "center", width: "100%" }, [
    h(InputGroup, [
      h(CreatableSelect, {
        isDisabled,
        placeholder: "With whom?",
        autoFocus,
        size: "md",
        chakraStyles: {
          container: (provided, state) => ({
            ...provided,
            width: "100%",
          }),
          multiValue: (provided, state) => {
            return {
              ...provided,
              ...(state.isDisabled && {
                backgroundColor: lightGray,
                color: "black",
              }),
            }
          },
        },
        isClearable: false,
        isMulti: true,
        createOptionPosition: "first",
        formatCreateLabel: (inputValue) => `Add contact: "${inputValue}"`,
        // @ts-ignore
        onChange: (newValue, _meta) => onSelect(newValue),
        options,
        noOptionsMessage: (_inputValue) => "No results.",
        value: selectedOptions.map((value) => ({
          ...value,
          isFixed: isDisabled,
        })),
      }),
    ]),
  ])

View.displayName = "Who"
