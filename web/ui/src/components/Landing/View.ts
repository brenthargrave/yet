import { Divider } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { productName, t } from "~/i18n"
import {
  Button,
  Center,
  Heading,
  Stack,
  ariaLabel,
  Logo,
  LogoLocation,
} from "~/system"

export interface Props {
  onClickJoin: React.MouseEventHandler<HTMLButtonElement>
  onClickLogin: React.MouseEventHandler<HTMLButtonElement>
}

export const View = ({ onClickJoin, onClickLogin }: Props) =>
  h(Center, { width: "100vw", height: "100vh" }, [
    h(Stack, { direction: "column", align: "center", spacing: 4 }, [
      h(Logo, { location: LogoLocation.splash }),
      h(Divider),
      h(Stack, { direction: "column", align: "center", spacing: 4 }, [
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
    ]),
  ])
