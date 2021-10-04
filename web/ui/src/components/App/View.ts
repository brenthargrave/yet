import { h } from "@cycle/react"
import { ChakraProvider } from "@chakra-ui/react"
import { h1 } from "@cycle/react-dom"

export const View = () =>
  h(ChakraProvider, {}, [
    // TODO
    h1("hello, world!"),
  ])

View.displayName = "AppView"
