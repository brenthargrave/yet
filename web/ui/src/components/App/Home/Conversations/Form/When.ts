import { SmallCloseIcon } from "@chakra-ui/icons"
import {
  Input,
  InputGroup,
  InputRightAddon,
  InputRightElement,
  IconButton,
  Stack,
} from "@chakra-ui/react"
import { h } from "@cycle/react"
import { isValid } from "date-fns"
import { createRef, FC, useState } from "react"
import { GoGear } from "react-icons/go"
import { formatDateInput, localizeDate, parseDateInput } from "~/i18n"
import { Button, Spacer, Text } from "~/system"

// TODO: natural language date input
// https://github.com/wanasit/chrono/pull/448
// https://github.com/spencermountain/compromise/tree/08f2a85d2d0c8d9b490fea003c3d856dec348a02#dates

export interface Props {
  occurredAt: Date
  onChangeOccurredAt: (date: Date) => void
  isDisabled?: boolean
}

export const View: FC<Props> = ({
  occurredAt,
  onChangeOccurredAt,
  isDisabled = false,
}) => {
  const [edit, setEdit] = useState(false)
  const max = formatDateInput(new Date())
  const value = formatDateInput(occurredAt)
  const ref = createRef<HTMLInputElement>()
  const onClick = () => {
    if (edit) {
      setEdit(false)
      ref.current?.focus()
    } else {
      setEdit(true)
    }
  }

  return h(Stack, { width: "100%", direction: "column" }, [
    h(Stack, { direction: "row", alignItems: "center", hidden: edit }, [
      // h(Text, { size: "sm" }, localizeDate(occurredAt)),
      h(Spacer),
      h(
        Button,
        {
          size: "xs",
          paddingLeft: 1,
          paddingRight: 1,
          padding: 2,
          rightIcon: h(GoGear),
          hidden: edit,
          onClick: () => setEdit(!edit),
        },
        // `Occurred: ${localizeDate(occurredAt)}`
        localizeDate(occurredAt)
      ),
    ]),
    h(
      InputGroup,
      {
        hidden: !edit,
      },
      [
        h(Input, {
          ref,
          isDisabled,
          type: "date",
          max,
          value,
          // @ts-ignore
          onChange: (event) => {
            const parsedDate = parseDateInput(event.target.value)
            if (isValid(parsedDate)) {
              onChangeOccurredAt(parsedDate)
            }
          },
        }),
        h(InputRightElement, { size: "sm" }, [
          //
          h(IconButton, {
            //
            size: "sm",
            icon: h(SmallCloseIcon),
            onClick,
          }),
        ]),
      ]
    ),
  ])
}

View.displayName = "When"
