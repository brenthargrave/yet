import { h } from "@cycle/react"

import { Center, Stack, Heading, Text } from "~/system"
import { t } from "~/i18n"

export const view = () =>
  h(Center, { width: "100vw", height: "100vh" }, [
    h(Stack, { direction: "column", align: "center", margin: "4" }, [
      h(Heading, {}, t("brand-name")),
      h(
        Text,
        { fontSize: "x-small" },
        `By tapping Create Account or Sign in you agree to never sue me.`
      ),
    ]),
  ])
