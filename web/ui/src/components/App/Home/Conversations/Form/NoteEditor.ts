import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { FC } from "react"
import { AutosizeTextarea, MarkdownView } from "~/system"

interface Props {
  note: string | null | undefined
  onChangeNote: (note: string) => void
}

export const NoteEditor: FC<Props> = ({ note, onChangeNote }) =>
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
        h(TabPanel, { padding: 0, paddingTop: 2 }, [
          h(AutosizeTextarea, {
            minRows: 4,
            defaultValue: note ?? "",
            onChange: (event) => onChangeNote(event.target.value),
          }),
        ]),
        h(TabPanel, [
          //
          h(MarkdownView, { md: note ?? "" }),
        ]),
      ]),
    ]
  )
