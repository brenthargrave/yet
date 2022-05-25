import { h } from "@cycle/react"

import { Button, Center, Stack, Heading, Text } from "~/system"
import { t } from "~/i18n"

const entryElement = document.getElementById("index")
const productName = entryElement?.dataset.product

export interface Props {
  onClickJoin: React.MouseEventHandler<HTMLButtonElement>
  onClickLogin: React.MouseEventHandler<HTMLButtonElement>
}

export const View = ({ onClickJoin, onClickLogin }: Props) =>
  h(Center, { width: "100vw", height: "100vh" }, [
    h(Stack, { direction: "column", align: "center", margin: "4" }, [
      // TODO: store product name in env var; use in SMS sends
      h(Heading, {}, productName),
      // h(Text, { fontSize: "x-small" }, t("landing.disclaimer")),
      h(Button, { onClick: onClickJoin }, t(`landing.join`)),
      h(Button, { onClick: onClickLogin }, t(`landing.login`)),
    ]),
  ])
