import { h } from "@cycle/react"
import { sign } from "crypto"
import { FC } from "react"
import { NoteView } from "~/components/Note"
import { map, pluck } from "~/fp"
import { Conversation, Customer, Maybe } from "~/graph"
import { localizeDate, t, toSentence } from "~/i18n"
import { routes, routeURL } from "~/router"
import {
  BackButton,
  Flex,
  Header,
  Heading,
  MarkdownView,
  Nav,
  ShareModal,
  Spacer,
  Stack,
  Status,
  Text,
} from "~/system"
import { ParticipantsView } from "~/system/ParticipantsView"
import { View as AuthPrompt } from "./AuthPrompt"
import { ShareButton } from "./ShareButton"
import { SignButton } from "./SignButton"

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
  viewer: Maybe<Customer>
  intent?: Intent
  step?: Step
  conversation: Conversation
  // sign
  onClickAuth?: () => void
  onClickSign?: () => void
  isSignLoading?: boolean
  // read
  onClickShare?: () => void
  isOpenShare?: boolean
  onCloseShare?: () => void
  onClickBack?: () => void
}

export const View: FC<Props> = ({
  viewer,
  intent = Intent.Read,
  step = Step.Auth,
  conversation: { id, status, occurredAt, invitees, creator, note, signatures },
  onClickAuth,
  onClickSign,
  isSignLoading = false,
  onClickShare,
  isOpenShare = false,
  onCloseShare = () => null,
  onClickBack,
}) => {
  const isObscured = isSigningStep(intent, step, Step.Auth) || isOpenShare
  const creatorName = creator.name
  const signers = map((sig) => sig.signer, signatures)
  const occurredAtDesc = localizeDate(occurredAt)
  return h(
    Stack,
    {
      direction: "column",
      align: "start",
      justifyContent: "flex-start",
    },
    [
      !isSigning(intent) && h(Nav, { onClickBack }),
      h(ShareModal, {
        isOpen: isReading(intent) && isOpenShare,
        onClose: onCloseShare,
        shareURL: routeURL(routes.conversation({ id })),
      }),
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
          gap: 4,
          style: {
            ...(isObscured && {
              color: "transparent",
              textShadow: "0 0 10px rgba(0,0,0,0.5)",
            }),
          },
        },
        [
          h(Header, [
            //
            h(Heading, { size: "md" }, "Conversation"),
            h(Spacer),
          ]),
          h(Stack, { direction: "column", gap: 1 }, [
            h(
              Flex,
              { justifyContent: "space-between", gap: 4, alignItems: "center" },
              [
                h(ParticipantsView, {
                  viewer,
                  status,
                  creator,
                  invitees,
                  signers,
                }),
                h(Stack, { direction: "column", alignItems: "end" }, [
                  h(
                    Text,
                    {
                      size: "xs",
                      style: {
                        whiteSpace: "nowrap",
                      },
                    },
                    occurredAtDesc
                  ),
                  h(Status, { status }),
                ]),
              ]
            ),
            h(NoteView, { note, isObscured }),
          ]),
          h(Stack, { direction: "row" }, [
            isSigningStep(intent, step, Step.Sign) &&
              h(SignButton, { onClickSign, isSignLoading }),
            isReading(intent) &&
              //
              h(ShareButton, { onClickShare }),
          ]),
        ]
      ),
    ]
  )
}
