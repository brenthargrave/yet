import { Box } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { percent } from "csx"
import { FC } from "react"
import { lightGray, maxWidth } from "~/system"

const Background: FC = ({ children }) =>
  h(
    Box,
    {
      backgroundColor: lightGray,
      margin: "4",
      width: "100%",
    },
    [children]
  )
Background.displayName = "BackgroundView"

export const View: FC = ({ children }) =>
  h(Background, [
    h(Box, { maxWidth, width: percent(100) }, [
      //
      children,
    ]),
  ])
View.displayName = "HomeView"
