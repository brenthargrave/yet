import { h } from "@cycle/react"
import { Stack, Heading } from "~/system"

export const view = () =>
  h(Stack, { direction: "column", width: "100vw", height: "100vh" }, [
    h(Heading, {}, "T.B.D."),
  ])
