import { Box, Button } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { isEmpty, head } from "~/fp"
import { ConversationStatus, statusText } from "~/graph"
import { toSentence } from "~/i18n"
import { Stack } from "~/system"

export type OnClickPublish = () => void

export interface Props {
  isPublishDisabled: boolean
  onClickPublish?: OnClickPublish
  participantNames?: string[]
  status?: ConversationStatus
  autoFocus?: boolean
}

export const View: FC<Props> = ({
  isPublishDisabled,
  onClickPublish,
  participantNames = [],
  status = ConversationStatus.Draft,
  autoFocus = false,
}) => {
  const firstNames = participantNames.map(
    (name) => head(name.split(/(\s+)/)) ?? name
  )
  const participantList = toSentence(firstNames)
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
              {
                autoFocus,
                isDisabled: isPublishDisabled,
                onClick: onClickPublish,
              },
              isEmpty(participantNames)
                ? `Publish`
                : `Publish with ${participantList}`
            ),
          ]),
        ]),
      ]
    ),
  ])
}

View.displayName = "ActionBar"
