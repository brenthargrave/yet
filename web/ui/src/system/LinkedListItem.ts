import { ListItem } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"

export interface Props {
  onClick?: () => void
}

export const LinkedListItem: FC<Props> = ({ onClick, children }) =>
  h(
    ListItem,
    {
      padding: 0,
      style: { cursor: "pointer" },
      onClick: (event: React.MouseEvent<HTMLElement>) => {
        // NOTE: ignore markdown link clicks
        // @ts-ignore
        const { href } = event.target
        if (!href && onClick) onClick()
      },
    },
    [children]
  )

LinkedListItem.displayName = "LinkedListItem"
