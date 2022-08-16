import { Box } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC, ReactNode } from "react"
import { paddingDefault } from "~/system"

interface Props {
  padding?: number
  paddingLeft?: number
  paddingRight?: number
}

export const Header: FC<Props> = ({
  padding = 0,
  paddingLeft = 0,
  paddingRight = 0,
  children,
}) =>
  h(
    Box,
    {
      display: "flex",
      direction: "row",
      alignItems: "center",
      width: "100%",
      padding,
      paddingLeft,
      paddingRight,
    },
    [children]
  )

Header.displayName = "Header"
