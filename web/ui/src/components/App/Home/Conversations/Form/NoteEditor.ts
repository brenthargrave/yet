import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { px } from "csx"
import { FC, useEffect, useState } from "react"
import { NoteView } from "~/components/Note"
import { AutosizeTextarea } from "~/system"

export interface Props {
  note: string | null | undefined
  onChangeNote: (note: string) => void
}

const noteInputsId = "notes"
const previewId = "preview"

export const View: FC<Props> = ({ note, onChangeNote }) => {
  const [minHeight, setMinHeight] = useState<number | null>(0)
  useEffect(() => {
    const noteInputsHeight = document.getElementById(noteInputsId)?.offsetHeight
    const previewHeight = document.getElementById(noteInputsId)?.offsetHeight
    if (!!noteInputsHeight && !!previewHeight) {
      const _minHeight = Math.max(noteInputsHeight, previewHeight)
      setMinHeight(_minHeight + 90)
    }
  }, [note])

  return h(
    Tabs,
    {
      isFitted: true,
      variant: "enclosed",
      isLazy: true,
      size: "sm",
      padding: 0,
      minHeight: px(minHeight ?? 0).toString(),
    },
    [
      h(TabList, [
        h(Tab, { tabIndex: -1 }, `Edit`),
        h(Tab, { tabIndex: -1 }, `Preview`),
      ]),
      h(TabPanels, { padding: 0 }, [
        h(
          TabPanel,
          {
            padding: 0,
            paddingTop: 4,
          },
          [
            h(AutosizeTextarea, {
              id: noteInputsId,
              paddingTop: 4,
              minRows: 4,
              defaultValue: note ?? "",
              onChange: (event) => onChangeNote(event.target.value),
            }),
          ]
        ),
        h(
          TabPanel,
          {
            //
            id: previewId,
            padding: 0,
            paddingTop: 4,
          },
          [
            //
            h(NoteView, { note }),
          ]
        ),
      ]),
    ]
  )
}

View.displayName = "NoteEditor"