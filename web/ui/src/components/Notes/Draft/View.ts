import { h } from "@cycle/react"
import { CreatableSelect, ChakraStylesConfig } from "chakra-react-select"
import { Heading, Stack } from "~/system"

export interface Props {
  // onClickJoin: React.MouseEventHandler<HTMLButtonElement>
  // onClickLogin: React.MouseEventHandler<HTMLButtonElement>
}

const chakraStyles: ChakraStylesConfig = {
  container: (provided, state) => ({
    ...provided,
    width: "100%",
  }),
}

export const View = (props: Props) =>
  // h(Center, { width: "100vw", height: "100vh" }, [
  h(
    Stack,
    {
      direction: "column",
      align: "start",
      margin: "4",
      justifyContent: "flex-start",
      gap: "2",
    },
    [
      h(Heading, { size: "lg" }, `Note a new conversation`),
      h(Stack, { direction: "row", alignItems: "center", width: "100%" }, [
        h(Heading, { size: "md" }, "with"),
        h(CreatableSelect, {
          size: "md",
          chakraStyles,
          isClearable: true,
          createOptionPosition: "first",
          formatCreateLabel: (inputValue) => `Add "${inputValue}"`,
          options: [{ value: "xyz", label: "Brent Hargrave" }],
          onChange: (x) => console.debug(x),
        }),
      ]),

      // h(Button, { onClick: onClickJoin }, t(`landing.join`)),
      // h(Button, { onClick: onClickLogin }, t(`landing.login`)),
    ]
  )
// ])
