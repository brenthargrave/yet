import { Icon } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { capitalCase } from "change-case"
import { FC } from "react"
import { AiOutlineFileDone } from "react-icons/ai"
import { MdPendingActions, MdUnpublished } from "react-icons/md"
import { RiDraftLine } from "react-icons/ri"
import { ConversationStatus } from "~/graph"
import { Stack, Text } from "."

const statusIcon = (status: ConversationStatus) => {
  if (status === ConversationStatus.Draft) return RiDraftLine
  if (status === ConversationStatus.Proposed) return MdPendingActions
  if (status === ConversationStatus.Signed) return AiOutlineFileDone
  if (status === ConversationStatus.Deleted) return MdUnpublished
  return null
}

const statusText = (status: ConversationStatus, participantList?: string) =>
  // eslint-disable-next-line no-nested-ternary
  status === ConversationStatus.Proposed
    ? participantList
      ? `Pending cosign by ${participantList}`
      : `Pending cosign`
    : capitalCase(status)

export interface Props {
  status: ConversationStatus
  participantList?: string
}

export const Status: FC<Props> = ({ status, participantList }) =>
  h(Stack, { direction: "row", alignItems: "center" }, [
    h(Icon, { as: statusIcon(status) }),
    h(
      Text,
      { fontSize: "xs", style: { whiteSpace: "nowrap" } },
      statusText(status, participantList)
    ),
  ])
