import { h } from "@cycle/react"
import { Center, Stack, Heading, Text } from "~/system"

export const view = () =>
  h(Center, { width: "100vw", height: "100vh" }, [
    h(Stack, { direction: "column", align: "center" }, [
      h(Heading, {}, "T.B.D."),
      h(
        Text,
        {},
        `By tapping Create Account or Sign in you agree to never sue me.`
      ),
    ]),
  ])
