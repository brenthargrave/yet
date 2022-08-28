import { Center, VStack } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"

interface Props {}

export const EmptyViewBase: FC<Props> = ({ children, ...props }) =>
  h(Center, { ...props }, [
    h(VStack, { alignItems: "center", gap: 4, padding: 4 }, [children]),
  ])

EmptyViewBase.displayName = "EmptyViewBase"
