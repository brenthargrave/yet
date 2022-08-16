import { Box, Button, Divider } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { head, isEmpty } from "~/fp"
import { ConversationStatus } from "~/graph"
import { toSentence } from "~/i18n"
import { Spacer, Stack } from "~/system"

export type OnClickPublish = () => void

export interface Props {
  isPublishDisabled: boolean
  onClickPublish?: OnClickPublish
  participantNames?: string[]
  status?: ConversationStatus
  autoFocus?: boolean
}

export const View: FC<Props> = ({
  children,
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
  return h(
    Stack,
    {
      //
      width: "100%",
      paddingTop: 2,
      direction: "column",
      alignItems: "start",
    },
    [
      h(Divider),
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
          h(
            Stack,
            {
              direction: "row",
              justifyContent: "start",
              alignItems: "start",
              width: "100%",
            },
            [
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
              h(Spacer),
              children,
            ]
          ),
        ]
      ),
    ]
  )
}

View.displayName = "ActionBar"
