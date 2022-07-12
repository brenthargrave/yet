import {
  Editable,
  EditableInput,
  EditableTextarea,
  EditablePreview,
  Input,
  InputLeftElement,
  InputRightElement,
  InputGroup,
  Tag,
  Button,
  Stack,
} from "@chakra-ui/react"
import { CalendarIcon, TimeIcon } from "@chakra-ui/icons"
import { h } from "@cycle/react"
import { FC } from "react"
import { format } from "date-fns"

interface Props {}

export const When: FC<Props> = () =>
  h(Stack, { width: "100%", direction: "row" }, [
    h(InputGroup, [
      h(InputLeftElement, {}, [h(CalendarIcon)]),
      h(Input, {
        type: "date",
        placeholder: `"Yesterday", "July 4th", etc.`,
      }),
      // h(InputRightElement, {}, [
      //   h(Button, { disabled: true, h: "1.75rem", size: "xs" }, "12/31"),
      // ]),
    ]),
    // h(Tag, { size: "md" }, format(new Date(), "MM/DD")),
  ])

// h(
//   Editable,
//   {
//     isPreviewFocusable: true,
//     defaultValue: "Take some chakra",
//     // value: "value"
//   },
//   [
//     h(EditablePreview),
//     h(EditableInput)
//   ]
// )
