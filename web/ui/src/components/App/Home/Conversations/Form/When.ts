import { Input, InputGroup, Stack } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { isValid } from "date-fns"
import { formatDateInput, parseDateInput } from "~/i18n"

// TODO: natural language date input
// https://github.com/wanasit/chrono/pull/448
// https://github.com/spencermountain/compromise/tree/08f2a85d2d0c8d9b490fea003c3d856dec348a02#dates

interface Props {
  date: Date
  onChangeDate: (date: Date) => void
}

export const When: FC<Props> = ({ date, onChangeDate }) => {
  const max = formatDateInput(new Date())
  const value = formatDateInput(date)

  return h(Stack, { width: "100%", direction: "row" }, [
    h(InputGroup, [
      h(Input, {
        type: "date",
        max,
        value,
        // @ts-ignore
        onChange: (event) => {
          const parsedDate = parseDateInput(event.target.value)
          if (isValid(parsedDate)) {
            onChangeDate(parsedDate)
          }
        },
      }),
    ]),
  ])
}