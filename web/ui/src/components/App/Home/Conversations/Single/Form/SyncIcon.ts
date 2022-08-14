import { CheckCircleIcon } from "@chakra-ui/icons"
import { Circle, Icon } from "@chakra-ui/react"
import { h } from "@cycle/react"

export interface Props {
  syncing: boolean
}

export const SyncIcon = ({ syncing = false }: Props) =>
  h(Icon, { viewBox: "0 0 200 200" }, [
    h("path", {
      fill: syncing ? "red" : "green",
      d: "M 100, 100 m -75, 0 a 75,75 0 1,0 150,0 a 75,75 0 1,0 -150,0",
    }),
  ])
