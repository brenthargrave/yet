import { SmallAddIcon } from "@chakra-ui/icons"
import { Button, Divider, IconButton } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { CreatableSelect } from "chakra-react-select"
import { Props as NoteProps, View as NoteView } from "~/components/Note/Draft"
import { Heading, InputGroup, Stack } from "~/system"

export interface Option {
  value: string
  label: string
}

export interface Props {
  options: Option[]
  onSelect: (option: Option) => void
  onCreateOption: (value: string) => void
  notes?: NoteProps[]
}

const size = "md"

export const View = ({ options, onSelect, onCreateOption, notes }: Props) =>
  h(
    Stack,
    {
      direction: "column",
      align: "start",
      justifyContent: "flex-start",
      padding: "4",
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
            onCreateOption,
            options,
            noOptionsMessage: (_inputValue) => "No results.",
          }),
        ]),
      ]),
      // TODO: optional, editable fields for when / where
      h(Stack, { direction: "column", alignItems: "start", width: "100%" }, [
        ...(notes || []).map(({ value, ...props }, idx, notesProps) =>
          h(NoteView, { value })
        ),
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
