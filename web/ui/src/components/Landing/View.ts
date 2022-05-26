import { h } from "@cycle/react"
import { productName, t } from "~/i18n"
import { Button, Center, Heading, Stack } from "~/system"

export interface Props {
  onClickJoin: React.MouseEventHandler<HTMLButtonElement>
  onClickLogin: React.MouseEventHandler<HTMLButtonElement>
}

export const View = ({ onClickJoin, onClickLogin }: Props) =>
  h(Center, { width: "100vw", height: "100vh" }, [
    h(Stack, { direction: "column", align: "center", margin: "4" }, [
      h(Heading, {}, productName),
      h(Button, { onClick: onClickJoin }, t(`landing.join`)),
      h(Button, { onClick: onClickLogin }, t(`landing.login`)),
    ]),
  ])
