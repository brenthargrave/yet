import { h } from "@cycle/react"
import { Center, Stack, Heading } from "~/system"

export const view = () =>
  h(Center, { width: "100vw", height: "100vh" }, [
    h(Stack, { direction: "column" }, [h(Heading, {}, "T.B.D.")]),
  ])
