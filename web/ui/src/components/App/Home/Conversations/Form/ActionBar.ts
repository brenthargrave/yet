import { Box, Button } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { Stack } from "~/system"

export interface Props {
  isShareDisabled: boolean
}

export const View: FC<Props> = ({ isShareDisabled }) =>
  h(Stack, { direction: "column", alignItems: "start", width: "100%" }, [
    h(
      Box,
      {
        display: "flex",
        direction: "row",
        alignItems: "center",
        width: "100%",
        space: 4,
      },
      [
        h(Stack, { direction: "row" }, [
          h(
            Button,
            {
              isDisabled: isShareDisabled,
            },
            `Share`
          ),
        ]),
      ]
    ),
  ])

View.displayName = "ActionBar"
