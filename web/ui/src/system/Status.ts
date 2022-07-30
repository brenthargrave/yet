import { Icon } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { AiOutlineFileDone } from "react-icons/ai"
import { MdPendingActions, MdUnpublished } from "react-icons/md"
import { RiDraftLine, RiLockLine } from "react-icons/ri"
import { ConversationStatus, statusText } from "~/graph"
import { toSentence } from "~/i18n"
import { Stack, Text } from "."
import { lightGray, lightGreen, lightYellow } from "./styles"

const statusIcon = (status: ConversationStatus) => {
  if (status === ConversationStatus.Draft) return RiDraftLine
  if (status === ConversationStatus.Proposed) return MdPendingActions
  if (status === ConversationStatus.Signed) return AiOutlineFileDone
  if (status === ConversationStatus.Deleted) return MdUnpublished
  return null
}

const statusColor = (status: ConversationStatus) => {
  if (status === ConversationStatus.Proposed) return lightYellow // "yellow.100"
  if (status === ConversationStatus.Signed) return lightGreen // "green.100"
  if (status === ConversationStatus.Deleted) return "red.100"
  return lightGray // "white"
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
      pl: 1,
      pr: 1,
      borderRadius: "6px",
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
