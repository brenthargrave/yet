import { Box, Spacer } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { ID } from "~/graph"
import { t } from "~/i18n"
import { ActionButton, DeleteButton, Stack } from "~/system"

export interface Props {
  id: ID
  // delete
  onClickDelete?: (id: ID) => void
  isDeleting?: boolean
  isDisabledDelete?: boolean
  // publish
  onClickPost?: (id: ID) => void
  isLoadingPost?: boolean
  isDisabledPost?: boolean
}

export const View = ({
  id,
  // delete
  onClickDelete,
  isDeleting = false,
  isDisabledDelete = true,
  // publish
  onClickPost,
  isLoadingPost = false,
  isDisabledPost = true,
  ...props
}: Props) =>
  h(
    Stack,
    {
      //
      direction: "column",
      width: "100%",
      p: 0,
    },
    [
      h(
        Stack,
        {
          //
          width: "100%",
          direction: "column",
          alignItems: "start",
          p: 0,
        },
        [
          // TODO: divide?
          // h(Divider),
          h(
            Box,
            {
              display: "flex",
              direction: "row",
              alignItems: "start",
              width: "100%",
              // space: 4,
            },
            [
              h(
                Stack,
                {
                  direction: "row",
                  justifyContent: "start",
                  alignItems: "start",
                  width: "100%",
                  p: 0,
                },
                [
                  h(ActionButton, {
                    cta: t("note.post"),
                    isLoading: isLoadingPost,
                    isDisabled: isDisabledPost,
                    onClick: () => onClickPost && onClickPost(id),
                  }),
                  h(Spacer),
                  h(DeleteButton, {
                    cta: "Delete Note",
                    onClick: () => onClickDelete && onClickDelete(id),
                    isLoading: isDeleting,
                    isDisabled: isDisabledDelete,
                  }),
                ]
              ),
            ]
          ),
        ]
      ),
    ]
  )
