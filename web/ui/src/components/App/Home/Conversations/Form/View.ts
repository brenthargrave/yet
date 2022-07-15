import { Divider, Spacer } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { BackButton, Header, Stack } from "~/system"
import { Props as ActionBarProps, View as ActionBar } from "./ActionBar"
import { DeleteButton } from "./DeleteButton"
import { NoteEditor } from "./NoteEditor"
import { When } from "./When"
import { Props as WhoProps, View as Who } from "./Who"

export type Props = {
  note?: string | null
  onChangeNote: (note: string) => void
  isSyncing?: boolean
  onClickBack?: () => void
  onClickDelete?: () => void
  isDeleting?: boolean
  isDeleteDisabled?: boolean
  occurredAt: Date
  onChangeOccurredAt: (date: Date) => void
} & WhoProps &
  ActionBarProps

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
      h(Header, [
        h(BackButton, {
          onClick: onClickBack,
        }),
        h(Spacer),
        h(DeleteButton, {
          onClick: onClickDelete,
          isLoading: isDeleting,
          isDisabled: isDeleteDisabled,
        }),
      ]),
      h(Stack, { direction: "column", width: "100%", padding: 4 }, [
        h(When, {
          date: occurredAt,
          onChangeDate: onChangeOccurredAt,
        }),
        h(Who, { onSelect, options, selectedOptions }),
        h(NoteEditor, { note, onChangeNote }),
        h(Divider, {}),
        h(ActionBar, { isShareDisabled }),
      ]),
    ]
  )
