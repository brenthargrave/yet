import { createStandaloneToast, UseToastOptions } from "@chakra-ui/react"

const _toast = createStandaloneToast()

type AlertProps = Pick<UseToastOptions, "status" | "title" | "description">

export const toast = (props: AlertProps) =>
  _toast({
    isClosable: true,
    duration: 9000,
    ...props,
  })
