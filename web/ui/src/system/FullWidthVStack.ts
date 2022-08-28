import { Stack, StackProps } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"

interface Props extends StackProps {
  isBody?: boolean
}

export const FullWidthVStack: FC<Props> = ({
  isBody = false,
  children,
  ...props
}) =>
  h(
    Stack,
    {
      //
      width: "100%",
      direction: "column",
      alignItems: "start",
      align: "start",
      justifyContent: "flex-start",
      pt: isBody ? 4 : 0,
      ...props,
    },
    [children]
  )

FullWidthVStack.displayName = "FullWidthVStack"
