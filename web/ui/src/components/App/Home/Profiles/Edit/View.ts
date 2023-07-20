import { CheckIcon, DeleteIcon, ViewIcon } from "@chakra-ui/icons"
import { ButtonGroup, Icon, IconButton, Tooltip } from "@chakra-ui/react"
import { h } from "@cycle/react"
import { form } from "@cycle/react-dom"
import { partition } from "ramda"
import { FC, ReactNode } from "react"
import { match } from "ts-pattern"
import {
  AuthProvider,
  handleForSocial,
  hasSocial,
  iconForSocial,
  Profile,
  socialProduct,
} from "~/graph"
import {
  Button,
  containerProps,
  Divider,
  FullWidthVStack,
  Header,
  Heading,
  Nav,
  Spacer,
  Stack,
} from "~/system"
import { CancelButton } from "~/system/CancelButton"
import { Section } from "./Section"

export const size = "md"

export interface Props {
  profile: Profile
  isDisabledSubmit?: boolean
  onSubmit?: () => void
  onCancel?: () => void
  onClickShow?: () => void
  isSaving?: boolean
  // name
  firstNameInput: ReactNode
  lastNameInput: ReactNode
  // work
  roleInput: ReactNode
  orgInput: ReactNode
  // contact
  email?: string | null
  e164?: string | null
  phone?: string | null
  // socials
  onClickAuthTwitter?: () => void
  authPendingTwitter?: boolean
  onClickAuthFacebook?: () => void
  authPendingFacebook?: boolean
  onClickSocial?: (social: AuthProvider) => void
}

export const View: FC<Props> = ({
  profile,
  isDisabledSubmit = true,
  onSubmit: _onSubmit,
  onCancel,
  onClickShow,
  isSaving = false,
  // name
  firstNameInput,
  lastNameInput,
  // work
  roleInput,
  orgInput,
  // misc
  email,
  e164,
  phone,
  // socials
  onClickAuthTwitter,
  authPendingTwitter = false,
  onClickAuthFacebook,
  authPendingFacebook = false,
  onClickSocial,
  ...props
}) => {
  //
  const onSubmit: React.FormEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault()
    if (_onSubmit) _onSubmit()
  }

  const [authd, unauthd] = partition(
    (a: AuthProvider) => hasSocial(a, profile),
    // TODO: restore once FB supported
    // Object.values(AuthProvider)
    [AuthProvider.Twitter]
  )

  //
  return h(FullWidthVStack, { ...containerProps }, [
    h(Nav, {
      /* onClickBack, backButtonText: "Home" */
    }),
    h(Header, [
      h(Heading, { size: "md" }, `Edit Profile`),
      h(Spacer),
      false &&
        h(
          Button,
          {
            leftIcon: h(Icon, { as: ViewIcon }),
            size: "xs",
            onClick: onClickShow,
          },
          `View`
        ),
    ]),

    //
    h(FullWidthVStack, { isBody: true }, [
      //
      form({ id: "edit", onSubmit, style: { width: "100%" } }, [
        h(Stack, { direction: "column", width: "100%" }, [
          h(
            Section,
            {
              heading: "Name *",
              size,
              // leftIcon: h(Icon, { as: CgProfile }),
            },
            [
              //
              firstNameInput,
              lastNameInput,
            ]
          ),
          h(
            Section,
            {
              heading: "Work",
              size,
              // leftIcon: h(Icon, { as: HiOutlineOfficeBuilding }),
            },
            [
              //
              roleInput,
              orgInput,
            ]
          ),

          // TODO: contact info
          // email &&
          //   h(HStack, {}, [
          //     h(EmailIcon, { size }),
          //     h(Text, { size }, email),
          //   ]),
          // phone &&
          //   h(HStack, {}, [
          //     h(PhoneIcon, { size }),
          //     h(Text, { size }, phone),
          //   ]),

          // TODO
          // location
          // handle
          // pfp

          // socials
          h(
            Section,
            {
              //
              heading: "Social accounts",
              direction: "column",
              align: "start",
              pb: 8,
              spacing: 4,
            },
            [
              ...authd.map((social) => {
                const social_lowered = social.toLowerCase()
                return h(
                  ButtonGroup,
                  {
                    size: "sm",
                    variant: "solid",
                    key: `add-${social_lowered}`,
                  },
                  [
                    h(
                      Button,
                      {
                        colorScheme: social_lowered,
                        variant: "outline",
                        leftIcon: h(Icon, {
                          as: iconForSocial(social),
                        }),
                        onClick: () => {
                          if (onClickSocial) onClickSocial(social)
                        },
                      },
                      handleForSocial(social, profile)
                    ),
                    h(Divider, { orientation: "vertical" }),
                    // TODO: support auth deletion
                    false &&
                      h(Tooltip, { label: `Remove ${socialProduct(social)}` }, [
                        h(IconButton, {
                          //
                          icon: h(DeleteIcon),
                          variant: "outline",
                        }),
                      ]),
                  ]
                )
              }),
              // h(Divider),
              ...unauthd.map((social) => {
                const social_lowered = social.toLowerCase()
                return h(
                  ButtonGroup,
                  {
                    //
                    size: "sm",
                    isAttached: true,
                    variant: "solid",
                    colorScheme: social_lowered,
                    key: `add-${social_lowered}`,
                  },
                  [
                    h(
                      Button,
                      {
                        size: "sm",
                        leftIcon: h(iconForSocial(social)),
                        onClick: () => {
                          match(social)
                            .with(AuthProvider.Twitter, () => {
                              if (onClickAuthTwitter) onClickAuthTwitter()
                            })
                            .with(AuthProvider.Facebook, () => {
                              if (onClickAuthFacebook) onClickAuthFacebook()
                            })
                            .exhaustive()
                        },
                      },
                      `Add ${socialProduct(social)}`
                    ),
                  ]
                )
              }),
            ]
          ),
          // Actions
          h(Stack, { direction: "column", paddingTop: 2 }, [
            h(Divider),
            h(Stack, { direction: "row", alignItems: "center" }, [
              h(
                Button,
                {
                  type: "submit",
                  // leftIcon: h(PlusSquareIcon),
                  leftIcon: h(CheckIcon),
                  size: "md",
                  isDisabled: isDisabledSubmit,
                  isLoading: isSaving,
                },
                "Save"
              ),
              h(Spacer),
              h(CancelButton, { onCancel, isDisabled: isSaving }),
            ]),
          ]),
        ]),
      ]),
    ]),
  ])
}
