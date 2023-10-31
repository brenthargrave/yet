import { Divider } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC, ReactNode } from "react"
import {
  ConversationView,
  Props as ConversationViewProps,
} from "~/components/Conversation/View"
import { Conversation, Customer, isCreatedBy, isLurking, Maybe } from "~/graph"
import { localizeDate } from "~/i18n"
import { routes, routeURL } from "~/router"
import {
  AriaHeading,
  containerProps,
  DeleteButton,
  FullWidthVStack,
  Header,
  Nav,
  ShareModal,
  Spacer,
  Stack,
} from "~/system"
import { View as AuthPrompt } from "./AuthPrompt"
import { ShareButton } from "./ShareButton"

export enum Intent {
  Read = "read",
  Join = "join",
}

const isReading = (current: Intent) => current === Intent.Read
const isJoining = (current: Intent) => current === Intent.Join

export interface Props {
  viewer: Maybe<Customer>
  intent?: Intent
  conversation: Conversation
  // join
  onClickAuth?: () => void
  // read
  onClickShare?: () => void
  isOpenShare?: boolean
  onCloseShare?: () => void
  onClickBack?: () => void
  onClickDelete?: () => void
  // convo deletion
  isDeleting?: boolean
  // notes
  addButton: ReactNode
  notesView: ReactNode
}

export const View: FC<Props> = ({
  viewer,
  intent = Intent.Read,
  conversation,
  onClickAuth,
  onClickShare,
  isOpenShare = false,
  onCloseShare = () => null,
  onClickBack,
  onClickDelete,
  isDeleting = false,
  notesView,
  addButton,
}) => {
  const { id, occurredAt, creator } = conversation
  const authRequired = isJoining(intent) && isLurking(viewer)
  const isObscured = authRequired
  const creatorName = creator.name
  const occurredAtDesc = localizeDate(occurredAt)

  const props: ConversationViewProps = {
    viewer,
    conversation,
    isObscured,
    notesView,
  }

  const key = `/c/${id}`
  return h(
    FullWidthVStack,
    {
      //
      ...containerProps,
      ...(!!id && {
        key,
        id: key,
        // @ts-ignore
        "data-conversation-id": id,
      }),
    },
    [
      !isJoining(intent) &&
        h(Nav, { onClickBack, backButtonText: "Conversations" }),
      h(ShareModal, {
        isOpen: isOpenShare,
        onClose: onCloseShare,
        shareURL: routeURL(routes.conversation({ id })),
      }),
      h(AuthPrompt, {
        isOpen: authRequired,
        creatorName,
        occurredAtDesc,
        onClickAuth,
      }),
      h(
        Stack,
        {
          direction: "column",
          width: "100%",
          // gap: 4,
          style: {
            ...(isObscured && {
              color: "transparent",
              textShadow: "0 0 10px rgba(0,0,0,0.5)",
            }),
          },
        },
        [
          h(Header, [
            //
            h(AriaHeading, { size: "md" }, "Conversation"),
            h(Spacer),
          ]),
          h(ConversationView, props),
          h(Divider),
          h(
            Stack,
            {
              direction: "row",
              justifyContent: "start",
              alignItems: "start",
              width: "100%",
            },
            [
              isReading(intent) && h(ShareButton, { onClickShare }),
              isReading(intent) && !isLurking(viewer) && addButton,
              h(Spacer),
              // for now, only creator can delete
              isCreatedBy(conversation, viewer) &&
                h(DeleteButton, {
                  onClick: onClickDelete,
                  isLoading: isDeleting,
                  isDisabled: false,
                }),
            ]
          ),
        ]
      ),
    ]
  )
}
