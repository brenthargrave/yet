import { h } from "@cycle/react"
import {
  AutosizeTextarea,
  BackButton,
  Header,
  Heading,
  Input,
  InputGroup,
  Spacer,
  Stack,
  Text,
} from "~/system"

export interface Props {
  showNav: boolean
}

export const View = ({ showNav, ...props }: Props) =>
  h(
    Stack,
    {
      direction: "column",
      align: "start",
      justifyContent: "flex-start",
    },
    [
      // only display nav from Home
      showNav &&
        h(Header, [
          h(BackButton, {
            onClick: () => null, // onClickBack,
          }),
          h(Spacer),
        ]),
      h(Header, [h(Heading, { size: "md" }, "Opportunity"), h(Spacer)]),
      h(Stack, { direction: "column", width: "100%", padding: 4, gap: 6 }, [
        // TODO: org
        h(Stack, { direction: "column" }, [
          h(Text, "Organization"),
          h(InputGroup, [
            h(Input, {
              placeholder: "Company, school, club, family, etc.",
              autoFocus: true,
            }),
          ]),
        ]),
        h(Stack, { direction: "column" }, [
          h(Text, "Role"),
          h(InputGroup, [
            // TODO: populate placeholder w/ most popular
            h(Input, { placeholder: "Engineer, etc." }),
          ]),
        ]),
        h(Stack, { direction: "column" }, [
          h(Text, "Description"),
          h(InputGroup, [
            h(AutosizeTextarea, {
              minRows: 4,
              // defaultValue: note ?? "",
              onChange: (event) => console.log(event),
            }),
          ]),
        ]),
      ]),
    ]
  )
