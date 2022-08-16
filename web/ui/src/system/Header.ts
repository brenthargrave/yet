import { Box } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC, ReactNode } from "react"
import { paddingDefault } from "~/system"

interface Props {
  paddingLeft?: number
  paddingRight?: number
  paddingTop?: number
  paddingBottom?: number
  padding?: number
}

export const Header: FC<Props> = ({
  paddingLeft = 0,
  paddingRight = 0,
  paddingTop, //= paddingDefault,
  paddingBottom, // = paddingDefault,
  padding,
  children,
}) =>
  h(
    Box,
    {
      display: "flex",
      direction: "row",
      alignItems: "center",
      width: "100%",
      margin: 0,
      paddingLeft,
      paddingRight,
      paddingTop: paddingDefault,
      paddingBottom: paddingDefault,
      padding,
    },
    [children]
  )

Header.displayName = "Header"
