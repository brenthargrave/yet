import { h } from "@cycle/react"
import { FC } from "react"
import { NoteView } from "~/components/Note"
import { map, pluck } from "~/fp"
import { Conversation } from "~/graph"
import { localizeDate, t, toSentence } from "~/i18n"
import {
  Button,
  Flex,
  Heading,
  MarkdownView,
  Spacer,
  Stack,
  Text,
} from "~/system"
import { View as AuthPrompt } from "./AuthPrompt"

const bold = (inner: string) => `**${inner}**`

export enum Intent {
  Read = "read",
  Sign = "sign",
}
const isReading = (current: Intent) => current === Intent.Read
const isSigning = (current: Intent) => current === Intent.Sign

export enum Step {
  Auth = "auth",
  Sign = "sign",
}
const isSigningStep = (intent: Intent, current: Step, step: Step) =>
  isSigning(intent) && current === step

export interface Props {
  intent?: Intent
  step?: Step
  conversation: Conversation
  onClickAuth?: () => void
  onClickSign?: () => void
  isSignLoading?: boolean
}

export const View: FC<Props> = ({
  intent = Intent.Read,
  step = Step.Auth,
  conversation: { occurredAt, invitees, creator, note },
  onClickAuth,
  onClickSign,
  isSignLoading = false,
}) => {
  const creatorName = creator.name
  const occurredAtDesc = localizeDate(occurredAt)
  return h(
    Stack,
    {
      direction: "column",
      align: "start",
      justifyContent: "flex-start",
    },
    [
      h(AuthPrompt, {
        isOpen: isSigningStep(intent, step, Step.Auth),
        creatorName,
        occurredAtDesc,
        onClickAuth,
      }),
      isSigningStep(intent, step, Step.Sign) &&
        h(
          Stack,
          {
            direction: "column",
            justifyContent: "start",
            backgroundColor: "#fafafa",
            padding: 4,
          },
          [
            h(MarkdownView, {
              md: `**${bold(
                creatorName
              )}** requested that you cosign these notes.
             ${t(`conversations.sign.once-signed`)}
            `,
            }),
          ]
        ),
      h(
        Stack,
        {
          direction: "column",
          width: "100%",
          padding: 4,
          gap: 4,
          style: {
            ...(isSigningStep(intent, step, Step.Auth) && {
              color: "transparent",
              textShadow: "0 0 10px rgba(0,0,0,0.5)",
            }),
          },
        },
        [
          h(Stack, { direction: "row" }, [
            h(Heading, { size: "md" }, "Conversation"),
            h(Spacer),
          ]),
          h(Stack, { direction: "column", gap: 1 }, [
            h(Flex, { justifyContent: "space-between", gap: 4 }, [
              h(MarkdownView, {
                md: `${bold(creatorName)} with ${toSentence(
                  map(bold, pluck("name", invitees))
                )}`,
              }),
              h(
                Text,
                { size: "xs", style: { whiteSpace: "nowrap" } },
                occurredAtDesc
              ),
            ]),
            h(NoteView, { note, isObscured: step === Step.Auth }),
          ]),
          h(Stack, { direction: "row" }, [
            isSigningStep(intent, step, Step.Sign) &&
              h(
                Button,
                {
                  onClick: onClickSign,
                  isLoading: isSignLoading,
                },
                `Cosign`
              ),
            isReading(intent) &&
              h(
                Button,
                {
                  // onClick: onClickSign,
                  // isLoading: isSignLoading,
                },
                `Share`
              ),
          ]),
        ]
      ),
    ]
  )
}
