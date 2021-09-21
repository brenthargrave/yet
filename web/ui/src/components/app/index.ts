import { h } from "@cycle/react"
import { ChakraProvider } from "@chakra-ui/react"

import { Landing } from "~/components/Landing"
import { Auth } from "~/components/Auth"

// export const App = () => h(ChakraProvider, {}, [h(Landing)])
export const App = () => h(ChakraProvider, {}, [h(Auth)])
