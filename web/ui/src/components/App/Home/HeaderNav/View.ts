import { h } from "@cycle/react"
import { FC } from "react"
import { t } from "~/i18n"
import { AriaButton, BackButton, Header, Spacer } from "~/system"

export interface Props {
  onClickAuth?: () => void
  onClickBack?: () => void
  backButtonText?: string
}

export const View: FC<Props> = ({
  onClickAuth,
  onClickBack,
  backButtonText = "Back",
}) => {
  return h(Header, { paddingBottom: 0 }, [
    onClickBack &&
      h(BackButton, {
        cta: backButtonText,
        onClick: onClickBack,
      }),
    h(Spacer, { minHeight: "24px" }),
    onClickAuth && h(AriaButton, { onClick: onClickAuth }, t("app.auth")),
  ])
}

View.displayName = "HeaderNav"
