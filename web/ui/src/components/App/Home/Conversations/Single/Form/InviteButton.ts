import { Button } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { head, isEmpty } from "~/fp"
import { toSentence } from "~/i18n"
import { ariaLabel } from "~/system"

export interface Props {
  isInvitable?: boolean
  hasInvited?: boolean
  inviteeNames: string[]
  onClick?: () => void
  autoFocus?: boolean
}

export const InviteButton = ({
  isInvitable = false,
  hasInvited = false,
  inviteeNames = [],
  onClick,
  autoFocus = false,
}: Props) => {
  const firstNames = inviteeNames.map(
    (name) => head(name.split(/(\s+)/)) ?? name
  )
  const inviteeList = toSentence(firstNames)
  const isDisabled = !isInvitable
  return h(
    Button,
    {
      size: "sm",
      autoFocus,
      isDisabled,
      onClick,
      ...ariaLabel("Invite"),
    },
    hasInvited
      ? "Invited"
      : isEmpty(inviteeNames)
      ? `Invite`
      : `Invite ${inviteeList}`
  )
}

InviteButton.displayName = "InviteButton"
