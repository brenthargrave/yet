import { Icon } from "@chakra-ui/react"
import { h } from "@cycle/react"
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

const statusText = (status: ConversationStatus) => status

export interface Props {
  status: ConversationStatus
}

export const Status: FC<Props> = ({ status }) =>
  h(Stack, { direction: "row" }, [
    h(Icon, { as: statusIcon(status) }),
    h(Text, { fontSize: "xs" }, statusText(status)),
  ])
