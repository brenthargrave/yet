import { Spinner } from "@chakra-ui/react"
import { h } from "@cycle/react"
import React from "react"
import { SettingsEvent } from "~/graph"
import { t } from "~/i18n"
import { ariaLabel, Button, Center, Heading, Spacer, Stack } from "~/system"

const homeKey = "unsubscribe.home"

export enum State {
  loading = "loading",
  loaded = "loaded",
}

export interface Props {
  state: State
  result: SettingsEvent
  onClickHome: React.MouseEventHandler<HTMLButtonElement>
}

export const View = ({ state, result, onClickHome }: Props) =>
  h(Center, { width: "100vw", height: "100vh" }, [
    h(Stack, { direction: "column", align: "center", margin: "4" }, [
      state === State.loading && h(Spinner),
      result &&
        h(
          Heading,
          { size: "lg", ...ariaLabel("Unsubscribed") },
          t("unsubscribe.unsubscribed")
        ),
      h(Spacer),
      h(Button, { onClick: onClickHome, ...ariaLabel(homeKey) }, t(homeKey)),
    ]),
  ])

View.displayName = "UnsubscribeView"
