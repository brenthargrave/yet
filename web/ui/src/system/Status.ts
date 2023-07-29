import { Icon } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { BsCheckCircle } from "react-icons/bs"
import { MdPendingActions, MdUnpublished } from "react-icons/md"
import { RiDraftLine } from "react-icons/ri"
import { match } from "ts-pattern"
import { ConversationStatus, statusText } from "~/graph"
import { toSentence } from "~/i18n"
import { Stack, Text } from "."
import { lightGray, lightGreen, lightYellow } from "./styles"

const statusIcon = (status: ConversationStatus) =>
  match(status)
    .with(ConversationStatus.Draft, () => RiDraftLine)
    .with(ConversationStatus.Proposed, () => MdPendingActions)
    .with(ConversationStatus.Joined, () => BsCheckCircle) // AiOutlineFileDone
    .with(ConversationStatus.Deleted, () => MdUnpublished)
    .exhaustive()

const statusColor = (status: ConversationStatus) => {
  if (status === ConversationStatus.Proposed) return lightYellow // "yellow.100"
  if (status === ConversationStatus.Joined) return lightGreen // "green.100"
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
