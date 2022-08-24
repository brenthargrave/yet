import { Stack, StackProps } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"

type Props = StackProps

export const FullWidthVStack: FC<Props> = ({ children, ...props }) =>
  h(
    Stack,
    {
      //
      ...props,
      width: "100%",
      direction: "column",
      alignItems: "start",
      align: "start",
      justifyContent: "flex-start",
    },
    [children]
  )

FullWidthVStack.displayName = "FullWidthVStack"
