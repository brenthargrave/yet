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
      width: "100%",
    },
    [
      h(Box, { maxWidth, width: "100%" }, [
        //
        children,
      ]),
    ]
  )
