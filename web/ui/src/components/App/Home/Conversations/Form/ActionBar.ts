import { Box, Button } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { isEmpty } from "~/fp"
import { Stack, Status } from "~/system"
import { toSentence } from "~/i18n"
import { ConversationStatus } from "~/graph"

export type OnClickPublish = () => void

export interface Props {
  isPublishDisabled: boolean
  onClickPublish?: OnClickPublish
  participantNames?: string[]
  status?: ConversationStatus
}

export const View: FC<Props> = ({
  isPublishDisabled,
  onClickPublish,
  participantNames = [],
  status = ConversationStatus.Draft,
}) => {
  const participantList = toSentence(participantNames)
  return h(Stack, { direction: "column", alignItems: "start", width: "100%" }, [
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
        h(Stack, { direction: "column", width: "100%" }, [
          h(Stack, { direction: "row", justifyContent: "start" }, [
            h(
              Button,
              {
                isDisabled: isPublishDisabled,
                onClick: onClickPublish,
              },
              // eslint-disable-next-line no-nested-ternary
              // isEmpty(participantNames)
              // ? `Publish`
              // : `Publish with ${participantList}`
              `Publish`
            ),
          ]),
          // h(Stack, { direction: "row", justifyContent: "start" }, [
          //   h(Status, { status, participantList }),
          // ]),
        ]),
      ]
    ),
  ])
}

View.displayName = "ActionBar"
