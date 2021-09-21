import { h } from "@cycle/react"
import { ChakraProvider } from "@chakra-ui/react"

import { Landing } from "../Landing"

export const App = () => h(ChakraProvider, {}, [h(Landing)])
