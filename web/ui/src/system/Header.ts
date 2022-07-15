import { Box } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC, ReactNode } from "react"

export const Header: FC = ({ children }) =>
  h(
    Box,
    {
      display: "flex",
      direction: "row",
      alignItems: "center",
      width: "100%",
      padding: 4,
    },
    [children]
  )

Header.displayName = "Header"
