import { h } from "@cycle/react"
import { h1 } from "@cycle/react-dom"
import { Stack, Button } from "@mui/material"

const logo = h1(`TBD`)
const button = h(
  Button,
  {
    variant: "outlined",
  },
  `Sign up`
)

export const view = () =>
  h(
    Stack,
    {
      direction: "column",
      justifyContent: "center",
      alignItems: "center",
      spacing: 2,
    },
    [logo, button]
  )
