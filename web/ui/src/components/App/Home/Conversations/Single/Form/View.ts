import { Spacer, Tooltip } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { ReactNode, Ref } from "react"
import { isEmpty, not } from "~/fp"
import { ConversationStatus, Invitee } from "~/graph"
import {
  containerProps,
  FullWidthVStack,
  Header,
  Heading,
  Nav,
  Stack,
  Status,
} from "~/system"
import { Props as ActionBarProps, View as ActionBar } from "./ActionBar"
import { View as AddOppModal } from "./AddOppModal"
import { DeleteButton } from "./DeleteButton"
import { Props as NoteEditorProps, View as NoteEditor } from "./NoteEditor"
import { PublishView } from "./PublishView"
import { Props as WhenProps, View as When } from "./When"
import { Props as WhoProps, View as Who } from "./Who"

export type { Option, SelectedOption } from "./Who"

export enum Mode {
  create = "create",
  edit = "edit",
}

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
  knownInvitees?: Invitee[]
  unknownInvitees?: Invitee[]
  isOpenAddOpp?: boolean
  onClickAddOpp?: () => void
  onCloseAddOpp?: () => void
  oppsView: ReactNode
  noteInputRef?: Ref<HTMLTextAreaElement>
  mode?: Mode
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
  knownInvitees,
  unknownInvitees,
  isOpenAddOpp = false,
  onClickAddOpp,
  onCloseAddOpp: onCloseAddApp,
  oppsView,
  noteInputRef,
  mode = Mode.create,
  ...props
}: Props) =>
  h(FullWidthVStack, { ...containerProps }, [
    h(Nav, { onClickBack, backButtonText: "Conversations" }),
    h(Header, [
      h(Heading, { size: "md" }, "Conversation"),
      h(Spacer),
      h(Status, { status }),
    ]),
    h(Stack, { id: "edit", direction: "column", width: "100%", pt: 0 }, [
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
        autoFocus: isEmpty(selectedOptions),
      }),
      h(NoteEditor, {
        status,
        note,
        onChangeNote,
        onClickAddOpp,
        isDisabled: isDisabledEditing,
        noteInputRef,
      }),
      h(
        ActionBar,
        {
          status,
          participantNames,
          isPublishDisabled,
          onClickPublish,
          autoFocus: not(isEmpty(selectedOptions)),
        },
        [
          h(
            Tooltip,
            {
              shouldWrapChildren: true,
              label: "Disabled once shared",
              isDisabled: !isDeleteDisabled,
            },
            [
              h(DeleteButton, {
                onClick: onClickDelete,
                isLoading: isDeleting,
                isDisabled: isDeleteDisabled,
              }),
            ]
          ),
        ]
      ),
    ]),
    h(PublishView, {
      isOpen: isOpenPublish,
      onClose: onClosePublish,
      shareURL,
      onShareURLCopied,
      onClickShareViaApp: onClickShare,
      knownInvitees,
      unknownInvitees,
    }),
    h(AddOppModal, {
      isOpen: isOpenAddOpp,
      onClose: onCloseAddApp,
      oppsView,
    }),
  ])
