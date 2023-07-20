import { FaFacebook, FaTwitter } from "react-icons/fa"
import { h } from "@cycle/react"
import { FC } from "react"
import { twitterBlue, ariaLabel } from "./styles"

interface Props {
  color: string
}

export const TwitterIcon: FC<Props> = ({ color = twitterBlue }) =>
  h(FaTwitter, { color })
