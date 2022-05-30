import {
  Button,
  Divider,
  IconButton,
  InputLeftAddon,
  Link,
  Textarea,
} from "@chakra-ui/react"
import { h } from "@cycle/react"
import { CreatableSelect, ChakraStylesConfig } from "chakra-react-select"
import { SmallAddIcon, AddIcon } from "@chakra-ui/icons"
import { Heading, Stack, Center, InputGroup } from "~/system"

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
        h(InputGroup, [
          h(CreatableSelect, {
            placeholder: "With whom?",
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
            formatCreateLabel: (inputValue) => `Add contact: "${inputValue}"`,
            // @ts-ignore
            onChange: (newValue, _meta) => onSelect(newValue),
            options,
            noOptionsMessage: (_inputValue) => "No results.",
          }),
        ]),
      ]),
      // TODO: optional, editable fields for when / where
      h(Stack, { direction: "column", alignItems: "start", width: "100%" }, [
        h(Stack, { direction: "column", alignItems: "start", width: "100%" }, [
          h(Textarea, {
            size,
            placeholder: "What did you learn?\nLinks, notes, etc.",
          }),
          // TODO: embed helpers: opp, links, ?
          // h(Stack, { direction: "row", alignItems: "start", width: "100%" }, [
          //   h(Link, { justifySelf: "left" }, `Add opportunity`),
          // ]),
        ]),
        // end of note units
        h(Divider, {}),
        h(
          Stack,
          {
            width: "100%",
            direction: "row",
            justifyContent: "end",
          },
          [
            h(Stack, { direction: "row" }, [
              h(IconButton, { icon: h(SmallAddIcon) }),
              h(Button, {}, `Save`),
            ]),
          ]
        ),
      ]),
    ]
  )
// ])
