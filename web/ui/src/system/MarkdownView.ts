import { h } from "@cycle/react"
import { FC } from "react"
import ReactMarkdown from "react-markdown"
import remarkBreaks from "remark-breaks"
import remarkGfm from "remark-gfm"
import { join, split, take, trim } from "~/fp"

interface Props {
  md: string
  maxLines?: number
}

export const MarkdownView: FC<Props> = ({ md, maxLines }) => {
  const truncated = maxLines
    ? trim(join("\n", take(maxLines, split("\n", md)))).concat("\n...")
    : md
  // NOTE: otherwise consecutive newlines don't generated breaks
  // TODO: PR fix on remarkBreaks lib
  // https://github.com/remarkjs/react-markdown/issues/278#issuecomment-628264062
  const children = truncated.replace(/\n/gi, "\n &nbsp;")
  return h(ReactMarkdown, {
    children,
    remarkPlugins: [remarkBreaks, remarkGfm],
    linkTarget: "_blank",
    skipHtml: false,
  })
}
