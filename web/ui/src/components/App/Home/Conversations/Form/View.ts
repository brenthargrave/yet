import { ChevronLeftIcon } from "@chakra-ui/icons"
import {
  Box,
  Button,
  Divider,
  IconButton,
  InputLeftAddon,
  InputLeftElement,
  Spacer,
} from "@chakra-ui/react"
import { h } from "@cycle/react"
import { CreatableSelect } from "chakra-react-select"
import { AutosizeTextarea, InputGroup, Stack, BackButton } from "~/system"
import { DeleteButton } from "./DeleteButton"
import { When } from "./When"

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
  isShareDisabled?: boolean
  occurredAt: Date
  onChangeOccurredAt: (date: Date) => void
}

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
  isDeleteDisabled = true,
  isShareDisabled = true,
  occurredAt,
  onChangeOccurredAt,
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
          // alignItems: "flex-end",
          alignItems: "center",
          width: "100%",
          padding: 4,
        },
        [
          h(BackButton, {
            onClick: onClickBack,
          }),
          h(Spacer),
          h(DeleteButton, {
            onClick: onClickDelete,
            isLoading: isDeleting,
            isDisabled: isDeleteDisabled,
          }),
        ]
      ),
      h(Stack, { direction: "column", width: "100%", padding: 4 }, [
        // h(Heading, { size: "lg" }, `Note a new conversation`),
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
        ]),
        h(When, {
          date: occurredAt,
          onChangeDate: onChangeOccurredAt,
        }),
        h(Stack, { direction: "row", alignItems: "center", width: "100%" }, [
          h(AutosizeTextarea, {
            minRows: 4,
            defaultValue: note || "",
            onChange: (event) => onChangeNote(event.target.value),
          }),
        ]),
        h(Stack, { direction: "column", alignItems: "start", width: "100%" }, [
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
                    isDisabled: isShareDisabled,
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
