import { Alert as _Alert, AlertProps } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"

interface Props {}

export const Alert: FC<AlertProps> = (props) => h(_Alert, props)
