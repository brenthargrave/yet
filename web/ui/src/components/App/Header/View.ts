import { h } from "@cycle/react"
import { productName } from "~/i18n"
import { maxWidth, Heading, Stack, Center } from "~/system"

export const View = () =>
  h(Center, { maxWidth }, [
    h(Stack, { direction: "row", p: 4 }, [
      h(Heading, { size: "md" }, productName),
    ]),
  ])
