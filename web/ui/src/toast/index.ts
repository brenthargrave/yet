import { createStandaloneToast, UseToastOptions } from "@chakra-ui/react"

const _toast = createStandaloneToast()

export type ToastProps = Pick<
  UseToastOptions,
  "status" | "title" | "description"
>

export const toast = (props: ToastProps) =>
  _toast({
    isClosable: true,
    duration: 9000,
    ...props,
  })
