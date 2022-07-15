import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { AutosizeTextarea, MarkdownView } from "~/system"

export interface Props {
  note: string | null | undefined
  onChangeNote: (note: string) => void
}

export const View: FC<Props> = ({ note, onChangeNote }) =>
  h(
    Tabs,
    {
      isFitted: true,
      variant: "enclosed",
      isLazy: true,
      size: "sm",
      padding: 0,
    },
    [
      h(TabList, [
        h(Tab, { tabIndex: -1 }, `Edit`),
        h(Tab, { tabIndex: -1 }, `Preview`),
      ]),
      h(TabPanels, { padding: 0 }, [
        h(TabPanel, { padding: 0, paddingTop: 4 }, [
          h(AutosizeTextarea, {
            minRows: 4,
            defaultValue: note ?? "",
            onChange: (event) => onChangeNote(event.target.value),
          }),
        ]),
        h(TabPanel, { padding: 4, paddingTop: 0 }, [
          //
          h(MarkdownView, { md: note ?? "" }),
        ]),
      ]),
    ]
  )

View.displayName = "NoteEditor"
