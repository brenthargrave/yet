/* eslint react/display-name: 0 */
import { Textarea, TextareaProps, useMergeRefs } from "@chakra-ui/react"
import { h } from "@cycle/react"
import React, { Ref } from "react"
import ResizeTextarea from "react-textarea-autosize"

interface Additions {
  // eslint-disable-next-line
  minRows?: number
}

// NOTE: see https://github.com/chakra-ui/chakra-ui/issues/670
export const AutosizeTextarea = React.forwardRef<
  HTMLTextAreaElement,
  TextareaProps & Additions
>(({ ...props }, ref) => {
  return h(Textarea, {
    minH: "unset",
    overflow: "hidden",
    w: "100%",
    resize: "none",
    ref,
    as: ResizeTextarea,
    ...props,
  })
})
