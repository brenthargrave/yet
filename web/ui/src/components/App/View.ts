import React, { FC, Fragment } from "react"
import { h } from "@cycle/react"
import { h1 } from "@cycle/react-dom"
import type { Route } from "type-route"

import { useToast, UseToastOptions } from "@chakra-ui/toast"
import { routes, isRoute, useRoute } from "~/router"

import { Landing } from "~/components/Landing"
import { Context, context } from "~/context"
import { PhoneSubmit } from "~/components/Auth/PhoneSubmit"
import { PhoneVerify } from "~/components/Auth/PhoneVerify"

// export type Notify = (status: "info" | "warning" | "success" | "error", message: string)
type NotifyConfig = Pick<UseToastOptions, "status" | "title">
export type Notify = (config: NotifyConfig) => void

export const View = () => {
  const toast = useToast()
  const notify: Notify = (config: NotifyConfig) => {
    const { title, status } = config
    toast({
      title,
      status,
      duration: 9000,
      isClosable: true,
      position: "top",
    })
  }
  const route = useRoute()
  return h(Fragment, [
    isRoute(route, routes.home()) && h(Landing),
    isRoute(route, routes.in()) && h(PhoneSubmit, { context, notify }),
    isRoute(route, routes.verify()) && h(PhoneVerify, {}),
  ])
}

View.displayName = "AppView"

/*

interface Props {
  route: Route<typeof routes>
}
export const View: FC<Props> = ({ route, children }) => {
  return h(React.StrictMode, [
    h(ChakraProvider, [
      children,
      // h1(`hello, world`),
      // isRoute(route, routes.home()) && h(Landing),
      // isRoute(route, routes.in()) && h(Auth, { context }),
    ]),
  ])
}

*/
