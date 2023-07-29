import { AddIcon } from "@chakra-ui/icons"
import { Button, Text } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { Customer, Profile } from "~/graph"
import { t } from "~/i18n"
import { AriaHeading, EmptyViewBase } from "~/system"

export type OnClickNew = () => void

export interface Props {
  viewer: Customer
  subject: Profile
  onClickNew?: OnClickNew
}

// TODO: refactor EmptyViews
export const ContactsEmptyView: FC<Props> = ({
  onClickNew,
  viewer,
  subject,
  ...props
}) => {
  return h(EmptyViewBase, { ...props }, [
    h(AriaHeading, { size: "md" }, `No contacts just yet.`),
    h(
      Text,
      { align: "center" },
      `Share notes of your conversations with ${
        viewer.id === subject.id ? "others" : subject.firstName
      } to grow your network.`
    ),
    h(
      Button,
      {
        onClick: onClickNew,
        leftIcon: h(AddIcon, { boxSize: 3 }),
      },
      t(`note.empty.buttonCopy`)
    ),
  ])
}

ContactsEmptyView.displayName = "ContactsEmptyView"
