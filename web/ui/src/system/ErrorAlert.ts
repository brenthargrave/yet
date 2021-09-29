import { h } from "@cycle/react"
import { Alert, AlertIcon, AlertTitle, AlertDescription } from "~/system"

interface Props {}
export const ErrorAlert = (props: Props) =>
  h(Alert, { status: "error" }, [
    h(AlertIcon),
    h(AlertTitle, { mr: 2 }, "Oops!"),
    h(AlertDescription, { mr: 2 }, "We've been notified, will fix this ASAP."),
  ])
