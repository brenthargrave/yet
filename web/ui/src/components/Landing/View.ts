import { h } from "@cycle/react"

import { Button, Center, Divider, Stack, Heading, Text } from "~/system"
import { t } from "~/i18n"

export interface Props {
  onClickJoin: React.MouseEventHandler<HTMLButtonElement>
  onClickLogin: React.MouseEventHandler<HTMLButtonElement>
}

export const View = ({ onClickJoin, onClickLogin }: Props) =>
  h(Center, { width: "100vw", height: "100vh" }, [
    h(Stack, { direction: "column", align: "center", margin: "4" }, [
      h(Heading, {}, t("brand-name")),
      h(Divider),
      // h(Text, { fontSize: "x-small" }, t("landing.disclaimer")),
      h(Button, { onClick: onClickJoin }, t(`landing.join`)),
      h(Button, { onClick: onClickLogin }, t(`landing.login`)),
    ]),
  ])
