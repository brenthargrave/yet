import React, { FC } from "react"
import { h } from "@cycle/react"
import { ChakraProvider } from "@chakra-ui/react"
import { useToast, UseToastOptions } from "@chakra-ui/toast"
import { ErrorBoundary } from "@sentry/react"

/*
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
}
View.displayName = "AppView"
*/

export const View: FC = ({ children }) => {
  return h(React.StrictMode, [
    h(ErrorBoundary, { showDialog: true }, [h(ChakraProvider, [children])]),
  ])
}
