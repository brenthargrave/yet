import { Box } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { rgb } from "csx"
import { FC, ReactNode } from "react"
import { maxWidth } from "~/system"

export const View: FC = ({ children }) =>
  h(
    Box,
    {
      backgroundColor: rgb(250, 250, 250).toString(),
      margin: "4",
    },
    [h(Box, { maxWidth }, [children])]
  )
