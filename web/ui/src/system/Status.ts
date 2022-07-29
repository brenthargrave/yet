import { Icon } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { AiOutlineFileDone } from "react-icons/ai"
import { MdPendingActions, MdUnpublished } from "react-icons/md"
import { RiDraftLine } from "react-icons/ri"
import { ConversationStatus, statusText } from "~/graph"
import { toSentence } from "~/i18n"
import { Stack, Text } from "."

const statusIcon = (status: ConversationStatus) => {
  if (status === ConversationStatus.Draft) return RiDraftLine
  if (status === ConversationStatus.Proposed) return MdPendingActions
  if (status === ConversationStatus.Signed) return AiOutlineFileDone
  if (status === ConversationStatus.Deleted) return MdUnpublished
  return null
}

const statusColor = (status: ConversationStatus) => {
  if (status === ConversationStatus.Proposed) return "yellow.100"
  if (status === ConversationStatus.Signed) return "green.100"
  if (status === ConversationStatus.Deleted) return "red.100"
  return "white"
}

export interface Props {
  status: ConversationStatus
  isHighlighted?: boolean
  stragglerNames?: string[]
}

export const Status: FC<Props> = ({
  status,
  isHighlighted = false,
  stragglerNames: participantNames = [],
}) =>
  h(
    Stack,
    {
      //
      direction: "row",
      alignItems: "center",
      ...(isHighlighted && {
        bgColor: statusColor(status),
      }),
    },
    [
      h(Icon, { as: statusIcon(status) }),
      h(
        Text,
        {
          fontSize: "xs",
          style: { whiteSpace: "nowrap" },
        },
        statusText(status, toSentence(participantNames))
      ),
    ]
  )
