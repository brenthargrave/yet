import { Divider, Spacer } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { ConversationStatus } from "~/graph"
import { BackButton, Header, Stack, Status } from "~/system"
import { Props as ActionBarProps, View as ActionBar } from "./ActionBar"
import { DeleteButton } from "./DeleteButton"
import { Props as NoteEditorProps, View as NoteEditor } from "./NoteEditor"
import { PublishView } from "./PublishView"
import { Props as WhenProps, View as When } from "./When"
import { Props as WhoProps, View as Who } from "./Who"

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
  onShareURLCopied?: () => void
  onClickShare: () => void
  status?: ConversationStatus
  isDisabledEditing?: boolean
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
  participantNames,
  isPublishDisabled = true,
  isOpenPublish = false,
  onClickPublish,
  onClosePublish,
  shareURL,
  onShareURLCopied,
  onClickShare,
  status = ConversationStatus.Draft,
  isDisabledEditing = false,
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
      h(Stack, { direction: "column", width: "100%", padding: 4, pt: 0 }, [
        h(
          Stack,
          { justifyContent: "start", direction: "row", width: "100%", p: 2 },
          [h(Status, { status })]
        ),
        h(When, {
          occurredAt,
          onChangeOccurredAt,
          isDisabled: isDisabledEditing,
        }),
        h(Who, {
          onSelect,
          options,
          selectedOptions,
          isDisabled: isDisabledEditing,
        }),
        h(NoteEditor, {
          status,
          note,
          onChangeNote,
          isDisabled: isDisabledEditing,
        }),
        h(Divider),
        h(ActionBar, {
          status,
          participantNames,
          isPublishDisabled,
          onClickPublish,
        }),
      ]),
      h(PublishView, {
        participantNames,
        isOpen: isOpenPublish,
        onClose: onClosePublish,
        shareURL,
        onShareURLCopied,
        onClickShareViaApp: onClickShare,
      }),
    ]
  )
