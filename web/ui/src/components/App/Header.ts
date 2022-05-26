import { h } from "@cycle/react"
import { productName } from "~/i18n"
import { Heading, Stack } from "~/system"

export const Header = () =>
  h(Stack, { direction: "row", p: 4 }, [
    h(Heading, { size: "lg" }, productName),
  ])
