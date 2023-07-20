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
    // ! TODO: duration: stauts === "error" ? false : 5000
    // ! verify tapping outside it doesn't dismiss it either
    // NOTE: don't auto-dismiss errors, preserver for screenie
    duration: 5000,
    render: () => {
      return h(
        // NOTE: to debug/preview, use oauth path:
        // /oauth?description=Welcome%20aboard%21&status=success
        Alert,
        {
          status,
          variant: "solid",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        },
        [
          title && h(AlertTitle, title),
          h(AlertDescription, { "aria-label": description }, [description]),
        ]
      )
    },
  })
}
