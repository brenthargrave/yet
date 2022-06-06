import { Box } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { lightGray, maxWidth } from "~/system"

export const View: FC = ({ children }) =>
  h(
    Box,
    {
      backgroundColor: lightGray,
      margin: "4",
    },
    [h(Box, { maxWidth }, [children])]
  )
