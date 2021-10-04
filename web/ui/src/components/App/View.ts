import { h } from "@cycle/react"
import { ChakraProvider } from "@chakra-ui/react"

import { Landing } from "~/components/Landing"
import { useRoute, isRoute, routes } from "~/router"
import { Auth } from "~/components/Auth"
import { Context } from "~/context"

export const View = ({ context }: { context: Context }) => {
  const route = useRoute()
  return h(ChakraProvider, [
    isRoute(route, routes.home) && h(Landing),
    isRoute(route, routes.in) && h(Auth, { context }),
  ])
}

View.displayName = "AppView"
