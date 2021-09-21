import { h } from "@cycle/react"
import { Heading, Stack } from "@chakra-ui/react"

export const view = () =>
  h(Stack, { direction: "column", width: "100vw", height: "100vh" }, [
    h(Heading, {}, "T.B.D."),
  ])
