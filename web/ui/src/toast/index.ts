import { createStandaloneToast, UseToastOptions } from "@chakra-ui/react"

const toast = createStandaloneToast()

type AlertProps = Pick<UseToastOptions, "status" | "title" | "description">

export const alert = (props: AlertProps) =>
  toast({
    isClosable: true,
    duration: 9000,
    ...props,
  })
