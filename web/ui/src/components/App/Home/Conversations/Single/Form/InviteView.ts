import { h } from "@cycle/react"
import { FC } from "react"
import { isNil, isNotEmpty, pluck, reject } from "~/fp"
import { Invitee } from "~/graph"
import { toSentence } from "~/i18n"
import { ShareModal } from "~/system"
import { Props as ModalProps } from "~/system/Modal"

export interface Props extends ModalProps {
  shareURL?: string
  onShareURLCopied?: () => void
  onClickShareViaApp: () => void
  knownInvitees?: Invitee[]
  unknownInvitees?: Invitee[]
  hasInvited?: boolean
}

const bold = (text: string) => `**${text}**`

const names = (invitees: Invitee[]) => pluck("name", invitees)

const boldNames = (invitees: Invitee[]) => names(invitees).map(bold)

export const InviteView: FC<Props> = ({
  knownInvitees = [],
  unknownInvitees = [],
  hasInvited = false,
  ...props
}) => {
  const ctaParts: string[] = []
  if (isNotEmpty(knownInvitees)) {
    const names = toSentence(boldNames(knownInvitees))
    ctaParts.push(`We texted ${names} to join the conversation.`)
  }
  if (isNotEmpty(unknownInvitees)) {
    const names = toSentence(boldNames(unknownInvitees))
    const pluralized = unknownInvitees.length === 1 ? "is" : "are"
    ctaParts.push(
      `${names} ${pluralized} not registered yet, please send them the link below.`
    )
  }
  const cta = reject(isNil, ctaParts).join("\n\n")
  return h(ShareModal, { cta, ...props })
}

InviteView.displayName = "InviteView"
