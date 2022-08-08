import { Box } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC, ReactNode } from "react"

interface Props {
  padding?: number
}

export const Header: FC<Props> = ({ padding = 4, children }) =>
  h(
    Box,
    {
      display: "flex",
      direction: "row",
      alignItems: "center",
      width: "100%",
      padding,
    },
    [children]
  )

Header.displayName = "Header"
