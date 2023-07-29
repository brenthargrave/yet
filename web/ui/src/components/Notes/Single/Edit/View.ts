import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { px } from "csx"
import { FC, useEffect, useState } from "react"
import { DraftNote, ID, NoteStatus } from "~/graph"
import { t } from "~/i18n"
import {
  ariaLabel,
  AutosizeTextarea,
  Spacer,
  Stack,
  roundedCorners,
} from "~/system"
import { View as ShowView } from "../Show/View"
import { Props as ActionBarProps, View as ActionBar } from "./ActionBar/View"
import { MarkdownLink } from "./MarkdownLink"

export interface NoteViewModel extends DraftNote {
  isDeleting: boolean
  isPosting: boolean
}

export type TextType = string | undefined

const previewId = "preview"

export interface Props extends Omit<ActionBarProps, "id"> {
  note: NoteViewModel
  autoFocus?: boolean
  isDisabled?: boolean
  onChangeText?: ({ text, id }: { text: TextType; id: ID }) => void
  // onClickAddOpp?: () => void
  // noteInputRef?: Ref<HTMLTextAreaElement>
}

export const View: FC<Props> = ({
  note,
  autoFocus = true,
  isDisabled = false,
  onChangeText,
  onClickDelete,
  onClickPost,
  // onClickAddOpp,
  // noteInputRef,
}) => {
  const { text, id, status } = note
  const noteInputsId = `note-${id}-input`
  const [minHeight, setMinHeight] = useState<number | null>(0)
  const isDisabledDelete = status !== NoteStatus.Draft
  let isDisabledPost = true
  if (text) {
    isDisabledPost = text.length < 2
  }

  const onChange = (valueText: TextType) => {
    if (onChangeText) onChangeText({ text: valueText, id })
  }

  useEffect(() => {
    const noteInputsHeight = document.getElementById(noteInputsId)?.offsetHeight
    const previewHeight = document.getElementById(noteInputsId)?.offsetHeight
    if (!!noteInputsHeight && !!previewHeight) {
      const _minHeight = Math.max(noteInputsHeight, previewHeight)
      setMinHeight(_minHeight + 80)
    }
  }, [text])

  const key = `note-${id}-edit`
  return h(
    Stack,
    {
      //
      key,
      id: key,
      width: "100%",
      direction: "column",
      ...roundedCorners,
      spacing: 0,
    },
    [
      h(
        Tabs,
        {
          isFitted: true,
          variant: "enclosed",
          isLazy: true,
          size: "sm",
          padding: 0,
          minHeight: px(minHeight ?? 0).toString(),
          width: "100%",
          isManual: true,
        },
        [
          h(TabList, {}, [
            h(Tab, { isDisabled }, `Edit`),
            h(Tab, { isDisabled }, `Preview`),
          ]),
          h(TabPanels, {}, [
            h(
              TabPanel,
              {
                padding: 0,
              },
              [
                h(AutosizeTextarea, {
                  autoFocus,
                  id: noteInputsId,
                  ...ariaLabel("Note"),
                  isDisabled,
                  paddingTop: 4,
                  paddingLeft: 4, // fixed to keep alignment w/ Preview
                  minRows: 10,
                  defaultValue: text ?? "",
                  size: "sm",
                  // ref: noteInputRef,
                  onChange: (event) => onChange(event.target.value),
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
                    // TODO: opps
                    // oppsEnabled &&
                    //   h(
                    //     Button,
                    //     {
                    //       leftIcon: h(AddIcon),
                    //       // leftIcon: h(CgInsertBefore),
                    //       // leftIcon: h(ImEmbed),
                    //       size: "xs",
                    //       variant: "ghost",
                    //       onClick: onClickAddOpp,
                    //       ...ariaLabel("Mention Opp"),
                    //     },
                    //     `Opportunity`
                    //   ),
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
                h(ShowView, {
                  //
                  isPreview: true,
                  note,
                }),
              ]
            ),
          ]),
        ]
      ),
      h(ActionBar, {
        id,
        onClickDelete,
        isDisabledDelete,
        onClickPost,
        isDisabledPost,
      }),
    ]
  )
}

View.displayName = "NoteEditor"
