import { Divider, Spacer } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { BackButton, Header, Stack } from "~/system"
import { Props as ActionBarProps, View as ActionBar } from "./ActionBar"
import { DeleteButton } from "./DeleteButton"
import { View as NoteEditor, Props as NoteEditorProps } from "./NoteEditor"
import { View as When, Props as WhenProps } from "./When"
import { View as Who, Props as WhoProps } from "./Who"
import { View as PublishModal } from "./PublishView"

export type { Option, SelectedOption } from "./Who"

export interface Props
  extends WhenProps,
    NoteEditorProps,
    WhoProps,
    ActionBarProps {
  isSyncing?: boolean
  onClickBack?: () => void
  onClickDelete?: () => void
  isDeleting?: boolean
  isDeleteDisabled?: boolean
  isOpenPublish: boolean
  onClosePublish: () => void
  shareURL?: string
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
  occurredAt,
  onChangeOccurredAt,
  isPublishDisabled = true,
  isOpenPublish = false,
  onClickPublish,
  onClosePublish,
  shareURL,
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
        h(When, { occurredAt, onChangeOccurredAt }),
        h(Who, { onSelect, options, selectedOptions }),
        h(NoteEditor, { note, onChangeNote }),
        h(Divider, {}),
        h(ActionBar, { isPublishDisabled, onClickPublish }),
      ]),
      h(PublishModal, {
        isOpen: isOpenPublish,
        onClose: onClosePublish,
        shareURL,
      }),
    ]
  )
