import { Box, VStack } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { white, maxWidth, paddingDefault } from "~/system"
import { View as NavView, Props as NavProps } from "./NavView"

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
      margin: 0,
      paddingLeft: paddingDefault,
      paddingRight: paddingDefault,
    },
    [children]
  )
MaxWidthView.displayName = "MaxWidthView"

export const View: FC<NavProps> = ({ children, ...props }) =>
  h(BackgroundView, [
    //
    h(MaxWidthView, [
      //
      h(NavView, { ...props }, [
        //
        children,
      ]),
    ]),
  ])
View.displayName = "HomeView"
