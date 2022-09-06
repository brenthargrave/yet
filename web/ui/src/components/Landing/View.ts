import { h } from "@cycle/react"
import { productName, t } from "~/i18n"
import { Button, Center, Heading, Stack, ariaLabel } from "~/system"

export interface Props {
  onClickJoin: React.MouseEventHandler<HTMLButtonElement>
  onClickLogin: React.MouseEventHandler<HTMLButtonElement>
}

export const View = ({ onClickJoin, onClickLogin }: Props) =>
  h(Center, { width: "100vw", height: "100vh" }, [
    h(Stack, { direction: "column", align: "center", margin: "4" }, [
      h(Heading, { "aria-label": productName }, productName),
      h(
        Button,
        { onClick: onClickJoin, ...ariaLabel(t(`landing.join`)) },
        t(`landing.join`)
      ),
      h(
        Button,
        { onClick: onClickLogin, ...ariaLabel(t(`landing.login`)) },
        t(`landing.login`)
      ),
    ]),
  ])
