import { Box, Center, Stack, VStack } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { percent } from "csx"
import { FC } from "react"
import { lightGray, maxWidth } from "~/system"

const Background: FC = ({ children }) =>
  h(
    VStack,
    {
      backgroundColor: lightGray,
      margin: "4",
      width: "100%",
      alignItems: "center",
    },
    [children]
  )
Background.displayName = "BackgroundView"

export const View: FC = ({ children }) =>
  h(Background, [
    h(VStack, { maxWidth }, [
      //
      children,
    ]),
  ])
View.displayName = "HomeView"
