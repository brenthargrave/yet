import { Button, Heading, Text, VStack } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { t } from "~/i18n"

export type OnClickNew = () => void

interface Props {
  onClickNew?: OnClickNew
}

export const EmptyView: FC<Props> = ({ onClickNew }) =>
  h(VStack, { alignItems: "center", gap: 4 }, [
    h(Heading, { size: "lg" }, `Welcome!`),
    h(Text, { align: "center" }, t(`note.empty.cta`)),
    h(Button, { onClick: onClickNew }, t(`note.empty.buttonCopy`)),
  ])
