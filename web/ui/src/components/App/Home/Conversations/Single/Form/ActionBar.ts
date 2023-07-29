import { Box, Button, Divider } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { head, isEmpty } from "~/fp"
import { toSentence } from "~/i18n"
import { ariaLabel, Spacer, Stack } from "~/system"

export type OnClickPublish = () => void

export interface Props {
  inviteeNames?: string[]
  isDisabledInvite: boolean
  onClickInvite?: OnClickPublish
  autoFocus?: boolean
}

export const ActionBar: FC<Props> = ({
  children,
  isDisabledInvite,
  onClickInvite,
  inviteeNames = [],
  autoFocus = false,
}) => {
  const firstNames = inviteeNames.map(
    (name) => head(name.split(/(\s+)/)) ?? name
  )
  const inviteeList = toSentence(firstNames)
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
              // h(Stack, { direction: "column", gap: 1, alignItems: "start" }, [
              h(
                Button,
                {
                  autoFocus,
                  isDisabled: isDisabledInvite,
                  onClick: onClickInvite,
                  ...ariaLabel("Invite"),
                },
                isEmpty(inviteeNames) ? `Invite` : `Invite ${inviteeList}`
              ),
              // ]),
              h(Spacer),
              children,
            ]
          ),
        ]
      ),
    ]
  )
}

ActionBar.displayName = "ActionBar"
