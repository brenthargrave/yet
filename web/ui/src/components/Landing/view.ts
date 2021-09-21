import { h1 } from "@cycle/react-dom"

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
