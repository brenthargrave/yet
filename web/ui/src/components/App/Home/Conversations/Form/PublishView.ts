import { h } from "@cycle/react"
import { FC } from "react"
import { t, toSentence } from "~/i18n"
import { ShareModal } from "~/system"
import { Props as ModalProps } from "~/system/Modal"

export interface Props extends ModalProps {
  participantNames?: string[]
  shareURL?: string
  onShareURLCopied?: () => void
  onClickShareViaApp: () => void
}

export const PublishView: FC<Props> = ({ participantNames = [], ...props }) => {
  const heading = `Now share your notes with ${toSentence(participantNames)}`
  const subheading = t(`conversations.sign.once-signed`)
  return h(ShareModal, { heading, subheading, ...props })
}

PublishView.displayName = "PublishView"
