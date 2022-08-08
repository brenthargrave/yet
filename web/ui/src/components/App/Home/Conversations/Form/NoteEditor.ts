import { AddIcon } from "@chakra-ui/icons"
import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { px } from "csx"
import { FC, useEffect, useState } from "react"
import { CgInsertBefore } from "react-icons/cg"
import { ImEmbed } from "react-icons/im"
import { NoteView } from "~/components/Note"
import { ConversationStatus } from "~/graph"
import { AutosizeTextarea, Button, Spacer, Stack } from "~/system"
import { MarkdownLink } from "./MarkdownLink"

const noteInputsId = "notes"
const previewId = "preview"

export interface Props {
  autoFocus?: boolean
  note: string | null | undefined
  onChangeNote: (note: string) => void
  status?: ConversationStatus
  isDisabled?: boolean
  onClickAddOpp?: () => void
}

export const View: FC<Props> = ({
  autoFocus = false,
  note,
  onChangeNote,
  status = ConversationStatus.Draft,
  isDisabled = false,
  onClickAddOpp,
}) => {
  const [minHeight, setMinHeight] = useState<number | null>(0)
  useEffect(() => {
    const noteInputsHeight = document.getElementById(noteInputsId)?.offsetHeight
    const previewHeight = document.getElementById(noteInputsId)?.offsetHeight
    if (!!noteInputsHeight && !!previewHeight) {
      const _minHeight = Math.max(noteInputsHeight, previewHeight)
      setMinHeight(_minHeight + 80)
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
        h(Tab, { isDisabled }, `Edit`),
        h(Tab, { isDisabled }, `Preview`),
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
              autoFocus,
              id: noteInputsId,
              isDisabled,
              paddingTop: 4,
              minRows: 4,
              defaultValue: note ?? "",
              onChange: (event) => onChangeNote(event.target.value),
            }),
            h(
              Stack,
              {
                direction: "row",
                alignItems: "center",
                paddingTop: "4px",
              },
              [
                h(
                  Button,
                  {
                    leftIcon: h(AddIcon),
                    // leftIcon: h(CgInsertBefore),
                    // leftIcon: h(ImEmbed),
                    size: "xs",
                    variant: "ghost",
                    onClick: onClickAddOpp,
                  },
                  `Opportunity`
                ),
                h(Spacer),
                h(MarkdownLink),
              ]
            ),
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
