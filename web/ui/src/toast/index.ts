import {
  Alert,
  AlertDescription,
  AlertTitle,
  createStandaloneToast,
  UseToastOptions,
} from "@chakra-ui/react"
import { h } from "@cycle/react"

const _toast = createStandaloneToast()

export type ToastProps = Pick<
  UseToastOptions,
  "status" | "title" | "description"
>

export const toast = (props: ToastProps) => {
  const { status, title, description } = props
  _toast({
    position: "top",
    isClosable: true,
    duration: 5000,
    render: () => {
      return h(Alert, { status, variant: "solid" }, [
        title && h(AlertTitle, title),
        h(AlertDescription, { "aria-label": description }, [description]),
      ])
    },
  })
}
