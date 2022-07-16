import { Box, Button } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { Stack } from "~/system"

export type OnClickPublish = () => void

export interface Props {
  isPublishDisabled: boolean
  onClickPublish?: OnClickPublish
  // participantNames?: string[]
}

export const View: FC<Props> = ({ isPublishDisabled, onClickPublish }) =>
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
              isDisabled: isPublishDisabled,
              onClick: onClickPublish,
            },
            `Publish`
          ),
        ]),
      ]
    ),
  ])

View.displayName = "ActionBar"
