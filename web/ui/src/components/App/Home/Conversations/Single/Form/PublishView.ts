import { h } from "@cycle/react"
import { FC } from "react"
import { Invitee } from "~/graph"
import { t, toSentence } from "~/i18n"
import { ShareModal } from "~/system"
import { Props as ModalProps } from "~/system/Modal"
import { isNotEmpty, pluck, reject, isNil } from "~/fp"

export interface Props extends ModalProps {
  shareURL?: string
  onShareURLCopied?: () => void
  onClickShareViaApp: () => void
  knownInvitees?: Invitee[]
  unknownInvitees?: Invitee[]
}

const bold = (text: string) => `**${text}**`

const names = (invitees: Invitee[]) => pluck("name", invitees)

const boldNames = (invitees: Invitee[]) => names(invitees).map(bold)

export const PublishView: FC<Props> = ({
  knownInvitees = [],
  unknownInvitees = [],
  ...props
}) => {
  const subheading = t(`conversations.sign.once-signed`)
  const ctaParts: string[] = []
  if (isNotEmpty(knownInvitees)) {
    const names = toSentence(boldNames(knownInvitees))
    ctaParts.push(`We just texted ${names} to cosign these notes.`)
  }
  if (isNotEmpty(unknownInvitees)) {
    const names = toSentence(boldNames(unknownInvitees))
    const pluralized = unknownInvitees.length === 1 ? "is" : "are"
    ctaParts.push(
      `${names} ${pluralized} not registered yet, please send your notes directly using the link below.`
    )
  }
  const cta = reject(isNil, ctaParts).join("\n\n")
  return h(ShareModal, { cta, subheading, ...props })
}

PublishView.displayName = "PublishView"
