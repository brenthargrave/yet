import { Input, InputGroup, Stack } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"

// TODO: natural language date input,using
// https://github.com/wanasit/chrono/pull/448
// https://github.com/spencermountain/compromise/tree/08f2a85d2d0c8d9b490fea003c3d856dec348a02#dates

interface Props {}
export const When: FC<Props> = () =>
  h(Stack, { width: "100%", direction: "row" }, [
    h(InputGroup, [
      h(Input, {
        type: "date",
        // color: "gray", // TODO: gray when default value (today)
      }),
    ]),
  ])
