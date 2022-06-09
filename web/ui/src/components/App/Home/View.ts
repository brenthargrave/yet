import { Box, Center, Stack, VStack } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { percent } from "csx"
import { FC } from "react"
import { lightGray, maxWidth } from "~/system"

const width = "100%"
const height = "100%"

const Background: FC = ({ children }) =>
  h(
    VStack,
    {
      backgroundColor: lightGray,
      padding: "4",
      width,
      height,
      alignItems: "center",
    },
    [children]
  )
Background.displayName = "BackgroundView"

export const View: FC = ({ children }) =>
  h(Background, [
    h(VStack, { maxWidth, width, height }, [
      //
      children,
    ]),
  ])
View.displayName = "HomeView"
