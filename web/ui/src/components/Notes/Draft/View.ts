import { h } from "@cycle/react"
import { CreatableSelect, ChakraStylesConfig } from "chakra-react-select"
import { Heading, Stack, Center } from "~/system"

export interface Option {
  value: string
  label: string
}

export interface Props {
  options: Option[]
  onSelect: (option: Option) => void
}

const size = "md"

export const View = ({ options, onSelect }: Props) =>
  // h(Center, { width: "100vw", height: "100vh" }, [
  h(
    Stack,
    {
      direction: "column",
      align: "start",
      margin: "4",
      justifyContent: "flex-start",
      gap: "2",
    },
    [
      h(Heading, { size: "lg" }, `Note a new conversation`),
      h(Stack, { direction: "row", alignItems: "center", width: "100%" }, [
        h(Heading, { size }, "with:"),
        h(CreatableSelect, {
          placeholder: "Dale Carnegie",
          autoFocus: true,
          size,
          chakraStyles: {
            container: (provided, state) => ({
              ...provided,
              width: "100%",
            }),
          },
          isClearable: true,
          createOptionPosition: "first",
          formatCreateLabel: (inputValue) => `New contact: "${inputValue}"`,
          // @ts-ignore
          onChange: (newValue, _meta) => onSelect(newValue),
          options,
        }),
      ]),
      // TODO: optional, editable fields for when / where
      h(Stack, { direction: "row", alignItems: "center", width: "100%" }, [
        h(Heading, { size }, "when"),
      ]),
    ]
  )
// ])
