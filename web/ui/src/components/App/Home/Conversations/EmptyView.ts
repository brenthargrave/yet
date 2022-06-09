import { Button, Box, Center, Heading, VStack, Text } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { productName, t } from "~/i18n"

export const EmptyView: FC = () =>
  h(VStack, { alignItems: "center", maxWidth: "80%", gap: 4 }, [
    h(Heading, { size: "lg" }, `Welcome!`),
    h(Text, { align: "center" }, t(`note.empty.cta`)),
    h(Button, {}, t(`note.empty.buttonCopy`)),
  ])
