import { Box, VStack } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { white, maxWidth } from "~/system"

const height = "100%"

const Background: FC = ({ children }) =>
  h(
    VStack,
    {
      backgroundColor: white,
      height,
      alignItems: "center",
    },
    [children]
  )
Background.displayName = "BackgroundView"

const MaxWidthView: FC = ({ children }) =>
  h(Box, { maxWidth, height: "100%", width: "100%", m: 0 }, [children])
MaxWidthView.displayName = "MaxWidthView"

export const View: FC = ({ children }) =>
  h(Background, [h(MaxWidthView, [children])])
View.displayName = "HomeView"
