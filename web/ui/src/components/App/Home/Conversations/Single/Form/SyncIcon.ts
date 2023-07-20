import { Icon, Spinner } from "@chakra-ui/react"
import { h } from "@cycle/react"

export interface Props {
  syncing: boolean
}

export const SyncIcon = ({ syncing = false, ...props }: Props) => {
  // const color = syncing ? "red.100" : "green.100"
  // return h(Icon, { color, viewBox: "0 0 200 200", ...props }, [
  //   h("path", {
  //     fill: "currentColor", // : syncing ? "red" : "green",
  //     d: "M 100, 100 m -75, 0 a 75,75 0 1,0 150,0 a 75,75 0 1,0 -150,0",
  //   }),
  // ])

  return syncing ? h(Spinner, { color: "gray.400", size: "xs" }) : null
}
