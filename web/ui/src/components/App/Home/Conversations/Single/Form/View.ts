import { Box, Divider, Spacer, Tooltip } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { ReactNode } from "react"
import { isNotEmpty } from "~/fp"
import { ConversationStatus, ID, Invitee } from "~/graph"
import { routes, routeURL } from "~/router"
import {
  AriaHeading,
  containerProps,
  DeleteButton,
  FullWidthVStack,
  Header,
  Heading,
  Nav,
  ShareModal,
  Stack,
  Status,
} from "~/system"
import { ShareButton } from "../ShareButton"
import { InviteButton } from "./InviteButton"
import { InviteView } from "./InviteView"
import { SyncIcon } from "./SyncIcon"

export enum Mode {
  create = "create",
  edit = "edit",
}

export interface Props {
  onClickBack: () => void
  isSyncing: boolean
  status: ConversationStatus
  when: ReactNode
  who: ReactNode

  // delete
  onClickDelete: () => void
  isDeleting: boolean
  isDisabledDelete: boolean

  // invite
  inviteeNames: string[]
  onClickInvite: () => void
  isOpenInvite: boolean
  onCloseInvite: () => void
  knownInvitees: Invitee[]
  unknownInvitees: Invitee[]
  hasInvited?: boolean
  isInvitable?: boolean

  // share
  showShare?: boolean
  joinURL: string
  onShareURLCopied: () => void
  onClickShare: () => void
  onCloseShare: () => void
  isOpenShare: boolean
  id: ID

  // notes
  addButton: ReactNode
  notes: ReactNode

  // mode?: Mode
}

export const View = ({
  onClickBack,
  isSyncing = false,
  status = ConversationStatus.Draft,
  when,
  who,

  // delete
  onClickDelete,
  isDeleting = false,
  isDisabledDelete = true,

  // invite
  inviteeNames = [],
  onClickInvite,
  isOpenInvite = false,
  onCloseInvite,
  knownInvitees,
  unknownInvitees,
  hasInvited = false,
  isInvitable = false,

  // share
  showShare = false,
  joinURL,
  onShareURLCopied,
  onClickShare,
  onCloseShare,
  isOpenShare,
  id,

  // notes
  notes,
  addButton,

  // mode = Mode.create,
  ...props
}: Props) => {
  const key = `/c/${id}`
  return h(
    FullWidthVStack,
    {
      //
      ...containerProps,
      // @ts-ignore
      className: "conversation",
      ...(!!id && {
        key,
        id: key,
        // @ts-ignore
        "data-conversation-id": id,
      }),
    },
    [
      h(ShareModal, {
        isOpen: isOpenShare,
        onClose: onCloseShare,
        shareURL: routeURL(routes.conversation({ id })),
      }),
      h(InviteView, {
        isOpen: isOpenInvite,
        onClose: onCloseInvite,
        shareURL: joinURL,
        onShareURLCopied,
        onClickShareViaApp: onClickShare,
        knownInvitees,
        unknownInvitees,
        hasInvited,
      }),
      //
      h(Nav, { onClickBack, backButtonText: "Conversations" }),
      h(Header, [
        h(AriaHeading, { size: "md" }, "Conversation"),
        h(Spacer),
        h(SyncIcon, { boxSize: 4, syncing: isSyncing }),
        // ? TODO: hide status if note pending cosign instead?
        h(Status, { status }),
      ]),

      //
      h(Stack, { id: "edit", direction: "column", width: "100%", pt: 0 }, [
        when,
        who,
        notes,
        h(
          Stack,
          {
            //
            width: "100%",
            paddingTop: 2,
            direction: "column",
            alignItems: "start",
            spacing: 4,
          },
          [
            h(Divider),
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
                h(
                  Stack,
                  {
                    direction: "row",
                    justifyContent: "start",
                    alignItems: "start",
                    width: "100%",
                  },
                  [
                    // Invite
                    !showShare &&
                      h(InviteButton, {
                        inviteeNames,
                        isInvitable,
                        hasInvited,
                        onClick: onClickInvite,
                      }),
                    // Share
                    showShare &&
                      //
                      h(ShareButton, { onClickShare }),
                    // Add
                    addButton,
                    h(Spacer),
                    // Delete
                    !isDisabledDelete &&
                      h(DeleteButton, {
                        onClick: onClickDelete,
                        isLoading: isDeleting,
                        isDisabled: isDisabledDelete,
                      }),
                  ]
                ),
              ]
            ),
          ]
        ),
      ]),
    ]
  )
}
