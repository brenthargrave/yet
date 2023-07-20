import { AddIcon } from "@chakra-ui/icons"
import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { px } from "csx"
import { FC, Ref, useEffect, useState } from "react"
import { NoteView } from "~/components/Note"
import { ConversationStatus, oppsEnabled } from "~/graph"
import { t } from "~/i18n"
import { ariaLabel, AutosizeTextarea, Button, Spacer, Stack } from "~/system"
import { MarkdownLink } from "./MarkdownLink"
import { SyncIcon } from "./SyncIcon"

const noteInputsId = "note"
const previewId = "preview"

export interface Props {
  autoFocus?: boolean
  note: string | null | undefined
  onChangeNote: (note: string) => void
  status?: ConversationStatus
  isDisabled?: boolean
  onClickAddOpp?: () => void
  noteInputRef?: Ref<HTMLTextAreaElement>
  isSyncing?: boolean
}

export const View: FC<Props> = ({
  autoFocus = false,
  note,
  onChangeNote,
  status = ConversationStatus.Draft,
  isDisabled = false,
  onClickAddOpp,
  noteInputRef,
  isSyncing = false,
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
              ...ariaLabel("Note"),
              isDisabled,
              paddingTop: 4,
              minRows: 10,
              defaultValue: note ?? "",
              size: "sm",
              onChange: (event) => onChangeNote(event.target.value),
              ref: noteInputRef,
              placeholder: t("note.draft.placeholder"),
            }),
            h(
              Stack,
              {
                direction: "row",
                alignItems: "center",
                paddingTop: "4px",
              },
              [
                oppsEnabled &&
                  h(
                    Button,
                    {
                      leftIcon: h(AddIcon),
                      // leftIcon: h(CgInsertBefore),
                      // leftIcon: h(ImEmbed),
                      size: "xs",
                      variant: "ghost",
                      onClick: onClickAddOpp,
                      ...ariaLabel("Mention Opp"),
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
