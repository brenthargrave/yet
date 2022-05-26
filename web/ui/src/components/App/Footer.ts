import { h } from "@cycle/react"
import { t } from "~/i18n"
import { Heading, Stack } from "~/system"

export const Footer = () =>
  h(Stack, { direction: "row", p: 4 }, [
    h(Heading, { size: "xs" }, t(`app.footer.copyright`)),
  ])
