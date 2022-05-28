import { h } from "@cycle/react"
import { Heading, Input, Stack } from "~/system"

export interface Props {
  // onClickJoin: React.MouseEventHandler<HTMLButtonElement>
  // onClickLogin: React.MouseEventHandler<HTMLButtonElement>
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
        h(Input, { placeholder: "With?", size: "md" }),
        // h(CreatableSelect, {
        //   size: "md",
        //   options: [{ value: "xyz", label: "Brent Hargrave" }],
        // }),
      ]),

      // h(Button, { onClick: onClickJoin }, t(`landing.join`)),
      // h(Button, { onClick: onClickLogin }, t(`landing.login`)),
    ]
  )
// ])
