import { Box, Button } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { isEmpty } from "~/fp"
import { ConversationStatus, statusText } from "~/graph"
import { toSentence } from "~/i18n"
import { Stack } from "~/system"

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
        h(Stack, { direction: "row", justifyContent: "start" }, [
          h(Stack, { direction: "column", gap: 1, alignItems: "start" }, [
            h(
              Button,
              { isDisabled: isPublishDisabled, onClick: onClickPublish },
              // eslint-disable-next-line no-nested-ternary
              status === ConversationStatus.Draft
                ? isEmpty(participantNames)
                  ? `Publish`
                  : `Publish with ${participantList}`
                : statusText(status)
            ),
          ]),
        ]),
      ]
    ),
  ])
}

View.displayName = "ActionBar"
