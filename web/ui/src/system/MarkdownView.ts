import { h } from "@cycle/react"
import { a } from "@cycle/react-dom"
import { FC } from "react"
import ReactMarkdown from "react-markdown"
import remarkBreaks from "remark-breaks"
import remarkGfm from "remark-gfm"
import { style } from "typestyle"
import { join, split, take, trim } from "~/fp"

const className = style({ textDecoration: "underline" })

interface Props {
  md?: string | null
  maxLines?: number
}

export const MarkdownView: FC<Props> = ({ md, maxLines }) => {
  const mkd = md ?? ""
  const truncated = maxLines
    ? trim(join("\n", take(maxLines, split("\n", mkd)))).concat("\n...")
    : mkd
  // NOTE: otherwise consecutive newlines don't generated breaks
  // TODO: PR fix on remarkBreaks lib
  // https://github.com/remarkjs/react-markdown/issues/278#issuecomment-628264062
  const children = truncated.replace(/\n/gi, "\n &nbsp;")
  return h(ReactMarkdown, {
    children,
    remarkPlugins: [remarkBreaks, remarkGfm],
    linkTarget: "_blank",
    skipHtml: false,
    components: {
      a: ({ node, href, children, ...props }) =>
        a({ href, className, ...props }, children),
    },
  })
}
