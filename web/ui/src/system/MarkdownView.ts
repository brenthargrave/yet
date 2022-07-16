import { h } from "@cycle/react"
import { FC } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkBreaks from "remark-breaks"
import { join, split, take, trim } from "~/fp"

interface Props {
  md: string
  maxLines?: number
}

export const MarkdownView: FC<Props> = ({ md, maxLines }) => {
  const truncated = maxLines
    ? trim(join("\n", take(maxLines, split("\n", md)))).concat("\n...")
    : md
  return h(ReactMarkdown, {
    children: truncated,
    remarkPlugins: [remarkGfm, remarkBreaks],
    linkTarget: "_blank",
    skipHtml: false,
  })
}
