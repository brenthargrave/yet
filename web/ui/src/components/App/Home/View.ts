import { Box, VStack } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { white, maxWidth } from "~/system"
import { View as NavView } from "./Nav"

const height = "100%"

const BackgroundView: FC = ({ children }) =>
  h(
    VStack,
    {
      backgroundColor: white,
      height,
      alignItems: "center",
    },
    [children]
  )
BackgroundView.displayName = "BackgroundView"

const MaxWidthView: FC = ({ children }) =>
  h(
    Box,
    {
      //
      maxWidth,
      height: "100%",
      width: "100%",
      m: 0,
    },
    [
      //
      h(NavView),
      children,
    ]
  )
MaxWidthView.displayName = "MaxWidthView"

export const View: FC = ({ children }) =>
  h(BackgroundView, [
    //
    h(MaxWidthView, [
      //
      children,
    ]),
  ])
View.displayName = "HomeView"
