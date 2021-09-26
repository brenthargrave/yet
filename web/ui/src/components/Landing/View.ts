import { h } from "@cycle/react"

import { Button, Center, Stack, Heading, Text } from "~/system"
import { t } from "~/i18n"

export const View = () =>
  h(Center, { width: "100vw", height: "100vh" }, [
    h(Stack, { direction: "column", align: "center", margin: "4" }, [
      h(Heading, {}, t("brand-name")),
      h(Text, { fontSize: "x-small" }, t("landing.disclaimer")),
      h(Button, {}, t(`landing.join`)),
      h(Button, {}, t(`landing.login`)),
    ]),
  ])
