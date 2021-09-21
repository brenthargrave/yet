import { h } from "@cycle/react"
import { ChakraProvider } from "@chakra-ui/react"

import { Landing } from "~/components/Landing"

export const App = () => h(ChakraProvider, {}, [h(Landing)])
