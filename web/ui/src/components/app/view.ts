// import { h } from "@cycle/react"
import { h1 } from "@cycle/react-dom"
// import { Stack, Button } from "@mui/material"

const logo = h1(`hello, world!`)
// const button = h(
//   Button,
//   {
//     variant: "outlined",
//   },
//   `Sign up`
// )

export const view = () => logo
// h(
//   Stack,
//   {
//     direction: "column",
//     justifyContent: "center",
//     alignItems: "center",
//     spacing: 2,
//   },
//   [logo, button]
// )

/*
import React from "react"
import { h1 } from "@cycle/react-dom"

// export const App = () => <div>Hello, world</div>
export const App = () => h1("hel")

*/
