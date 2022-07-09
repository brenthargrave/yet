import { ChevronLeftIcon } from "@chakra-ui/icons"
import { Box, Button, Divider, IconButton, Spacer } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { CreatableSelect } from "chakra-react-select"
import { AutosizeTextarea, Heading, InputGroup, Stack } from "~/system"
import { DeleteButton } from "./DeleteButton"

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
  note?: string | null
  onChangeNote: (note: string) => void
  isSyncing?: boolean
  onClickBack?: () => void
  onClickDelete?: () => void
  isDeleting?: boolean
  isDeleteDisabled?: boolean
  isRecordReady?: boolean
}

const size = "md"

export const View = ({
  options,
  onSelect,
  selectedOptions,
  note,
  onChangeNote,
  isSyncing = false,
  onClickBack,
  onClickDelete,
  isDeleting = false,
  isDeleteDisabled = false,
  isRecordReady = true,
}: Props) =>
  h(
    Stack,
    {
      direction: "column",
      align: "start",
      justifyContent: "flex-start",
    },
    [
      h(
        Box,
        {
          display: "flex",
          direction: "row",
          alignItems: "flex-end",
          width: "100%",
          padding: 4,
        },
        [
          h(IconButton, {
            icon: h(ChevronLeftIcon),
            variant: "unstyled",
            onClick: onClickBack,
            size: "xs",
          }),
          h(Spacer),
          h(DeleteButton, {
            onClick: onClickDelete,
            isLoading: isDeleting,
            isDisabled: isDeleteDisabled,
          }),
        ]
      ),
      // TODO: Edit vs. New copy
      // ? how distinguish new conversation from old?
      h(Stack, { direction: "column", width: "100%", padding: 4 }, [
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
        ]),
        // TODO: optional fields for: when, where
        h(Stack, { direction: "column", alignItems: "start", width: "100%" }, [
          h(AutosizeTextarea, {
            minRows: 4,
            value: note || "",
            onChange: (event) => onChangeNote(event.target.value),
          }),
          h(Divider, {}),
          h(
            Box,
            {
              display: "flex",
              direction: "row",
              alignItems: "center",
              width: "100%",
              space: 4,
            },
            [
              h(Stack, { direction: "row" }, [
                h(
                  Button,
                  {
                    // isLoading: isSyncing,
                    isDisabled: isSyncing,
                  },
                  `Share`
                ),
              ]),
            ]
          ),
        ]),
      ]),
    ]
  )
