import { h } from "@cycle/react"
import { rgb } from "csx"
import { Button, Center, Heading, Stack } from "~/system"

export interface Conversation {}

export interface Props {
  conversations: Conversation[]
}

export const View = ({ conversations }: Props) =>
  h(Center, { width: "100vw", height: "100vh" }, [
    h(
      Stack,
      {
        direction: "column",
        // align: "center",
        margin: "4",
      },
      [h(Heading, {}, "Conversations")]
    ),
  ])
